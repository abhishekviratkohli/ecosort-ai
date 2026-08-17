const express = require('express');
const router = express.Router();
const store = require('../models/store');

// Haversine formula for distance calculation in kilometers
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// GET /api/centers/nearby
router.get('/nearby', (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat) || 28.6139; // Default New Delhi / center
    const userLng = parseFloat(req.query.lng) || 77.2090;
    const category = req.query.category || 'All';
    const radius = parseFloat(req.query.radius) || 25; // km

    let centers = store.centers.map(c => {
      const distance = calculateDistanceKm(userLat, userLng, c.latitude, c.longitude);
      return {
        ...c,
        distanceKm: distance
      };
    });

    // Filter by category if not 'All'
    if (category && category !== 'All') {
      centers = centers.filter(c =>
        c.category.toLowerCase() === category.toLowerCase() ||
        c.acceptedCategories.some(ac => ac.toLowerCase() === category.toLowerCase())
      );
    }

    // Filter by radius
    centers = centers.filter(c => c.distanceKm <= radius);

    // Sort by nearest distance first
    centers.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      success: true,
      count: centers.length,
      userCoordinates: { lat: userLat, lng: userLng },
      centers
    });
  } catch (err) {
    console.error('Centers locator error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve recycling centers' });
  }
});

module.exports = router;
