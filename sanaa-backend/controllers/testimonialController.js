// sanaa-backend/controllers/testimonialController.js
const pool = require('../config/db');
const fs = require('fs').promises;
const path = require('path');

const getFullFileUrl = (req, filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath;
    }
    const basePath = '/uploads/';
    const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const baseUrl = process.env.NODE_ENV === 'production' ? process.env.BASE_URL : `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}${basePath}${relativePath}`;
};

exports.getPublicTestimonials = async (req, res) => {
    console.log("Request received to get public testimonials");
    try {
        const result = await pool.query(
            `SELECT testimonial_id, student_name, testimonial_text, student_detail, avatar_url
             FROM testimonials
             WHERE is_approved = TRUE
             ORDER BY submitted_at DESC`
        );
        console.log('Fetched public testimonials from DB:', result.rows); // <-- Log added

        const testimonialsWithUrls = result.rows.map(t => ({
            ...t,
            avatar_url: getFullFileUrl(req, t.avatar_url)
        }));

        res.status(200).json({
            message: "Approved testimonials fetched successfully.",
            count: result.rows.length,
            testimonials: testimonialsWithUrls
        });
    } catch (err) {
        console.error("Error fetching public testimonials:", err);
        res.status(500).json({ message: "Server error fetching testimonials." });
    }
};

exports.getAllTestimonials = async (req, res) => {
    console.log("Admin request received to get all testimonials");
    try {
        const result = await pool.query(
            `SELECT testimonial_id, student_name, testimonial_text, student_detail, avatar_url, is_approved, submitted_at, updated_at
             FROM testimonials
             ORDER BY submitted_at DESC`
        );
        console.log('Fetched all testimonials for admin from DB:', result.rows); // <-- Log added

        const testimonialsWithUrls = result.rows.map(t => ({
            ...t,
            avatar_url: getFullFileUrl(req, t.avatar_url)
        }));

        res.status(200).json({
            message: "All testimonials fetched successfully.",
            count: result.rows.length,
            testimonials: testimonialsWithUrls
        });
    } catch (err) {
        console.error("Error fetching all testimonials:", err);
        res.status(500).json({ message: "Server error fetching testimonials." });
    }
};

exports.addTestimonial = async (req, res) => {
    const { student_name, testimonial_text, student_detail, is_approved = 'false' } = req.body; // Default is_approved to string 'false'
    const avatarFile = req.file;
    console.log("Admin request to add new testimonial:", { student_name, is_approved, avatarFile: avatarFile?.filename });

    if (!student_name || !testimonial_text) {
        if (avatarFile) await fs.unlink(avatarFile.path).catch(e => console.error("Error deleting uploaded testimonial avatar on validation fail (name/text):", e));
        return res.status(400).json({ message: "Student name and testimonial text are required." });
    }

    const avatarDbPath = avatarFile ? path.join('avatars', avatarFile.filename).replace(/\\/g, '/') : null;

    try {
        const insertQuery = `
            INSERT INTO testimonials (student_name, testimonial_text, student_detail, avatar_url, is_approved, submitted_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            RETURNING *;
        `;
        const values = [
            student_name, testimonial_text, student_detail || null, avatarDbPath,
            is_approved === 'true' || is_approved === true // Ensure boolean conversion
        ];
        const newTestimonialResult = await pool.query(insertQuery, values);
        const newTestimonial = newTestimonialResult.rows[0];
        newTestimonial.avatar_url = getFullFileUrl(req, newTestimonial.avatar_url);
        console.log('Testimonial added successfully:', newTestimonial); // <-- Log added
        res.status(201).json({
            message: "Testimonial added successfully.",
            testimonial: newTestimonial
        });
    } catch (err) {
        console.error("Error adding testimonial:", err);
        if (avatarFile) await fs.unlink(avatarFile.path).catch(e => console.error("Error deleting uploaded testimonial avatar after DB error:", e));
        res.status(500).json({ message: "Server error adding testimonial." });
    }
};

