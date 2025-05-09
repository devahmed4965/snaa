// sanaa-backend/controllers/platformSettingsController.js
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

exports.getSetting = async (req, res) => {
    const { key } = req.params;
    console.log(`Request received to get setting: ${key}`);
    try {
        const result = await pool.query(
            'SELECT setting_value FROM platform_settings WHERE setting_key = $1',
            [key]
        );
        console.log(`Fetched setting '${key}' from DB:`, result.rows[0]); // <-- Log added

        if (result.rows.length === 0) {
            return res.status(200).json({
                message: `Setting '${key}' not found, returning default.`,
                setting: { key: key, value: null }
            });
        }

        const settingValue = result.rows[0].setting_value;
        let finalValue = settingValue;

        if (key === 'intro_video_url' && settingValue) {
            finalValue = getFullFileUrl(req, settingValue);
        }
        console.log(`Final value for setting '${key}':`, finalValue); // <-- Log added
        res.status(200).json({
            message: `Setting '${key}' fetched successfully.`,
            setting: { key: key, value: finalValue }
        });
    } catch (err) {
        console.error(`Error fetching setting ${key}:`, err);
        res.status(500).json({ message: `Server error fetching setting ${key}.` });
    }
};

exports.updateIntroVideo = async (req, res) => {
    const introVideoFile = req.file;
    const settingKey = 'intro_video_url';
    console.log("Admin request to update intro video", { file: introVideoFile?.filename });

    if (!introVideoFile) {
        return res.status(400).json({ message: "Video file is required." });
    }

    const videoDbPath = path.join('videos', introVideoFile.filename).replace(/\\/g, '/');
    let oldVideoRelativePath = null;
    const uploadsBaseDir = path.join(__dirname, '..', 'uploads');

    try {
        const oldPathResult = await pool.query(
            'SELECT setting_value FROM platform_settings WHERE setting_key = $1',
            [settingKey]
        );
        if (oldPathResult.rows.length > 0 && oldPathResult.rows[0].setting_value) {
            oldVideoRelativePath = oldPathResult.rows[0].setting_value;
            console.log("Old intro video path found:", oldVideoRelativePath); // <-- Log added
        }

        const updateQuery = `
            INSERT INTO platform_settings (setting_key, setting_value, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (setting_key) DO UPDATE SET
                setting_value = EXCLUDED.setting_value,
                updated_at = NOW()
            RETURNING setting_key, setting_value;
        `;
        const values = [settingKey, videoDbPath];
        const updatedSettingResult = await pool.query(updateQuery, values);
        const updatedSetting = updatedSettingResult.rows[0];
        console.log('Intro video setting updated in DB:', updatedSetting); // <-- Log added

        if (oldVideoRelativePath && oldVideoRelativePath !== videoDbPath) {
            const fullOldVideoPath = path.join(uploadsBaseDir, oldVideoRelativePath);
            console.log("Attempting to delete old intro video:", fullOldVideoPath); // <-- Log added
            await fs.unlink(fullOldVideoPath).catch(err => {
                if (err.code !== 'ENOENT') console.error(`Error deleting old intro video ${fullOldVideoPath}:`, err);
                else console.log(`Old intro video not found, skipping deletion: ${fullOldVideoPath}`);
            });
        }

        const fullUrl = getFullFileUrl(req, updatedSetting.setting_value);
        res.status(200).json({
            message: 'Introductory video updated successfully.',
            setting: { key: updatedSetting.setting_key, value: fullUrl }
        });
    } catch (err) {
        console.error("Error updating intro video setting:", err);
        if (introVideoFile) await fs.unlink(introVideoFile.path).catch(e => console.error("Error deleting newly uploaded intro video after DB error:", e));
        res.status(500).json({ message: 'Server error updating introductory video.' });
    }
};
