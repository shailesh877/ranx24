import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
let firebaseApp = null;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        console.log("🔐 Loading Firebase config from BASE64 env var");

        let decoded = Buffer.from(
            process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
            "base64"
        ).toString("utf8");

        // Fix ERROR: Unexpected token '﻿'
        if (decoded.charCodeAt(0) === 0xFEFF) {
            decoded = decoded.slice(1);
        }

        const serviceAccount = JSON.parse(decoded);

        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        console.log("🔥 Firebase Admin Initialized Successfully from BASE64");
    } else {
        try {
            const serviceAccount = require("../firebase-credentials.json");
            console.log("🔹 Loading Firebase config from local file");

            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });

            console.log("🔥 Firebase Admin Initialized from File Successfully");
        } catch (fileError) {
            console.warn(
                "⚠️ FIREBASE_SERVICE_ACCOUNT_BASE64 missing and no local file found. Push notifications disabled.",
                fileError.message
            );
        }
    }
} catch (error) {
    console.error("❌ Error initializing Firebase Admin:", error);
}

export default firebaseApp;
