import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Worker from './model/Worker.js';

dotenv.config();

const migrateWorkers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Update all workers that don't have isAvailable field
        // Or just update all to ensure consistency
        const result = await Worker.updateMany(
            { isAvailable: { $exists: false } },
            { $set: { isAvailable: true } }
        );

        console.log(`Updated ${result.modifiedCount} workers (set isAvailable: true).`);
        console.log(`Matched ${result.matchedCount} workers.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

migrateWorkers();
