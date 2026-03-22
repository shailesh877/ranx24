import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Worker from './model/Worker.js';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

const updateWorkers = async () => {
    await connectDB();

    try {
        const workers = await Worker.find({});
        console.log(`Found ${workers.length} workers.`);

        const baseLat = 25.3176;
        const baseLng = 82.9739;

        for (const worker of workers) {
            // Generate random offset within ~5km (approx 0.05 degrees)
            const latOffset = (Math.random() - 0.5) * 0.1;
            const lngOffset = (Math.random() - 0.5) * 0.1;

            const newLat = baseLat + latOffset;
            const newLng = baseLng + lngOffset;

            await Worker.updateOne(
                { _id: worker._id },
                {
                    $set: {
                        latitude: newLat.toFixed(6),
                        longitude: newLng.toFixed(6),
                        location: {
                            type: 'Point',
                            coordinates: [newLng, newLat]
                        }
                    },
                    $addToSet: { services: 'wood' }
                }
            );
            console.log(`Updated worker ${worker.firstName} with location: ${newLat}, ${newLng} and service 'wood'`);
        }

        console.log('All workers updated successfully.');
        process.exit();
    } catch (error) {
        console.error('Error updating workers:', error);
        process.exit(1);
    }
};

updateWorkers();
