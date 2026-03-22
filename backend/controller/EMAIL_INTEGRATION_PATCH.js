/**
 * Email Integration Patch for Booking Controller
 * 
 * This file contains the email notification additions for the booking controller.
 * Add the import statement at the top of bookingController.js and integrate
 * the email calls at the specified locations.
 */

// ============================================
// ADD THIS IMPORT AT THE TOP OF bookingController.js (after line 23)
// ============================================
import emailService from '../utils/emailService.js';

// ============================================
// 1. CREATE BOOKING - Add after line 299 (before res.status(201).json)
// ============================================
// Send booking confirmation email to user
try {
    const user = await User.findById(req.user._id);
    if (user && user.email) {
        await emailService.sendBookingConfirmation(user, createdBooking);
    }
} catch (emailError) {
    console.error('Failed to send booking confirmation email:', emailError);
    // Don't block booking creation if email fails
}

// ============================================
// 2. ASSIGN WORKER - Add in assignWorker function after notifications (around line 1100)
// ============================================
// Send worker assignment emails
try {
    const user = await User.findById(booking.user).select('name email');
    const workerData = await Worker.findById(workerId).select('firstName lastName mobileNumber email rating');

    if (user && user.email) {
        await emailService.sendWorkerAssignmentToUser(user, booking, workerData);
    }

    if (workerData && workerData.email) {
        await emailService.sendNewBookingToWorker(workerData, booking, user);
    }
} catch (emailError) {
    console.error('Failed to send worker assignment emails:', emailError);
}

// ============================================
// 3. COMPLETE BOOKING - Add in completeBooking function after notifications
// ============================================
// Send booking completion email
try {
    const user = await User.findById(booking.user).select('name email');
    const workerData = await Worker.findById(booking.worker).select('firstName lastName');

    if (user && user.email) {
        await emailService.sendBookingCompletion(user, updatedBooking, workerData);
    }
} catch (emailError) {
    console.error('Failed to send booking completion email:', emailError);
}

// ============================================
// 4. CANCEL BOOKING - Add in cancelBooking function after save (around line 1250)
// ============================================
// Send cancellation email
try {
    const user = await User.findById(booking.user).select('name email');
    if (user && user.email) {
        await emailService.sendBookingCancellation(user, updatedBooking, 'Cancelled by user');
    }

    // Notify worker if assigned
    if (booking.worker) {
        const workerData = await Worker.findById(booking.worker).select('email');
        if (workerData && workerData.email) {
            // You can create a worker cancellation template or reuse the same
            await emailService.sendEmail({
                to: workerData.email,
                subject: 'Booking Cancelled',
                template: 'bookingCancelled',
                data: {
                    userName: 'Worker',
                    bookingId: booking._id.toString().slice(-6),
                    serviceName: booking.service,
                    reason: 'Cancelled by customer'
                }
            });
        }
    }
} catch (emailError) {
    console.error('Failed to send cancellation email:', emailError);
}

// ============================================
// 5. PAYMENT COLLECTION - Add in collectPayment or verifyPaymentStatus
// ============================================
// Send payment receipt email (add after payment is marked as paid)
try {
    const user = await User.findById(booking.user).select('name email');
    if (user && user.email && booking.paymentStatus === 'paid') {
        await emailService.sendPaymentReceipt(user, booking, {
            razorpayPaymentId: booking.paymentId || 'CASH',
            amount: booking.finalPrice,
            createdAt: new Date(),
            method: paymentMethod || 'Online'
        });
    }
} catch (emailError) {
    console.error('Failed to send payment receipt email:', emailError);
}
