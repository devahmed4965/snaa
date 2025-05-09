// middleware/authMiddleware.js

const jwt = require('jsonwebtoken'); // لاستيراد مكتبة JWT
require('dotenv').config(); // للتأكد من تحميل متغيرات البيئة (خاصة JWT_SECRET)

// دالة الوسيط للتحقق من توكن JWT
const authenticateToken = (req, res, next) => {
  // الحصول على التوكن من هيدر Authorization
  // الهيدر عادة يكون بالشكل: "Bearer TOKEN_STRING"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // استخلاص التوكن فقط

  // إذا لم يتم العثور على توكن
  if (token == null) {
    console.log('Auth Middleware: No token provided.');
    // 401 Unauthorized: الطلب يفتقر إلى بيانات اعتماد المصادقة الصالحة
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // التحقق من صحة التوكن
  jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
    if (err) {
      console.log('Auth Middleware: Token verification failed.', err.message);
      // 403 Forbidden: الخادم فهم الطلب ولكنه يرفض تفويضه (التوكن غير صالح أو منتهي الصلاحية)
      if (err.name === 'TokenExpiredError') {
          return res.status(403).json({ message: 'Access denied. Token has expired.' });
      }
      return res.status(403).json({ message: 'Access denied. Invalid token.' });
    }

    // إذا كان التوكن صالحًا، قم بإرفاق بيانات المستخدم (payload) بكائن الطلب (req)
    // هذا يجعل بيانات المستخدم (مثل userId, role) متاحة في معالجات المسارات اللاحقة
    req.user = userPayload;
    console.log('Auth Middleware: Token verified successfully for user:', req.user.userId);

    // الانتقال إلى الوسيط التالي أو معالج المسار
    next();
  });
};

// (اختياري) يمكن إضافة وسيط آخر للتحقق من الدور (Authorization)
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        // يفترض أن authenticateToken قد تم تنفيذه قبله وأضاف req.user
        if (!req.user || !req.user.role) {
            console.log('Authorization Middleware: User role not found.');
            return res.status(403).json({ message: 'Forbidden: User role missing.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            console.log(`Authorization Middleware: User role '${req.user.role}' not authorized. Allowed: ${allowedRoles}`);
            return res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource.' });
        }

        // إذا كان الدور مسموحًا به
        next();
    };
};


module.exports = {
    authenticateToken,
    authorizeRole // تصدير دالة التحقق من الدور أيضًا
};
