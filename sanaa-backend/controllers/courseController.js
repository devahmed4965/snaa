// sanaa-backend/controllers/courseController.js
const pool = require('../config/db');

exports.getAllCourses = async (req, res) => {
  console.log('Fetching all courses');
  try {
    const coursesQuery = `
      SELECT
        c.course_id, c.title_key, c.description_key, c.category_key, c.image_url,
        c.created_at, c.updated_at,
        u.full_name AS instructor_name, u.user_id AS instructor_id,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.course_id) AS student_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.user_id AND u.role = 'teacher'
      ORDER BY c.created_at DESC;
    `;
    const coursesResult = await pool.query(coursesQuery);
    console.log('Fetched courses from DB:', coursesResult.rows); // <-- Log added
    res.status(200).json({
      message: 'Courses fetched successfully.',
      count: coursesResult.rows.length,
      courses: coursesResult.rows
    });
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ message: 'Server error fetching courses.' });
  }
};

exports.getCourseById = async (req, res) => {
  const { courseId } = req.params;
  console.log(`Fetching course with ID: ${courseId}`);
  try {
    const courseQuery = `
      SELECT
        c.course_id, c.title_key, c.description_key, c.category_key, c.image_url,
        c.created_at, c.updated_at,
        u.full_name AS instructor_name, u.user_id AS instructor_id,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.course_id) AS student_count
      FROM courses c
      LEFT JOIN users u ON c.instructor_id = u.user_id AND u.role = 'teacher'
      WHERE c.course_id = $1;
    `;
    const courseResult = await pool.query(courseQuery, [courseId]);
    console.log(`Fetched course ${courseId} from DB:`, courseResult.rows[0]); // <-- Log added

    if (courseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    res.status(200).json({
      message: 'Course fetched successfully.',
      course: courseResult.rows[0]
    });
  } catch (err) {
    console.error(`Error fetching course ${courseId}:`, err);
    res.status(500).json({ message: 'Server error fetching course details.' });
  }
};

exports.addCourse = async (req, res) => {
  console.log('Adding new course:', req.body);
  const { title_key, description_key, category_key, image_url, instructor_id } = req.body;

  if (!title_key || !description_key || !category_key) {
    return res.status(400).json({ message: 'Title key, description key, and category key are required.' });
  }

  try {
    if (instructor_id) {
        const teacherCheck = await pool.query('SELECT role FROM users WHERE user_id = $1', [instructor_id]);
        if (teacherCheck.rows.length === 0 || teacherCheck.rows[0].role !== 'teacher') {
            return res.status(400).json({ message: 'Invalid instructor ID provided.' });
        }
    }

    const insertQuery = `
      INSERT INTO courses (title_key, description_key, category_key, image_url, instructor_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *;
    `;
    const values = [
        title_key, description_key, category_key, image_url || null, instructor_id || null
    ];
    const newCourseResult = await pool.query(insertQuery, values);
    console.log('Course added successfully:', newCourseResult.rows[0]); // <-- Log added
    res.status(201).json({
      message: 'Course added successfully.',
      course: newCourseResult.rows[0]
    });
  } catch (err) {
    console.error('Error adding course:', err);
    if (err.code === '23505') { // Unique constraint violation
        return res.status(409).json({ message: `Course creation failed. The title key '${title_key}' might already exist.` });
    }
    res.status(500).json({ message: 'Server error adding course.' });
  }
};

exports.updateCourse = async (req, res) => {
  const { courseId } = req.params;
  const { title_key, description_key, category_key, image_url, instructor_id } = req.body;
  console.log(`Updating course ID: ${courseId} with data:`, req.body);

  try {
      const courseCheck = await pool.query('SELECT course_id FROM courses WHERE course_id = $1', [courseId]);
      if (courseCheck.rows.length === 0) {
          return res.status(404).json({ message: 'Course not found.' });
      }
  } catch(err) {
       console.error('Error checking course existence:', err);
       return res.status(500).json({ message: 'Server error.' });
  }

  const fieldsToUpdate = [];
  const values = [];
  let queryIndex = 1;

  if (title_key !== undefined) { fieldsToUpdate.push(`title_key = $${queryIndex++}`); values.push(title_key); }
  if (description_key !== undefined) { fieldsToUpdate.push(`description_key = $${queryIndex++}`); values.push(description_key); }
  if (category_key !== undefined) { fieldsToUpdate.push(`category_key = $${queryIndex++}`); values.push(category_key); }
  if (image_url !== undefined) { fieldsToUpdate.push(`image_url = $${queryIndex++}`); values.push(image_url || null); } // Allow setting to null
  if (instructor_id !== undefined) {
       try {
           if (instructor_id !== null && instructor_id !== '') { // Allow setting null or empty string for unassigning
               const teacherCheck = await pool.query('SELECT role FROM users WHERE user_id = $1', [instructor_id]);
               if (teacherCheck.rows.length === 0 || teacherCheck.rows[0].role !== 'teacher') {
                   return res.status(400).json({ message: 'Invalid instructor ID provided for update.' });
               }
           }
           fieldsToUpdate.push(`instructor_id = $${queryIndex++}`); values.push(instructor_id || null);
       } catch(err) {
            console.error('Error checking instructor during update:', err);
            return res.status(500).json({ message: 'Server error checking instructor.' });
       }
  }

  if (values.length === 0) {
    return res.status(400).json({ message: 'No valid fields provided for update.' });
  }

  fieldsToUpdate.push(`updated_at = NOW()`);
  values.push(courseId);

  const updateQuery = `
    UPDATE courses
    SET ${fieldsToUpdate.join(', ')}
    WHERE course_id = $${queryIndex}
    RETURNING *;
  `;

  try {
    if (title_key) {
        const titleKeyCheck = await pool.query(
            'SELECT course_id FROM courses WHERE title_key = $1 AND course_id != $2',
            [title_key, courseId]
        );
        if (titleKeyCheck.rows.length > 0) {
            return res.status(409).json({ message: `Course title key '${title_key}' is already used by another course.` });
        }
    }

    const updatedCourseResult = await pool.query(updateQuery, values);
    if (updatedCourseResult.rows.length === 0) { // Should not happen if check above passed
        return res.status(404).json({ message: 'Course not found or update failed.' });
    }
    console.log('Course updated successfully:', updatedCourseResult.rows[0]); // <-- Log added
    res.status(200).json({
      message: 'Course updated successfully.',
      course: updatedCourseResult.rows[0]
    });
  } catch (err) {
    console.error(`Error updating course ${courseId}:`, err);
    if (err.code === '23505') { // Unique constraint violation
        return res.status(409).json({ message: 'Update failed due to conflicting data (e.g., title key already exists).' });
    }
    res.status(500).json({ message: 'Server error updating course.' });
  }
};

exports.deleteCourse = async (req, res) => {
  const { courseId } = req.params;
  console.log(`Attempting to delete course ID: ${courseId}`);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log(`Deleting links for course ID: ${courseId}`);
    await client.query('DELETE FROM links WHERE course_id = $1', [courseId]);
    console.log(`Deleting enrollments for course ID: ${courseId}`);
    await client.query('DELETE FROM enrollments WHERE course_id = $1', [courseId]);
    // Also consider deleting from price_plans if a course_id is directly linked and should be cleared
    console.log(`Nullifying course_id in price_plans for course ID: ${courseId}`);
    await client.query('UPDATE price_plans SET course_id = NULL WHERE course_id = $1', [courseId]);

    console.log(`Deleting course with ID: ${courseId}`);
    const deleteCourseResult = await client.query('DELETE FROM courses WHERE course_id = $1 RETURNING course_id', [courseId]);

    if (deleteCourseResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Course not found.' });
    }
    await client.query('COMMIT');
    console.log(`Course ${courseId} and related data deleted/updated successfully.`); // <-- Log added
    res.status(200).json({ message: `Course ${courseId} and related data deleted/updated successfully.` });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Error deleting course ${courseId}:`, err);
    res.status(500).json({ message: 'Server error deleting course.' });
  } finally {
    client.release();
  }
};