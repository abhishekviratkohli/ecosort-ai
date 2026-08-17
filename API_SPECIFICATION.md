# EcoSort AI - REST API Specification & Data Contracts
**Version:** 2.0  
**Base URL:** `http://localhost:5000/api` (Development) / `https://api.ecosort.ai/api` (Production)  
**Authentication Scheme:** `Bearer <JWT_TOKEN>` in standard `Authorization` Header

---

## 1. Authentication & User Management

### `POST /auth/register`
Creates a new citizen, campus, or municipal user account.

**Request Body:**
```json
{
  "name": "Aarav Sharma",
  "email": "aarav.eco@example.com",
  "password": "SecurePassword123!",
  "role": "citizen",
  "institution": "Delhi Technological University"
}
```

**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66c1f01a8f1b2c0012345678",
    "name": "Aarav Sharma",
    "email": "aarav.eco@example.com",
    "role": "citizen",
    "institution": "Delhi Technological University",
    "ecoPoints": 0,
    "currentStreak": 0,
    "stats": {
      "totalScans": 0,
      "totalCo2SavedKg": 0,
      "totalPlasticDivertedKg": 0,
      "totalOrganicCompostedKg": 0
    }
  }
}
```

---

### `POST /auth/login`
Authenticates existing user credentials and returns session token.

**Request Body:**
```json
{
  "email": "aarav.eco@example.com",
  "password": "SecurePassword123!"
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66c1f01a8f1b2c0012345678",
    "name": "Aarav Sharma",
    "email": "aarav.eco@example.com",
    "role": "citizen",
    "institution": "Delhi Technological University",
    "ecoPoints": 485,
    "currentStreak": 6
  }
}
```

---

### `GET /auth/me`
Retrieves currently logged-in user's profile, full statistics, and badges.
*(Requires Bearer Token)*

**Response (`200 OK`):**
```json
{
  "success": true,
  "user": {
    "id": "66c1f01a8f1b2c0012345678",
    "name": "Aarav Sharma",
    "email": "aarav.eco@example.com",
    "role": "citizen",
    "institution": "Delhi Technological University",
    "ecoPoints": 485,
    "currentStreak": 6,
    "longestStreak": 14,
    "stats": {
      "totalScans": 34,
      "totalCo2SavedKg": 4.82,
      "totalPlasticDivertedKg": 1.95,
      "totalOrganicCompostedKg": 5.40
    },
    "badges": [
      {
        "id": "seedling_sorter",
        "title": "Seedling Sorter",
        "icon": "🌱",
        "description": "Completed first waste scan",
        "unlockedAt": "2026-08-01T09:00:00Z"
      },
      {
        "id": "master_recycler",
        "title": "Master Recycler",
        "icon": "♻️",
        "description": "Sorted 25 recyclable items correctly",
        "unlockedAt": "2026-08-14T14:30:00Z"
      }
    ]
  }
}
```

---

## 2. Waste Classification & AI Predictions

### `POST /predict`
Uploads waste image (Base64 or multipart file) and runs multi-category AI classification, returning actionable circular guidance.
*(Authentication Optional - Supports Guest Scans)*

**Request (JSON / Base64):**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "prediction": {
    "id": "66c1f23b8f1b2c0087654321",
    "category": "Plastic",
    "subItem": "PET Clear Beverage Bottle (Type 1)",
    "confidence": 0.968,
    "probabilities": [
      { "category": "Plastic", "score": 0.968 },
      { "category": "Glass", "score": 0.021 },
      { "category": "Metal", "score": 0.007 },
      { "category": "Paper", "score": 0.003 },
      { "category": "Organic", "score": 0.001 },
      { "category": "E-Waste", "score": 0.000 },
      { "category": "Hazardous", "score": 0.000 }
    ],
    "explainability": {
      "rationale": "High-confidence detection of transparent Polyethylene Terephthalate polymer wall, threaded neck, and standard PET-1 recycling triangular stamp.",
      "contaminationRisk": "Low if rinsed; residues may attract ants and ruin bale quality."
    },
    "binGuidance": {
      "binColor": "Blue",
      "binName": "Dry Recyclable Waste Bin",
      "symbol": "recycle",
      "hexCode": "#3B82F6"
    },
    "circularAction": {
      "pathway": "Mechanical Polymer Recycling",
      "isRecyclable": true,
      "prepSteps": [
        "1. Empty and rinse all leftover liquid",
        "2. Crush the bottle flat to save volume in the collection truck",
        "3. Replace cap securely before dropping into the blue bin"
      ],
      "decompositionTimeline": "450 Years in landfill or marine environment",
      "upcyclingIdea": "Cut in half horizontally to create a self-watering desk planter or pen organizer."
    },
    "environmentalImpact": {
      "co2SavedGrams": 82.5,
      "waterSavedLiters": 1.4,
      "energySavedWattHours": 48.0
    },
    "ecoPointsEligible": 15
  }
}
```

---

### `POST /predict/confirm-disposal`
Called when the user confirms physical disposal in the correct bin. Increments user Eco-Points, updates streaks, and unlocks milestone badges.
*(Requires Bearer Token)*

**Request Body:**
```json
{
  "predictionId": "66c1f23b8f1b2c0087654321"
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Disposal logged! 15 Eco-Points awarded.",
  "ecoPointsAwarded": 15,
  "newTotalPoints": 500,
  "currentStreak": 7,
  "streakMultiplier": 1.25,
  "newBadgesUnlocked": [
    {
      "id": "week_warrior",
      "title": "Week Warrior",
      "icon": "⚡",
      "description": "Maintained a 7-day daily segregation streak!"
    }
  ]
}
```

