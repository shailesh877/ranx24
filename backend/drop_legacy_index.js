import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const collection = mongoose.connection.collection('users');

        // List indexes first
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        // Drop the specific index
        try {
            await collection.dropIndex('mobile_1');
            console.log('Successfully dropped index: mobile_1');
        } catch (err) {
            console.log('Error dropping index (might not exist):', err.message);
        }

        console.log('Done');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

dropIndex();
