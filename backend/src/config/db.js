import mongoose from 'mongoose';

/**
 * Single Responsibility: this module owns the DB connection lifecycle only.
 */
export async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
