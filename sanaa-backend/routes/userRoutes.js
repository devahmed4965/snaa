// routes/userRoutes.js
// تم تعديل هذا الملف لاستخدام multer مع memoryStorage لتحضير الملفات للرفع إلى Cloudinary.

const express = require('express');
const multer = require('multer'); // استيراد multer
// const path = require('path'); //  لم نعد بحاجة إليه لحفظ الملفات محليًا في هذا المسار
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// --- إعداد Multer لتخزين الملفات في الذاكرة ---
// بدلًا من diskStorage، سنستخدم memoryStorage.
// هذا يجعل الملف متاحًا كـ Buffer في req.file.buffer
const storage = multer.memoryStorage(); // <<<--- التغيير هنا

// --- فلتر للتحقق من نوع الملف (يبقى كما هو) ---
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, or GIF allowed.'), false);
  }
};

// --- إنشاء middleware الرفع باستخدام الإعدادات الجديدة ---
const upload = multer({
    storage: storage, // <<<--- استخدام memoryStorage
    limits: { fileSize: 5 * 1024 * 1024 }, // تحديد حجم أقصى للملف (مثال: 5MB للصور الرمزية)
    fileFilter: fileFilter
});


// --- مسارات الملف الشخصي ---

// GET /api/users/profile - جلب بيانات الملف الشخصي للمستخدم المسجل دخوله
router.get('/profile', authenticateToken, userController.getUserProfile);

// PUT /api/users/profile - تحديث بيانات الملف الشخصي للمستخدم المسجل دخوله
// 1. authenticateToken: التحقق من التوكن
// 2. upload.single('avatar'): معالجة حقل الملف المسمى 'avatar' بواسطة multer
//    سيقوم multer الآن بتوفير الملف كـ Buffer في req.file.buffer
router.put(
    '/profile',
    authenticateToken,
    upload.single('avatar'), // <<<--- multer سيستخدم memoryStorage
    userController.updateUserProfile // وحدة التحكم ستقوم بالرفع لـ Cloudinary
);

module.exports = router;
