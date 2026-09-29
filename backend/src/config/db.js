import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  const isProduction = process.env.NODE_ENV === 'production';

  // 1. If MONGODB_URI is provided (e.g. MongoDB Atlas or custom connection string)
  if (uri) {
    const isAtlas = uri.includes('mongodb+srv://') || uri.includes('cluster');
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

    try {
      console.log(`📡 Connecting to MongoDB (${isAtlas ? 'MongoDB Atlas' : 'Custom Server'})...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: isAtlas ? 15000 : 5000,
        connectTimeoutMS: 15000,
      });
      console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`❌ MongoDB connection error (${maskedUri}):`, err.message);
      console.warn('⚠️ MongoDB connection failed. Falling back to in-memory instance to keep API server operational...');
    }
  }

  // 2. Try default local MongoDB in development if MONGODB_URI was not specified
  if (!isProduction) {
    try {
      const localUri = 'mongodb://127.0.0.1:27017/quickbite';
      const conn = await mongoose.connect(localUri, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`✅ MongoDB Connected to Local Server: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.warn(`⚠️ Local MongoDB not running on 127.0.0.1:27017. Starting in-memory MongoDB...`);
    }
  }

  // 3. Resilient fallback to MongoMemoryServer so server never hard crashes
  try {
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`✅ In-Memory MongoDB Server running: ${memoryUri}`);
    return conn;
  } catch (memoryErr) {
    console.error(`❌ Failed to start in-memory MongoDB:`, memoryErr.message);
    throw memoryErr;
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
};
