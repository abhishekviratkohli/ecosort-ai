const express = require('express');
const router = express.Router();
const taxonomyData = require('../data/waste_taxonomy.json');

// GET /api/waste-catalog
router.get('/', (req, res) => {
  res.json({
    success: true,
    totalCategories: taxonomyData.categories.length,
    categories: taxonomyData.categories
  });
});

module.exports = router;
