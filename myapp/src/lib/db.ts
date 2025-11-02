import mongoose from 'mongoose';
import { createGridFSBucket } from './gridfs';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/swasthya';

if (!MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI not set, using default: mongodb://localhost:27017/swasthya');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, bucket: null, promise: null };
}

async function connectDB(): Promise<{ connection: mongoose.Connection; bucket: mongoose.mongo.GridFSBucket | null }> {
  if (cached.conn && cached.bucket) {
    return { connection: cached.conn, bucket: cached.bucket };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout for server selection
      connectTimeoutMS: 10000, // 10 seconds timeout for initial connection
      socketTimeoutMS: 45000, // 45 seconds timeout for socket operations
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Connected to MongoDB');

      // Initialize GridFS bucket after connection
      const connection = mongoose.connection;
      let bucket: mongoose.mongo.GridFSBucket | null = null;

      if (connection.db) {
        bucket = createGridFSBucket(connection, 'medical_uploads');
        console.log('GridFS bucket initialized for medical uploads');
      }

      return { connection, bucket };
    }).catch((error) => {
      cached.promise = null;
      console.error('MongoDB connection error:', error.message);
      throw error;
    });
  }

  try {
    const result = await cached.promise;
    cached.conn = result.connection;
    cached.bucket = result.bucket;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return { connection: cached.conn, bucket: cached.bucket };
}

// Backward compatibility function
async function connectDBLegacy() {
  const { connection } = await connectDB();
  return connection;
}

export default connectDBLegacy;
export { connectDB };
