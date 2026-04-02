
import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGODB_URI;
export const connectDB = async () => {
    try {
        await mongoose.connect(uri, { dbName: 'algojunction' });
        console.log(`${new Date().toLocaleString()}: MongoDB connected`);
    }
    catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}