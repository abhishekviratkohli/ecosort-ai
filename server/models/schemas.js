const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'admin', 'super_admin'], default: 'citizen' },
  institution: { type: String, default: 'Green Community' },
  ecoPoints: { type: Number, default: 20 },
  currentStreak: { type: Number, default: 1 },
  longestStreak: { type: Number, default: 1 },
  lastScanDate: { type: Date, default: Date.now },
  badges: [{ type: String }],
  stats: {
    totalScans: { type: Number, default: 0 },
    totalCo2SavedKg: { type: Number, default: 0 },
    totalWaterSavedLiters: { type: Number, default: 0 },
    totalPlasticDivertedKg: { type: Number, default: 0 },
    totalOrganicCompostedKg: { type: Number, default: 0 },
    totalEWasteRecoveredKg: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

// Scan History Schema
const ScanHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  imageUrl: { type: String },
  category: { type: String, required: true },
  subItem: { type: String, required: true },
  confidence: { type: Number, default: 0.95 },
  binColor: { type: String, default: 'Green' },
  co2SavedGrams: { type: Number, default: 50 },
  waterSavedLiters: { type: Number, default: 1.0 },
  pointsAwarded: { type: Number, default: 15 },
  markedDisposed: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

// Recycling Center Schema
const RecyclingCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, default: '+91 800-456-7890' },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  acceptedMaterials: [{ type: String }],
  buybackPrices: {
    plasticPerKg: { type: Number, default: 18 },
    eWastePerKg: { type: Number, default: 120 },
    metalPerKg: { type: Number, default: 35 },
    paperPerKg: { type: Number, default: 12 },
    glassPerKg: { type: Number, default: 6 }
  },
  verified: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Municipal Broadcast Alert Schema
const MunicipalAlertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  zone: { type: String, default: 'All Municipal Zones' },
  severity: { type: String, enum: ['info', 'warning', 'urgent'], default: 'info' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const ScanHistory = mongoose.models.ScanHistory || mongoose.model('ScanHistory', ScanHistorySchema);
const RecyclingCenter = mongoose.models.RecyclingCenter || mongoose.model('RecyclingCenter', RecyclingCenterSchema);
const MunicipalAlert = mongoose.models.MunicipalAlert || mongoose.model('MunicipalAlert', MunicipalAlertSchema);

module.exports = {
  User,
  ScanHistory,
  RecyclingCenter,
  MunicipalAlert
};
