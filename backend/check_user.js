import mongoose from 'mongoose';
import User from './model/User.js';
import dotenv from 'dotenv';
dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        const user = await User.findOne({ name: /Yuvraj/i });
        if (user) {
            console.log('User found:', JSON.stringify(user, null, 2));
        } else {
            console.log('User not found');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkUser();