---

### `GET /predict/history`
Fetches paginated past predictions for the logged-in user.
*(Requires Bearer Token)*

**Query Params:** `?page=1&limit=10&category=Plastic`

**Response (`200 OK`):**
```json
{
  "success": true,
  "total": 34,
  "page": 1,
  "pages": 4,
  "history": [
    {
      "_id": "66c1f23b8f1b2c0087654321",
      "imageUrl": "https://res.cloudinary.com/ecosort/image/upload/v1/samples/bottle.jpg",
      "category": "Plastic",
      "subItem": "PET Clear Beverage Bottle (Type 1)",
      "confidence": 0.968,
      "binColor": "Blue",
      "co2SavedGrams": 82.5,
      "pointsAwarded": 15,
      "markedDisposed": true,
      "timestamp": "2026-08-17T10:15:30.000Z"
    }
  ]
}
```

---

## 3. Community Leaderboard & Challenges

### `GET /community/leaderboard`
Returns top eco-champion individuals, schools, and societies.

**Query Params:** `?scope=all|weekly|institution&limit=10`

**Response (`200 OK`):**
```json
{
  "success": true,
  "scope": "weekly",
  "leaderboard": [
    {
      "rank": 1,
      "userId": "66c1f01a8f1b2c0012345678",
      "name": "Priya Verma",
      "institution": "Greenwood International School",
      "ecoPoints": 1250,
      "scansCount": 68,
      "co2SavedKg": 18.4,
      "streak": 22
    },
    {
      "rank": 2,
      "userId": "66c1f01a8f1b2c0012349999",
      "name": "Aarav Sharma",
      "institution": "Delhi Technological University",
      "ecoPoints": 980,
      "scansCount": 45,
      "co2SavedKg": 12.1,
      "streak": 7
    }
  ],
  "institutionRankings": [
    {
      "rank": 1,
      "institution": "Delhi Technological University",
      "totalMembers": 142,
      "totalEcoPoints": 24800,
      "totalCo2SavedKg": 320.5
    },
    {
      "rank": 2,
      "institution": "Greenwood International School",
      "totalMembers": 98,
      "totalEcoPoints": 18950,
      "totalCo2SavedKg": 240.2
    }
  ]
}
```

---

## 4. Geo-Recycling Center Locator

### `GET /centers/nearby`
Finds certified recycling facilities, scrap buyback merchants, e-waste drop-off points, and composting centers based on latitude/longitude.

**Query Params:** `?lat=28.6139&lng=77.2090&category=E-Waste&radius=10`

**Response (`200 OK`):**
```json
{
  "success": true,
  "count": 3,
  "centers": [
    {
      "id": "ctr_001",
      "name": "EcoGreen Certified E-Waste & Battery Hub",
      "address": "Plot 42, Okhla Industrial Area Phase III, New Delhi",
      "latitude": 28.5355,
      "longitude": 77.2732,
      "distanceKm": 4.2,
      "phone": "+91 98110 00000",
      "acceptedCategories": ["E-Waste", "Hazardous", "Metal"],
      "buyBackOffered": true,
      "timing": "09:00 AM - 07:00 PM (Mon-Sat)",
      "isVerified": true
    },
    {
      "id": "ctr_002",
      "name": "Delhi City Composting & Green Waste Station",
      "address": "Lodhi Road Community Center, New Delhi",
      "latitude": 28.5912,
      "longitude": 77.2285,
      "distanceKm": 2.8,
      "phone": "+91 11 2460 0000",
      "acceptedCategories": ["Organic"],
      "buyBackOffered": false,
      "timing": "07:00 AM - 06:00 PM Daily",
      "isVerified": true
    }
  ]
}
```

---

## 5. Waste Catalog & Reference Data

### `GET /waste-catalog`
Fetches complete master data of the 7 waste streams, bin colors, and circular guidelines.

**Response (`200 OK`):**
```json
{
  "success": true,
  "categories": [
    {
      "id": "organic",
      "name": "Organic (Wet Waste)",
      "binColor": "Green",
      "hex": "#22C55E",
      "decompositionTime": "2 to 6 Weeks",
      "examples": ["Fruit Peels", "Leftover Food", "Coffee Grounds", "Tea Leaves", "Dry Leaves"],
      "circularAction": "Compost into organic plant nutrient fertilizer or feed into biogas digesters.",
      "co2OffsetMultiplier": 0.4
    },
    {
      "id": "plastic",
      "name": "Plastic (Dry Recyclable)",
      "binColor": "Blue",
      "hex": "#3B82F6",
      "decompositionTime": "100 to 500 Years",
      "examples": ["PET Bottles", "HDPE Jugs", "Plastic Wrappers", "Food Containers"],
      "circularAction": "Rinse, flatten, and deposit in dry recyclables bin for mechanical shredding and remolding.",
      "co2OffsetMultiplier": 1.8
    },
    {
      "id": "e_waste",
      "name": "E-Waste",
      "binColor": "Yellow",
      "hex": "#F59E0B",
      "decompositionTime": "Non-Biodegradable",
      "examples": ["Old Phones", "Batteries", "Chargers", "Cables", "Laptops", "Circuit Boards"],
      "circularAction": "Drop off at certified urban mining centers to safely extract gold, silver, and copper.",
      "co2OffsetMultiplier": 5.0
    }
  ]
}
```
