import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createNotification } from './notificationController.js';
import Wallet from '../model/userWallet.js'; // Import Wallet model correct location

dotenv.config();

// Validate Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('❌ CRITICAL: Razorpay credentials not found in environment variables!');
    console.error('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file');
    throw new Error('Razorpay credentials missing');
}

// Initialize Razorpay instance with environment variables only
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a Razorpay order
// @route   POST /api/payment/order
// @access  Private
export const createOrder = async (req, res) => {
    const { amount } = req.body;

    if (!amount) {
        return res.status(400).json({ message: 'Amount is required' });
    }

    const options = {
        amount: amount * 100, // Amount in smallest currency unit (paise)
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Server error while creating order', error });
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/verify
// @access  Private
export const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: 'Missing payment verification details' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    // ... (imports)
    // import Wallet cleaned up

    // ...

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Payment is successful

        // 1. Handle Wallet Top-up
        const { isWalletTopUp, amount } = req.body; // Expect these fields

        if (isWalletTopUp && amount) {
            try {
                const wallet = await Wallet.findOne({ user: req.user._id });
                // Ensure wallet exists (create if not - reusing logic from walletController would be better but simple create is fine here or ensureWallet)
                // Let's use simple findOneAndUpdate for atomic update if possible or just logic here.
                // We need to import ensureWallet or duplicate logic? Importing is cleaner but let's just do inline for now to avoid circular deps if any.

                let userWallet = wallet;
                if (!userWallet) {
                    userWallet = await Wallet.create({ user: req.user._id, balance: 0, transactions: [] });
                }

                const topUpAmount = Number(amount);
                userWallet.balance += topUpAmount;
                userWallet.transactions.push({
                    type: 'credit',
                    amount: topUpAmount,
                    note: 'Wallet Top-up via Razorpay',
                    meta: { paymentId: razorpay_payment_id }
                });
                await userWallet.save();

                console.log(`✅ Wallet topped up for user ${req.user._id} by ₹${topUpAmount}`);

            } catch (walletError) {
                console.error('❌ Error updating wallet after payment:', walletError);
                // This is critical - money deducted but wallet not updated. 
                // In production, we need manual reconciliation logs or retry mechanism.
                return res.status(500).json({ message: 'Payment verified but wallet update failed. Contact support.' });
            }
        }

        // 2. Handle Booking Payment
        if (bookingId) {
            console.log(`🔍 Processing booking payment for bookingId: ${bookingId}`);
            try {
                // Dynamic import to avoid circular dependency
                const Booking = (await import('../model/Booking.js')).default;
                const booking = await Booking.findById(bookingId);

                if (!booking) {
                    console.error(`❌ Booking not found: ${bookingId}`);
                } else {
                    console.log(`📦 Found booking: ${bookingId}, Current amountPaid: ${booking.amountPaid}, FinalPrice: ${booking.finalPrice}`);
                    
                    // Fetch payment details from Razorpay to get the actual amount paid
                    console.log(`💳 Fetching Razorpay payment details for: ${razorpay_payment_id}`);
                    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
                    const paidInThisTransaction = Number(paymentDetails.amount) / 100; // Convert from paise to rupees
                    console.log(`💰 Amount paid in this transaction: ₹${paidInThisTransaction}`);
                    
                    const newAmountPaid = (booking.amountPaid || 0) + paidInThisTransaction;
                    
                    booking.amountPaid = newAmountPaid;
                    booking.paymentId = razorpay_payment_id;
                    
                    // Mark as paid if total matches or exceeds finalPrice (Using Math.round to avoid precision issues)
                    if (Math.round(newAmountPaid) >= Math.round(booking.finalPrice)) {
                        booking.paymentStatus = 'paid';
                        console.log(`✅ Setting paymentStatus to 'paid'`);
                    } else if (newAmountPaid > 0) {
                        booking.paymentStatus = 'partial';
                        console.log(`⚠️ Setting paymentStatus to 'partial'`);
                    }

                    booking.status = 'confirmed'; // Auto-confirm on any payment
                    await booking.save();
                    console.log(`✨ Booking ${bookingId} updated successfully: Total Paid ₹${newAmountPaid}`);
                }
            } catch (error) {
                console.error('❌ Error updating booking status after payment:', error);
                console.error('Error stack:', error.stack);
            }
        }

        // 3. Handle Membership Purchase
        const { isMembershipPurchase, planId } = req.body;
        if (isMembershipPurchase && planId) {
            console.log(`🔍 Processing membership purchase for planId: ${planId}`);
            try {
                const MembershipPlan = (await import('../model/MembershipPlan.js')).default;
                const UserMembership = (await import('../model/UserMembership.js')).default;

                const plan = await MembershipPlan.findById(planId);
                if (plan) {
                    const start = new Date();
                    const expiry = new Date();
                    expiry.setMonth(start.getMonth() + parseInt(plan.duration_months));
                    const formatDate = (date) => date.toISOString().split('T')[0];
                    
                    // Generate a random 11-digit card number
                    const cardNumber = Math.floor(10000000000 + Math.random() * 90000000000).toString();

                    await UserMembership.create({
                        customer_id: req.user._id,
                        plan_id: planId,
                        start_date: formatDate(start),
                        expiry_date: formatDate(expiry),
                        status: 'Active',
                        card_number: cardNumber
                    });
                    console.log(`✅ Membership activated for user ${req.user._id} with Card: ${cardNumber}`);
                }
            } catch (error) {
                console.error('❌ Error activating membership after payment:', error);
            }
        }

        // 4. Handle AMC Purchase
        const { isAMCPurchase, planIds } = req.body;
        if (isAMCPurchase && planIds && Array.isArray(planIds)) {
            console.log(`🔍 Processing AMC purchase for planIds: ${planIds}`);
            try {
                const AMCPlan = (await import('../model/AMCPlan.js')).default;
                const UserAMC = (await import('../model/UserAMC.js')).default;

                const plans = await AMCPlan.find({ _id: { $in: planIds } });
                if (plans.length > 0) {
                    const contractNumber = 'RANX-' + Math.floor(1000000000 + Math.random() * 9000000000);
                    const start = new Date();
                    const end = new Date();
                    const duration = plans[0].duration_months || 12;
                    end.setMonth(start.getMonth() + duration);
                    const formatDate = (date) => date.toISOString().split('T')[0];

                    await UserAMC.create({
                        customer_id: req.user._id,
                        contract_number: contractNumber,
                        plans: planIds,
                        start_date: formatDate(start),
                        end_date: formatDate(end),
                        status: 'Active'
                    });
                    console.log(`✅ AMC Package activated for user ${req.user._id}`);
                }
            } catch (error) {
                console.error('❌ Error activating AMC package after payment:', error);
            }
        }

        // Send Notification
        if (req.user) {
            await createNotification({
                recipient: req.user._id,
                recipientModel: 'User',
                title: 'Payment Successful',
                message: isWalletTopUp
                    ? `Wallet successfully topped up with ₹${amount}.`
                    : `Booking payment verified successfully.`,
                type: 'success',
                data: { paymentId: razorpay_payment_id },
                io: req.io
            });
        }

        res.json({
            message: 'Payment verified successfully',
            success: true,
            paymentId: razorpay_payment_id,
        });
    } else {
        res.status(400).json({
            message: 'Invalid payment signature',
            success: false,
        });
    }
};
