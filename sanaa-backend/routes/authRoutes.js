// routes/authRoutes.js

const express = require('express');
const authController = require('../controllers/authController'); // سنقوم باستيراد وحدة التحكم

const router = express.Router();

// تعريف مسار إنشاء حساب جديد
// POST /api/auth/signup
router.post('/signup', authController.handleSignup); // ربط المسار بدالة التحكم المقابلة

// TODO: إضافة مسار تسجيل الدخول لاحقًا
// router.post('/login', authController.handleLogin);

// TODO: إضافة مسار تسجيل الخروج لاحقًا
// router.post('/logout', authController.handleLogout);
// في routes/authRoutes.js
router.post('/login', authController.handleLogin); // إلغاء التعليق
router.post('/logout', authController.handleLogout); // إلغاء التعليق (اختياري)

module.exports = router; // تصدير الـ router لاستخدامه في server.js
