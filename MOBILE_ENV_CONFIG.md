# Mobile Apps Environment Configuration

## User App (app/)

### Development
The app uses hardcoded LAN IP for development: `http://192.168.1.8:5000/api`

### Production
To configure production API URL, create `app.config.js`:

```javascript
export default {
  expo: {
    // ... other config
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.yourdomain.com/api"
    }
  }
};
```

Then create `.env` file:
```
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api
```

## Worker App (worker-app/)

Same configuration as User App.

### Building for Production

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file with production API URL:
   ```
   EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api
   ```

3. Build using EAS:
   ```bash
   npx expo prebuild --clean
   ./gradlew bundleRelease  # Android
   ```

### Important Notes

- ⚠️ Update the LAN IP (`192.168.1.8`) in config files if your local network IP changes
- ⚠️ Never commit `.env` files to version control
- ✅ The apps will automatically use production URL when `__DEV__` is false
