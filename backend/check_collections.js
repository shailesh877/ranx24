import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

await mongoose.connect(process.env.MONGO_URI);
const collections = await mongoose.connection.db.listCollections().toArray();
console.log('=== ALL COLLECTIONS ===');
collections.forEach(c => console.log(' -', c.name));

// Check marriage/event related data
const db = mongoose.connection.db;
for (const col of collections) {
  const count = await db.collection(col.name).countDocuments();
  if (count > 0) {
    console.log(`\n[${col.name}] - ${count} docs`);
    if (col.name.toLowerCase().includes('event') || col.name.toLowerCase().includes('marriage') || col.name.toLowerCase().includes('package')) {
      const sample = await db.collection(col.name).findOne();
      console.log('  Sample:', JSON.stringify(sample, null, 2).substring(0, 300));
    }
  }
}

await mongoose.disconnect();
