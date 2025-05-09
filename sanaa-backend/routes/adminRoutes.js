// routes/adminRoutes.js

const express = require('express');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // استيراد الوسائط
const adminController = require('../controllers/adminController'); // استيراد وحدة تحكم المدير
const pricePlanController = require('../controllers/pricePlanController'); // *** ADDED: Import pricePlanController ***

const router = express.Router();

// --- تطبيق وسائط الحماية على جميع مسارات المدير ---
// Any request starting with /api/admin will first require a valid token and 'admin' role
router.use(authenticateToken);
router.use(authorizeRole(['admin']));

// --- مسارات إدارة المستخدمين (Admin User Management) ---
// GET /api/admin/users - Fetches a list of all users
router.get('/users', adminController.getAllUsers);

// GET /api/admin/users/:userId - Fetches data for a specific user
router.get('/users/:userId', adminController.getUserById);

// PUT /api/admin/users/:userId - Updates user data (e.g., changing role)
router.put('/users/:userId', adminController.updateUser);

// DELETE /api/admin/users/:userId - Deletes a user
router.delete('/users/:userId', adminController.deleteUser);

// POST /api/admin/users - Adds a new user (if admin should be able to create users directly)
// Note: Requires addUser function in adminController if uncommented
// router.post('/users', adminController.addUser);

// --- مسارات إدارة الكورسات (Admin Course Management) ---
// Note: Actual course CRUD (Create, Read, Update, Delete) operations are in courseRoutes.js,
// and are protected there for admin roles.
// These admin-specific routes here could be for views or bulk operations if needed in the future.

// --- مسارات التعيينات (Admin Assignments) ---
// POST /api/admin/assignments - Assigns a student or teacher to a course
router.post('/assignments', adminController.assignUserToCourse);

// DELETE /api/admin/assignments - Unassigns/unenrolls a user from a course
// Consider using URL parameters for clarity if req.body for DELETE is problematic:
// e.g., router.delete('/assignments/course/:courseId/user/:userId', adminController.unassignUserFromCourse);
router.delete('/assignments', adminController.unassignUserFromCourse);


// --- Platform Section Management Routes ---
// GET /api/admin/sections - Fetches all platform sections
router.get('/sections', adminController.getSections);

// POST /api/admin/sections - Adds a new platform section
router.post('/sections', adminController.addSection);

// PUT /api/admin/sections/:sectionId - Modifies an existing section
router.put('/sections/:sectionId', adminController.updateSection);

// DELETE /api/admin/sections/:sectionId - Deletes a section
router.delete('/sections/:sectionId', adminController.deleteSection);

// --- Price Plan Management Routes for Admin ---
// GET /api/admin/price-plans - Fetches all price plans for the admin view
router.get('/price-plans', pricePlanController.getAllPricePlansAdmin);

// POST /api/admin/price-plans - Adds a new price plan
router.post('/price-plans', pricePlanController.addPricePlan);

// PUT /api/admin/price-plans/:planId - Updates an existing price plan
router.put('/price-plans/:planId', pricePlanController.updatePricePlan);

// DELETE /api/admin/price-plans/:planId - Deletes a price plan
router.delete('/price-plans/:planId', pricePlanController.deletePricePlan);


module.exports = router; // Export the router for use in server.js
