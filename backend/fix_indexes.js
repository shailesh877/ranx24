import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Worker from './model/Worker.js';

dotenv.config();

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        console.log('Creating 2dsphere index on location...');
        await Worker.collection.createIndex({ location: '2dsphere' });
        console.log('Index created successfully.');

        // Verify indexes
        const indexes = await Worker.collection.indexes();
        console.log('Indexes:', indexes);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

fixIndexes();
