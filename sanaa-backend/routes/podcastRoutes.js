// routes/podcastRoutes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // File system for creating directories
const podcastController = require('../controllers/podcastController'); // استيراد وحدة تحكم البودكاست
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // استيراد وسائط الحماية

const router = express.Router();

// --- إعداد Multer لرفع ملفات البودكاست والصور ---

// التأكد من وجود مجلدات الرفع
const uploadsDir = path.join(__dirname, '..', 'uploads');
const podcastDir = path.join(uploadsDir, 'podcasts');
const audioDir = path.join(podcastDir, 'audio');
const thumbnailDir = path.join(podcastDir, 'thumbnails');

// إنشاء المجلدات إذا لم تكن موجودة
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(podcastDir, { recursive: true });
fs.mkdirSync(audioDir, { recursive: true });
fs.mkdirSync(thumbnailDir, { recursive: true });


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // تحديد مجلد التخزين بناءً على اسم الحقل (fieldname)
    if (file.fieldname === 'audioFile') {
      cb(null, audioDir); // تخزين ملفات الصوت في 'uploads/podcasts/audio'
    } else if (file.fieldname === 'thumbnailFile') {
      cb(null, thumbnailDir); // تخزين الصور المصغرة في 'uploads/podcasts/thumbnails'
    } else {
      cb(new Error('Unexpected file field'), null);
    }
  },
  filename: function (req, file, cb) {
    // إنشاء اسم فريد للملف: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E6); // جزء عشوائي أصغر
    const extension = path.extname(file.originalname);
    // استخدام اسم ملف آمن (إزالة المسافات والأحرف الخاصة إن لزم الأمر)
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
    cb(null, `${uniqueSuffix}-${safeOriginalName}${extension}`);
  }
});

// فلتر للتحقق من أنواع الملفات المسموح بها
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audioFile') {
    // السماح بملفات الصوت الشائعة
    if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/wav' || file.mimetype === 'audio/ogg' || file.mimetype === 'audio/mp3') { // Added mp3 explicitly
      cb(null, true);
    } else {
      cb(new Error('Invalid audio file type. Only MP3, WAV, OGG allowed.'), false);
    }
  } else if (file.fieldname === 'thumbnailFile') {
    // السماح بملفات الصور الشائعة
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif' || file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(new Error('Invalid image file type. Only JPG, PNG, GIF, WEBP allowed.'), false);
    }
  } else {
    cb(new Error('Unexpected file field during filter'), false);
  }
};

// إنشاء وسيط Multer بالإعدادات
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // تحديد حجم أقصى للملف (مثال: 100MB للصوت) - اضبط حسب الحاجة
    },
    fileFilter: fileFilter
});

// --- مسارات البودكاست ---

// GET /api/podcasts - جلب جميع حلقات البودكاست (عام)
router.get('/', podcastController.getAllPodcasts);

// GET /api/podcasts/:id - جلب حلقة بودكاست واحدة (عام)
router.get('/:id', podcastController.getPodcastById);

// --- مسارات محمية للمدير ---

// POST /api/podcasts - إضافة حلقة بودكاست جديدة (محمي للمدير)
// upload.fields يسمح برفع ملفات متعددة بأسماء حقول مختلفة
router.post(
    '/',
    authenticateToken,
    authorizeRole(['admin']),
    upload.fields([
        { name: 'audioFile', maxCount: 1 },      // اسم الحقل لملف الصوت
        { name: 'thumbnailFile', maxCount: 1 }   // اسم الحقل للصورة المصغرة (اختياري)
    ]),
    podcastController.addPodcast
);

// PUT /api/podcasts/:id - تعديل حلقة بودكاست (محمي للمدير)
router.put(
    '/:id',
    authenticateToken,
    authorizeRole(['admin']),
    upload.fields([
        { name: 'audioFile', maxCount: 1 },
        { name: 'thumbnailFile', maxCount: 1 }
    ]),
    podcastController.updatePodcast
);

// DELETE /api/podcasts/:id - حذف حلقة بودكاست (محمي للمدير)
router.delete(
    '/:id',
    authenticateToken,
    authorizeRole(['admin']),
    podcastController.deletePodcast
);


module.exports = router; // تصدير الـ router لاستخدامه في server.js
