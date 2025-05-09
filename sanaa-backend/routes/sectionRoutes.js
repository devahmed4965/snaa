// sanaa-backend/routes/sectionRoutes.js
const express = require('express');
const router = express.Router();
// تأكد من أن المسار إلى المتحكم صحيح
// Make sure the path to the controller is correct
const sectionController = require('../controllers/sectionController');

// GET /api/sections - Get all active sections for public display
router.get('/', sectionController.getPublicSections);

module.exports = router;
