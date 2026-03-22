import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Category from './model/Category.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yellowcaps";

console.log('1. Connecting to MongoDB...', MONGO_URI);

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
        console.log('2. Connected to MongoDB');
        try {
            console.log('3. Fetching categories...');
            const categories = await Category.find({});
            console.log(`4. Found ${categories.length} categories`);
            // console.log(JSON.stringify(categories, null, 2));
        } catch (error) {
            console.error('ERROR fetching categories:', error);
        } finally {
            console.log('5. Disconnecting...');
            await mongoose.disconnect();
            console.log('6. Disconnected');
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
