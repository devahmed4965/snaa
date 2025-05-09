// server.js - Main entry point for the Sanaa Academy Backend

// Import necessary modules
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const multer = require('multer'); // Keep multer if other routes use it directly in server.js

// Import route handlers - Ensure paths are correct
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const linkRoutes = require('./routes/linkRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const podcastRoutes = require('./routes/podcastRoutes');
const bookRoutes = require('./routes/bookRoutes');
const audioRoutes = require('./routes/audioRoutes');
const storyRoutes = require('./routes/storyRoutes'); // This should be an object if it exports multiple routers
const dictionaryRoutes = require('./routes/dictionaryRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes'); // This should be an object
const certificateRoutes = require('./routes/certificateRoutes'); // This should be an object
const platformSettingsRoutes = require('./routes/platformSettingsRoutes'); // This should be an object
const pricePlanRoutes = require('./routes/pricePlanRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Load environment variables from .env file
dotenv.config();

// Create the Express application
const app = express();

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing

// Middleware to conditionally parse JSON, skipping for specific webhook routes
app.use((req, res, next) => {
    if (req.originalUrl === '/api/payments/webhook') { // Stripe webhook endpoint
        next(); // Skip express.json() for this route, Stripe needs raw body
    } else {
        express.json()(req, res, next); // Apply JSON parsing for all other routes
    }
});
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// --- Static File Serving ---
// Serves files from the 'uploads' directory at the '/uploads' URL path
const uploadsPath = path.join(__dirname, 'uploads');
console.log(`Serving static files from: ${uploadsPath}`);
app.use('/uploads', express.static(uploadsPath));

// --- Routes ---
// Basic API welcome route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Sanaa Academy API!' });
});

// Mount the different route handlers
try {
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/courses', courseRoutes);
    app.use('/api/links', linkRoutes);
    app.use('/api/admin', adminRoutes); // Admin routes (includes /api/admin/price-plans)
    app.use('/api/sections', sectionRoutes);
    app.use('/api/podcasts', podcastRoutes);
    app.use('/api/books', bookRoutes);
    app.use('/api/audio', audioRoutes);
    app.use('/api/dictionaries', dictionaryRoutes);

    // Mount routes that have separate public and admin routers
    if (storyRoutes && storyRoutes.publicRouter && storyRoutes.adminRouter) {
        app.use('/api/stories', storyRoutes.publicRouter);
        app.use('/api/admin/stories', storyRoutes.adminRouter);
    } else {
        console.error("ERROR: storyRoutes did not load correctly. Check exports in storyRoutes.js");
    }

    if (testimonialRoutes && testimonialRoutes.publicRouter && testimonialRoutes.adminRouter) {
        app.use('/api/testimonials', testimonialRoutes.publicRouter);
        app.use('/api/admin/testimonials', testimonialRoutes.adminRouter);
    } else {
        console.error("ERROR: testimonialRoutes did not load correctly. Check exports in testimonialRoutes.js");
    }

    if (certificateRoutes && certificateRoutes.publicRouter && certificateRoutes.adminRouter) {
        app.use('/api/certificates', certificateRoutes.publicRouter);
        app.use('/api/admin/certificates', certificateRoutes.adminRouter);
    } else {
        console.error("ERROR: certificateRoutes did not load correctly. Check exports in certificateRoutes.js");
    }

    if (platformSettingsRoutes && platformSettingsRoutes.publicRouter && platformSettingsRoutes.adminRouter) {
        app.use('/api/settings', platformSettingsRoutes.publicRouter);
        app.use('/api/admin/settings', platformSettingsRoutes.adminRouter);
    } else {
        console.error("ERROR: platformSettingsRoutes did not load correctly. Check exports in platformSettingsRoutes.js");
    }

    // Public route for price plans (e.g., for display on the frontend)
    app.use('/api/price-plans', pricePlanRoutes);
    app.use('/api/payments', paymentRoutes);

} catch (mountError) {
    console.error("Error mounting routes:", mountError);
    process.exit(1); // Exit if routes can't be mounted, as it's a critical failure
}


// --- Error Handling Middleware ---
// This should be defined after all other app.use() and routes calls
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err); // Log the full error stack

  if (err instanceof multer.MulterError) {
      // Handle Multer-specific errors
      let message = `File upload error: ${err.message}`;
      if (err.code === 'LIMIT_FILE_SIZE') message = 'File is too large.';
      else if (err.code === 'LIMIT_UNEXPECTED_FILE') message = 'Unexpected file field received.';
      // Check if err.message exists before trying to access includes (safer)
      else if (err.message && err.message.includes('Invalid file type')) message = err.message;
      return res.status(400).json({ message });
  } else if (err.message && err.message.includes('Invalid file type')) { // General invalid file type error
      return res.status(400).json({ message: err.message });
  } else if (err.status) { // HTTP errors (like those from http-errors module)
      return res.status(err.status).json({ message: err.message });
  } else { // Default to 500 server error
      return res.status(500).json({ message: err.message || 'Something broke on the server!' });
  }
});

// --- Not Found Handler (404) ---
// This should be the last middleware, for requests that didn't match any route
app.use((req, res, next) => {
    res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` });
});


// --- Start the Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
