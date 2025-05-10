// sanaa-backend/config/cloudinaryConfig.js
// هذا الملف يقوم بإعداد Cloudinary SDK باستخدام بيانات الاعتماد من متغيرات البيئة.

const cloudinary = require('cloudinary').v2;
require('dotenv').config(); // لتحميل متغيرات البيئة أثناء التطوير المحلي

// إعداد Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // اسم السحابة الخاص بك من Cloudinary
  api_key: process.env.CLOUDINARY_API_KEY,       // مفتاح API الخاص بك
  api_secret: process.env.CLOUDINARY_API_SECRET, // مفتاح API السري الخاص بك
  secure: true //  لضمان استخدام HTTPS للروابط
});

// تصدير كائن cloudinary المهيأ لاستخدامه في أجزاء أخرى من التطبيق
module.exports = cloudinary;
