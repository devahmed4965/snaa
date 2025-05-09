// sanaa-backend/controllers/podcastController.js
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

exports.getAllPodcasts = async (req, res) => {
    console.log("Request received to get all podcasts");
    try {
        const result = await pool.query(
            `SELECT podcast_id, title, description, audio_url, thumbnail_url, duration_seconds, published_at, created_at
             FROM podcasts
             ORDER BY created_at DESC` // Order by creation for admin, published_at for public
        );
        console.log('Fetched podcasts from DB:', result.rows); // <-- Log added

        const podcastsWithUrls = result.rows.map(podcast => ({
            ...podcast,
            audio_url: getFullFileUrl(req, podcast.audio_url),
            thumbnail_url: getFullFileUrl(req, podcast.thumbnail_url)
        }));

        res.status(200).json({
            message: "Podcasts fetched successfully.",
            count: result.rows.length,
            podcasts: podcastsWithUrls
        });
    } catch (err) {
        console.error("Error fetching podcasts:", err);
        res.status(500).json({ message: "Server error fetching podcasts." });
    }
};

exports.getPodcastById = async (req, res) => {
    const { id } = req.params;
    console.log(`Request received to get podcast with ID: ${id}`);
    try {
        const result = await pool.query(
            `SELECT podcast_id, title, description, audio_url, thumbnail_url, duration_seconds, published_at
             FROM podcasts
             WHERE podcast_id = $1`,
            [id]
        );
        console.log(`Fetched podcast ${id} from DB:`, result.rows[0]); // <-- Log added

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Podcast not found.' });
        }
        const podcast = result.rows[0];
        podcast.audio_url = getFullFileUrl(req, podcast.audio_url);
        podcast.thumbnail_url = getFullFileUrl(req, podcast.thumbnail_url);
        res.status(200).json({
            message: "Podcast fetched successfully.",
            podcast: podcast
        });
    } catch (err) {
        console.error(`Error fetching podcast ${id}:`, err);
        res.status(500).json({ message: "Server error fetching podcast details." });
    }
};

exports.addPodcast = async (req, res) => {
    const { title, description, duration_seconds, published_at } = req.body;
    const audioFile = req.files?.audioFile?.[0];
    const thumbnailFile = req.files?.thumbnailFile?.[0];
    console.log("Admin request to add new podcast:", { title, audioFile: audioFile?.filename, thumbnailFile: thumbnailFile?.filename });

    if (!title) {
        if (audioFile) fs.unlink(audioFile.path, (err) => { if (err) console.error("Error deleting uploaded audio on validation fail (title):", err); });
        if (thumbnailFile) fs.unlink(thumbnailFile.path, (err) => { if (err) console.error("Error deleting uploaded thumbnail on validation fail (title):", err); });
        return res.status(400).json({ message: "Podcast title is required." });
    }
    if (!audioFile) {
        if (thumbnailFile) fs.unlink(thumbnailFile.path, (err) => { if (err) console.error("Error deleting uploaded thumbnail on validation fail (audio missing):", err); });
        return res.status(400).json({ message: "Audio file is required." });
    }

    const audioDbPath = audioFile ? path.join('podcasts', 'audio', audioFile.filename).replace(/\\/g, '/') : null;
    const thumbnailDbPath = thumbnailFile ? path.join('podcasts', 'thumbnails', thumbnailFile.filename).replace(/\\/g, '/') : null;

    try {
        const insertQuery = `
            INSERT INTO podcasts (title, description, audio_url, thumbnail_url, duration_seconds, published_at, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *;
        `;
        const values = [
            title, description || null, audioDbPath, thumbnailDbPath,
            duration_seconds ? parseInt(duration_seconds, 10) : null,
            published_at || new Date()
        ];
        const newPodcastResult = await pool.query(insertQuery, values);
        const newPodcast = newPodcastResult.rows[0];
        newPodcast.audio_url = getFullFileUrl(req, newPodcast.audio_url);
        newPodcast.thumbnail_url = getFullFileUrl(req, newPodcast.thumbnail_url);
        console.log('Podcast added successfully:', newPodcast); // <-- Log added
        res.status(201).json({
            message: "Podcast added successfully.",
            podcast: newPodcast
        });
    } catch (err) {
        console.error("Error adding podcast:", err);
        if (audioFile) fs.unlink(audioFile.path, (unlinkErr) => { if (unlinkErr) console.error("Error deleting uploaded audio after DB error:", unlinkErr); });
        if (thumbnailFile) fs.unlink(thumbnailFile.path, (unlinkErr) => { if (unlinkErr) console.error("Error deleting uploaded thumbnail after DB error:", unlinkErr); });
        res.status(500).json({ message: "Server error adding podcast." });
    }
};

