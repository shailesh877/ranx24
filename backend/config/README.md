# Firebase Configuration

## IMPORTANT: Security Notice

⚠️ **NEVER commit `serviceAccountKey.json` to version control!**

## Setup Instructions

1. Download your Firebase service account key from:
   - Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"

2. Save the file as `serviceAccountKey.json` in this directory

3. The file is already added to `.gitignore` to prevent accidental commits

4. For production deployment, use environment variables or secure secret management:
   - AWS Secrets Manager
   - Google Cloud Secret Manager
   - Environment variables on your hosting platform

## Environment Variable Alternative (Recommended for Production)

Instead of using a file, you can set the Firebase credentials as an environment variable:

```bash
export FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

Then update `firebase.js` to read from the environment variable.
