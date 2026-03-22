import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './model/Category.js';

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

const listSubCategories = async () => {
    await connectDB();
    try {
        const categories = await Category.find({});
        console.log('Available Subcategories:');
        categories.forEach(cat => {
            cat.subCategories.forEach(sub => {
                console.log(`${sub.name}: ${sub._id}`);
            });
        });
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listSubCategories();
