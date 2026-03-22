
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Admin from './model/Admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, './.env') });

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const mobileNumber = '9999999999'; // To match README
        const password = 'admin';       // Default Admin Password

        const exists = await Admin.findOne({ mobileNumber });
        if (exists) {
            console.log('Admin already exists. Updating password...');
            exists.password = password;
            await exists.save();
            console.log('Admin password updated to:', password);
        } else {
            await Admin.create({
                mobileNumber,
                password,
                role: 'superadmin'
            });
            console.log('Admin created successfully.');
            console.log('Mobile:', mobileNumber);
            console.log('Password:', password);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdmin();
