// routes/testimonialRoutes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // File system for creating directories
const testimonialController = require('../controllers/testimonialController'); // استيراد وحدة تحكم آراء الطلاب
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // استيراد وسائط الحماية

const router = express.Router();

// --- إعداد Multer لرفع صور الطلاب الرمزية (Avatars) ---
// سنستخدم نفس مجلد avatars المستخدم في userRoutes لتناسق التخزين

// التأكد من وجود مجلد avatars
const uploadsDir = path.join(__dirname, '..', 'uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');

// إنشاء المجلد إذا لم يكن موجودًا
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(avatarsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // تخزين الصور الرمزية في 'uploads/avatars'
    cb(null, avatarsDir);
  },
  filename: function (req, file, cb) {
    // إنشاء اسم فريد للملف: testimonial-{timestamp}-{random}-{originalname}
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E6);
    const extension = path.extname(file.originalname);
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
    cb(null, `testimonial-${uniqueSuffix}-${safeOriginalName}${extension}`);
  }
});

// فلتر للتحقق من أنواع ملفات الصور المسموح بها
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // قبول ملفات الصور
    } else {
        cb(new Error('Invalid file type. Only images allowed.'), false);
    }
};

// إنشاء وسيط Multer بالإعدادات
const uploadAvatar = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // تحديد حجم أقصى للملف (مثال: 2MB للصور الرمزية)
    },
    fileFilter: fileFilter
});

// --- مسارات آراء الطلاب (Testimonials) ---

// GET /api/testimonials - جلب جميع الآراء الموافق عليها (عام)
router.get('/', testimonialController.getPublicTestimonials);

// --- مسارات محمية للمدير لإدارة آراء الطلاب ---
// سيتم تركيب هذه المسارات تحت /api/admin/testimonials في server.js

const adminRouter = express.Router(); // Router فرعي لمسارات المدير

// تطبيق الحماية على جميع مسارات adminRouter
adminRouter.use(authenticateToken);
adminRouter.use(authorizeRole(['admin']));

// GET /api/admin/testimonials - جلب جميع آراء الطلاب (للمدير)
adminRouter.get('/', testimonialController.getAllTestimonials);

// POST /api/admin/testimonials - إضافة رأي جديد (محمي للمدير)
// uploadAvatar.single('avatarFile') لمعالجة ملف واحد باسم الحقل 'avatarFile'
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

// --- تصدير المسارات ---
// تصدير المسار العام والمسار المحمي للمدير بشكل منفصل
module.exports = {
    publicRouter: router, // للمسارات العامة /api/testimonials
    adminRouter: adminRouter   // للمسارات المحمية /api/admin/testimonials
};
