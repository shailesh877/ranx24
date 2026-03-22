import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Worker from './model/Worker.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

const checkIndexes = async () => {
    await connectDB();
    try {
        const indexes = await Worker.collection.getIndexes();
        console.log('Indexes:', JSON.stringify(indexes, null, 2));
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkIndexes();
