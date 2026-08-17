const mongoose = require('mongoose');

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB Atlas with connection caching for serverless environments
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log('📦 Connected to MongoDB Atlas Cloud Database successfully!');
      return m;
    }).catch(err => {
      console.warn('⚠️ MongoDB connection error, falling back to local store:', err.message);
      cached.promise = null;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    return null;
  }

  return cached.conn;
}

module.exports = { connectDB };
