// sanaa-backend/controllers/storyController.js
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

exports.getAllStories = async (req, res) => {
    console.log("Request received to get stories", req.query);
    const { category } = req.query;

    try {
        let query = `
            SELECT story_id, title, content, category, image_url, created_at, updated_at
            FROM stories
        `;
        const queryParams = [];
        let conditions = [];

        if (category) {
            if (['prophets', 'seerah', 'other'].includes(category.toLowerCase())) {
                conditions.push('category = $1');
                queryParams.push(category.toLowerCase());
            } else {
                 // If an invalid category is provided for a public endpoint,
                 // it might be better to return all or an empty set rather than an error,
                 // or log a warning and proceed without category filter.
                 // For admin, an error might be acceptable.
                 console.warn("Invalid category specified in public request, fetching all stories instead:", category);
            }
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, queryParams);
        console.log('Fetched stories from DB:', result.rows); // <-- Log added

        const storiesWithUrls = result.rows.map(story => ({
            ...story,
            content: story.content.length > 150 ? story.content.substring(0, 150) + '...' : story.content, // Keep excerpt for list view
            image_url: getFullFileUrl(req, story.image_url)
        }));

        res.status(200).json({
            message: "Stories fetched successfully.",
            count: result.rows.length,
            stories: storiesWithUrls
        });
    } catch (err) {
        console.error("Error fetching stories:", err);
        res.status(500).json({ message: "Server error fetching stories." });
    }
};

exports.getStoryById = async (req, res) => {
    const { id } = req.params;
    console.log(`Request received to get story with ID: ${id}`);
    try {
        const result = await pool.query(
            `SELECT story_id, title, content, category, image_url, created_at, updated_at
             FROM stories
             WHERE story_id = $1`,
            [id]
        );
        console.log(`Fetched story ${id} from DB:`, result.rows[0]); // <-- Log added

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Story not found.' });
        }
        const story = result.rows[0];
        story.image_url = getFullFileUrl(req, story.image_url);
        res.status(200).json({
            message: "Story fetched successfully.",
            story: story
        });
    } catch (err) {
        console.error(`Error fetching story ${id}:`, err);
        res.status(500).json({ message: "Server error fetching story details." });
    }
};

exports.addStory = async (req, res) => {
    const { title, content, category = 'other' } = req.body; // Default category
    const imageFile = req.file;
    console.log("Admin request to add new story:", { title, category, imageFile: imageFile?.filename });

    if (!title || !content) {
        if (imageFile) await fs.unlink(imageFile.path).catch(e => console.error("Error deleting uploaded story image on validation fail (title/content):", e));
        return res.status(400).json({ message: "Story title and content are required." });
    }
    if (!['prophets', 'seerah', 'other'].includes(category.toLowerCase())) {
        if (imageFile) await fs.unlink(imageFile.path).catch(e => console.error("Error deleting uploaded story image on validation fail (category):", e));
        return res.status(400).json({ message: "Invalid category specified. Use 'prophets', 'seerah', or 'other'." });
    }

    const imageDbPath = imageFile ? path.join('stories', imageFile.filename).replace(/\\/g, '/') : null;

    try {
        const insertQuery = `
            INSERT INTO stories (title, content, category, image_url, created_at, updated_at)
            VALUES ($1, $2, $3, $4, NOW(), NOW())
            RETURNING *;
        `;
        const values = [title, content, category.toLowerCase(), imageDbPath];
        const newStoryResult = await pool.query(insertQuery, values);
        const newStory = newStoryResult.rows[0];
        newStory.image_url = getFullFileUrl(req, newStory.image_url);
        console.log('Story added successfully:', newStory); // <-- Log added
        res.status(201).json({
            message: "Story added successfully.",
            story: newStory
        });
    } catch (err) {
        console.error("Error adding story:", err);
        if (imageFile) await fs.unlink(imageFile.path).catch(e => console.error("Error deleting uploaded story image after DB error:", e));
        res.status(500).json({ message: "Server error adding story." });
    }
};

