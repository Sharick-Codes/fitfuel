import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

const connectDB = async () => {
  let mongoUri = process.env.MONGODB_URI;
  let usingMemoryServer = false;

  // First, try to connect to the configured MongoDB URI
  if (mongoUri) {
    try {
      const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return false; // not using memory server
    } catch (error) {
      console.warn(`⚠️  Could not connect to MongoDB at ${mongoUri}: ${error.message}`);
      console.log('🔄 Falling back to MongoDB Memory Server...');
    }
  } else {
    console.log('🔄 No MONGODB_URI set — starting MongoDB Memory Server...');
  }

  // Fall back to in-memory server
  try {
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Memory Server Connected: ${conn.connection.host}`);
    usingMemoryServer = true;
  } catch (error) {
    console.error(`❌ MongoDB Memory Server Error: ${error.message}`);
    process.exit(1);
  }

  // Return true if using memory server so we know to seed
  return usingMemoryServer;
};

export default connectDB;
