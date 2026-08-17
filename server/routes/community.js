const express = require('express');
const router = express.Router();
const store = require('../models/store');

// GET /api/community/leaderboard
router.get('/leaderboard', (req, res) => {
  try {
    const scope = req.query.scope || 'all'; // 'all', 'weekly', 'institution'

    // Sort users by ecoPoints
    const sortedUsers = [...store.users]
      .sort((a, b) => b.ecoPoints - a.ecoPoints)
      .map((u, index) => ({
        rank: index + 1,
        id: u.id,
        name: u.name,
        role: u.role,
        institution: u.institution,
        ecoPoints: u.ecoPoints,
        streak: u.currentStreak,
        scansCount: u.stats.totalScans,
        co2SavedKg: u.stats.totalCo2SavedKg
      }));

    // Aggregate by institution
    const institutionMap = {};
    store.users.forEach(u => {
      const inst = u.institution || 'Independent Sorters';
      if (!institutionMap[inst]) {
        institutionMap[inst] = {
          institution: inst,
          totalMembers: 0,
          totalEcoPoints: 0,
          totalCo2SavedKg: 0,
          totalScans: 0
        };
      }
      institutionMap[inst].totalMembers += 1;
      institutionMap[inst].totalEcoPoints += u.ecoPoints;
      institutionMap[inst].totalCo2SavedKg = Math.round((institutionMap[inst].totalCo2SavedKg + u.stats.totalCo2SavedKg) * 10) / 10;
      institutionMap[inst].totalScans += u.stats.totalScans;
    });

    const institutionRankings = Object.values(institutionMap)
      .sort((a, b) => b.totalEcoPoints - a.totalEcoPoints)
      .map((item, idx) => ({ rank: idx + 1, ...item }));

    // Dynamic community challenges
    const activeChallenges = [
      {
        id: 'chal_01',
        title: 'Campus Zero-Plastic League',
        target: 'Divert 500 plastic bottles before weekend',
        progress: 342,
        goal: 500,
        unit: 'bottles',
        reward: '+100 Bonus Points & Green Campus Trophy',
        daysLeft: 3
      },
      {
        id: 'chal_02',
        title: 'Citywide E-Waste Recovery Blitz',
        target: 'Surrender 50kg old smartphones and cables',
        progress: 38.4,
        goal: 50.0,
        unit: 'kg',
        reward: 'Urban Mining Gold Medal & Tree Plantation Certificate',
        daysLeft: 6
      }
    ];

    res.json({
      success: true,
      scope,
      leaderboard: sortedUsers,
      institutionRankings,
      activeChallenges
    });
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard data' });
  }
});

module.exports = router;
