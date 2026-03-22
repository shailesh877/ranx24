
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
dns.setServers(['8.8.8.8']); // Using the fix here too

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI;

const checkNames = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const MembershipPlan = mongoose.models.MembershipPlan || mongoose.model('MembershipPlan', new mongoose.Schema({}, { strict: false }), 'membership_plans');
    const plans = await MembershipPlan.find({});
    console.log(`Count: ${plans.length}`);
    plans.forEach(p => {
        console.log(`ID: ${p._id}, Name: ${p.name}, Price: ${p.price}, Active: ${p.is_active}, Tiers: ${p.discount_tiers ? p.discount_tiers.length : 'none'}`);
    });
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
checkNames();
