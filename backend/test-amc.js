import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const plans = await mongoose.connection.db.collection('a_m_c_plans').find().toArray();
    console.log(JSON.stringify(plans, null, 2));
    process.exit(0);
}
check();
