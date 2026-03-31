import mongoose from 'mongoose';
import User from './model/User.js';
import UserMembership from './model/UserMembership.js';
import dotenv from 'dotenv';
dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- DB Debugging ---');
        
        const user = await User.findOne({ phone: '9648022011' });
        if (!user) {
            console.log('User not found by phone');
            return;
        }
        console.log('User ID (ObjectId):', user._id.toString());
        
        // Find membership by String ID (as seen in screenshot)
        const membershipByString = await UserMembership.findOne({ customer_id: user._id.toString() });
        console.log('Membership found by String ID:', !!membershipByString);
        
        // Find membership by ObjectId
        const membershipByObj = await UserMembership.findOne({ customer_id: user._id });
        console.log('Membership found by ObjectId:', !!membershipByObj);

        // Find ALL memberships for this customer just in case
        const allMems = await UserMembership.find({ 
            $or: [{ customer_id: user._id }, { customer_id: user._id.toString() }]
        });
        console.log('Total memberships found:', allMems.length);
        if (allMems.length > 0) {
            console.log('Sample Membership Status:', allMems[0].status);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

debug();
