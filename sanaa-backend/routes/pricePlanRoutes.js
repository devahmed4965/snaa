// sanaa-backend/routes/pricePlanRoutes.js
const express = require('express');
const pricePlanController = require('../controllers/pricePlanController');
// const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // إذا احتجت حماية لمسارات معينة

const router = express.Router();

// GET /api/price-plans - جلب جميع خطط الأسعار النشطة (عام)
router.get('/', pricePlanController.getAllPricePlans);

// --- مسارات محمية للمدير (يمكن إضافتها لاحقًا) ---
// مثال:
// router.post('/', authenticateToken, authorizeRole(['admin']), pricePlanController.addPricePlan);
// router.put('/:planId', authenticateToken, authorizeRole(['admin']), pricePlanController.updatePricePlan);
// router.delete('/:planId', authenticateToken, authorizeRole(['admin']), pricePlanController.deletePricePlan);

module.exports = router;