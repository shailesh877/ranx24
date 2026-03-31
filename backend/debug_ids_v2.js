import mongoose from 'mongoose';
import User from './model/User.js';
import UserMembership from './model/UserMembership.js';
import dotenv from 'dotenv';
dotenv.config();

const findUserAndMemberships = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('--- Database Match Check ---');
        
        const phoneToSearch = '9648022011';
        const user = await User.findOne({ phone: phoneToSearch });
        
        if (!user) {
            console.log(`User not found with phone: ${phoneToSearch}`);
            return;
        }
        
        console.log(`User Found: ${user.name}`);
        console.log(`User _id (ObjectId): ${user._id}`);
        console.log(`User _id (String): ${user._id.toString()}`);
        
        const allMembershipsForId = await UserMembership.find({
            $or: [
              { customer_id: user._id },
              { customer_id: user._id.toString() }
            ]
        });
        
        console.log(`Total Memberships found for ID ${user._id}: ${allMembershipsForId.length}`);
        
        if (allMembershipsForId.length === 0) {
            console.log('Try searching ALL memberships to see what IDs are actually there...');
            const firstFew = await UserMembership.find().limit(5).lean();
            firstFew.forEach(m => console.log(`Sample Membership Customer ID: ${m.customer_id} (Type: ${typeof m.customer_id})`));
        } else {
            allMembershipsForId.forEach(m => {
                console.log(`Membership found: Plan ID ${m.plan_id}, Status: ${m.status}`);
            });
        }
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error during debugging:', error);
    }
};

findUserAndMemberships();
