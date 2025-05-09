// sanaa-backend/controllers/authController.js
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.handleSignup = async (req, res) => {
  console.log('Signup request received:', req.body);
  const {
    fullName, email, password, passwordConfirm, age, gender,
    islamKnowledgeLevel, quranKnowledgeLevel, isNewMuslim,
    aspirations, howHeard
  } = req.body;

  if (!fullName || !email || !password || !passwordConfirm) {
    return res.status(400).json({ message: 'Please provide full name, email, password, and password confirmation.' });
  }
  if (password !== passwordConfirm) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
  }
  if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  try {
    const userExistsResult = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (userExistsResult.rows.length > 0) {
      return res.status(409).json({ message: 'Email address is already registered.' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const defaultRole = 'student';
    const newMuslimBool = isNewMuslim === 'yes'; // Convert 'yes'/'no' string to boolean

    const insertQuery = `
      INSERT INTO users (
        full_name, email, password_hash, role, age, gender,
        islam_knowledge_level, quran_knowledge_level, is_new_muslim,
        aspirations, how_heard, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
      ) RETURNING user_id, full_name, email, role;
    `;
    const values = [
      fullName, email, hashedPassword, defaultRole, age ? parseInt(age, 10) : null, gender || null,
      islamKnowledgeLevel || null, quranKnowledgeLevel || null, newMuslimBool,
      aspirations || null, howHeard || null
    ];

    const newUserResult = await pool.query(insertQuery, values);
    const newUser = newUserResult.rows[0];
    console.log('New user created:', newUser); // <-- Log added

    res.status(201).json({
      message: 'User created successfully! Please login.',
      user: {
          userId: newUser.user_id,
          fullName: newUser.full_name,
          email: newUser.email,
          role: newUser.role
      }
    });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ message: 'Server error during signup. Please try again later.' });
  }
};

exports.handleLogin = async (req, res) => {
  console.log('Login request received:', req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }

  try {
    const userResult = await pool.query('SELECT user_id, full_name, email, password_hash, role, avatar_url FROM users WHERE email = $1', [email]);
    console.log(`User query result for email ${email}:`, userResult.rows[0]); // <-- Log added

    if (userResult.rows.length === 0) {
      console.log(`Login attempt failed: User not found for email ${email}`);
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log(`Login attempt failed: Incorrect password for email ${email}`);
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!process.env.JWT_SECRET) {
        console.error("FATAL ERROR: JWT_SECRET is not defined.");
        return res.status(500).json({ message: 'Server configuration error.' });
    }
    const payload = { userId: user.user_id, role: user.role };
    const options = { expiresIn: process.env.JWT_EXPIRES_IN || '1h' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, options);

    console.log(`Login successful for email ${email}. User role: ${user.role}`); // <-- Log added
    res.status(200).json({
      message: 'Login successful!',
      token: token,
      user: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url // Include avatar_url in login response
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error during login. Please try again later.' });
  }
};

exports.handleLogout = (req, res) => {
    console.log('Logout request received (Placeholder). Client should clear token.'); // <-- Log added
    res.status(200).json({ message: 'Logout handled (client should clear token).' });
};
