const pool = require('../config/db');
const fs = require('fs').promises; // Use promises for fs operations
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

exports.getPublicCertificates = async (req, res) => {
    console.log("Request received to get public certificates");
    try {
        const result = await pool.query(
            `SELECT certificate_id, student_name, course_name, image_url, issue_date, created_at
             FROM certificates
             ORDER BY created_at DESC`
        );
        console.log('Fetched public certificates from DB:', result.rows); // <-- Log added

        const certificatesWithUrls = result.rows.map(cert => ({
            ...cert,
            image_url: getFullFileUrl(req, cert.image_url)
        }));

        res.status(200).json({
            message: "Certificates fetched successfully.",
            count: result.rows.length,
            certificates: certificatesWithUrls
        });
    } catch (err) {
        console.error("Error fetching public certificates:", err);
        res.status(500).json({ message: "Server error fetching certificates." });
    }
};

exports.getAllCertificates = async (req, res) => {
    console.log("Admin request received to get all certificates");
    try {
        const result = await pool.query(
            `SELECT certificate_id, student_name, course_name, image_url, issue_date, created_at, updated_at
             FROM certificates
             ORDER BY created_at DESC`
        );
        console.log('Fetched all certificates for admin from DB:', result.rows); // <-- Log added

         const certificatesWithUrls = result.rows.map(cert => ({
            ...cert,
            image_url: getFullFileUrl(req, cert.image_url)
        }));

        res.status(200).json({
            message: "All certificates fetched successfully.",
            count: result.rows.length,
            certificates: certificatesWithUrls
        });
    } catch (err) {
        console.error("Error fetching all certificates:", err);
        res.status(500).json({ message: "Server error fetching certificates." });
    }
};

exports.addCertificate = async (req, res) => {
    const { student_name, course_name, issue_date } = req.body;
    const certificateImageFile = req.file;
    console.log("Admin request to add new certificate:", { student_name, certificateImageFile: certificateImageFile?.filename });

    if (!student_name) {
        if (certificateImageFile) await fs.unlink(certificateImageFile.path).catch(e => console.error("Error deleting uploaded cert image on validation fail (name):", e));
        return res.status(400).json({ message: "Student name is required." });
    }
    if (!certificateImageFile) {
        return res.status(400).json({ message: "Certificate image file is required." });
    }

    const imageDbPath = path.join('certificates', certificateImageFile.filename).replace(/\\/g, '/');

    try {
        const insertQuery = `
            INSERT INTO certificates (student_name, course_name, issue_date, image_url, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *;
        `;
        const values = [
            student_name,
            course_name || null,
            issue_date || null,
            imageDbPath
        ];
        const newCertificateResult = await pool.query(insertQuery, values);
        const newCertificate = newCertificateResult.rows[0];
        newCertificate.image_url = getFullFileUrl(req, newCertificate.image_url);
        console.log('Certificate added successfully:', newCertificate); // <-- Log added
        res.status(201).json({
            message: "Certificate added successfully.",
            certificate: newCertificate
        });
    } catch (err) {
        console.error("Error adding certificate:", err);
        if (certificateImageFile) await fs.unlink(certificateImageFile.path).catch(e => console.error("Error deleting uploaded cert image after DB error:", e));
        res.status(500).json({ message: "Server error adding certificate." });
    }
};

exports.deleteCertificate = async (req, res) => {
    const { id } = req.params;
    console.log(`Admin request to delete certificate ID: ${id}`);
    let imagePathToDelete = null;
    const uploadsBaseDir = path.join(__dirname, '..', 'uploads');

    try {
        const fileResult = await pool.query('SELECT image_url FROM certificates WHERE certificate_id = $1', [id]);
        if (fileResult.rows.length === 0) {
            return res.status(404).json({ message: 'Certificate not found.' });
        }
        if (fileResult.rows[0].image_url) {
            imagePathToDelete = path.join(uploadsBaseDir, fileResult.rows[0].image_url);
        }

        const deleteResult = await pool.query('DELETE FROM certificates WHERE certificate_id = $1 RETURNING certificate_id', [id]);
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ message: 'Certificate not found during deletion attempt.' });
        }

        if (imagePathToDelete) {
            await fs.unlink(imagePathToDelete).catch(err => {
                if (err.code !== 'ENOENT') console.error(`Error deleting certificate image ${imagePathToDelete}:`, err);
                else console.log(`Certificate image not found, skipping deletion: ${imagePathToDelete}`);
            });
        }
        console.log(`Certificate ${id} deleted successfully.`); // <-- Log added
        res.status(200).json({ message: `Certificate ${id} deleted successfully.` });
    } catch (err) {
        console.error(`Error deleting certificate ${id}:`, err);
        res.status(500).json({ message: 'Server error deleting certificate.' });
    }
};