exports.updateStory = async (req, res) => {
    const { id } = req.params;
    const { title, content, category } = req.body;
    const imageFile = req.file;
    console.log(`Admin request to update story ID: ${id} with data:`, { title, category, imageFile: imageFile?.filename });

    let oldImageRelativePath = null;
    const uploadsBaseDir = path.join(__dirname, '..', 'uploads');

    try {
        const existingResult = await pool.query('SELECT image_url FROM stories WHERE story_id = $1', [id]);
        if (existingResult.rows.length === 0) {
             if (imageFile) await fs.unlink(imageFile.path).catch(e => console.error("Error deleting new story image for non-existent story:", e));
            return res.status(404).json({ message: 'Story not found.' });
        }
        oldImageRelativePath = existingResult.rows[0].image_url;

        const fieldsToUpdate = [];
        const values = [];
        let queryIndex = 1;

        if (title !== undefined) { fieldsToUpdate.push(`title = $${queryIndex++}`); values.push(title); }
        if (content !== undefined) { fieldsToUpdate.push(`content = $${queryIndex++}`); values.push(content); }
        if (category !== undefined) {
             if (!['prophets', 'seerah', 'other'].includes(category.toLowerCase())) {
                 if (imageFile) await fs.unlink(imageFile.path).catch(e => console.error("Error deleting new story image on validation fail (category update):", e));
                 return res.status(400).json({ message: "Invalid category specified. Use 'prophets', 'seerah', or 'other'." });
             }
             fieldsToUpdate.push(`category = $${queryIndex++}`); values.push(category.toLowerCase());
        }

        if (imageFile) {
            const newImageDbPath = path.join('stories', imageFile.filename).replace(/\\/g, '/');
            fieldsToUpdate.push(`image_url = $${queryIndex++}`);
            values.push(newImageDbPath);
        }

        if (fieldsToUpdate.length === 0) {
             if (imageFile) await fs.unlink(imageFile.path).catch(e => console.error("Error deleting unused new story image:", e));
            const currentData = await pool.query('SELECT * FROM stories WHERE story_id = $1', [id]);
            const currentStory = currentData.rows[0];
            currentStory.image_url = getFullFileUrl(req, currentStory.image_url);
            return res.status(200).json({ message: "No changes detected.", story: currentStory });
        }

        fieldsToUpdate.push(`updated_at = NOW()`);
        values.push(id);

        const updateQuery = `
            UPDATE stories
            SET ${fieldsToUpdate.join(', ')}
            WHERE story_id = $${queryIndex}
            RETURNING *;
        `;
        const updatedStoryResult = await pool.query(updateQuery, values);
        const updatedStory = updatedStoryResult.rows[0];

        if (imageFile && oldImageRelativePath && oldImageRelativePath !== updatedStory.image_url) {
            const fullOldImagePath = path.join(uploadsBaseDir, oldImageRelativePath);
            console.log("Attempting to delete old story image:", fullOldImagePath); // <-- Log added
            await fs.unlink(fullOldImagePath).catch(err => {
                if (err.code !== 'ENOENT') console.error(`Error deleting old story image ${fullOldImagePath}:`, err);
                else console.log(`Old story image not found, skipping deletion: ${fullOldImagePath}`);
            });
        }
        updatedStory.image_url = getFullFileUrl(req, updatedStory.image_url);
        console.log('Story updated successfully:', updatedStory); // <-- Log added
        res.status(200).json({
            message: 'Story updated successfully.',
            story: updatedStory
        });
    } catch (err) {
        console.error(`Error updating story ${id}:`, err);
        if (imageFile) await fs.unlink(imageFile.path).catch(e => console.error("Error deleting new story image after update error:", e));
        res.status(500).json({ message: 'Server error updating story.' });
    }
};

exports.deleteStory = async (req, res) => {
    const { id } = req.params;
    console.log(`Admin request to delete story ID: ${id}`);
    let imagePathToDelete = null;
    const uploadsBaseDir = path.join(__dirname, '..', 'uploads');

    try {
        const fileResult = await pool.query('SELECT image_url FROM stories WHERE story_id = $1', [id]);
        if (fileResult.rows.length === 0) {
            return res.status(404).json({ message: 'Story not found.' });
        }
        if (fileResult.rows[0].image_url) {
            imagePathToDelete = path.join(uploadsBaseDir, fileResult.rows[0].image_url);
        }

        const deleteResult = await pool.query('DELETE FROM stories WHERE story_id = $1 RETURNING story_id', [id]);
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ message: 'Story not found during deletion attempt.' });
        }

        if (imagePathToDelete) {
            console.log("Attempting to delete story image:", imagePathToDelete); // <-- Log added
            await fs.unlink(imagePathToDelete).catch(err => {
                if (err.code !== 'ENOENT') console.error(`Error deleting story image ${imagePathToDelete}:`, err);
                else console.log(`Story image not found, skipping deletion: ${imagePathToDelete}`);
            });
        }
        console.log(`Story ${id} deleted successfully.`); // <-- Log added
        res.status(200).json({ message: `Story ${id} deleted successfully.` });
    } catch (err) {
        console.error(`Error deleting story ${id}:`, err);
        res.status(500).json({ message: 'Server error deleting story.' });
    }
};