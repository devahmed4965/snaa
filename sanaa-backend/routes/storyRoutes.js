// routes/storyRoutes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // File system for creating directories
const storyController = require('../controllers/storyController'); // استيراد وحدة تحكم القصص
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // استيراد وسائط الحماية

// --- إعداد Multer لرفع صور القصص ---
// (تأكد من أن هذا الجزء يعمل بشكل صحيح ولا يسبب أخطاء)
let storiesDir;
try {
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    storiesDir = path.join(uploadsDir, 'stories'); // مجلد لصور القصص

    // إنشاء المجلدات إذا لم تكن موجودة
    fs.mkdirSync(uploadsDir, { recursive: true });
    fs.mkdirSync(storiesDir, { recursive: true });
    console.log("Multer destination directory confirmed:", storiesDir); // Log directory
} catch (err) {
    console.error("Error setting up Multer directory for stories:", err);
    // لا توقف العملية هنا، قد يعمل Multer لاحقًا أو قد لا تحتاج لرفع ملفات فورًا
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // تخزين الصور في 'uploads/stories'
    if (!storiesDir) {
        // حاول إنشائه مرة أخرى أو أبلغ عن خطأ
        return cb(new Error("Stories upload directory not initialized."), null);
    }
    cb(null, storiesDir);
  },
  filename: function (req, file, cb) {
    // إنشاء اسم فريد للملف: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E6);
    const extension = path.extname(file.originalname);
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
    // تأكد من أن الامتداد يبدأ بنقطة واحدة فقط
    const finalExtension = extension && extension.startsWith('.') ? extension : '';
    cb(null, `${uniqueSuffix}-${safeOriginalName}${finalExtension}`);
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
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // تحديد حجم أقصى للملف (مثال: 5MB للصور)
    },
    fileFilter: fileFilter
});

// --- مسارات القصص والسيرة ---

const publicRouter = express.Router(); // Router للمسارات العامة
const adminRouter = express.Router();   // Router لمسارات المدير

// GET /api/stories - جلب جميع القصص (عام، مع فلترة اختيارية بالتصنيف)
publicRouter.get('/', storyController.getAllStories);

// GET /api/stories/:id - جلب قصة واحدة (عام)
publicRouter.get('/:id', storyController.getStoryById);

// --- مسارات محمية للمدير لإدارة القصص ---

// تطبيق الحماية على جميع مسارات adminRouter
adminRouter.use(authenticateToken);
adminRouter.use(authorizeRole(['admin']));

// *** <<<--- السطر المضاف لحل المشكلة ---***
// GET /api/admin/stories - جلب جميع القصص (للمدير)
adminRouter.get('/', storyController.getAllStories); // استخدام نفس الدالة لجلب الكل للمدير

// POST /api/admin/stories - إضافة قصة/سيرة جديدة (محمي للمدير)
adminRouter.post(
    '/',
    upload.single('imageFile'), // اسم الحقل لصورة القصة (اختياري)
    storyController.addStory
);

// PUT /api/admin/stories/:id - تعديل قصة/سيرة (محمي للمدير)
adminRouter.put(
    '/:id',
    upload.single('imageFile'), // يسمح برفع ملف جديد ليحل محل القديم
    storyController.updateStory
);

// DELETE /api/admin/stories/:id - حذف قصة/سيرة (محمي للمدير)
adminRouter.delete(
    '/:id',
    storyController.deleteStory
);


// --- تصدير المسارات ---
const exportedRoutes = {
    publicRouter: publicRouter,
    adminRouter: adminRouter
};

console.log("Exporting storyRoutes:", typeof exportedRoutes.publicRouter, typeof exportedRoutes.adminRouter);

module.exports = exportedRoutes;
