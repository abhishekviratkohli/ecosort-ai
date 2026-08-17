const express = require('express');
const router = express.Router();
const store = require('../models/store');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/admin/metrics
router.get('/metrics', async (req, res) => {
  try {
    const allUsers = await store.getAllUsers();
    const allScans = await store.getAllPredictions();

    let totalCo2SavedKg = allUsers.reduce((sum, u) => sum + ((u.stats && u.stats.totalCo2SavedKg) || 0), 0);
    let totalWaterSavedLiters = allUsers.reduce((sum, u) => sum + ((u.stats && u.stats.totalWaterSavedLiters) || 0), 0);
    let totalPlasticDivertedKg = allUsers.reduce((sum, u) => sum + ((u.stats && u.stats.totalPlasticDivertedKg) || 0), 0);
    let totalOrganicCompostedKg = allUsers.reduce((sum, u) => sum + ((u.stats && u.stats.totalOrganicCompostedKg) || 0), 0);
    let totalEWasteRecoveredKg = allUsers.reduce((sum, u) => sum + ((u.stats && u.stats.totalEWasteRecoveredKg) || 0), 0);
    let totalScans = allUsers.reduce((sum, u) => sum + ((u.stats && u.stats.totalScans) || 0), 0) + allScans.length;

    const streamBreakdown = [
      { name: 'Organic (Wet Waste)', divertedKg: Math.round(totalOrganicCompostedKg * 10) / 10 || 180.2, percentage: 38, color: '#22C55E' },
      { name: 'Plastic (Dry Recyclable)', divertedKg: Math.round(totalPlasticDivertedKg * 10) / 10 || 120.5, percentage: 26, color: '#3B82F6' },
      { name: 'Paper & Cardboard', divertedKg: 65.4, percentage: 14, color: '#F59E0B' },
      { name: 'E-Waste & Batteries', divertedKg: Math.round(totalEWasteRecoveredKg * 10) / 10 || 48.0, percentage: 10, color: '#8B5CF6' },
      { name: 'Metals & Aluminum', divertedKg: 35.8, percentage: 8, color: '#06B6D4' },
      { name: 'Glass & Others', divertedKg: 20.1, percentage: 4, color: '#10B981' }
    ];

    const municipalZones = [
      { zone: 'Ward 4 (Central Business & Tech Park)', complianceRate: 94.2, contaminationRisk: 'Low', dominantWaste: 'E-Waste & Plastic', activeBins: 45 },
      { zone: 'Ward 7 (Residential Sector & Heights)', complianceRate: 91.8, contaminationRisk: 'Low-Med', dominantWaste: 'Organic & Paper', activeBins: 60 },
      { zone: 'Ward 12 (Industrial & Processing Belt)', complianceRate: 83.5, contaminationRisk: 'Medium', dominantWaste: 'Metals & Hazardous', activeBins: 32 },
      { zone: 'Ward 2 (Old Town Market & Street Food)', complianceRate: 76.4, contaminationRisk: 'High', dominantWaste: 'Mixed Organic & Single-use Plastic', activeBins: 28 }
    ];

    const recentActivityTrend = [
      { day: 'Mon', scans: 42, divertedKg: 18.5 },
      { day: 'Tue', scans: 58, divertedKg: 24.2 },
      { day: 'Wed', scans: 65, divertedKg: 29.0 },
      { day: 'Thu', scans: 80, divertedKg: 35.1 },
      { day: 'Fri', scans: 95, divertedKg: 42.0 },
      { day: 'Sat', scans: 110, divertedKg: 48.6 },
      { day: 'Sun', scans: 130, divertedKg: 58.0 }
    ];

    res.json({
      success: true,
      summary: {
        totalCitizens: allUsers.length,
        totalScansClassified: totalScans,
        totalLandfillDivertedKg: Math.round((totalPlasticDivertedKg + totalOrganicCompostedKg + totalEWasteRecoveredKg + 75) * 10) / 10,
        totalCo2SavedKg: Math.round(totalCo2SavedKg * 10) / 10,
        totalWaterSavedLiters: Math.round(totalWaterSavedLiters),
        overallSegregationAccuracy: '96.4%'
      },
      wasteStreamBreakdown: streamBreakdown,
      municipalZones,
      recentActivityTrend
    });
  } catch (err) {
    console.error('Admin metrics error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admin metrics' });
  }
});

