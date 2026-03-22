import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './model/User.js'; // Adjust path if needed
import { createNotification } from './controller/notificationController.js';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const debugNotification = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find the most recent user
        const user = await User.findOne().sort({ createdAt: -1 });

        if (!user) {
            console.log('No users found in database.');
            return;
        }

        console.log(`Found User: ${user.name} (${user._id})`);
        console.log(`FCM Token: ${user.fcmToken ? user.fcmToken.substring(0, 20) + '...' : 'NONE'}`);

        if (!user.fcmToken) {
            console.log('User has no FCM Token. Cannot test notification.');
            // Try to find ANY user with a token
            const userWithToken = await User.findOne({ fcmToken: { $exists: true, $ne: null } });
            if (userWithToken) {
                console.log(`Found alternative user with token: ${userWithToken.name} (${userWithToken._id})`);
                await testSend(userWithToken._id);
            } else {
                console.log('No users have FCM tokens.');
            }
        } else {
            await testSend(user._id);
        }

    } catch (error) {
        console.error('Debug Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

const testSend = async (userId) => {
    console.log(`Attempting to send test notification to ${userId}...`);
    await createNotification({
        recipient: userId,
        recipientModel: 'User',
        title: 'Test OTP Notification',
        message: 'This is a test notification from the debugger script.',
        type: 'otp',
        data: { test: 'true' }
    });
    console.log('Notification function executed.');
};

debugNotification();
