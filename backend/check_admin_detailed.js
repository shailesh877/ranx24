
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './model/Admin.js';

dotenv.config({ path: './.env' });

async function checkAdminDetailed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const admins = await Admin.find({});

    if (admins.length > 0) {
      console.log('--- Detailed Admin List ---');
      admins.forEach(admin => {
        const mob = admin.mobileNumber;
        console.log(`Mobile: "${mob}" (Length: ${mob.length})`);
        console.log(`Hex: ${Buffer.from(mob).toString('hex')}`);
        console.log(`Password: "${admin.password}"`);
      });
      console.log('---------------------------');
    } else {
      console.log('No admins found.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdminDetailed();
