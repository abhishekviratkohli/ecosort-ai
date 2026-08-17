const express = require('express');
const router = express.Router();
const store = require('../models/store');
const { optionalAuth, authenticateToken } = require('../middleware/auth');
const { classifyWasteImage, sampleWasteLibrary } = require('../services/aiInference');
const { resolveCircularActionPlan } = require('../services/circularEngine');

// POST /api/predict
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { image, sampleKey, classification, metadata } = req.body;

    if (!image && !sampleKey && !classification) {
      return res.status(400).json({ success: false, message: 'Image data, sampleKey, or classification is required' });
    }

    let rawPrediction;

    // If client-side TensorFlow.js neural network already classified the real image pixels:
    if (classification && classification.category) {
      rawPrediction = {
        category: classification.category,
        subItem: classification.subItem || classification.category,
        confidence: classification.confidence || 0.94,
        probabilities: classification.probabilities || [
          { category: classification.category, score: classification.confidence || 0.94 }
        ],
        xai: classification.xai || {
          rationale: `Neural Network classified this item as ${classification.subItem || classification.category}.`,
          inferenceEngine: 'TensorFlow.js WebGL MobileNet'
        }
      };
    } else {
      // Server-side inference fallback
      rawPrediction = await classifyWasteImage({
        imageBase64: image,
        sampleKey,
        metadata
      });
    }

    // 2. Resolve Circular Economy & Environmental Impact Plan
    const circularPlan = resolveCircularActionPlan(rawPrediction);

    // 3. Format Response Payload
    const predictionPayload = {
      category: rawPrediction.category,
      subItem: rawPrediction.subItem,
      confidence: rawPrediction.confidence,
      probabilities: rawPrediction.probabilities,
      explainability: rawPrediction.xai,
      ...circularPlan
    };

    // 4. If user is logged in, log prediction in store
    let savedRecord = null;
    if (req.user) {
      savedRecord = store.addPrediction({
        userId: req.user.id,
        imageUrl: image ? (image.length > 200 ? image.slice(0, 150) + '...' : image) : `/samples/${sampleKey || 'sample'}.jpg`,
        category: rawPrediction.category,
        subItem: rawPrediction.subItem,
        confidence: rawPrediction.confidence,
        binColor: circularPlan.binColor,
        co2SavedGrams: circularPlan.environmentalImpact.co2SavedGrams,
        waterSavedLiters: circularPlan.environmentalImpact.waterSavedLiters,
        pointsAwarded: circularPlan.ecoPointsEligible,
        markedDisposed: false
      });
      predictionPayload.predictionId = savedRecord.id;
    } else {
      predictionPayload.predictionId = 'guest_' + Date.now();
    }

    res.json({
      success: true,
      data: predictionPayload
    });
  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ success: false, message: 'Failed to process waste classification' });
  }
});

// POST /api/predict/confirm-disposal
router.post('/confirm-disposal', authenticateToken, (req, res) => {
  try {
    const { predictionId } = req.body;
    const user = req.user;

    const prediction = store.findPredictionById(predictionId);
    if (!prediction && !predictionId.startsWith('guest_')) {
      return res.status(404).json({ success: false, message: 'Prediction record not found' });
    }

    if (prediction && prediction.markedDisposed) {
      return res.status(400).json({ success: false, message: 'This item has already been marked as disposed' });
    }

    if (prediction) {
      prediction.markedDisposed = true;
    }

    const basePoints = prediction ? prediction.pointsAwarded : 15;
    const streakMultiplier = user.currentStreak >= 7 ? 1.25 : 1.0;
    const finalPoints = Math.round(basePoints * streakMultiplier);

    user.ecoPoints += finalPoints;
    user.stats.totalScans += 1;
    
    if (prediction) {
      user.stats.totalCo2SavedKg = Math.round((user.stats.totalCo2SavedKg + (prediction.co2SavedGrams / 1000)) * 100) / 100;
      user.stats.totalWaterSavedLiters = Math.round((user.stats.totalWaterSavedLiters + (prediction.waterSavedLiters || 1.0)) * 10) / 10;
      
      const cat = (prediction.category || '').toLowerCase();
      if (cat.includes('plastic')) user.stats.totalPlasticDivertedKg = Math.round((user.stats.totalPlasticDivertedKg + 0.045) * 100) / 100;
      if (cat.includes('organic')) user.stats.totalOrganicCompostedKg = Math.round((user.stats.totalOrganicCompostedKg + 0.120) * 100) / 100;
      if (cat.includes('e-waste')) user.stats.totalEWasteRecoveredKg = Math.round((user.stats.totalEWasteRecoveredKg + 0.180) * 100) / 100;
    }

    const now = new Date();
    const lastScan = user.lastScanDate ? new Date(user.lastScanDate) : null;
    if (lastScan) {
      const diffHours = (now - lastScan) / (1000 * 60 * 60);
      if (diffHours >= 18 && diffHours <= 48) {
        user.currentStreak += 1;
        if (user.currentStreak > user.longestStreak) {
          user.longestStreak = user.currentStreak;
        }
      }
    }
    user.lastScanDate = now.toISOString();

    const newBadges = store.checkAndAwardBadges(user);

    res.json({
      success: true,
      message: `Proper disposal verified! +${finalPoints} Eco-Points added to your balance.`,
      pointsAwarded: finalPoints,
      newTotalPoints: user.ecoPoints,
      currentStreak: user.currentStreak,
      streakMultiplier,
      newBadgesUnlocked: newBadges,
      updatedStats: user.stats
    });
  } catch (err) {
    console.error('Confirm disposal error:', err);
    res.status(500).json({ success: false, message: 'Failed to record disposal confirmation' });
  }
});

// GET /api/predict/history
router.get('/history', authenticateToken, (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || null;

    const result = store.getUserPredictions(req.user.id, { page, limit, category });

    res.json({
      success: true,
      total: result.total,
      page: result.page,
      pages: result.pages,
      history: result.list
    });
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

// DELETE /api/predict/history/:id
router.delete('/history/:id', authenticateToken, (req, res) => {
  try {
    const deleted = store.deletePrediction(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Record not found or unauthorized' });
    }
    res.json({ success: true, message: 'Record deleted from history' });
  } catch (err) {
    console.error('History delete error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete record' });
  }
});

// GET /api/predict/samples
router.get('/samples', (req, res) => {
  const sampleList = [
    { key: 'pet_bottle', name: 'Plastic PET Water Bottle', category: 'Plastic', icon: '🍶', preview: 'Clear plastic beverage container' },
    { key: 'banana_peel', name: 'Banana Peel / Fruit Scraps', category: 'Organic', icon: '🍌', preview: 'Fresh wet organic fruit peel' },
    { key: 'smartphone', name: 'Old Smartphone / Circuit', category: 'E-Waste', icon: '📱', preview: 'Lithium battery & motherboard electronics' },
    { key: 'aluminum_can', name: 'Soda Aluminum Can', category: 'Metal', icon: '🥫', preview: 'Lightweight infinitely recyclable metal' },
    { key: 'cardboard_box', name: 'Amazon Cardboard Box', category: 'Paper', icon: '📦', preview: 'Corrugated cellulose fiber packaging' },
    { key: 'battery', name: 'Alkaline AA Battery', category: 'Hazardous', icon: '🔋', preview: 'Electrochemical cell (Toxic leachate)' },
    { key: 'glass_jar', name: 'Flint Glass Food Jar', category: 'Glass', icon: '🫙', preview: '100% recyclable culinary glass' }
  ];
  res.json({ success: true, samples: sampleList });
});

module.exports = router;
