import mongoose from 'mongoose';
import { getCategories } from './controller/categoryController.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function testApi() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        const testCases = [
            undefined,   // No city
            'Patna',     // Valid city with categories
            'Unknown',   // City not in DB
            '',          // Empty string
            'null'       // String "null"
        ];

        for (const city of testCases) {
            console.log(`\n--- Testing with city: [${city}] ---`);
            const req = { query: { city } };
            const res = {
                json: (data) => {
                    console.log(`Count: ${data.length}`);
                    if (data.length > 0) console.log(`First item: ${data[0].name}`);
                },
                status: (code) => ({ json: (d) => console.log(`Error ${code}:`, d) })
            };
            await getCategories(req, res);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

testApi();
