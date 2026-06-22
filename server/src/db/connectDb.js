import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGODB_URI;

// Fail fast if the connection string is not configured
if (!uri) {
  console.error('FATAL: MONGODB_URI environment variable is not set');
  process.exit(1);
}

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectDB = async () => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(uri, {
        dbName: 'algojunction',
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`${new Date().toLocaleString()}: MongoDB connected`);
      return;
    } catch (error) {
      const remaining = MAX_RETRIES - attempt - 1;
      console.error(
        `${new Date().toLocaleString()}: MongoDB connection attempt ${attempt + 1}/${MAX_RETRIES} failed: ${error.message}`
      );

      if (remaining === 0) {
        console.error('FATAL: All MongoDB connection attempts exhausted. Exiting.');
        process.exit(1);
      }

      const delay = Math.min(INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt), MAX_RETRY_DELAY_MS);
      console.log(`Retrying in ${delay / 1000}s (${remaining} attempt${remaining > 1 ? 's' : ''} remaining)...`);
      await sleep(delay);
    }
  }
};

export const setupConnectionListeners = () => {
  mongoose.connection.on('connected', () => {
    console.log(`${new Date().toLocaleString()}: Mongoose connected`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn(`${new Date().toLocaleString()}: Mongoose disconnected`);
  });

  mongoose.connection.on('reconnected', () => {
    console.log(`${new Date().toLocaleString()}: Mongoose reconnected`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`${new Date().toLocaleString()}: Mongoose error: ${err.message}`);
  });
};

const gracefulShutdown = async (signal) => {
  console.log(`${new Date().toLocaleString()}: Received ${signal}, closing Mongoose connection...`);
  await mongoose.connection.close();
  console.log(`${new Date().toLocaleString()}: Mongoose connection closed`);
  process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
