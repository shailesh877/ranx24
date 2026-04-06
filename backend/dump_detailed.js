import mongoose from 'mongoose';
import Category from './model/Category.js';
import City from './model/City.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function dumpDetailedData() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const categories = await Category.find({}, 'name');
        const cities = await City.find({});
        
        console.log('--- CATEGORIES (with length) ---');
        categories.forEach(c => {
            console.log(`'${c.name}' (Length: ${c.name.length})`);
        });
        
        console.log('\n--- CITIES & ASSIGNMENTS (with length) ---');
        cities.forEach(city => {
            console.log(`City: '${city.name}'`);
            city.assignedCategories.forEach(ac => {
                console.log(`  - '${ac.category}' (Length: ${ac.category.length})`);
            });
            console.log('---');
        });
        
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

dumpDetailedData();
