// routes/certificateRoutes.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // File system for creating directories
const certificateController = require('../controllers/certificateController'); // استيراد وحدة تحكم الشهادات
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // استيراد وسائط الحماية

const router = express.Router();

// --- إعداد Multer لرفع صور الشهادات ---

// التأكد من وجود مجلدات الرفع للشهادات
const uploadsDir = path.join(__dirname, '..', 'uploads');
const certificatesDir = path.join(uploadsDir, 'certificates'); // مجلد لصور الشهادات

// إنشاء المجلد إذا لم يكن موجودًا
fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(certificatesDir, { recursive: true });


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // تخزين الصور في 'uploads/certificates'
    cb(null, certificatesDir);
  },
  filename: function (req, file, cb) {
    // إنشاء اسم فريد للملف: certificate-{timestamp}-{random}-{originalname}
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E6);
    const extension = path.extname(file.originalname);
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_').toLowerCase();
    cb(null, `certificate-${uniqueSuffix}-${safeOriginalName}${extension}`);
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
const uploadCertificateImage = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // تحديد حجم أقصى للملف (مثال: 5MB للصور)
    },
    fileFilter: fileFilter
});

// --- مسارات الشهادات (Certificates) ---

// GET /api/certificates - جلب جميع الشهادات للعرض العام
router.get('/', certificateController.getPublicCertificates);

// --- مسارات محمية للمدير لإدارة الشهادات ---
// سيتم تركيب هذه المسارات تحت /api/admin/certificates في server.js

const adminRouter = express.Router(); // Router فرعي لمسارات المدير

// تطبيق الحماية على جميع مسارات adminRouter
adminRouter.use(authenticateToken);
adminRouter.use(authorizeRole(['admin']));

// GET /api/admin/certificates - جلب جميع الشهادات (للمدير)
adminRouter.get('/', certificateController.getAllCertificates);

// POST /api/admin/certificates - إضافة شهادة جديدة (محمي للمدير)
// uploadCertificateImage.single('certificateImage') لمعالجة ملف واحد باسم الحقل 'certificateImage'
adminRouter.post(
    '/',
    uploadCertificateImage.single('certificateImage'), // اسم الحقل لصورة الشهادة
    certificateController.addCertificate
);

// DELETE /api/admin/certificates/:id - حذف شهادة (محمي للمدير)
adminRouter.delete(
    '/:id',
    certificateController.deleteCertificate
);

// --- تصدير المسارات ---
module.exports = {
    publicRouter: router, // للمسارات العامة /api/certificates
    adminRouter: adminRouter   // للمسارات المحمية /api/admin/certificates
};