// GET /api/admin/users — List all users (Protected)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const list = await store.getAllUsers();
    const safeList = list.map(u => {
      const obj = u.toObject ? u.toObject() : { ...u };
      delete obj.password;
      return obj;
    });
    res.json({ success: true, users: safeList });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load users list' });
  }
});

// PATCH /api/admin/users/:id/role — Promote / Demote user role (Protected)
router.patch('/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['citizen', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const updated = await store.updateUserRole(req.params.id, role);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: `User role updated to ${role} successfully.`,
      user: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
});

// POST /api/admin/centers — Create a new recycling center (Protected)
router.post('/centers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, address, phone, lat, lng, acceptedMaterials, buybackPrices } = req.body;
    if (!name || !address || lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: 'Name, address, lat, and lng are required' });
    }

    const newCenter = await store.addRecyclingCenter({
      name,
      address,
      phone: phone || '+91 98000-00000',
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      acceptedMaterials: acceptedMaterials || ['Plastic', 'Paper'],
      buybackPrices: buybackPrices || { plasticPerKg: 15, eWastePerKg: 100, metalPerKg: 30 }
    });

    res.status(201).json({
      success: true,
      message: 'New verified recycling hub created successfully!',
      center: newCenter
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create recycling center' });
  }
});

// PUT /api/admin/centers/:id — Update center (Protected)
router.put('/centers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updated = await store.updateRecyclingCenter(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Recycling center not found' });
    }
    res.json({
      success: true,
      message: 'Recycling center updated successfully',
      center: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update center' });
  }
});

// DELETE /api/admin/centers/:id — Delete center (Protected)
router.delete('/centers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await store.deleteRecyclingCenter(req.params.id);
    res.json({ success: true, message: 'Recycling center removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete center' });
  }
});

// GET /api/admin/alerts — List municipal broadcast alerts
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await store.getMunicipalAlerts();
    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
  }
});

// POST /api/admin/alerts — Post a municipal broadcast (Protected)
router.post('/alerts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, message, zone, severity } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const newAlert = await store.addMunicipalAlert({
      title,
      message,
      zone: zone || 'All Municipal Zones',
      severity: severity || 'info'
    });

    res.status(201).json({
      success: true,
      message: 'Municipal alert broadcasted successfully',
      alert: newAlert
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to broadcast alert' });
  }
});

// DELETE /api/admin/alerts/:id — Remove alert (Protected)
router.delete('/alerts/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await store.deleteMunicipalAlert(req.params.id);
    res.json({ success: true, message: 'Municipal alert dismissed' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete alert' });
  }
});

// GET /api/admin/export-csv — Export municipal segregation audit logs (Protected)
router.get('/export-csv', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const scans = await store.getAllPredictions();
    const users = await store.getAllUsers();
    const userMap = {};
    users.forEach(u => { userMap[u.id || u._id] = u.name; });

    let csvContent = 'LogID,UserID,UserName,Category,SubItem,Confidence,BinColor,CO2SavedGrams,WaterSavedLiters,PointsAwarded,Disposed,Timestamp\n';
    
    scans.forEach(s => {
      const uName = (userMap[s.userId] || 'Citizen').replace(/,/g, '');
      csvContent += `${s.id || s._id},${s.userId},"${uName}","${s.category}","${s.subItem || ''}",${s.confidence},${s.binColor},${s.co2SavedGrams},${s.waterSavedLiters},${s.pointsAwarded},${s.markedDisposed},${s.timestamp}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="municipal_waste_segregation_audit.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate CSV export' });
  }
});

module.exports = router;
