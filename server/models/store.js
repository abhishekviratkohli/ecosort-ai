const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const taxonomyData = require('../data/waste_taxonomy.json');
const centersData = require('../data/recycling_centers.json');

// In-Memory Data Store with initial seed data
class Store {
  constructor() {
    this.users = [];
    this.predictions = [];
    this.centers = centersData.centers || [];
    this.taxonomy = taxonomyData.categories || [];
    this.badges = [
      {
        id: 'seedling_sorter',
        title: 'Seedling Sorter',
        icon: '🌱',
        description: 'Completed your first smart waste scan',
        category: 'milestone'
      },
      {
        id: 'week_warrior',
        title: 'Week Warrior',
        icon: '⚡',
        description: 'Maintained a 7-day daily segregation streak',
        category: 'streak'
      },
      {
        id: 'master_recycler',
        title: 'Master Recycler',
        icon: '♻️',
        description: 'Sorted 20 recyclable plastic/metal/paper items correctly',
        category: 'recycling'
      },
      {
        id: 'urban_miner',
        title: 'Urban Miner',
        icon: '💎',
        description: 'Diverted electronic waste containing precious metals',
        category: 'ewaste'
      },
      {
        id: 'carbon_champion',
        title: 'Carbon Champion',
        icon: '🌍',
        description: 'Offset more than 10 kg of CO2 equivalent emissions',
        category: 'carbon'
      },
      {
        id: 'zero_waste_hero',
        title: 'Zero Waste Hero',
        icon: '👑',
        description: 'Accumulated 1,000+ Eco-Points on the platform',
        category: 'points'
      }
    ];

    this.seedInitialData();
  }

  seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    
    // Seed Demo Users
    const userAarav = {
      id: 'usr_aarav_001',
      name: 'Aarav Sharma',
      email: 'aarav.eco@example.com',
      passwordHash: bcrypt.hashSync('Password123!', salt),
      role: 'citizen',
      institution: 'Delhi Technological University',
      ecoPoints: 520,
      currentStreak: 6,
      longestStreak: 12,
      lastScanDate: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hrs ago
      stats: {
        totalScans: 28,
        totalCo2SavedKg: 8.45,
        totalWaterSavedLiters: 142.0,
        totalPlasticDivertedKg: 2.3,
        totalOrganicCompostedKg: 4.8,
        totalEWasteRecoveredKg: 0.8
      },
      badges: [
        { badgeId: 'seedling_sorter', unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() },
        { badgeId: 'master_recycler', unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() }
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
    };

    const userPriya = {
      id: 'usr_priya_002',
      name: 'Priya Verma',
      email: 'priya.green@example.com',
      passwordHash: bcrypt.hashSync('Password123!', salt),
      role: 'institution_member',
      institution: 'Greenwood International Campus',
      ecoPoints: 890,
      currentStreak: 15,
      longestStreak: 15,
      lastScanDate: new Date().toISOString(),
      stats: {
        totalScans: 54,
        totalCo2SavedKg: 19.8,
        totalWaterSavedLiters: 320.0,
        totalPlasticDivertedKg: 5.1,
        totalOrganicCompostedKg: 12.4,
        totalEWasteRecoveredKg: 1.4
      },
      badges: [
        { badgeId: 'seedling_sorter', unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString() },
        { badgeId: 'week_warrior', unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString() },
        { badgeId: 'urban_miner', unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
        { badgeId: 'carbon_champion', unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() }
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString()
    };

    const userAdmin = {
      id: 'usr_admin_003',
      name: 'Dr. Ramesh Iyer',
      email: 'admin@ecosort.ai',
      passwordHash: bcrypt.hashSync('AdminSecure2026!', salt),
      role: 'admin',
      institution: 'Municipal Solid Waste Corporation',
      ecoPoints: 1450,
      currentStreak: 21,
      longestStreak: 21,
      lastScanDate: new Date().toISOString(),
      stats: {
        totalScans: 92,
        totalCo2SavedKg: 34.6,
        totalWaterSavedLiters: 580.0,
        totalPlasticDivertedKg: 11.2,
        totalOrganicCompostedKg: 24.0,
        totalEWasteRecoveredKg: 3.2
      },
      badges: [
        { badgeId: 'seedling_sorter', unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString() },
        { badgeId: 'week_warrior', unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString() },
        { badgeId: 'master_recycler', unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString() },
        { badgeId: 'urban_miner', unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString() },
        { badgeId: 'carbon_champion', unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
        { badgeId: 'zero_waste_hero', unlockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() }
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString()
    };

    this.users.push(userAarav, userPriya, userAdmin);

    // Seed Sample Historic Predictions for Aarav
    this.predictions.push(
      {
        id: 'pred_001',
        userId: userAarav.id,
        imageUrl: '/samples/sample_pet_bottle.jpg',
        category: 'Plastic',
        subItem: 'PET Beverage Bottle (Type 1)',
        confidence: 0.974,
        binColor: 'Blue',
        co2SavedGrams: 82.5,
        waterSavedLiters: 1.4,
        pointsAwarded: 15,
        markedDisposed: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
      },
      {
        id: 'pred_002',
        userId: userAarav.id,
        imageUrl: '/samples/sample_banana_peel.jpg',
        category: 'Organic',
        subItem: 'Fruit & Vegetable Peels',
        confidence: 0.982,
        binColor: 'Green',
        co2SavedGrams: 35.0,
        waterSavedLiters: 0.5,
        pointsAwarded: 10,
        markedDisposed: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString()
      },
      {
        id: 'pred_003',
        userId: userAarav.id,
        imageUrl: '/samples/sample_smartphone.jpg',
        category: 'E-Waste',
        subItem: 'Smartphone / Portable Electronics',
        confidence: 0.941,
        binColor: 'Yellow',
        co2SavedGrams: 420.0,
        waterSavedLiters: 8.5,
        pointsAwarded: 30,
        markedDisposed: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString()
      },
      {
        id: 'pred_004',
        userId: userAarav.id,
        imageUrl: '/samples/sample_cardboard.jpg',
        category: 'Paper',
        subItem: 'Corrugated Shipping Boxes',
        confidence: 0.958,
        binColor: 'Blue',
        co2SavedGrams: 95.0,
        waterSavedLiters: 2.1,
        pointsAwarded: 15,
        markedDisposed: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 76).toISOString()
      }
    );
  }

  // User Operations
  findUserByEmail(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.users.find(u => u.id === id);
  }

  createUser({ name, email, password, role = 'citizen', institution = '' }) {
    const salt = bcrypt.genSaltSync(10);
    const newUser = {
      id: 'usr_' + uuidv4().slice(0, 8),
      name,
      email,
      passwordHash: bcrypt.hashSync(password, salt),
      role,
      institution: institution || 'Independent Eco Champion',
      ecoPoints: 10, // Welcome bonus
      currentStreak: 1,
      longestStreak: 1,
      lastScanDate: new Date().toISOString(),
      stats: {
        totalScans: 0,
        totalCo2SavedKg: 0,
        totalWaterSavedLiters: 0,
        totalPlasticDivertedKg: 0,
        totalOrganicCompostedKg: 0,
        totalEWasteRecoveredKg: 0
      },
      badges: [
        { badgeId: 'seedling_sorter', unlockedAt: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id, updates) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...updates };
    return this.users[idx];
  }

  // Prediction Operations
  addPrediction(prediction) {
    const newPred = {
      id: 'pred_' + uuidv4().slice(0, 8),
      ...prediction,
      timestamp: new Date().toISOString()
    };
    this.predictions.unshift(newPred);
    return newPred;
  }

  findPredictionById(id) {
    return this.predictions.find(p => p.id === id);
  }

  getUserPredictions(userId, { limit = 20, page = 1, category = null } = {}) {
    let list = this.predictions.filter(p => p.userId === userId);
    if (category && category !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);
    return { list: paginated, total, page, pages: Math.ceil(total / limit) || 1 };
  }

  deletePrediction(id, userId) {
    const index = this.predictions.findIndex(p => p.id === id && p.userId === userId);
    if (index !== -1) {
      this.predictions.splice(index, 1);
      return true;
    }
    return false;
  }

  // Badges & Gamification
  checkAndAwardBadges(user) {
    const newlyUnlocked = [];
    const existingBadgeIds = new Set(user.badges.map(b => b.badgeId));

    // 1. Seedling Sorter
    if (!existingBadgeIds.has('seedling_sorter') && user.stats.totalScans >= 1) {
      user.badges.push({ badgeId: 'seedling_sorter', unlockedAt: new Date().toISOString() });
      newlyUnlocked.push(this.badges.find(b => b.id === 'seedling_sorter'));
    }

    // 2. Week Warrior (7+ day streak)
    if (!existingBadgeIds.has('week_warrior') && user.currentStreak >= 7) {
      user.badges.push({ badgeId: 'week_warrior', unlockedAt: new Date().toISOString() });
      newlyUnlocked.push(this.badges.find(b => b.id === 'week_warrior'));
    }

    // 3. Master Recycler (20+ scans)
    if (!existingBadgeIds.has('master_recycler') && user.stats.totalScans >= 20) {
      user.badges.push({ badgeId: 'master_recycler', unlockedAt: new Date().toISOString() });
      newlyUnlocked.push(this.badges.find(b => b.id === 'master_recycler'));
    }

    // 4. Urban Miner (E-waste logged)
    if (!existingBadgeIds.has('urban_miner') && user.stats.totalEWasteRecoveredKg > 0) {
      user.badges.push({ badgeId: 'urban_miner', unlockedAt: new Date().toISOString() });
      newlyUnlocked.push(this.badges.find(b => b.id === 'urban_miner'));
    }

    // 5. Carbon Champion (10+ kg CO2)
    if (!existingBadgeIds.has('carbon_champion') && user.stats.totalCo2SavedKg >= 10.0) {
      user.badges.push({ badgeId: 'carbon_champion', unlockedAt: new Date().toISOString() });
      newlyUnlocked.push(this.badges.find(b => b.id === 'carbon_champion'));
    }

    // 6. Zero Waste Hero (1000+ points)
    if (!existingBadgeIds.has('zero_waste_hero') && user.ecoPoints >= 1000) {
      user.badges.push({ badgeId: 'zero_waste_hero', unlockedAt: new Date().toISOString() });
      newlyUnlocked.push(this.badges.find(b => b.id === 'zero_waste_hero'));
    }

    return newlyUnlocked;
  }
}

const storeInstance = new Store();
module.exports = storeInstance;
