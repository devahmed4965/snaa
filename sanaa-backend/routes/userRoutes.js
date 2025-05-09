// routes/userRoutes.js

const express = require('express');
const multer = require('multer'); // <<<--- استيراد multer
const path = require('path'); // <<<--- لاستخدام مسارات الملفات
const userController = require('../controllers/userController'); // استيراد وحدة تحكم المستخدم
const { authenticateToken } = require('../middleware/authMiddleware'); // استيراد وسيط المصادقة

const router = express.Router();

// --- إعداد Multer لتخزين الملفات ---
// سيتم تخزين الملفات في مجلد 'uploads/avatars' داخل الـ backend
// تأكد من إنشاء هذا المجلد يدوياً أو أن الكود لديه الصلاحيات لإنشائه
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // تحديد مجلد التخزين
    const uploadPath = path.join(__dirname, '..', 'uploads', 'avatars'); // المسار النسبي للمجلد
    // يمكنك إضافة تحقق وإنشاء المجلد إذا لم يكن موجودًا هنا
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // إنشاء اسم فريد للملف (user_id + timestamp + extension)
    const userId = req.user?.userId || 'unknown'; // الحصول على ID المستخدم من التوكن
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname); // الحصول على امتداد الملف الأصلي
    cb(null, `user-${userId}-${uniqueSuffix}${extension}`);
  }
});

// --- فلتر للتحقق من نوع الملف ---
const fileFilter = (req, file, cb) => {
  // السماح فقط بملفات الصور الشائعة
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
    cb(null, true); // قبول الملف
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, or GIF allowed.'), false); // رفض الملف
  }
};

// --- إنشاء middleware الرفع باستخدام الإعدادات ---
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // تحديد حجم أقصى للملف (مثال: 2MB)
    fileFilter: fileFilter
});


// --- مسارات الملف الشخصي ---

// GET /api/users/profile - جلب بيانات الملف الشخصي للمستخدم المسجل دخوله
router.get('/profile', authenticateToken, userController.getUserProfile);

// PUT /api/users/profile - تحديث بيانات الملف الشخصي للمستخدم المسجل دخوله
// 1. authenticateToken: التحقق من التوكن
// 2. upload.single('avatar'): معالجة حقل الملف المسمى 'avatar' بواسطة multer
//    سيقوم multer بتحليل الحقول النصية ووضعها في req.body والملف في req.file
router.put(
    '/profile',
    authenticateToken,
    upload.single('avatar'), // <<<--- تطبيق middleware multer هنا
    userController.updateUserProfile
);

// --- يمكن إضافة مسارات أخرى متعلقة بالمستخدم هنا لاحقًا ---

module.exports = router; // تصدير الـ router لاستخدامه في server.js
