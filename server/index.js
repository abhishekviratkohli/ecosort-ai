require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const predictRoutes = require('./routes/predict');
const communityRoutes = require('./routes/community');
const centersRoutes = require('./routes/centers');
const adminRoutes = require('./routes/admin');
const catalogRoutes = require('./routes/catalog');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'EcoSort AI Backend API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/centers', centersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/waste-catalog', catalogRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🌿 EcoSort AI API Server running securely on http://localhost:${PORT}`);
  });
}

module.exports = app;
