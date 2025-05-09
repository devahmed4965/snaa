// routes/audioRoutes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // File system for creating directories
const audioController = require('../controllers/audioController'); // استيراد وحدة تحكم الصوتيات
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // استيراد وسائط الحماية

const router = express.Router();

// --- إعداد Multer لرفع الملفات الصوتية ---

// التأكد من وجود مجلدات الرفع للصوتيات
const uploadsDir = path.join(__dirname, '..', 'uploads');
const audioBaseDir = path.join(uploadsDir, 'audio'); // المجلد الرئيسي للصوتيات
const generalAudioDir = path.join(audioBaseDir, 'general'); // مجلد فرعي افتراضي

// إنشاء المجلدات إذا لم تكن موجودة
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(audioBaseDir, { recursive: true });
fs.mkdirSync(generalAudioDir, { recursive: true });


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // تخزين جميع ملفات الصوت في المجلد الفرعي 'general' حاليًا
    // يمكن تعديل هذا لاحقًا إذا أردت مجلدات فرعية بناءً على التصنيف مثلاً
    cb(null, generalAudioDir);
  },
  filename: function (req, file, cb) {
    // إنشاء اسم فريد للملف: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E6);
    const extension = path.extname(file.originalname);
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
    cb(null, `${uniqueSuffix}-${safeOriginalName}${extension}`);
  }
});

// فلتر للتحقق من أنواع الملفات الصوتية المسموح بها
const fileFilter = (req, file, cb) => {
  // السماح بملفات الصوت الشائعة
  if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/wav' || file.mimetype === 'audio/ogg' || file.mimetype === 'audio/mp3') {
    cb(null, true); // قبول الملف
  } else {
    cb(new Error('Invalid audio file type. Only MP3, WAV, OGG allowed.'), false); // رفض الملف
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

// --- مسارات الصوتيات ---

// GET /api/audio - جلب جميع الملفات الصوتية (عام، مع فلترة اختيارية)
router.get('/', audioController.getAllAudioFiles);

// GET /api/audio/:id - جلب ملف صوتي واحد (عام)
router.get('/:id', audioController.getAudioFileById);

// --- مسارات محمية للمدير ---

// POST /api/audio - إضافة ملف صوتي جديد (محمي للمدير)
// upload.single('audioFile') لمعالجة ملف واحد باسم الحقل 'audioFile'
router.post(
    '/',
    authenticateToken,
    authorizeRole(['admin']),
    upload.single('audioFile'), // اسم الحقل لملف الصوت
    audioController.addAudioFile
);

// PUT /api/audio/:id - تعديل ملف صوتي (محمي للمدير)
router.put(
    '/:id',
    authenticateToken,
    authorizeRole(['admin']),
    upload.single('audioFile'), // يسمح برفع ملف جديد ليحل محل القديم
    audioController.updateAudioFile
);

// DELETE /api/audio/:id - حذف ملف صوتي (محمي للمدير)
router.delete(
    '/:id',
    authenticateToken,
    authorizeRole(['admin']),
    audioController.deleteAudioFile
);


module.exports = router; // تصدير الـ router لاستخدامه في server.js
