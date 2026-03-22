import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Worker from './model/Worker.js';
import City from './model/City.js';

dotenv.config();

const checkWorkers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const cityName = 'Varanasi';

        // 1. Check City
        const city = await City.findOne({ name: { $regex: new RegExp(`^${cityName}$`, 'i') } });
        if (city) {
            console.log(`City found: ${city.name}`);
            console.log(`Assigned Categories Count: ${city.assignedCategories.length}`);
        } else {
            console.log(`City "${cityName}" NOT found.`);
        }

        // 2. Check ALL Workers
        const workers = await Worker.find({});

        console.log(`\n--- Total Workers: ${workers.length} ---`);

        if (workers.length > 0) {
            // Find a worker in Varanasi if possible, otherwise just the first one
            const w = workers.find(w => /varanasi/i.test(w.city)) || workers[0];

            const output = `
Worker: ${w.firstName} ${w.lastName}
City: "${w.city}"
Status: "${w.status}"
Available Type: ${typeof w.isAvailable}, Value: ${w.isAvailable}
Coordinates: ${w.location && w.location.coordinates ? JSON.stringify(w.location.coordinates) : 'MISSING'}
        `;
            fs.writeFileSync('worker_status.txt', output);
            console.log('Written to worker_status.txt');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkWorkers();
