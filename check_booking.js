
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './backend/model/Booking.js';

dotenv.config({ path: './backend/.env' });

async function checkBooking() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const userId = '69462197e859a4b53a480625';
    const latestBooking = await Booking.findOne({ user: userId }).sort({ createdAt: -1 });

    if (latestBooking) {
      console.log('--- Latest Booking ---');
      console.log('ID:', latestBooking._id);
      console.log('Service:', latestBooking.service);
      console.log('Final Price:', latestBooking.finalPrice);
      console.log('Amount Paid:', latestBooking.amountPaid);
      console.log('Payment Status:', latestBooking.paymentStatus);
      console.log('Status:', latestBooking.status);
      console.log('Created At:', latestBooking.createdAt);
      console.log('----------------------');
    } else {
      console.log('No booking found for this user.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkBooking();
