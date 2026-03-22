import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const dropIndex = async () => {
    await connectDB();

    try {
        const collection = mongoose.connection.collection('users');
        // List indexes to verify
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        // Drop the email_1 index
        if (indexes.find(index => index.name === 'email_1')) {
            await collection.dropIndex('email_1');
            console.log('Index email_1 dropped successfully');
        } else {
            console.log('Index email_1 not found');
        }

        process.exit();
    } catch (error) {
        console.error(`Error dropping index: ${error.message}`);
        process.exit(1);
    }
};

dropIndex();
