
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserMembership from './model/UserMembership.js';
import UserAMC from './model/UserAMC.js';

dotenv.config({ path: './.env' });

async function checkUserPlans() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const mCount = await UserMembership.countDocuments();
    const aCount = await UserAMC.countDocuments();
    console.log(`--- Stats: Memberships=${mCount}, AMCs=${aCount} ---`);

    const samplesM = await UserMembership.find({}).limit(5).lean();
    console.log('\n--- Membership Samples ---');
    samplesM.forEach(m => {
      console.log(`ID: ${m._id}, Cust: ${m.customer_id}, Status: "${m.status}", Plan: ${m.plan_id}`);
    });

    const samplesA = await UserAMC.find({}).limit(5).lean();
    console.log('\n--- AMC Samples ---');
    samplesA.forEach(a => {
      console.log(`ID: ${a._id}, Cust: ${a.customer_id}, Status: "${a.status}", Contract: ${a.contract_number}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserPlans();
