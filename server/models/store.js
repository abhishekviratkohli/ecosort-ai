/**
 * EcoSort AI - Resilient Data Store & MongoDB Synchronization Layer
 */

const bcrypt = require('bcryptjs');
const { connectDB } = require('./db');
const { User, ScanHistory, RecyclingCenter, MunicipalAlert } = require('./schemas');

const SUPER_ADMIN_EMAIL = 'abhisheksingh.gwl3@gmail.com';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'ECOSORT_ADMIN_2026';

// In-Memory Fallback Cache & Default Seed Data
let users = [
  {
    id: 'usr_super_000',
    _id: 'usr_super_000',
    name: 'Abhishek Singh (Super Admin)',
    email: SUPER_ADMIN_EMAIL,
    password: bcrypt.hashSync('superpassword', 10),
    role: 'super_admin',
    institution: 'City Municipal Solid Waste HQ',
    ecoPoints: 2500,
    currentStreak: 45,
    longestStreak: 45,
    lastScanDate: new Date().toISOString(),
    badges: ['super_admin_crest', 'zero_waste_hero', 'plastic_diverter'],
    stats: {
      totalScans: 350,
      totalCo2SavedKg: 185.4,
      totalWaterSavedLiters: 4200,
      totalPlasticDivertedKg: 64.2,
      totalOrganicCompostedKg: 95.0,
      totalEWasteRecoveredKg: 26.2
    },
    createdAt: new Date('2026-01-01').toISOString()
  },
  {
    id: 'usr_admin_003',
    _id: 'usr_admin_003',
    name: 'Vikram Joshi (City Officer)',
    email: 'admin@greenward.gov',
    password: bcrypt.hashSync('adminpassword', 10),
    role: 'admin',
    institution: 'Municipal Corporation (Ward 4)',
    ecoPoints: 1200,
    currentStreak: 20,
    longestStreak: 20,
    lastScanDate: new Date().toISOString(),
    badges: ['admin_badge', 'circuit_miner'],
    stats: {
      totalScans: 180,
      totalCo2SavedKg: 92.5,
      totalWaterSavedLiters: 2100,
      totalPlasticDivertedKg: 32.0,
      totalOrganicCompostedKg: 45.0,
      totalEWasteRecoveredKg: 15.5
    },
    createdAt: new Date('2026-01-15').toISOString()
  },
  {
    id: 'usr_aarav_001',
    _id: 'usr_aarav_001',
    name: 'Aarav Sharma',
    email: 'aarav@ecogreen.org',
    password: bcrypt.hashSync('password123', 10),
    role: 'citizen',
    institution: 'Greenwood Heights Society',
    ecoPoints: 520,
    currentStreak: 6,
    longestStreak: 12,
    lastScanDate: new Date(Date.now() - 3600000).toISOString(),
    badges: ['plastic_diverter', 'streak_7d'],
    stats: {
      totalScans: 48,
      totalCo2SavedKg: 24.5,
      totalWaterSavedLiters: 580,
      totalPlasticDivertedKg: 8.4,
      totalOrganicCompostedKg: 12.0,
      totalEWasteRecoveredKg: 4.1
    },
    createdAt: new Date('2026-02-01').toISOString()
  },
  {
    id: 'usr_priya_002',
    _id: 'usr_priya_002',
    name: 'Priya Patel',
    email: 'priya@techcampus.edu',
    password: bcrypt.hashSync('password123', 10),
    role: 'citizen',
    institution: 'Apex Tech University',
    ecoPoints: 890,
    currentStreak: 15,
    longestStreak: 15,
    lastScanDate: new Date().toISOString(),
    badges: ['compost_master', 'streak_14d'],
    stats: {
      totalScans: 92,
      totalCo2SavedKg: 46.2,
      totalWaterSavedLiters: 1100,
      totalPlasticDivertedKg: 15.2,
      totalOrganicCompostedKg: 28.0,
      totalEWasteRecoveredKg: 3.0
    },
    createdAt: new Date('2026-02-10').toISOString()
  }
];

let predictions = [];