exports.updatePodcast = async (req, res) => {
    const { id } = req.params;
    const { title, description, duration_seconds, published_at } = req.body;
    const audioFile = req.files?.audioFile?.[0];
    const thumbnailFile = req.files?.thumbnailFile?.[0];
    console.log(`Admin request to update podcast ID: ${id} with data:`, { title, audioFile: audioFile?.filename, thumbnailFile: thumbnailFile?.filename });

    let oldAudioPath = null;
    let oldThumbnailPath = null;
    const uploadsBaseDir = path.join(__dirname, '..', 'uploads');

    try {
        const existingResult = await pool.query('SELECT audio_url, thumbnail_url FROM podcasts WHERE podcast_id = $1', [id]);
        if (existingResult.rows.length === 0) {
             if (audioFile) fs.unlink(audioFile.path, (err) => { if (err) console.error("Error deleting new audio for non-existent podcast:", err); });
             if (thumbnailFile) fs.unlink(thumbnailFile.path, (err) => { if (err) console.error("Error deleting new thumbnail for non-existent podcast:", err); });
            return res.status(404).json({ message: 'Podcast not found.' });
        }
        oldAudioPath = existingResult.rows[0].audio_url;
        oldThumbnailPath = existingResult.rows[0].thumbnail_url;

        const fieldsToUpdate = [];
        const values = [];
        let queryIndex = 1;

        if (title !== undefined) { fieldsToUpdate.push(`title = $${queryIndex++}`); values.push(title); }
        if (description !== undefined) { fieldsToUpdate.push(`description = $${queryIndex++}`); values.push(description || null); }
        if (duration_seconds !== undefined) { fieldsToUpdate.push(`duration_seconds = $${queryIndex++}`); values.push(duration_seconds ? parseInt(duration_seconds, 10) : null); }
        if (published_at !== undefined) { fieldsToUpdate.push(`published_at = $${queryIndex++}`); values.push(published_at || new Date()); }

        if (audioFile) {
            const newAudioDbPath = path.join('podcasts', 'audio', audioFile.filename).replace(/\\/g, '/');
            fieldsToUpdate.push(`audio_url = $${queryIndex++}`);
            values.push(newAudioDbPath);
        }
         if (thumbnailFile) {
            const newThumbnailDbPath = path.join('podcasts', 'thumbnails', thumbnailFile.filename).replace(/\\/g, '/');
            fieldsToUpdate.push(`thumbnail_url = $${queryIndex++}`);
            values.push(newThumbnailDbPath);
        }

        if (fieldsToUpdate.length === 0) {
             if (audioFile) fs.unlink(audioFile.path, (err) => { if (err) console.error("Error deleting unused new audio:", err); });
             if (thumbnailFile) fs.unlink(thumbnailFile.path, (err) => { if (err) console.error("Error deleting unused new thumbnail:", err); });
            const currentData = await pool.query('SELECT * FROM podcasts WHERE podcast_id = $1', [id]);
            const currentPodcast = currentData.rows[0];
            currentPodcast.audio_url = getFullFileUrl(req, currentPodcast.audio_url);
            currentPodcast.thumbnail_url = getFullFileUrl(req, currentPodcast.thumbnail_url);
            return res.status(200).json({ message: "No changes detected.", podcast: currentPodcast });
        }

        fieldsToUpdate.push(`updated_at = NOW()`);
        values.push(id);

        const updateQuery = `
            UPDATE podcasts
            SET ${fieldsToUpdate.join(', ')}
            WHERE podcast_id = $${queryIndex}
            RETURNING *;
        `;
        const updatedPodcastResult = await pool.query(updateQuery, values);
        const updatedPodcast = updatedPodcastResult.rows[0];

        if (audioFile && oldAudioPath && oldAudioPath !== updatedPodcast.audio_url) {
            const fullOldAudioPath = path.join(uploadsBaseDir, oldAudioPath);
            fs.unlink(fullOldAudioPath, (err) => {
                if (err && err.code !== 'ENOENT') console.error(`Error deleting old audio file ${fullOldAudioPath}:`, err);
                else if (!err) console.log(`Deleted old audio file: ${fullOldAudioPath}`);
            });
        }
        if (thumbnailFile && oldThumbnailPath && oldThumbnailPath !== updatedPodcast.thumbnail_url) {
            const fullOldThumbnailPath = path.join(uploadsBaseDir, oldThumbnailPath);
            fs.unlink(fullOldThumbnailPath, (err) => {
                if (err && err.code !== 'ENOENT') console.error(`Error deleting old thumbnail file ${fullOldThumbnailPath}:`, err);
                 else if (!err) console.log(`Deleted old thumbnail file: ${fullOldThumbnailPath}`);
            });
        }
        updatedPodcast.audio_url = getFullFileUrl(req, updatedPodcast.audio_url);
        updatedPodcast.thumbnail_url = getFullFileUrl(req, updatedPodcast.thumbnail_url);
        console.log('Podcast updated successfully:', updatedPodcast); // <-- Log added
        res.status(200).json({
            message: 'Podcast updated successfully.',
            podcast: updatedPodcast
        });
    } catch (err) {
        console.error(`Error updating podcast ${id}:`, err);
        if (audioFile) fs.unlink(audioFile.path, (unlinkErr) => { if (unlinkErr) console.error("Error deleting new audio after update error:", unlinkErr); });
        if (thumbnailFile) fs.unlink(thumbnailFile.path, (unlinkErr) => { if (unlinkErr) console.error("Error deleting new thumbnail after update error:", unlinkErr); });
        res.status(500).json({ message: 'Server error updating podcast.' });
    }
};

