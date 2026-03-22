
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import User from './model/User.js';
import Worker from './model/Worker.js';

dotenv.config();

const testPush = async () => {
    console.log('--- Test Push Notification ---');

    // 1. Initialize Firebase
    const serviceAccountPath = path.join(process.cwd(), 'config', 'serviceAccountKey.json');
    if (!fs.existsSync(serviceAccountPath)) {
        console.error('❌ serviceAccountKey.json NOT FOUND');
        process.exit(1);
    }

    try {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
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
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // 3. Find User/Worker with Token
    // We'll try to find one of each and send
    const user = await User.findOne({ fcmToken: { $exists: true, $ne: null } }).select('name fcmToken');
    const worker = await Worker.findOne({ fcmToken: { $exists: true, $ne: null } }).select('name fcmToken');

    const targets = [];
    if (user) targets.push({ type: 'User', name: user.name, token: user.fcmToken });
    if (worker) targets.push({ type: 'Worker', name: worker.name, token: worker.fcmToken });

    if (targets.length === 0) {
        console.log('❌ No users/workers with tokens found.');
        process.exit(0);
    }

    // 4. Send Notifications
    for (const target of targets) {
        console.log(`\n📤 Sending to ${target.type}: ${target.name}`);
        console.log(`   Token: ${target.token.substring(0, 20)}...`);

        const messagePayload = {
            token: target.token,
            notification: {
                title: 'Test Notification',
                body: `This is a test message for ${target.type} from Backend Script`
            },
            data: {
                type: 'test',
                click_action: 'FLUTTER_NOTIFICATION_CLICK' // Sometimes needed, though this is RN
            },
            android: {
                priority: 'high',
                notification: {
                    channelId: 'default'
                }
            }
        };

        try {
            const response = await admin.messaging().send(messagePayload);
            console.log('✅ Success! Message ID:', response);
        } catch (error) {
            console.error('❌ Failure:', error.message);
            if (error.code) console.error('   Code:', error.code);
        }
    }

    process.exit(0);
};

testPush();
