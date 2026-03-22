
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import User from './model/User.js';
import Worker from './model/Worker.js';

dotenv.config();

const checkFirebase = async () => {
    console.log('--- Firebase Diagnostic ---');

    // 1. Check Service Account
    const serviceAccountPath = path.join(process.cwd(), 'config', 'serviceAccountKey.json');
    console.log(`Checking file: ${serviceAccountPath}`);

    if (!fs.existsSync(serviceAccountPath)) {
        console.error('❌ serviceAccountKey.json NOT FOUND');
        process.exit(1);
    }

    try {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        console.log('✅ serviceAccountKey.json is valid JSON');
        console.log(`   Project ID: ${serviceAccount.project_id}`);

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase Admin Initialized');
        }
    } catch (e) {
        console.error('❌ Failed to parse/init Firebase:', e.message);
        process.exit(1);
    }

    // 2. Connect DB
    console.log('Connecting to MongoDB...');
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (e) {
        console.error('❌ DB Connection Failed:', e.message);
        process.exit(1);
    }

    // 3. Check Tokens
    const userTokens = await User.countDocuments({ fcmToken: { $exists: true, $ne: null } });
    const workerTokens = await Worker.countDocuments({ fcmToken: { $exists: true, $ne: null } });

    console.log(`Users with FCM Tokens: ${userTokens}`);
    console.log(`Workers with FCM Tokens: ${workerTokens}`);

    if (userTokens > 0) {
        const sampleUser = await User.findOne({ fcmToken: { $exists: true, $ne: null } }).select('name fcmToken');
        console.log(`First User Token: ${sampleUser.fcmToken.substring(0, 20)}...`);
    }

    process.exit(0);
};

checkFirebase();
