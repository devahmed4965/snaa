// sanaa-backend/controllers/audioController.js
const pool = require('../config/db');
const fs = require('fs');
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

exports.getAllAudioFiles = async (req, res) => {
    console.log("Request received to get all audio files", req.query);
    const { category, speaker_name } = req.query;

    try {
        let query = `
            SELECT audio_id, title, description, speaker_name, category, audio_url, duration_seconds, uploaded_at, created_at
            FROM audio_files
        `;
        const queryParams = [];
        const conditions = [];
        let paramIndex = 1;

        if (category) {
            conditions.push(`category ILIKE $${paramIndex++}`);
            queryParams.push(`%${category}%`);
        }
        if (speaker_name) {
            conditions.push(`speaker_name ILIKE $${paramIndex++}`);
            queryParams.push(`%${speaker_name}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY created_at DESC'; // Order by creation date for admin, or uploaded_at for public

        const result = await pool.query(query, queryParams);
        console.log('Fetched audio files from DB:', result.rows); // <-- Log added

        const audioFilesWithUrls = result.rows.map(audio => ({
            ...audio,
            audio_url: getFullFileUrl(req, audio.audio_url),
        }));

        res.status(200).json({
            message: "Audio files fetched successfully.",
            count: result.rows.length,
            audioFiles: audioFilesWithUrls
        });
    } catch (err) {
        console.error("Error fetching audio files:", err);
        res.status(500).json({ message: "Server error fetching audio files." });
    }
};

exports.getAudioFileById = async (req, res) => {
    const { id } = req.params;
    console.log(`Request received to get audio file with ID: ${id}`);
    try {
        const result = await pool.query(
            `SELECT audio_id, title, description, speaker_name, category, audio_url, duration_seconds, uploaded_at
             FROM audio_files
             WHERE audio_id = $1`,
            [id]
        );
        console.log(`Fetched audio file ${id} from DB:`, result.rows[0]); // <-- Log added

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Audio file not found.' });
        }
        const audioFile = result.rows[0];
        audioFile.audio_url = getFullFileUrl(req, audioFile.audio_url);
        res.status(200).json({
            message: "Audio file fetched successfully.",
            audioFile: audioFile
        });
    } catch (err) {
        console.error(`Error fetching audio file ${id}:`, err);
        res.status(500).json({ message: "Server error fetching audio file details." });
    }
};

exports.addAudioFile = async (req, res) => {
    const { title, description, speaker_name, category, duration_seconds } = req.body;
    const audioFile = req.file;
    console.log("Admin request to add new audio file:", { title, speaker_name, audioFile: audioFile?.filename });

    if (!title) {
        if (audioFile) fs.unlink(audioFile.path, (err) => { if (err) console.error("Error deleting uploaded audio on validation fail:", err); });
        return res.status(400).json({ message: "Audio title is required." });
    }
    if (!audioFile) {
        return res.status(400).json({ message: "Audio file is required." });
    }

    const audioDbPath = path.join('audio', 'general', audioFile.filename).replace(/\\/g, '/');

    try {
        const insertQuery = `
            INSERT INTO audio_files (title, description, speaker_name, category, audio_url, duration_seconds, uploaded_at, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())
            RETURNING *;
        `;
        const values = [
            title, description || null, speaker_name || null, category || null,
            audioDbPath, duration_seconds ? parseInt(duration_seconds, 10) : null
        ];
        const newAudioResult = await pool.query(insertQuery, values);
        const newAudio = newAudioResult.rows[0];
        newAudio.audio_url = getFullFileUrl(req, newAudio.audio_url);
        console.log('Audio file added successfully:', newAudio); // <-- Log added
        res.status(201).json({
            message: "Audio file added successfully.",
            audioFile: newAudio
        });
    } catch (err) {
        console.error("Error adding audio file:", err);
        if (audioFile) fs.unlink(audioFile.path, (unlinkErr) => { if (unlinkErr) console.error("Error deleting uploaded audio after DB error:", unlinkErr); });
        res.status(500).json({ message: "Server error adding audio file." });
    }
};

exports.updateAudioFile = async (req, res) => {
    const { id } = req.params;
    const { title, description, speaker_name, category, duration_seconds } = req.body;
    const audioFile = req.file;
    console.log(`Admin request to update audio file ID: ${id} with data:`, { title, audioFile: audioFile?.filename });

    let oldAudioPath = null;
    const uploadsBaseDir = path.join(__dirname, '..', 'uploads');

    try {
        const existingResult = await pool.query('SELECT audio_url FROM audio_files WHERE audio_id = $1', [id]);
        if (existingResult.rows.length === 0) {
             if (audioFile) fs.unlink(audioFile.path, (err) => { if (err) console.error("Error deleting new audio for non-existent record:", err); });
            return res.status(404).json({ message: 'Audio file not found.' });
        }
        oldAudioPath = existingResult.rows[0].audio_url;

        const fieldsToUpdate = [];
        const values = [];
        let queryIndex = 1;

        if (title !== undefined) { fieldsToUpdate.push(`title = $${queryIndex++}`); values.push(title); }
        if (description !== undefined) { fieldsToUpdate.push(`description = $${queryIndex++}`); values.push(description || null); }
        if (speaker_name !== undefined) { fieldsToUpdate.push(`speaker_name = $${queryIndex++}`); values.push(speaker_name || null); }
        if (category !== undefined) { fieldsToUpdate.push(`category = $${queryIndex++}`); values.push(category || null); }
        if (duration_seconds !== undefined) { fieldsToUpdate.push(`duration_seconds = $${queryIndex++}`); values.push(duration_seconds ? parseInt(duration_seconds, 10) : null); }
        // uploaded_at is not typically updated manually, but rather on creation or file change.

        if (audioFile) {
            const newAudioDbPath = path.join('audio', 'general', audioFile.filename).replace(/\\/g, '/');
            fieldsToUpdate.push(`audio_url = $${queryIndex++}`);
            values.push(newAudioDbPath);
            fieldsToUpdate.push(`uploaded_at = NOW()`); // Update uploaded_at if file changes
        }

        if (fieldsToUpdate.length === 0) {
             if (audioFile) fs.unlink(audioFile.path, (err) => { if (err) console.error("Error deleting unused new audio:", err); });
            const currentData = await pool.query('SELECT * FROM audio_files WHERE audio_id = $1', [id]);
            const currentAudio = currentData.rows[0];
            currentAudio.audio_url = getFullFileUrl(req, currentAudio.audio_url);
            return res.status(200).json({ message: "No changes detected.", audioFile: currentAudio });
        }

        fieldsToUpdate.push(`updated_at = NOW()`);
        values.push(id);

        const updateQuery = `
            UPDATE audio_files
            SET ${fieldsToUpdate.join(', ')}
            WHERE audio_id = $${queryIndex}
            RETURNING *;
        `;
        const updatedAudioResult = await pool.query(updateQuery, values);
        const updatedAudio = updatedAudioResult.rows[0];

        if (audioFile && oldAudioPath && oldAudioPath !== updatedAudio.audio_url) {
            const fullOldAudioPath = path.join(uploadsBaseDir, oldAudioPath);
            fs.unlink(fullOldAudioPath, (err) => {
                if (err && err.code !== 'ENOENT') console.error(`Error deleting old audio file ${fullOldAudioPath}:`, err);
                else if (!err) console.log(`Deleted old audio file: ${fullOldAudioPath}`);
            });
        }
        updatedAudio.audio_url = getFullFileUrl(req, updatedAudio.audio_url);
        console.log('Audio file updated successfully:', updatedAudio); // <-- Log added
        res.status(200).json({
            message: 'Audio file updated successfully.',
            audioFile: updatedAudio
        });
    } catch (err) {
        console.error(`Error updating audio file ${id}:`, err);
        if (audioFile) fs.unlink(audioFile.path, (unlinkErr) => { if (unlinkErr) console.error("Error deleting new audio after update error:", unlinkErr); });
        res.status(500).json({ message: 'Server error updating audio file.' });
    }
};

exports.deleteAudioFile = async (req, res) => {
    const { id } = req.params;
    console.log(`Admin request to delete audio file ID: ${id}`);
    let audioPathToDelete = null;
    const uploadsBaseDir = path.join(__dirname, '..', 'uploads');

    try {
        const fileResult = await pool.query('SELECT audio_url FROM audio_files WHERE audio_id = $1', [id]);
        if (fileResult.rows.length === 0) {
            return res.status(404).json({ message: 'Audio file not found.' });
        }
        if(fileResult.rows[0].audio_url) {
            audioPathToDelete = path.join(uploadsBaseDir, fileResult.rows[0].audio_url);
        }

        const deleteResult = await pool.query('DELETE FROM audio_files WHERE audio_id = $1 RETURNING audio_id', [id]);
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ message: 'Audio file not found during deletion attempt.' });
        }

        if (audioPathToDelete) {
            fs.unlink(audioPathToDelete, (err) => {
                if (err && err.code !== 'ENOENT') console.error(`Error deleting audio file ${audioPathToDelete}:`, err);
                else if (!err) console.log(`Deleted audio file: ${audioPathToDelete}`);
            });
        }
        console.log(`Audio file ${id} deleted successfully.`); // <-- Log added
        res.status(200).json({ message: `Audio file ${id} deleted successfully.` });
    } catch (err) {
        console.error(`Error deleting audio file ${id}:`, err);
        res.status(500).json({ message: 'Server error deleting audio file.' });
    }
};