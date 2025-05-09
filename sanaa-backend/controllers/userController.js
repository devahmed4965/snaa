// sanaa-backend/controllers/userController.js
const pool = require('../config/db');
const path = require('path');
const fs = require('fs').promises; // Use promises for fs operations
const bcrypt = require('bcrypt');


exports.getUserProfile = async (req, res) => {
  if (!req.user || !req.user.userId) {
    console.error('User ID not found in request after authentication.');
    return res.status(401).json({ message: 'Unauthorized: User information missing.' });
  }
  const userId = req.user.userId;
  console.log(`Fetching profile data for user ID: ${userId}`);

  try {
    // Query to fetch user's basic profile information
    const profileQuery = `
      SELECT
        user_id, full_name, email, role, avatar_url, age, gender,
        phone_number, whatsapp_number, islam_knowledge_level,
        quran_knowledge_level, is_new_muslim, aspirations, how_heard,
        created_at, email_verified_at, updated_at
      FROM users
      WHERE user_id = $1;
    `;
    const profileResult = await pool.query(profileQuery, [userId]);
    console.log(`Fetched user profile for ${userId} from DB:`, profileResult.rows[0]);

    if (profileResult.rows.length === 0) {
      console.log(`Profile not found for user ID: ${userId}`);
      return res.status(404).json({ message: 'User profile not found.' });
    }
    const userProfile = profileResult.rows[0];

    // Construct full avatar URL if not already absolute
    if (userProfile.avatar_url && !userProfile.avatar_url.startsWith('http')) {
        const baseUrl = process.env.NODE_ENV === 'production' ? process.env.BASE_URL : `${req.protocol}://${req.get('host')}`;
        userProfile.avatar_url = `${baseUrl}/uploads/avatars/${userProfile.avatar_url}`;
    }

    // Query to fetch user's enrolled courses
    // This assumes you have an 'enrollments' table linking users to courses
    // and a 'courses' table with course details.
    const enrolledCoursesQuery = `
      SELECT
        c.course_id,
        c.title_key,      -- Key for translation of course title
        c.description_key,  -- Key for translation of course description
        c.category_key,   -- Key for translation of course category
        c.image_url,      -- URL for the course image
        u_instructor.full_name AS instructor_name -- Instructor's name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.course_id
      LEFT JOIN users u_instructor ON c.instructor_id = u_instructor.user_id
      WHERE e.student_id = $1;
    `;
    const enrolledCoursesResult = await pool.query(enrolledCoursesQuery, [userId]);
    console.log(`Fetched enrolled courses for user ${userId} from DB:`, enrolledCoursesResult.rows);

    // Add enrolled courses to the profile object
    userProfile.enrolled_courses = enrolledCoursesResult.rows.map(course => {
        // Construct full image URL for courses if not already absolute
        if (course.image_url && !course.image_url.startsWith('http')) {
            const baseUrl = process.env.NODE_ENV === 'production' ? process.env.BASE_URL : `${req.protocol}://${req.get('host')}`;
            // Assuming course images are in a general uploads folder or a specific courses subfolder
            // Adjust the path if necessary, e.g., /uploads/courses/
            course.image_url = `${baseUrl}/uploads/${course.image_url.startsWith('/') ? course.image_url.substring(1) : course.image_url}`;
        }
        return course;
    });

    res.status(200).json({
        message: 'Profile data and enrolled courses fetched successfully.',
        profile: userProfile
    });

  } catch (err) {
    console.error('Error fetching user profile and courses:', err);
    res.status(500).json({ message: 'Server error fetching profile data.' });
  }
};

