
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const MONGO_URI = process.env.MONGO_URI;

const checkPlans = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    const MembershipPlan = mongoose.models.MembershipPlan || mongoose.model('MembershipPlan', new mongoose.Schema({}, { strict: false }), 'membership_plans');
    const plans = await MembershipPlan.find({});
    console.log('Full Plans JSON:', JSON.stringify(plans, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

checkPlans();