exports.updateTestimonial = async (req, res) => {
    const { id } = req.params;
    const { student_name, testimonial_text, student_detail, is_approved } = req.body;
    const avatarFile = req.file;
    console.log(`Admin request to update testimonial ID: ${id} with data:`, { student_name, is_approved, avatarFile: avatarFile?.filename });

    let oldAvatarRelativePath = null;
    const uploadsBaseDir = path.join(__dirname, '..', 'uploads');

    try {
        const existingResult = await pool.query('SELECT avatar_url FROM testimonials WHERE testimonial_id = $1', [id]);
        if (existingResult.rows.length === 0) {
            if (avatarFile) await fs.unlink(avatarFile.path).catch(e => console.error("Error deleting new testimonial avatar for non-existent testimonial:", e));
            return res.status(404).json({ message: 'Testimonial not found.' });
        }
        oldAvatarRelativePath = existingResult.rows[0].avatar_url;

        const fieldsToUpdate = [];
        const values = [];
        let queryIndex = 1;

        if (student_name !== undefined) { fieldsToUpdate.push(`student_name = $${queryIndex++}`); values.push(student_name); }
        if (testimonial_text !== undefined) { fieldsToUpdate.push(`testimonial_text = $${queryIndex++}`); values.push(testimonial_text); }
        if (student_detail !== undefined) { fieldsToUpdate.push(`student_detail = $${queryIndex++}`); values.push(student_detail || null); }
        if (is_approved !== undefined) { fieldsToUpdate.push(`is_approved = $${queryIndex++}`); values.push(is_approved === 'true' || is_approved === true); }

        if (avatarFile) {
            const newAvatarDbPath = path.join('avatars', avatarFile.filename).replace(/\\/g, '/');
            fieldsToUpdate.push(`avatar_url = $${queryIndex++}`);
            values.push(newAvatarDbPath);
        }

        if (fieldsToUpdate.length === 0) {
            if (avatarFile) await fs.unlink(avatarFile.path).catch(e => console.error("Error deleting unused new testimonial avatar:", e));
            // Fetch current data to return
            const currentDataResult = await pool.query('SELECT * FROM testimonials WHERE testimonial_id = $1', [id]);
            const currentTestimonial = currentDataResult.rows[0];
            currentTestimonial.avatar_url = getFullFileUrl(req, currentTestimonial.avatar_url);
            return res.status(200).json({ message: "No changes detected.", testimonial: currentTestimonial });
        }

        fieldsToUpdate.push(`updated_at = NOW()`);
        values.push(id);

        const updateQuery = `
            UPDATE testimonials
            SET ${fieldsToUpdate.join(', ')}
            WHERE testimonial_id = $${queryIndex}
            RETURNING *;
        `;
        const updatedTestimonialResult = await pool.query(updateQuery, values);
        const updatedTestimonial = updatedTestimonialResult.rows[0];

        if (avatarFile && oldAvatarRelativePath && oldAvatarRelativePath !== updatedTestimonial.avatar_url) {
            const fullOldAvatarPath = path.join(uploadsBaseDir, oldAvatarRelativePath);
            console.log("Attempting to delete old testimonial avatar:", fullOldAvatarPath); // <-- Log added
            await fs.unlink(fullOldAvatarPath).catch(err => {
                if (err.code !== 'ENOENT') console.error(`Error deleting old testimonial avatar ${fullOldAvatarPath}:`, err);
                else console.log(`Old testimonial avatar not found, skipping deletion: ${fullOldAvatarPath}`);
            });
        }
        updatedTestimonial.avatar_url = getFullFileUrl(req, updatedTestimonial.avatar_url);
        console.log('Testimonial updated successfully:', updatedTestimonial); // <-- Log added
        res.status(200).json({
            message: 'Testimonial updated successfully.',
            testimonial: updatedTestimonial
        });
    } catch (err) {
        console.error(`Error updating testimonial ${id}:`, err);
        if (avatarFile) await fs.unlink(avatarFile.path).catch(e => console.error("Error deleting new testimonial avatar after update error:", e));
        res.status(500).json({ message: 'Server error updating testimonial.' });
    }
};

exports.deleteTestimonial = async (req, res) => {
    const { id } = req.params;
    console.log(`Admin request to delete testimonial ID: ${id}`);
    let avatarPathToDelete = null;
    const uploadsBaseDir = path.join(__dirname, '..', 'uploads');

    try {
        const fileResult = await pool.query('SELECT avatar_url FROM testimonials WHERE testimonial_id = $1', [id]);
        if (fileResult.rows.length === 0) {
            return res.status(404).json({ message: 'Testimonial not found.' });
        }
        if (fileResult.rows[0].avatar_url) {
            avatarPathToDelete = path.join(uploadsBaseDir, fileResult.rows[0].avatar_url);
        }

        const deleteResult = await pool.query('DELETE FROM testimonials WHERE testimonial_id = $1 RETURNING testimonial_id', [id]);
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ message: 'Testimonial not found during deletion attempt.' });
        }

        if (avatarPathToDelete) {
            console.log("Attempting to delete testimonial avatar:", avatarPathToDelete); // <-- Log added
            await fs.unlink(avatarPathToDelete).catch(err => {
                if (err.code !== 'ENOENT') console.error(`Error deleting testimonial avatar ${avatarPathToDelete}:`, err);
                else console.log(`Testimonial avatar not found, skipping deletion: ${avatarPathToDelete}`);
            });
        }
        console.log(`Testimonial ${id} deleted successfully.`); // <-- Log added
        res.status(200).json({ message: `Testimonial ${id} deleted successfully.` });
    } catch (err) {
        console.error(`Error deleting testimonial ${id}:`, err);
        res.status(500).json({ message: 'Server error deleting testimonial.' });
    }
};