let centers = [
  {
    id: 'ctr_001',
    _id: 'ctr_001',
    name: 'E-Waste & Precious Metals Recovery Facility',
    address: 'Plot 42, Green Electronics Zone, Phase II',
    phone: '+91 98234-56781',
    lat: 28.6139,
    lng: 77.2090,
    acceptedMaterials: ['E-Waste', 'Hazardous', 'Metal'],
    buybackPrices: {
      eWastePerKg: 120,
      metalPerKg: 35,
      plasticPerKg: 0,
      paperPerKg: 0,
      glassPerKg: 0
    },
    verified: true,
    active: true,
    operatingHours: 'Mon-Sat: 09:00 - 18:00'
  },
  {
    id: 'ctr_002',
    _id: 'ctr_002',
    name: 'Apex Polymer Reprocessing Center',
    address: 'Gate 3, Industrial Area Sector 18',
    phone: '+91 98112-34567',
    lat: 28.6250,
    lng: 77.2180,
    acceptedMaterials: ['Plastic', 'Paper', 'Glass'],
    buybackPrices: {
      plasticPerKg: 18,
      paperPerKg: 12,
      glassPerKg: 6,
      eWastePerKg: 0,
      metalPerKg: 0
    },
    verified: true,
    active: true,
    operatingHours: 'Mon-Sun: 08:00 - 20:00'
  },
  {
    id: 'ctr_003',
    _id: 'ctr_003',
    name: 'City Bio-Methanation & Compost Plant',
    address: 'Organic Processing Yard, Ward 7',
    phone: '+91 98765-43210',
    lat: 28.6010,
    lng: 77.2250,
    acceptedMaterials: ['Organic'],
    buybackPrices: {
      plasticPerKg: 0,
      paperPerKg: 0,
      glassPerKg: 0,
      eWastePerKg: 0,
      metalPerKg: 0
    },
    verified: true,
    active: true,
    operatingHours: 'Daily: 06:00 - 18:00'
  }
];

let municipalAlerts = [
  {
    id: 'alt_001',
    _id: 'alt_001',
    title: 'Ward 4 Plastic Contamination Drive',
    message: 'Dedicated single-use plastic collection drive this Saturday across Greenwood Sector.',
    zone: 'Ward 4',
    severity: 'info',
    active: true,
    createdAt: new Date().toISOString()
  }
];

// Helper to determine role with Super Admin priority
function resolveRole(email, requestedRole, secretKey) {
  if (email && email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase()) {
    return 'super_admin';
  }
  if (secretKey && secretKey === ADMIN_SECRET_KEY) {
    return 'admin';
  }
  if (requestedRole === 'admin' && secretKey === ADMIN_SECRET_KEY) {
    return 'admin';
  }
  return 'citizen';
}

