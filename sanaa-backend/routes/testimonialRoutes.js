// routes/testimonialRoutes.js
// تم تعديل هذا الملف لاستخدام multer مع memoryStorage لتحضير صور الطلاب للرفع إلى Cloudinary.

const express = require('express');
const multer = require('multer');
// const path = require('path'); //  لم نعد بحاجة إليه هنا
// const fs = require('fs'); // لم نعد بحاجة إليه هنا
const testimonialController = require('../controllers/testimonialController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// --- إعداد Multer لرفع صور الطلاب الرمزية (Avatars) في الذاكرة ---
const storage = multer.memoryStorage(); // <<<--- التغيير هنا: استخدام التخزين في الذاكرة

// فلتر للتحقق من أنواع ملفات الصور المسموح بها (يبقى كما هو)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // قبول ملفات الصور
    } else {
        cb(new Error('Invalid file type. Only images allowed.'), false);
    }
};

// إنشاء وسيط Multer بالإعدادات
const uploadAvatar = multer({
    storage: storage, // <<<--- استخدام memoryStorage
    limits: {
        fileSize: 2 * 1024 * 1024 // تحديد حجم أقصى للملف (مثال: 2MB للصور الرمزية)
    },
    fileFilter: fileFilter
});

// --- مسارات آراء الطلاب (Testimonials) ---

// GET /api/testimonials - جلب جميع الآراء الموافق عليها (عام)
router.get('/', testimonialController.getPublicTestimonials);

// --- مسارات محمية للمدير لإدارة آراء الطلاب ---
const adminRouter = express.Router();
adminRouter.use(authenticateToken);
adminRouter.use(authorizeRole(['admin']));

// GET /api/admin/testimonials - جلب جميع آراء الطلاب (للمدير)
adminRouter.get('/', testimonialController.getAllTestimonials);

// POST /api/admin/testimonials - إضافة رأي جديد (محمي للمدير)
// uploadAvatar.single('avatarFile') سيوفر الملف في req.file.buffer
adminRouter.post(
    '/',
    uploadAvatar.single('avatarFile'), // اسم الحقل للصورة الرمزية (اختياري)
    testimonialController.addTestimonial
);

// PUT /api/admin/testimonials/:id - تعديل رأي (مثل الموافقة عليه) (محمي للمدير)
adminRouter.put(
    '/:id',
    uploadAvatar.single('avatarFile'), // يسمح برفع ملف جديد ليحل محل القديم
    testimonialController.updateTestimonial
);

// DELETE /api/admin/testimonials/:id - حذف رأي (محمي للمدير)
adminRouter.delete(
    '/:id',
    testimonialController.deleteTestimonial
);

module.exports = {
    publicRouter: router,
    adminRouter: adminRouter
};
