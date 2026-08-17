const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const store = require('../models/store');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, institution, adminSecretKey } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await store.findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await store.createUser({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role,
      institution,
      adminSecretKey
    });

    const token = jwt.sign(
      { id: user.id || user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;

    res.status(201).json({
      success: true,
      message: user.role === 'super_admin' 
        ? '👑 Welcome Super Administrator! Full municipal control privileges unlocked.' 
        : 'Registration successful! Welcome to EcoSort AI.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await store.findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Compare with bcrypt or plaintext fallback for seeded users
    const isMatch = bcrypt.compareSync(password, user.password) || user.password === password;
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Auto-elevate super admin if logging in
    if (cleanEmail === store.SUPER_ADMIN_EMAIL.toLowerCase() && user.role !== 'super_admin') {
      user.role = 'super_admin';
      await store.updateUserRole(user.id || user._id, 'super_admin');
    }

    const token = jwt.sign(
      { id: user.id || user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;

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
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await store.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;

    res.json({
      success: true,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error retrieving user' });
  }
});

// GET /api/auth/demo-users
router.get('/demo-users', async (req, res) => {
  try {
    const list = await store.getAllUsers();
    const demoList = list.map(u => ({
      id: u.id || u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      institution: u.institution,
      ecoPoints: u.ecoPoints,
      currentStreak: u.currentStreak,
      scans: u.stats?.totalScans || 0,
      co2SavedKg: u.stats?.totalCo2SavedKg || 0
    }));
    res.json({ success: true, demoUsers: demoList });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error loading demo users' });
  }
});

module.exports = router;
