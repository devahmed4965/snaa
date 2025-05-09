// sanaa-backend/controllers/adminController.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// --- User Management Functions ---
exports.getAllUsers = async (req, res) => {
  console.log('Admin request to get all users');
  try {
    // Added avatar_url to the selection
    const result = await pool.query('SELECT user_id, full_name, email, role, created_at, avatar_url FROM users ORDER BY created_at DESC');
    console.log('Fetched users from DB:', result.rows); // <-- Log added
    res.status(200).json({
        message: 'Users fetched successfully.',
        count: result.rows.length,
        users: result.rows
    });
  } catch (err) {
    console.error('Error fetching all users:', err);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
};

exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  console.log(`Admin request to get user ID: ${userId}`);
  try {
    const result = await pool.query(
        `SELECT user_id, full_name, email, role, avatar_url, age, gender,
                phone_number, whatsapp_number, islam_knowledge_level, quran_knowledge_level,
                is_new_muslim, aspirations, how_heard, created_at, updated_at, email_verified_at
         FROM users WHERE user_id = $1`,
        [userId]
    );
    console.log(`Fetched user ${userId} from DB:`, result.rows[0]); // <-- Log added
    if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({
        message: 'User data fetched successfully.',
        user: result.rows[0]
    });
  } catch (err) {
    console.error(`Error fetching user ${userId}:`, err);
    res.status(500).json({ message: 'Server error fetching user data.' });
  }
};

exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  // Make sure to handle all fields that can be updated by admin
  const { fullName, email, role, age, gender, phone, whatsapp, password,
          islamKnowledgeLevel, quranKnowledgeLevel, isNewMuslim, aspirations, howHeard
        } = req.body;
  console.log(`Admin request to update user ID: ${userId} with data:`, req.body);

  if (role && !['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
  }

  const fieldsToUpdate = [];
  const values = [];
  let queryIndex = 1;

  if (fullName !== undefined) { fieldsToUpdate.push(`full_name = $${queryIndex++}`); values.push(fullName); }
  if (email !== undefined) { fieldsToUpdate.push(`email = $${queryIndex++}`); values.push(email); }
  if (role !== undefined) { fieldsToUpdate.push(`role = $${queryIndex++}`); values.push(role); }
  if (age !== undefined) { fieldsToUpdate.push(`age = $${queryIndex++}`); values.push(age ? parseInt(age, 10) : null); }
  if (gender !== undefined) { fieldsToUpdate.push(`gender = $${queryIndex++}`); values.push(gender || null); }
  if (phone !== undefined) { fieldsToUpdate.push(`phone_number = $${queryIndex++}`); values.push(phone || null); }
  if (whatsapp !== undefined) { fieldsToUpdate.push(`whatsapp_number = $${queryIndex++}`); values.push(whatsapp || null); }
  if (islamKnowledgeLevel !== undefined) { fieldsToUpdate.push(`islam_knowledge_level = $${queryIndex++}`); values.push(islamKnowledgeLevel || null); }
  if (quranKnowledgeLevel !== undefined) { fieldsToUpdate.push(`quran_knowledge_level = $${queryIndex++}`); values.push(quranKnowledgeLevel || null); }
  if (isNewMuslim !== undefined) { fieldsToUpdate.push(`is_new_muslim = $${queryIndex++}`); values.push(isNewMuslim === 'true' || isNewMuslim === true); }
  if (aspirations !== undefined) { fieldsToUpdate.push(`aspirations = $${queryIndex++}`); values.push(aspirations || null); }
  if (howHeard !== undefined) { fieldsToUpdate.push(`how_heard = $${queryIndex++}`); values.push(howHeard || null); }


  if (password) {
      try {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(password, saltRounds);
          fieldsToUpdate.push(`password_hash = $${queryIndex++}`);
          values.push(hashedPassword);
          console.log(`Password for user ${userId} will be updated.`); // <-- Log added
      } catch (hashError) {
          console.error('Error hashing password during update:', hashError);
          return res.status(500).json({ message: 'Error processing password.' });
      }
  }

  if (values.length === 0) {
      console.log(`No fields to update for user ${userId}.`); // <-- Log added
      return res.status(400).json({ message: 'No valid fields provided for update.' });
  }

  fieldsToUpdate.push(`updated_at = NOW()`);
  values.push(userId);

  const updateQuery = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE user_id = $${queryIndex} RETURNING user_id, full_name, email, role;`;
  console.log(`Executing update query for user ${userId}: ${updateQuery} with values:`, values); // <-- Log added

  try {
      // Check for email conflict before updating
      if (email) {
          const emailCheckQuery = 'SELECT user_id FROM users WHERE email = $1 AND user_id != $2';
          const emailCheckResult = await pool.query(emailCheckQuery, [email, userId]);
          if (emailCheckResult.rows.length > 0) {
              console.warn(`Email conflict for user ${userId}: email ${email} already in use.`); // <-- Log added
              return res.status(409).json({ message: 'Email address is already in use by another account.' });
          }
      }

      const updatedUserResult = await pool.query(updateQuery, values);
      if (updatedUserResult.rows.length === 0) {
          console.warn(`User ${userId} not found or update failed.`); // <-- Log added
          return res.status(404).json({ message: 'User not found or update failed.' });
      }
      console.log('User updated successfully in DB:', updatedUserResult.rows[0]); // <-- Log added
      res.status(200).json({
          message: 'User updated successfully.',
          user: updatedUserResult.rows[0]
      });
  } catch (err) {
      console.error(`Error updating user ${userId}:`, err);
       if (err.code === '23505' && err.constraint === 'users_email_key') { // Unique constraint on email
           return res.status(409).json({ message: 'Email address is already in use.' });
       }
      res.status(500).json({ message: 'Server error updating user.' });
  }
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  console.log(`Admin request to delete user ID: ${userId}`);

  // Prevent admin from deleting themselves
  if (String(req.user.userId) === String(userId)) {
    console.warn(`Admin user ${req.user.userId} attempted to delete self.`); // <-- Log added
    return res.status(403).json({ message: 'Admin cannot delete self.' });
  }

  const client = await pool.connect();
  try {
      await client.query('BEGIN');
      console.log(`Deleting enrollments for student ID: ${userId}`);
      await client.query('DELETE FROM enrollments WHERE student_id = $1', [userId]);
      console.log(`Deleting links sent by teacher ID: ${userId}`);
      await client.query('DELETE FROM links WHERE teacher_id = $1', [userId]);
      console.log(`Unassigning teacher ID: ${userId} from courses`);
      await client.query('UPDATE courses SET instructor_id = NULL WHERE instructor_id = $1', [userId]);
      // Add more deletions for related data if necessary (e.g., transactions, user_preferences)

      console.log(`Deleting user with ID: ${userId}`);
      const deleteResult = await client.query('DELETE FROM users WHERE user_id = $1 RETURNING user_id', [userId]);

      if (deleteResult.rowCount === 0) {
          await client.query('ROLLBACK');
          console.warn(`User ${userId} not found for deletion.`); // <-- Log added
          return res.status(404).json({ message: 'User not found.' });
      }
      await client.query('COMMIT');
      console.log(`User ${userId} deleted successfully from DB.`); // <-- Log added
      res.status(200).json({ message: `User ${userId} deleted successfully.` });
  } catch (err) {
      await client.query('ROLLBACK');
      console.error(`Error deleting user ${userId}:`, err);
      res.status(500).json({ message: 'Server error deleting user.' });
  } finally {
      client.release();
  }
};

// --- Course Assignment Functions ---
exports.assignUserToCourse = async (req, res) => {
  const { userId, courseId } = req.body;
  console.log(`Admin request to assign user ${userId} to course ${courseId}`);

  if (!userId || !courseId) {
      return res.status(400).json({ message: 'User ID and Course ID are required.' });
  }

  try {
      const userCheck = await pool.query('SELECT role FROM users WHERE user_id = $1', [userId]);
      const courseCheck = await pool.query('SELECT course_id, instructor_id FROM courses WHERE course_id = $1', [courseId]);

      if (userCheck.rows.length === 0) {
          console.warn(`Assign User: User ${userId} not found.`); // <-- Log added
          return res.status(404).json({ message: 'User not found.' });
      }
      if (courseCheck.rows.length === 0) {
          console.warn(`Assign User: Course ${courseId} not found.`); // <-- Log added
          return res.status(404).json({ message: 'Course not found.' });
      }

      const userRole = userCheck.rows[0].role;
      const currentInstructorId = courseCheck.rows[0].instructor_id;

      if (userRole === 'teacher') {
          if (String(currentInstructorId) === String(userId)) {
              console.log(`Teacher ${userId} is already assigned to course ${courseId}.`); // <-- Log added
              return res.status(200).json({ message: 'Teacher is already assigned to this course.' });
          }
          await pool.query('UPDATE courses SET instructor_id = $1, updated_at = NOW() WHERE course_id = $2', [userId, courseId]);
          console.log(`Teacher ${userId} assigned to course ${courseId} in DB.`); // <-- Log added
          res.status(200).json({ message: `Teacher ${userId} assigned to course ${courseId} successfully.` });

      } else if (userRole === 'student') {
          const enrollmentCheck = await pool.query('SELECT enrollment_id FROM enrollments WHERE student_id = $1 AND course_id = $2', [userId, courseId]);
          if (enrollmentCheck.rows.length > 0) {
              console.log(`Student ${userId} is already enrolled in course ${courseId}.`); // <-- Log added
              return res.status(409).json({ message: 'Student is already enrolled in this course.' });
          }
          await pool.query('INSERT INTO enrollments (student_id, course_id, enrolled_at) VALUES ($1, $2, NOW())', [userId, courseId]);
          console.log(`Student ${userId} enrolled in course ${courseId} in DB.`); // <-- Log added
          res.status(201).json({ message: `Student ${userId} enrolled in course ${courseId} successfully.` });
      } else {
          console.warn(`Cannot assign user ${userId} with role ${userRole} to course ${courseId}.`); // <-- Log added
          return res.status(400).json({ message: 'Cannot assign admin role to a course directly.' });
      }
  } catch (err) {
      console.error(`Error assigning user ${userId} to course ${courseId}:`, err);
       if (err.code === '23503') { // Foreign key violation
           return res.status(400).json({ message: 'Invalid User ID or Course ID provided.' });
       }
      res.status(500).json({ message: 'Server error assigning user to course.' });
  }
};

exports.unassignUserFromCourse = async (req, res) => {
    const { userId, courseId } = req.body;
    console.log(`Admin request to unassign user ${userId} from course ${courseId}`);

    if (!userId || !courseId) {
        return res.status(400).json({ message: 'User ID and Course ID are required.' });
    }

    try {
        const userCheck = await pool.query('SELECT role FROM users WHERE user_id = $1', [userId]);
         if (userCheck.rows.length === 0) {
             console.warn(`Unassign User: User ${userId} not found.`); // <-- Log added
             return res.status(404).json({ message: 'User not found.' });
         }
         const userRole = userCheck.rows[0].role;

        if (userRole === 'teacher') {
            const result = await pool.query('UPDATE courses SET instructor_id = NULL, updated_at = NOW() WHERE course_id = $1 AND instructor_id = $2 RETURNING course_id', [courseId, userId]);
             if (result.rowCount > 0) {
                 console.log(`Teacher ${userId} unassigned from course ${courseId} in DB.`); // <-- Log added
                 res.status(200).json({ message: `Teacher ${userId} unassigned from course ${courseId} successfully.` });
             } else {
                 console.warn(`Teacher ${userId} was not assigned to course ${courseId} or course not found.`); // <-- Log added
                 res.status(404).json({ message: 'Teacher was not assigned to this course or course not found.' });
             }
        } else if (userRole === 'student') {
            const result = await pool.query('DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2 RETURNING enrollment_id', [userId, courseId]);
             if (result.rowCount > 0) {
                 console.log(`Student ${userId} unenrolled from course ${courseId} in DB.`); // <-- Log added
                 res.status(200).json({ message: `Student ${userId} unenrolled from course ${courseId} successfully.` });
             } else {
                  console.warn(`Student ${userId} was not enrolled in course ${courseId} or course/student not found.`); // <-- Log added
                  res.status(404).json({ message: 'Student was not enrolled in this course or course/student not found.' });
             }
        } else {
             console.warn(`Cannot unassign user ${userId} with role ${userRole} from course ${courseId}.`); // <-- Log added
             return res.status(400).json({ message: 'Cannot unassign admin role from a course.' });
        }
    } catch(err) {
         console.error(`Error unassigning user ${userId} from course ${courseId}:`, err);
         res.status(500).json({ message: 'Server error unassigning user from course.' });
    }
};

// --- Platform Section Management Functions ---
exports.getSections = async (req, res) => {
    console.log("Admin request to get all platform sections");
    try {
        const result = await pool.query(
            `SELECT section_id, name_key, icon_class, path, is_active, display_order, created_at
             FROM platform_sections
             ORDER BY display_order ASC, created_at ASC`
        );
        console.log('Fetched sections from DB:', result.rows); // <-- Log added
        res.status(200).json({
            message: "Sections fetched successfully.",
            count: result.rows.length,
            sections: result.rows
        });
    } catch (err) {
        console.error("Error fetching platform sections:", err);
        res.status(500).json({ message: "Server error fetching sections." });
    }
};

exports.addSection = async (req, res) => {
    const { name_key, icon_class, path, is_active = true, display_order = 0 } = req.body;
    console.log("Admin request to add new section:", req.body);

    if (!name_key || !icon_class || !path) {
        return res.status(400).json({ message: "Name key, icon class, and path are required." });
    }
    if (/\s/.test(path) || path !== path.toLowerCase()) {
        return res.status(400).json({ message: "Path should be lowercase and contain no spaces." });
    }

    try {
        // Check if name_key or path already exists
        const existingCheck = await pool.query(
            'SELECT section_id FROM platform_sections WHERE name_key = $1 OR path = $2',
            [name_key, path]
        );
        if (existingCheck.rows.length > 0) {
            const conflictingField = existingCheck.rows[0].name_key === name_key ? 'Name key' : 'Path';
            console.warn(`Section creation failed: ${conflictingField} already exists.`); // <-- Log added
            return res.status(409).json({ message: `Section creation failed. ${conflictingField} '${existingCheck.rows[0][conflictingField === 'Name key' ? 'name_key' : 'path']}' already exists.` });
        }

        const insertQuery = `
            INSERT INTO platform_sections (name_key, icon_class, path, is_active, display_order, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
            RETURNING *;
        `;
        const values = [name_key, icon_class, path, Boolean(is_active), parseInt(display_order, 10)];
        const newSectionResult = await pool.query(insertQuery, values);
        console.log('Section added successfully to DB:', newSectionResult.rows[0]); // <-- Log added
        res.status(201).json({
            message: "Platform section added successfully.",
            section: newSectionResult.rows[0]
        });
    } catch (err) {
        console.error("Error adding platform section:", err);
        // This catch might be redundant if the above check catches unique violations, but good for other errors.
        if (err.code === '23505') { // Unique constraint violation
             return res.status(409).json({ message: 'Section creation failed due to conflicting data (name_key or path must be unique).' });
        }
        res.status(500).json({ message: "Server error adding section." });
    }
};

exports.updateSection = async (req, res) => {
    const { sectionId } = req.params;
    const { name_key, icon_class, path, is_active, display_order } = req.body;
    console.log(`Admin request to update section ID: ${sectionId} with data:`, req.body);

    if (path && (/\s/.test(path) || path !== path.toLowerCase())) {
        return res.status(400).json({ message: "Path should be lowercase and contain no spaces." });
    }

    const fieldsToUpdate = [];
    const values = [];
    let queryIndex = 1;

    if (name_key !== undefined) { fieldsToUpdate.push(`name_key = $${queryIndex++}`); values.push(name_key); }
    if (icon_class !== undefined) { fieldsToUpdate.push(`icon_class = $${queryIndex++}`); values.push(icon_class); }
    if (path !== undefined) { fieldsToUpdate.push(`path = $${queryIndex++}`); values.push(path); }
    if (is_active !== undefined) { fieldsToUpdate.push(`is_active = $${queryIndex++}`); values.push(Boolean(is_active)); }
    if (display_order !== undefined) { fieldsToUpdate.push(`display_order = $${queryIndex++}`); values.push(parseInt(display_order, 10)); }

    if (values.length === 0) {
        console.log(`No fields to update for section ${sectionId}.`); // <-- Log added
        // Fetch current data to return if no fields were actually changed
        const currentSectionResult = await pool.query('SELECT * FROM platform_sections WHERE section_id = $1', [sectionId]);
        if (currentSectionResult.rows.length === 0) {
            return res.status(404).json({ message: 'Section not found.' });
        }
        return res.status(200).json({ message: 'No changes detected.', section: currentSectionResult.rows[0] });
    }

    fieldsToUpdate.push(`updated_at = NOW()`);
    values.push(sectionId);

    const updateQuery = `
        UPDATE platform_sections
        SET ${fieldsToUpdate.join(', ')}
        WHERE section_id = $${queryIndex}
        RETURNING *;
    `;
    console.log(`Executing update query for section ${sectionId}: ${updateQuery} with values:`, values); // <-- Log added

    try {
        // Check for conflicts before updating
        if (path) {
            const pathCheck = await pool.query(
                'SELECT section_id FROM platform_sections WHERE path = $1 AND section_id != $2',
                [path, sectionId]
            );
            if (pathCheck.rows.length > 0) {
                console.warn(`Section update conflict: Path '${path}' already exists for section ${pathCheck.rows[0].section_id}.`); // <-- Log added
                return res.status(409).json({ message: `Section path '${path}' is already used by another section.` });
            }
        }
         if (name_key) {
            const nameKeyCheck = await pool.query(
                'SELECT section_id FROM platform_sections WHERE name_key = $1 AND section_id != $2',
                [name_key, sectionId]
            );
            if (nameKeyCheck.rows.length > 0) {
                console.warn(`Section update conflict: Name key '${name_key}' already exists for section ${nameKeyCheck.rows[0].section_id}.`); // <-- Log added
                return res.status(409).json({ message: `Section name key '${name_key}' is already used by another section.` });
            }
        }

        const updatedSectionResult = await pool.query(updateQuery, values);
        if (updatedSectionResult.rows.length === 0) {
            console.warn(`Section ${sectionId} not found or update failed.`); // <-- Log added
            return res.status(404).json({ message: 'Section not found or update failed.' });
        }
        console.log('Section updated successfully in DB:', updatedSectionResult.rows[0]); // <-- Log added
        res.status(200).json({
            message: 'Platform section updated successfully.',
            section: updatedSectionResult.rows[0]
        });
    } catch (err) {
        console.error(`Error updating section ${sectionId}:`, err);
        if (err.code === '23505') { // Unique constraint violation
             return res.status(409).json({ message: 'Update failed due to conflicting data (name_key or path must be unique).' });
        }
        res.status(500).json({ message: 'Server error updating section.' });
    }
};

exports.deleteSection = async (req, res) => {
    const { sectionId } = req.params;
    console.log(`Admin request to delete section ID: ${sectionId}`);
    try {
        // TODO: Consider implications for associated content.
        const deleteResult = await pool.query('DELETE FROM platform_sections WHERE section_id = $1 RETURNING section_id', [sectionId]);
        if (deleteResult.rowCount === 0) {
            console.warn(`Section ${sectionId} not found for deletion.`); // <-- Log added
            return res.status(404).json({ message: 'Section not found.' });
        }
        console.log(`Section ${sectionId} deleted successfully from DB.`); // <-- Log added
        res.status(200).json({ message: `Platform section ${sectionId} deleted successfully.` });
    } catch (err) {
        console.error(`Error deleting section ${sectionId}:`, err);
        if (err.code === '23503') { // Foreign key constraint violation
             return res.status(409).json({ message: 'Cannot delete section because it is referenced by other data. Please remove associated content first.' });
        }
        res.status(500).json({ message: 'Server error deleting section.' });
    }
};
