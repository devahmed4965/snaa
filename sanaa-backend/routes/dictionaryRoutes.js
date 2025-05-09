// routes/dictionaryRoutes.js

const express = require('express');
const dictionaryController = require('../controllers/dictionaryController'); // استيراد وحدة تحكم المعجم
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware'); // استيراد وسائط الحماية

const router = express.Router();

// --- مسارات المعجم ---

// GET /api/dictionaries - جلب جميع إدخالات المعجم (عام، مع فلترة اختيارية بالمصطلح)
router.get('/', dictionaryController.getAllEntries);

// GET /api/dictionaries/:id - جلب إدخال واحد (عام)
router.get('/:id', dictionaryController.getEntryById);

// --- مسارات محمية للمدير لإدارة المعجم ---

// POST /api/dictionaries - إضافة مصطلح جديد (محمي للمدير)
router.post(
    '/',
    authenticateToken,
    authorizeRole(['admin']),
    dictionaryController.addEntry
);

// PUT /api/dictionaries/:id - تعديل مصطلح (محمي للمدير)
router.put(
    '/:id',
    authenticateToken,
    authorizeRole(['admin']),
    dictionaryController.updateEntry
);

// DELETE /api/dictionaries/:id - حذف مصطلح (محمي للمدير)
router.delete(
    '/:id',
    authenticateToken,
    authorizeRole(['admin']),
    dictionaryController.deleteEntry
);


module.exports = router;
