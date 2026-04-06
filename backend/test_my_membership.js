import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected");
    const db = mongoose.connection.db;
    
    // Find any user with active membership
    const memb = await db.collection('memberships').findOne({ status: { $regex: /^active$/i } });
    if (!memb) {
        console.log("No active membership found in memberships collection");
        const um = await db.collection('usermemberships').findOne({ status: { $regex: /^active$/i } });
        console.log("In usermemberships:", um);
        process.exit(0);
    }
    console.log("Found membership:", memb);
    
    const plan = await db.collection('membership_plans').findOne({
        $or: [
            { _id: typeof memb.plan_id === 'string' && memb.plan_id.length === 24 ? new mongoose.Types.ObjectId(memb.plan_id) : memb.plan_id },
            { _id: memb.plan_id }
        ]
    });
    console.log("Found plan:", JSON.stringify(plan, null, 2));
    process.exit(0);
}
test();