exports.updateUserProfile = async (req, res) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: 'Unauthorized: User information missing.' });
  }
  const userId = req.user.userId;
  const { fullName, phone, whatsapp } = req.body;
  const avatarFile = req.file;
  console.log(`Updating profile for user ID: ${userId}`, { fullName, phone, whatsapp, avatarFile: avatarFile?.filename });

  if (fullName !== undefined && fullName.trim() === '') {
    return res.status(400).json({ message: 'Full name cannot be empty.' });
  }

  const uploadsBaseDir = path.join(__dirname, '..', 'uploads', 'avatars');

  try {
    const fieldsToUpdate = [];
    const values = [];
    let queryIndex = 1;
    let oldAvatarRelativePath = null;

    if (fullName !== undefined) { fieldsToUpdate.push(`full_name = $${queryIndex++}`); values.push(fullName); }
    if (phone !== undefined) { fieldsToUpdate.push(`phone_number = $${queryIndex++}`); values.push(phone === '' ? null : phone); }
    if (whatsapp !== undefined) { fieldsToUpdate.push(`whatsapp_number = $${queryIndex++}`); values.push(whatsapp === '' ? null : whatsapp); }

    if (avatarFile) {
      const oldAvatarResult = await pool.query('SELECT avatar_url FROM users WHERE user_id = $1', [userId]);
      if (oldAvatarResult.rows.length > 0 && oldAvatarResult.rows[0].avatar_url) {
          oldAvatarRelativePath = oldAvatarResult.rows[0].avatar_url;
          console.log("Old avatar relative path (filename):", oldAvatarRelativePath);
      }
      const newAvatarFilename = avatarFile.filename;
      fieldsToUpdate.push(`avatar_url = $${queryIndex++}`);
      values.push(newAvatarFilename);
    }

    if (fieldsToUpdate.length === 0) {
      console.log('No fields to update for user ID:', userId);
      const currentProfileResult = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
      if (currentProfileResult.rows.length > 0) {
          const currentProfile = currentProfileResult.rows[0];
          if (currentProfile.avatar_url && !currentProfile.avatar_url.startsWith('http')) {
              const baseUrl = process.env.NODE_ENV === 'production' ? process.env.BASE_URL : `${req.protocol}://${req.get('host')}`;
              currentProfile.avatar_url = `${baseUrl}/uploads/avatars/${currentProfile.avatar_url}`;
          }
          return res.status(200).json({ message: 'No changes detected.', profile: currentProfile });
      }
      return res.status(404).json({ message: 'User not found.' });
    }

    fieldsToUpdate.push(`updated_at = NOW()`);
    values.push(userId);

    const updateQuery = `
      UPDATE users
      SET ${fieldsToUpdate.join(', ')}
      WHERE user_id = $${queryIndex}
      RETURNING user_id, full_name, email, role, avatar_url, age, gender, phone_number, whatsapp_number;
    `;
    const updateResult = await pool.query(updateQuery, values);

    if (updateResult.rows.length === 0) {
       if (avatarFile) await fs.unlink(avatarFile.path).catch(e => console.error(`Error deleting uploaded avatar ${avatarFile.path} after failed update:`, e));
      return res.status(404).json({ message: 'User profile not found or update failed.' });
    }
    const updatedProfile = updateResult.rows[0];
    console.log(`Profile updated successfully for user ID: ${userId}`, updatedProfile);

     if (avatarFile && oldAvatarRelativePath && oldAvatarRelativePath !== updatedProfile.avatar_url) {
         const fullOldAvatarPath = path.join(uploadsBaseDir, oldAvatarRelativePath);
         console.log("Attempting to delete old avatar:", fullOldAvatarPath);
         await fs.unlink(fullOldAvatarPath).catch(err => {
             if (err.code !== 'ENOENT') console.error(`Error deleting old avatar file ${fullOldAvatarPath}:`, err);
             else console.log(`Old avatar not found, skipping deletion: ${fullOldAvatarPath}`);
         });
     }

    if (updatedProfile.avatar_url && !updatedProfile.avatar_url.startsWith('http')) {
        const baseUrl = process.env.NODE_ENV === 'production' ? process.env.BASE_URL : `${req.protocol}://${req.get('host')}`;
        updatedProfile.avatar_url = `${baseUrl}/uploads/avatars/${updatedProfile.avatar_url}`;
    }

    res.status(200).json({
      message: 'Profile updated successfully.',
      profile: updatedProfile
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
     if (avatarFile) await fs.unlink(avatarFile.path).catch(unlinkErr => console.error(`Error deleting uploaded avatar ${avatarFile.path} after error:`, unlinkErr));
    if (err.code === '23505') {
        return res.status(409).json({ message: 'Update failed due to conflicting data (e.g., email already exists).' });
    }
    res.status(500).json({ message: 'Server error updating profile data.' });
  }
};
