// routes/courseRoutes.js

const express = require('express');
const courseController = require('../controllers/courseController'); // استيراد وحدة تحكم الكورسات
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // استيراد وسيط المصادقة والتحقق من الدور

const router = express.Router();

// --- مسارات الكورسات ---

// GET /api/courses - جلب جميع الكورسات (عام، لا يحتاج مصادقة)
router.get('/', courseController.getAllCourses);

// GET /api/courses/:courseId - جلب كورس معين بواسطة ID (عام، لا يحتاج مصادقة)
// ملاحظة: دالة getCourseById في courseController تحتاج إلى تنفيذ كامل
router.get('/:courseId', courseController.getCourseById);

// --- مسارات محمية للمدير فقط ---

// POST /api/courses - إضافة كورس جديد (محمي للمدير)
// 1. authenticateToken: التأكد من أن المستخدم مسجل دخوله
// 2. authorizeRole(['admin']): التأكد من أن دور المستخدم هو 'admin'
// 3. courseController.addCourse: معالجة الطلب لإضافة الكورس
router.post(
    '/',
    authenticateToken,
    authorizeRole(['admin']), // السماح للمديرين فقط
    courseController.addCourse
);

// PUT /api/courses/:courseId - تعديل كورس موجود (محمي للمدير)
router.put(
    '/:courseId',
    authenticateToken,
    authorizeRole(['admin']),
    courseController.updateCourse
);

// DELETE /api/courses/:courseId - حذف كورس (محمي للمدير)
router.delete(
    '/:courseId',
    authenticateToken,
    authorizeRole(['admin']),
    courseController.deleteCourse
);


module.exports = router; // تصدير الـ router لاستخدامه في server.js