exports.deletePodcast = async (req, res) => {
    const { id } = req.params;
    console.log(`Admin request to delete podcast ID: ${id}`);
    let audioPathToDelete = null;
    let thumbnailPathToDelete = null;
    const uploadsBaseDir = path.join(__dirname, '..', 'uploads');

    try {
        const fileResult = await pool.query('SELECT audio_url, thumbnail_url FROM podcasts WHERE podcast_id = $1', [id]);
        if (fileResult.rows.length === 0) {
            return res.status(404).json({ message: 'Podcast not found.' });
        }
        if(fileResult.rows[0].audio_url) {
             audioPathToDelete = path.join(uploadsBaseDir, fileResult.rows[0].audio_url);
        }
         if(fileResult.rows[0].thumbnail_url) {
             thumbnailPathToDelete = path.join(uploadsBaseDir, fileResult.rows[0].thumbnail_url);
        }

        const deleteResult = await pool.query('DELETE FROM podcasts WHERE podcast_id = $1 RETURNING podcast_id', [id]);
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ message: 'Podcast not found during deletion attempt.' });
        }

        if (audioPathToDelete) {
            fs.unlink(audioPathToDelete, (err) => {
                if (err && err.code !== 'ENOENT') console.error(`Error deleting audio file ${audioPathToDelete}:`, err);
                else if (!err) console.log(`Deleted audio file: ${audioPathToDelete}`);
            });
        }
        if (thumbnailPathToDelete) {
            fs.unlink(thumbnailPathToDelete, (err) => {
                if (err && err.code !== 'ENOENT') console.error(`Error deleting thumbnail file ${thumbnailPathToDelete}:`, err);
                 else if (!err) console.log(`Deleted thumbnail file: ${thumbnailPathToDelete}`);
            });
        }
        console.log(`Podcast ${id} deleted successfully.`); // <-- Log added
        res.status(200).json({ message: `Podcast ${id} deleted successfully.` });
    } catch (err) {
        console.error(`Error deleting podcast ${id}:`, err);
        res.status(500).json({ message: 'Server error deleting podcast.' });
    }
};