const taxonomy = require('../data/waste_taxonomy.json');

// Category mapping helper
const categoryMap = {};
taxonomy.categories.forEach(cat => {
  categoryMap[cat.name.toLowerCase()] = cat;
  categoryMap[cat.id.toLowerCase()] = cat;
});

/**
 * Resolves full circular economy intelligence plan for a predicted waste classification.
 */
function resolveCircularActionPlan(predictionResult) {
  const categoryName = predictionResult.category || 'Plastic';
  const catKey = categoryName.toLowerCase();
  
  // Find taxonomy match
  let matchedCat = taxonomy.categories.find(
    c => c.name.toLowerCase().includes(catKey) || c.id.toLowerCase().includes(catKey)
  ) || taxonomy.categories[1]; // fallback to plastic

  // Specific Sub-Item Details
  let matchedSubItem = null;
  if (matchedCat.subItems && predictionResult.subItem) {
    matchedSubItem = matchedCat.subItems.find(
      s => predictionResult.subItem.toLowerCase().includes(s.name.toLowerCase()) ||
           s.name.toLowerCase().includes(predictionResult.subItem.toLowerCase())
    );
  }

  // Calculate environmental impacts based on 1 unit standard average weight
  const co2Factor = matchedCat.co2OffsetPerKg || 1.5;
  const waterFactor = matchedCat.waterOffsetLitersPerKg || 10.0;
  
  // Weights in kg per typical item
  const typicalWeightKg = {
    'plastic': 0.045, // 45g bottle
    'organic': 0.120, // 120g peel/food
    'paper': 0.080,   // 80g box/sheet
    'metal': 0.018,   // 18g soda can
    'glass': 0.250,   // 250g jar
    'e_waste': 0.180, // 180g phone/circuit
    'hazardous': 0.050 // 50g battery
  }[matchedCat.id] || 0.05;

  const co2SavedGrams = Math.round(typicalWeightKg * co2Factor * 1000 * 10) / 10;
  const waterSavedLiters = Math.round(typicalWeightKg * waterFactor * 10) / 10;
  const energySavedWattHours = Math.round(co2SavedGrams * 0.65 * 10) / 10;

  // Prepare Circular Plan Output
  const circularPlan = {
    category: matchedCat.displayName,
    categoryKey: matchedCat.id,
    binColor: matchedCat.binColor,
    hexCode: matchedCat.hexCode,
    badge: matchedCat.badge,
    decompositionTimeline: matchedCat.decompositionTimeline,
    decompositionYears: matchedCat.decompositionYears,
    primaryAction: matchedCat.primaryAction,
    
    binGuidance: {
      binColor: matchedCat.binColor,
      binName: matchedCat.binGuidance ? matchedCat.binGuidance.binName : `${matchedCat.binColor} Bin`,
      doNotMixWith: matchedCat.binGuidance ? matchedCat.binGuidance.doNotMixWith : ['Unsorted trash']
    },

    circularAction: {
      pathway: matchedCat.primaryAction,
      isRecyclable: matchedCat.id !== 'hazardous',
      prepSteps: matchedSubItem ? [matchedSubItem.prep] : [
        '1. Inspect item for contaminants or residues.',
        '2. Separate composite materials if detachable.',
        `3. Deposit into the ${matchedCat.binColor} bin.`
      ],
      upcyclingIdea: matchedSubItem ? matchedSubItem.upcycling : 'Check our community creative upcycling directory for zero-waste ideas.'
    },

    environmentalImpact: {
      co2SavedGrams,
      waterSavedLiters,
      energySavedWattHours,
      landfillVolumeDivertedGrams: Math.round(typicalWeightKg * 1000)
    },

    ecoPointsEligible: matchedCat.baseEcoPoints || 15
  };

  // If E-Waste, attach urban mining yield
  if (matchedCat.id === 'e_waste') {
    circularPlan.urbanMiningYield = {
      isRecoverable: true,
      metals: [
        { material: 'Copper (Cu)', amount: '12.5 grams', purity: '99.9% High Conductive Grade' },
        { material: 'Cobalt (Co)', amount: '6.8 grams', purity: 'Battery Cathode Grade' },
        { material: 'Gold & Silver Traces', amount: '0.024 grams', purity: 'High-Value Plating' },
        { material: 'Aluminum Chassis', amount: '28.0 grams', purity: 'Structural Alloy' }
      ],
      economicValueEstimate: '₹85 - ₹240 estimated trade-in scrap recovery value'
    };
  }

  // If Hazardous, attach critical warning checklist
  if (matchedCat.id === 'hazardous') {
    circularPlan.hazardSafety = {
      isHazardous: true,
      toxicityLevel: 'HIGH - Environmental & Health Danger',
      warnings: [
        '⚠️ NEVER mix with food scraps or standard trash bags.',
        '⚠️ Leaching danger: Heavy metals contaminate local drinking aquifers.',
        '⚠️ Fire hazard: Lithium or chemical batteries short-circuit when crushed in garbage trucks.'
      ],
      safeAction: 'Tape terminal contacts and take to designated Municipal Red Bin or Hazmat drop-off.'
    };
  }

  return circularPlan;
}

module.exports = {
  resolveCircularActionPlan
};