const store = {
  SUPER_ADMIN_EMAIL,
  ADMIN_SECRET_KEY,

  // --- Users ---
  async findUserByEmail(email) {
    const cleanEmail = (email || '').toLowerCase().trim();
    const db = await connectDB();
    if (db) {
      const user = await User.findOne({ email: cleanEmail });
      if (user) return user;
    }
    return users.find(u => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findUserById(id) {
    const db = await connectDB();
    if (db) {
      const user = await User.findById(id).catch(() => null);
      if (user) return user;
    }
    return users.find(u => u.id === id || u._id === id) || null;
  },

  async createUser(userData) {
    const cleanEmail = (userData.email || '').toLowerCase().trim();
    const role = resolveRole(cleanEmail, userData.role, userData.adminSecretKey);

    const newUserObj = {
      id: 'usr_' + Date.now(),
      name: userData.name,
      email: cleanEmail,
      password: userData.password,
      role: role,
      institution: userData.institution || 'Green Community',
      ecoPoints: role === 'super_admin' ? 1000 : 20,
      currentStreak: 1,
      longestStreak: 1,
      lastScanDate: new Date().toISOString(),
      badges: role === 'super_admin' ? ['super_admin_crest', 'welcome_badge'] : ['welcome_badge'],
      stats: {
        totalScans: 0,
        totalCo2SavedKg: 0,
        totalWaterSavedLiters: 0,
        totalPlasticDivertedKg: 0,
        totalOrganicCompostedKg: 0,
        totalEWasteRecoveredKg: 0
      },
      createdAt: new Date().toISOString()
    };

    const db = await connectDB();
    if (db) {
      try {
        const saved = await User.create(newUserObj);
        return saved;
      } catch (err) {
        console.warn('MongoDB user create fallback to memory:', err.message);
      }
    }

    users.push(newUserObj);
    return newUserObj;
  },

  async getAllUsers() {
    const db = await connectDB();
    if (db) {
      try {
        const list = await User.find({}).sort({ createdAt: -1 });
        if (list && list.length > 0) return list;
      } catch (err) {
        console.warn('MongoDB list users fallback:', err.message);
      }
    }
    return users;
  },

  async updateUserRole(userId, newRole) {
    const db = await connectDB();
    if (db) {
      try {
        const updated = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true });
        if (updated) return updated;
      } catch (err) {
        console.warn('MongoDB role update fallback:', err.message);
      }
    }
    const user = users.find(u => u.id === userId || u._id === userId);
    if (user) {
      user.role = newRole;
      return user;
    }
    return null;
  },

  // --- Predictions ---
  async addPrediction(predData) {
    const newRecord = {
      id: 'pred_' + Date.now(),
      _id: 'pred_' + Date.now(),
      ...predData,
      timestamp: new Date().toISOString()
    };

    const db = await connectDB();
    if (db) {
      try {
        const saved = await ScanHistory.create(newRecord);
        return saved;
      } catch (err) {
        console.warn('MongoDB scan save fallback:', err.message);
      }
    }

    predictions.unshift(newRecord);
    return newRecord;
  },

  async findPredictionById(id) {
    const db = await connectDB();
    if (db) {
      try {
        const record = await ScanHistory.findById(id).catch(() => null);
        if (record) return record;
      } catch (err) {}
    }
    return predictions.find(p => p.id === id || p._id === id) || null;
  },

  async getUserPredictions(userId, { page = 1, limit = 10, category = null } = {}) {
    const db = await connectDB();
    if (db) {
      try {
        const query = { userId };
        if (category && category !== 'All') query.category = category;
        const total = await ScanHistory.countDocuments(query);
        const list = await ScanHistory.find(query)
          .sort({ timestamp: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
        return { total, page, pages: Math.ceil(total / limit) || 1, list };
      } catch (err) {}
    }

    let filtered = predictions.filter(p => p.userId === userId);
    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
    }
    const total = filtered.length;
    const start = (page - 1) * limit;
    return {
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      list: filtered.slice(start, start + limit)
    };
  },

  async deletePrediction(id, userId) {
    const db = await connectDB();
    if (db) {
      try {
        await ScanHistory.findOneAndDelete({ _id: id, userId });
      } catch (err) {}
    }
    const index = predictions.findIndex(p => (p.id === id || p._id === id) && p.userId === userId);
    if (index !== -1) {
      predictions.splice(index, 1);
      return true;
    }
    return true;
  },

  async getAllPredictions() {
    const db = await connectDB();
    if (db) {
      try {
        const list = await ScanHistory.find({}).sort({ timestamp: -1 });
        if (list && list.length > 0) return list;
      } catch (err) {}
    }
    return predictions;
  },

  // --- Recycling Centers ---
  async getRecyclingCenters({ category = null } = {}) {
    const db = await connectDB();
    if (db) {
      try {
        const list = await RecyclingCenter.find({ active: true });
        if (list && list.length > 0) {
          if (category && category !== 'All') {
            return list.filter(c => c.acceptedMaterials.some(m => m.toLowerCase().includes(category.toLowerCase())));
          }
          return list;
        }
      } catch (err) {}
    }

    let list = centers.filter(c => c.active);
    if (category && category !== 'All') {
      list = list.filter(c => c.acceptedMaterials.some(m => m.toLowerCase().includes(category.toLowerCase())));
    }
    return list;
  },

  async addRecyclingCenter(centerData) {
    const newCenter = {
      id: 'ctr_' + Date.now(),
      _id: 'ctr_' + Date.now(),
      ...centerData,
      verified: true,
      active: true,
      createdAt: new Date().toISOString()
    };

    const db = await connectDB();
    if (db) {
      try {
        const saved = await RecyclingCenter.create(newCenter);
        return saved;
      } catch (err) {}
    }

    centers.push(newCenter);
    return newCenter;
  },

  async updateRecyclingCenter(id, centerData) {
    const db = await connectDB();
    if (db) {
      try {
        const updated = await RecyclingCenter.findByIdAndUpdate(id, centerData, { new: true });
        if (updated) return updated;
      } catch (err) {}
    }

    const center = centers.find(c => c.id === id || c._id === id);
    if (center) {
      Object.assign(center, centerData);
      return center;
    }
    return null;
  },

  async deleteRecyclingCenter(id) {
    const db = await connectDB();
    if (db) {
      try {
        await RecyclingCenter.findByIdAndDelete(id);
      } catch (err) {}
    }
    const idx = centers.findIndex(c => c.id === id || c._id === id);
    if (idx !== -1) {
      centers.splice(idx, 1);
      return true;
    }
    return true;
  },

  // --- Municipal Alerts ---
  async getMunicipalAlerts() {
    const db = await connectDB();
    if (db) {
      try {
        const list = await MunicipalAlert.find({ active: true }).sort({ createdAt: -1 });
        if (list && list.length > 0) return list;
      } catch (err) {}
    }
    return municipalAlerts.filter(a => a.active);
  },

  async addMunicipalAlert(alertData) {
    const newAlert = {
      id: 'alt_' + Date.now(),
      _id: 'alt_' + Date.now(),
      ...alertData,
      active: true,
      createdAt: new Date().toISOString()
    };

    const db = await connectDB();
    if (db) {
      try {
        const saved = await MunicipalAlert.create(newAlert);
        return saved;
      } catch (err) {}
    }

    municipalAlerts.unshift(newAlert);
    return newAlert;
  },

  async deleteMunicipalAlert(id) {
    const db = await connectDB();
    if (db) {
      try {
        await MunicipalAlert.findByIdAndDelete(id);
      } catch (err) {}
    }
    const idx = municipalAlerts.findIndex(a => a.id === id || a._id === id);
    if (idx !== -1) {
      municipalAlerts.splice(idx, 1);
      return true;
    }
    return true;
  },

  // --- Badges ---
  checkAndAwardBadges(user) {
    const newlyAwarded = [];
    const stats = user.stats || {};
    const existingBadges = new Set(user.badges || []);

    if (user.role === 'super_admin' && !existingBadges.has('super_admin_crest')) {
      newlyAwarded.push({ id: 'super_admin_crest', name: 'Super Admin Crest', icon: '👑', desc: 'Municipal Supreme Administrator' });
      existingBadges.add('super_admin_crest');
    }
    if (stats.totalScans >= 1 && !existingBadges.has('first_scan')) {
      newlyAwarded.push({ id: 'first_scan', name: 'Eco Explorer', icon: '🌱', desc: 'Classified your first waste item' });
      existingBadges.add('first_scan');
    }
    if (stats.totalPlasticDivertedKg >= 5 && !existingBadges.has('plastic_diverter')) {
      newlyAwarded.push({ id: 'plastic_diverter', name: 'Ocean Savior', icon: '🌊', desc: 'Diverted 5kg+ of plastic from oceans' });
      existingBadges.add('plastic_diverter');
    }
    if (stats.totalOrganicCompostedKg >= 10 && !existingBadges.has('compost_master')) {
      newlyAwarded.push({ id: 'compost_master', name: 'Compost Virtuoso', icon: '🍃', desc: 'Generated 10kg+ organic bio-compost' });
      existingBadges.add('compost_master');
    }
    if (stats.totalEWasteRecoveredKg >= 2 && !existingBadges.has('circuit_miner')) {
      newlyAwarded.push({ id: 'circuit_miner', name: 'Urban Gold Miner', icon: '⚡', desc: 'Recovered precious metals from e-waste' });
      existingBadges.add('circuit_miner');
    }
    if (user.currentStreak >= 7 && !existingBadges.has('streak_7d')) {
      newlyAwarded.push({ id: 'streak_7d', name: 'Consistency Champion', icon: '🔥', desc: 'Maintained a 7-day segregation streak' });
      existingBadges.add('streak_7d');
    }

    user.badges = Array.from(existingBadges);
    return newlyAwarded;
  }
};

module.exports = store;
