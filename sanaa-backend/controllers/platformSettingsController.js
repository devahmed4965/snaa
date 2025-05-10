// sanaa-backend/controllers/platformSettingsController.js
// تم تعديل هذا الملف لرفع الفيديو التعريفي إلى Cloudinary
// وحفظ الـ URL والمعرف العام (public_id) في جدول platform_settings.

const pool = require('../config/db');
const cloudinary = require('../config/cloudinaryConfig'); // استيراد إعدادات Cloudinary
// const fs = require('fs').promises; // لم نعد بحاجة إليه
// const path = require('path'); // لم نعد بحاجة إليه

// دالة مساعدة لتحويل Buffer إلى Data URI (أو استخدام upload_stream)
const bufferToDataURI = (buffer, mimeType) => `data:${mimeType};base64,${buffer.toString('base64')}`;

// دالة مساعدة للحصول على رابط الملف الكامل (تبقى مفيدة للبيانات القديمة أو الروابط الخارجية)
const getFullFileUrlWithCheck = (req, filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        return filePath; //  رابط كامل بالفعل (مثل Cloudinary)
    }
    // هذا الجزء للتوافق مع المسارات المحلية القديمة إذا وجدت
    const basePath = '/uploads/';
    const relativePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}${basePath}${relativePath}`;
};

// دالة مساعدة لرفع Buffer إلى Cloudinary (باستخدام upload_stream)
const uploadStreamToCloudinary = (fileBuffer, options) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
        uploadStream.end(fileBuffer);
    });
};


exports.getSetting = async (req, res) => {
    const { key } = req.params;
    console.log(`Request received to get setting: ${key}`);
    try {
        const result = await pool.query(
            'SELECT setting_value FROM platform_settings WHERE setting_key = $1',
            [key]
        );
        

        if (result.rows.length === 0) {
            // إذا كان المفتاح هو intro_video_url ولم يتم العثور عليه، أرجع null
            if (key === 'intro_video_url') {
                 console.log(`Setting '${key}' not found, returning null for video URL.`);
                return res.status(200).json({
                    message: `Setting '${key}' not found.`,
                    setting: { key: key, value: null }
                });
            }
            // للإعدادات الأخرى، يمكنك إرجاع 404 أو قيمة افتراضية
            return res.status(404).json({ message: `Setting '${key}' not found.` });
        }

        const settingValue = result.rows[0].setting_value;
        let finalValue = settingValue;

        // إذا كان المفتاح هو intro_video_url، فمن المفترض أن القيمة هي رابط Cloudinary كامل
        // ولا تحتاج إلى تعديل إضافي هنا.
        // دالة getFullFileUrlWithCheck يمكن استخدامها إذا كان هناك شك في أن الرابط قد يكون محليًا قديمًا.
        if (key === 'intro_video_url' && settingValue) {
            finalValue = getFullFileUrlWithCheck(req, settingValue); // سيعيد رابط Cloudinary كما هو
        }
        console.log(`Fetched setting '${key}' from DB, final value:`, finalValue);

        res.status(200).json({
            message: `Setting '${key}' fetched successfully.`,
            setting: { key: key, value: finalValue }
        });
    } catch (err) {
        console.error(`Error fetching setting ${key}:`, err);
        res.status(500).json({ message: `Server error fetching setting ${key}.` });
    }
};

exports.updateIntroVideo = async (req, res) => {
    const introVideoFile = req.file; // سيكون هذا req.file.buffer
    const videoUrlKey = 'intro_video_url';
    const videoPublicIdKey = 'intro_video_cloudinary_public_id';
    console.log("Admin request to update intro video", { fileProvided: !!introVideoFile });

    if (!introVideoFile) {
        return res.status(400).json({ message: "Video file is required." });
    }

    let newVideoUrl = null;
    let newVideoPublicId = null;
    let oldVideoPublicId = null;

    const client = await pool.connect(); // استخدام اتصال واحد للمعاملة

    try {
        await client.query('BEGIN'); // بدء المعاملة

        // 1. جلب public_id للفيديو القديم إذا كان موجودًا
        const oldPublicIdResult = await client.query(
            'SELECT setting_value FROM platform_settings WHERE setting_key = $1',
            [videoPublicIdKey]
        );
        if (oldPublicIdResult.rows.length > 0 && oldPublicIdResult.rows[0].setting_value) {
            oldVideoPublicId = oldPublicIdResult.rows[0].setting_value;
            console.log("Old intro video Cloudinary Public ID found:", oldVideoPublicId);
        }

        // 2. رفع الفيديو الجديد إلى Cloudinary
        console.log(`New intro video file received, uploading to Cloudinary...`);
        const uploadOptions = {
            resource_type: "video",
            folder: "sanaa_platform_videos/intro", // مجلد اختياري على Cloudinary
            public_id: `intro_video_${Date.now()}`, // اسم فريد للملف
            overwrite: true // مهم إذا كنت ستستخدم نفس public_id (لكننا ننشئ واحدًا جديدًا)
        };
        
        // استخدام uploadStreamToCloudinary مع buffer
        const result = await uploadStreamToCloudinary(introVideoFile.buffer, uploadOptions);
        newVideoUrl = result.secure_url;
        newVideoPublicId = result.public_id;
        console.log(`Intro video uploaded to Cloudinary: ${newVideoUrl}, Public ID: ${newVideoPublicId}`);

        // 3. حفظ/تحديث رابط الفيديو الجديد في قاعدة البيانات
        const upsertVideoUrlQuery = `
            INSERT INTO platform_settings (setting_key, setting_value, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (setting_key) DO UPDATE SET
                setting_value = EXCLUDED.setting_value,
                updated_at = NOW()
            RETURNING setting_key, setting_value;
        `;
        await client.query(upsertVideoUrlQuery, [videoUrlKey, newVideoUrl]);
        console.log('Intro video URL updated in DB:', newVideoUrl);

        // 4. حفظ/تحديث public_id الجديد للفيديو في قاعدة البيانات
        const upsertPublicIdQuery = `
            INSERT INTO platform_settings (setting_key, setting_value, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (setting_key) DO UPDATE SET
                setting_value = EXCLUDED.setting_value,
                updated_at = NOW()
            RETURNING setting_key, setting_value;
        `;
        await client.query(upsertPublicIdQuery, [videoPublicIdKey, newVideoPublicId]);
        console.log('Intro video Cloudinary Public ID updated in DB:', newVideoPublicId);

        // 5. إذا كان هناك فيديو قديم على Cloudinary، قم بحذفه
        if (oldVideoPublicId && oldVideoPublicId !== newVideoPublicId) {
            console.log(`Deleting old intro video from Cloudinary, Public ID: ${oldVideoPublicId}`);
            await cloudinary.uploader.destroy(oldVideoPublicId, { resource_type: 'video' }, (error, deleteResult) => {
                if (error) console.error('Failed to delete old intro video from Cloudinary:', error);
                else console.log('Old intro video deleted from Cloudinary:', deleteResult);
            });
        }

        await client.query('COMMIT'); // تأكيد المعاملة

        res.status(200).json({
            message: 'Introductory video updated successfully.',
            setting: { key: videoUrlKey, value: newVideoUrl } // إرجاع الرابط الجديد
        });

    } catch (err) {
        await client.query('ROLLBACK'); // تراجع عن المعاملة في حالة حدوث خطأ
        console.error("Error updating intro video setting with Cloudinary:", err);
        // إذا فشل الرفع لـ Cloudinary أو أي خطوة، حاول حذف الفيديو الجديد الذي تم رفعه لـ Cloudinary (إذا تم)
        if (newVideoPublicId) {
            await cloudinary.uploader.destroy(newVideoPublicId, { resource_type: 'video' })
                .catch(e => console.error("Cloudinary cleanup error (update intro video):", e));
        }
        if (err.http_code && err.message) { // خطأ محتمل من Cloudinary
            return res.status(err.http_code).json({ message: `Cloudinary error: ${err.message}` });
        }
        res.status(500).json({ message: 'Server error updating introductory video.' });
    } finally {
        client.release(); // تحرير الاتصال
    }
};
