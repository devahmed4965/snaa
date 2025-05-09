// routes/platformSettingsRoutes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // File system for creating directories
const platformSettingsController = require('../controllers/platformSettingsController'); // استيراد وحدة تحكم الإعدادات
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // استيراد وسائط الحماية

const router = express.Router();

// --- إعداد Multer لرفع ملفات الفيديو ---

// التأكد من وجود مجلدات الرفع للفيديو
const uploadsDir = path.join(__dirname, '..', 'uploads');
const videosDir = path.join(uploadsDir, 'videos'); // مجلد لملفات الفيديو

// إنشاء المجلد إذا لم يكن موجودًا
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(videosDir, { recursive: true });


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // تخزين الفيديو في 'uploads/videos'
    cb(null, videosDir);
  },
  filename: function (req, file, cb) {
    // إنشاء اسم فريد للملف: intro-video-{timestamp}{extension}
    const uniqueSuffix = Date.now();
    const extension = path.extname(file.originalname);
    // اسم ثابت نسبيًا لتسهيل الإشارة إليه، مع إضافة timestamp لمنع التخزين المؤقت فقط
    cb(null, `intro-video-${uniqueSuffix}${extension}`);
  }
});

// فلتر للتحقق من أنواع ملفات الفيديو المسموح بها
const fileFilter = (req, file, cb) => {
    // السماح بأنواع الفيديو الشائعة (يمكن إضافة المزيد)
    if (file.mimetype === 'video/mp4' || file.mimetype === 'video/webm' || file.mimetype === 'video/ogg') {
        cb(null, true); // قبول الملف
    } else {
        cb(new Error('Invalid file type. Only MP4, WebM, or Ogg video allowed.'), false); // رفض الملف
    }
};

// إنشاء وسيط Multer بالإعدادات
const uploadIntroVideo = multer({
    storage: storage,
    limits: {
        fileSize: 200 * 1024 * 1024 // تحديد حجم أقصى للملف (مثال: 200MB للفيديو) - اضبط حسب الحاجة
    },
    fileFilter: fileFilter
});

// --- مسارات إعدادات المنصة (Platform Settings) ---

// GET /api/settings/:key - جلب قيمة إعداد معين (عام)
// هذا المسار سيُستخدم لجلب رابط الفيديو التعريفي في الصفحة الرئيسية
router.get('/:key', platformSettingsController.getSetting);

// --- مسارات محمية للمدير لإدارة الإعدادات ---
// سيتم تركيب هذه المسارات تحت /api/admin/settings في server.js

const adminRouter = express.Router(); // Router فرعي لمسارات المدير

// تطبيق الحماية على جميع مسارات adminRouter
adminRouter.use(authenticateToken);
adminRouter.use(authorizeRole(['admin']));

// PUT /api/admin/settings/intro-video - تحديث الفيديو التعريفي (محمي للمدير)
// uploadIntroVideo.single('introVideoFile') لمعالجة ملف واحد باسم الحقل 'introVideoFile'
adminRouter.put(
    '/intro-video',
    uploadIntroVideo.single('introVideoFile'), // اسم الحقل لملف الفيديو
    platformSettingsController.updateIntroVideo
);

// --- تصدير المسارات ---
module.exports = {
    publicRouter: router, // للمسارات العامة /api/settings
    adminRouter: adminRouter   // للمسارات المحمية /api/admin/settings
};
