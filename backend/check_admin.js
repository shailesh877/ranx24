
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './model/Admin.js';

dotenv.config({ path: './.env' });

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const mobileNumber = '9999999999';
    const admin = await Admin.findOne({ mobileNumber });

    if (admin) {
      console.log('--- Admin Found ---');
      console.log('ID:', admin._id);
      console.log('Mobile:', admin.mobileNumber);
      console.log('Password (Literal):', admin.password);
      console.log('Role:', admin.role);
      console.log('-------------------');
    } else {
      console.log('No admin found with mobile:', mobileNumber);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdmin();
