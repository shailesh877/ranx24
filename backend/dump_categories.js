import mongoose from 'mongoose';
import Category from './model/Category.js';
import City from './model/City.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function dumpData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const categories = await Category.find({}, 'name');
        const cities = await City.find({});
        
        console.log('--- CATEGORIES ---');
        console.log(categories.map(c => c.name));
        
        console.log('\n--- CITIES & ASSIGNMENTS ---');
        cities.forEach(city => {
            console.log(`City: ${city.name}`);
            console.log(`Assigned Categories: ${JSON.stringify(city.assignedCategories.map(ac => ac.category))}`);
            console.log('---');
        });
        
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

dumpData();
