// routes/bookRoutes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // File system for creating directories
const bookController = require('../controllers/bookController'); // استيراد وحدة تحكم الكتب
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // استيراد وسائط الحماية

const router = express.Router();

// --- إعداد Multer لرفع أغلفة وملفات الكتب ---

// التأكد من وجود مجلدات الرفع للكتب
const uploadsDir = path.join(__dirname, '..', 'uploads');
const booksDir = path.join(uploadsDir, 'books');
const coversDir = path.join(booksDir, 'covers'); // مجلد للأغلفة
const filesDir = path.join(booksDir, 'files');   // مجلد لملفات الكتب (PDF, EPUB)

// إنشاء المجلدات إذا لم تكن موجودة
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(booksDir, { recursive: true });
fs.mkdirSync(coversDir, { recursive: true });
fs.mkdirSync(filesDir, { recursive: true });


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // تحديد مجلد التخزين بناءً على اسم الحقل
    if (file.fieldname === 'coverFile') {
      cb(null, coversDir); // تخزين الأغلفة في 'uploads/books/covers'
    } else if (file.fieldname === 'bookFile') {
      cb(null, filesDir); // تخزين ملفات الكتب في 'uploads/books/files'
    } else {
      cb(new Error('Unexpected file field for book upload'), null);
    }
  },
  filename: function (req, file, cb) {
    // إنشاء اسم فريد للملف: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E6);
    const extension = path.extname(file.originalname);
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
    cb(null, `${uniqueSuffix}-${safeOriginalName}${extension}`);
  }
});

// فلتر للتحقق من أنواع الملفات المسموح بها
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'coverFile') {
    // السماح بملفات الصور الشائعة للأغلفة
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif' || file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(new Error('Invalid cover image file type. Only JPG, PNG, GIF, WEBP allowed.'), false);
    }
  } else if (file.fieldname === 'bookFile') {
    // السماح بملفات الكتب الشائعة (PDF, EPUB) - يمكنك إضافة المزيد
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/epub+zip') {
      cb(null, true);
    } else {
      cb(new Error('Invalid book file type. Only PDF, EPUB allowed.'), false);
    }
  } else {
    cb(new Error('Unexpected file field during filter'), false);
  }
};

// إنشاء وسيط Multer بالإعدادات
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // تحديد حجم أقصى للملف (مثال: 50MB للكتب) - اضبط حسب الحاجة
    },
    fileFilter: fileFilter
});

// --- مسارات الكتب ---

// GET /api/books - جلب جميع الكتب (عام، مع فلترة اختيارية)
router.get('/', bookController.getAllBooks);

// GET /api/books/:id - جلب كتاب واحد (عام)
router.get('/:id', bookController.getBookById);

// --- مسارات محمية للمدير ---

// POST /api/books - إضافة كتاب جديد (محمي للمدير)
router.post(
    '/',
    authenticateToken,
    authorizeRole(['admin']),
    upload.fields([
        { name: 'coverFile', maxCount: 1 }, // اسم الحقل لصورة الغلاف
        { name: 'bookFile', maxCount: 1 }   // اسم الحقل لملف الكتاب
    ]),
    bookController.addBook
);

// PUT /api/books/:id - تعديل كتاب (محمي للمدير)
router.put(
    '/:id',
    authenticateToken,
    authorizeRole(['admin']),
    upload.fields([
        { name: 'coverFile', maxCount: 1 },
        { name: 'bookFile', maxCount: 1 }
    ]),
    bookController.updateBook
);

// DELETE /api/books/:id - حذف كتاب (محمي للمدير)
router.delete(
    '/:id',
    authenticateToken,
    authorizeRole(['admin']),
    bookController.deleteBook
);


module.exports = router; // تصدير الـ router لاستخدامه في server.js
