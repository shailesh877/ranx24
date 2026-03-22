
const fs = require('fs');
const path = require('path');

const envContent = `NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://anuragrai809018:anurag2001@cluster0.si3f7y4.mongodb.net/ranx24?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=bd144ac51970152bfc1ade56c77db312d2ba671f80e405b31aff799d723
YC_REWARD_PERCENTAGE=2
RAZORPAY_KEY_ID=rzp_test_RMXAUXty6nvaXm
RAZORPAY_KEY_SECRET=It60ovNrbtNA6kPw0kxET8Fl
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5173/admin-login
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,https://www.ranx24.com
EMAIL_SERVICE=hostinger
EMAIL_HOST=smtp.hostinger.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=Support@ranx24.com
EMAIL_PASSWORD="Support@8349@7914#^!*&"
EMAIL_FROM="RanX24<Support@ranx24.com>"
LOG_LEVEL=info
`;

fs.writeFileSync(path.join(__dirname, 'backend/.env'), envContent.trim());
console.log('Successfully rewrote backend/.env');
