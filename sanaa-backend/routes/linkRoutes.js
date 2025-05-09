// routes/linkRoutes.js

const express = require('express');
const linkController = require('../controllers/linkController'); // استيراد وحدة تحكم الروابط
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // استيراد وسيط المصادقة والتحقق من الدور

const router = express.Router();

// --- مسارات الروابط ---

// POST /api/links - إرسال رابط جديد لكورس (محمي للمدرسين)
// 1. authenticateToken: التأكد من أن المستخدم مسجل دخوله
// 2. authorizeRole(['teacher']): التأكد من أن دور المستخدم هو 'teacher'
// 3. linkController.sendLink: معالجة الطلب لإضافة الرابط
router.post(
    '/',
    authenticateToken,
    authorizeRole(['teacher']), // السماح للمدرسين فقط
    linkController.sendLink
);

// GET /api/links/course/:courseId - جلب الروابط لكورس معين
// يمكن حماية هذا المسار لاحقًا للسماح فقط للطلاب المسجلين في الكورس أو المدرس/المدير
// حاليًا، سنتركه بدون حماية إضافية كمثال
router.get(
    '/course/:courseId',
    authenticateToken, // يتطلب تسجيل الدخول على الأقل لرؤية الروابط
    linkController.getLinksForCourse
);

// --- يمكن إضافة مسارات أخرى متعلقة بالروابط هنا لاحقًا ---
// مثال: حذف رابط (قد يكون للمدرس أو المدير)
// router.delete('/:linkId', authenticateToken, authorizeRole(['teacher', 'admin']), linkController.deleteLink);


module.exports = router; // تصدير الـ router لاستخدامه في server.js
