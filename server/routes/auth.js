const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const store = require('../models/store');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role, institution } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = store.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = store.createUser({ name, email, password, role, institution });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const safeUser = { ...user };
    delete safeUser.passwordHash;

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to EcoSort AI.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = store.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const safeUser = { ...user };
    delete safeUser.passwordHash;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const safeUser = { ...req.user };
  delete safeUser.passwordHash;

  // Enrich badges with details
  const enrichedBadges = safeUser.badges.map(userBadge => {
    const badgeDef = store.badges.find(b => b.id === userBadge.badgeId) || {};
    return {
      ...badgeDef,
      unlockedAt: userBadge.unlockedAt
    };
  });

  res.json({
    success: true,
    user: {
      ...safeUser,
      badges: enrichedBadges
    }
  });
});

// PUT /api/auth/profile
router.put('/profile', authenticateToken, (req, res) => {
  try {
    const { name, institution } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (institution) updates.institution = institution;

    const updatedUser = store.updateUser(req.user.id, updates);
    const safeUser = { ...updatedUser };
    delete safeUser.passwordHash;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: safeUser
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// GET /api/auth/demo-users (For quick switching in presentations)
router.get('/demo-users', (req, res) => {
  const demoList = store.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    institution: u.institution,
    ecoPoints: u.ecoPoints,
    currentStreak: u.currentStreak,
    scans: u.stats.totalScans,
    co2SavedKg: u.stats.totalCo2SavedKg
  }));
  res.json({ success: true, demoUsers: demoList });
});

module.exports = router;
