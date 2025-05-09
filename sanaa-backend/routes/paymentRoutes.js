// sanaa-backend/routes/paymentRoutes.js
const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/authMiddleware'); //  لحماية بعض المسارات

const router = express.Router();

// POST /api/payments/initiate - بدء عملية دفع جديدة (محمي)
router.post('/initiate', authenticateToken, paymentController.initiatePayment);

// POST /api/payments/webhook - استقبال إشعارات من بوابة الدفع (عام)
//  ملاحظة: Stripe يتطلب أن يكون هذا المسار بدون express.json() middleware إذا كنت تستخدم req.rawBody
//  سنقوم بمعالجة هذا في server.js إذا لزم الأمر.
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleWebhook);


module.exports = router;
