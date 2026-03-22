
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './model/Booking.js';

dotenv.config({ path: './.env' });

async function fixBooking() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const bookingId = '69bec63da409b6c3f3b4a125';
    const booking = await Booking.findById(bookingId);

    if (booking) {
      console.log('Old State:', { amountPaid: booking.amountPaid, paymentStatus: booking.paymentStatus });
      
      booking.amountPaid = booking.finalPrice;
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      
      await booking.save();
      
      console.log('New State:', { amountPaid: booking.amountPaid, paymentStatus: booking.paymentStatus });
      console.log('✅ Booking fixed successfully!');
    } else {
      console.log('Booking not found.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

fixBooking();
