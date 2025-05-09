// sanaa-backend/controllers/sectionController.js
const pool = require('../config/db');

exports.getPublicSections = async (req, res) => {
    console.log("Public request received to get active platform sections");
    try {
        const result = await pool.query(
            `SELECT section_id, name_key, icon_class, path, display_order, is_active
             FROM platform_sections
             WHERE is_active = TRUE  -- Only fetch active sections for public view
             ORDER BY display_order ASC, section_id ASC`
        );
        console.log('Fetched public sections from DB:', result.rows); // <-- Log added
        res.status(200).json({
            message: "Active sections fetched successfully.",
            count: result.rows.length,
            sections: result.rows
        });
    } catch (err) {
        console.error("Error fetching public platform sections:", err);
        res.status(500).json({ message: "Server error fetching sections." });
    }
};