// routes/platformSettingsRoutes.js
// تم تعديل هذا الملف لاستخدام multer مع memoryStorage لتحضير الفيديو التعريفي للرفع إلى Cloudinary.

const express = require('express');
const multer = require('multer');
// const path = require('path'); // لم نعد بحاجة إليه هنا
// const fs = require('fs'); // لم نعد بحاجة إليه هنا
const platformSettingsController = require('../controllers/platformSettingsController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// --- إعداد Multer لرفع ملفات الفيديو في الذاكرة ---
const storage = multer.memoryStorage(); // <<<--- التغيير هنا: استخدام التخزين في الذاكرة

// فلتر للتحقق من أنواع ملفات الفيديو المسموح بها (يبقى كما هو)
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'video/mp4' || file.mimetype === 'video/webm' || file.mimetype === 'video/ogg') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only MP4, WebM, or Ogg video allowed.'), false);
    }
};

// إنشاء وسيط Multer بالإعدادات
const uploadIntroVideo = multer({
    storage: storage, // <<<--- استخدام memoryStorage
    limits: {
        fileSize: 200 * 1024 * 1024 // تحديد حجم أقصى للملف (مثال: 200MB للفيديو)
    },
    fileFilter: fileFilter
});

// --- مسارات إعدادات المنصة (Platform Settings) ---

// GET /api/settings/:key - جلب قيمة إعداد معين (عام)
router.get('/:key', platformSettingsController.getSetting);

// --- مسارات محمية للمدير لإدارة الإعدادات ---
const adminRouter = express.Router();
adminRouter.use(authenticateToken);
adminRouter.use(authorizeRole(['admin']));

// PUT /api/admin/settings/intro-video - تحديث الفيديو التعريفي (محمي للمدير)
// uploadIntroVideo.single('introVideoFile') سيوفر الملف في req.file.buffer
adminRouter.put(
    '/intro-video',
    uploadIntroVideo.single('introVideoFile'), // اسم الحقل لملف الفيديو
    platformSettingsController.updateIntroVideo
);

module.exports = {
    publicRouter: router,
    adminRouter: adminRouter
};
