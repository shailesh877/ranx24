
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './model/Admin.js';

dotenv.config({ path: './.env' });

async function listAdmins() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const admins = await Admin.find({});

    if (admins.length > 0) {
      console.log('--- Admin List ---');
      admins.forEach(admin => {
        console.log(`Mobile: ${admin.mobileNumber}, Password: ${admin.password}, Role: ${admin.role}`);
      });
      console.log('------------------');
    } else {
      console.log('No admins found in database.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

listAdmins();
