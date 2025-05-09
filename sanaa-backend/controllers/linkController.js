// sanaa-backend/controllers/linkController.js
const pool = require('../config/db');

exports.sendLink = async (req, res) => {
  if (!req.user || !req.user.userId || req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Forbidden: Only teachers can send links.' });
  }

  const teacherId = req.user.userId;
  const { courseId, linkUrl, description } = req.body;
  console.log(`Teacher ${teacherId} attempting to send link for course ${courseId}:`, { linkUrl, description });

  if (!courseId || !linkUrl) {
    return res.status(400).json({ message: 'Course ID and Link URL are required.' });
  }

  try {
    const courseCheckQuery = 'SELECT instructor_id FROM courses WHERE course_id = $1';
    const courseCheckResult = await pool.query(courseCheckQuery, [courseId]);

    if (courseCheckResult.rows.length === 0) {
        return res.status(404).json({ message: 'Course not found.' });
    }
    // Not strictly enforcing instructor_id === teacherId to allow any teacher to send links for now.
    // if (courseCheckResult.rows[0].instructor_id !== teacherId) {
    //     return res.status(403).json({ message: 'Forbidden: You are not the instructor for this course.' });
    // }

    const insertQuery = `
      INSERT INTO links (course_id, teacher_id, url, description, sent_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    const values = [courseId, teacherId, linkUrl, description || null];
    const newLinkResult = await pool.query(insertQuery, values);
    const newLink = newLinkResult.rows[0];
    console.log('Link sent successfully:', newLink); // <-- Log added
    res.status(201).json({
      message: 'Link sent successfully to students of the course.',
      link: newLink
    });
  } catch (err) {
    console.error('Error sending link:', err);
    if (err.code === '23503') {
        return res.status(400).json({ message: 'Invalid Course ID or Teacher ID.' });
    }
    res.status(500).json({ message: 'Server error sending link.' });
  }
};

exports.getLinksForCourse = async (req, res) => {
    const { courseId } = req.params;
    console.log(`Fetching links for course ID: ${courseId}`);
    try {
        const linksQuery = `
            SELECT l.link_id, l.url, l.description, l.sent_at, u.full_name as teacher_name
            FROM links l
            JOIN users u ON l.teacher_id = u.user_id
            WHERE l.course_id = $1
            ORDER BY l.sent_at DESC;
        `;
        const linksResult = await pool.query(linksQuery, [courseId]);
        console.log(`Fetched links for course ${courseId} from DB:`, linksResult.rows); // <-- Log added
        res.status(200).json({
            message: 'Links fetched successfully.',
            links: linksResult.rows
        });
    } catch(err) {
        console.error(`Error fetching links for course ${courseId}:`, err);
        res.status(500).json({ message: 'Server error fetching links.' });
    }
};