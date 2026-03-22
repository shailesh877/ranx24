import OTP from '../model/OTP.js';

// Configuration
const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;
const MAX_OTP_REQUESTS_PER_WINDOW = 3;
const RATE_LIMIT_WINDOW_MINUTES = 15;

/**
 * Generate a 4-digit OTP
 */
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Check if phone number has exceeded rate limit
 */
const checkRateLimit = async (phone) => {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);

    const recentRequests = await OTP.countDocuments({
        phone,
        createdAt: { $gte: windowStart }
    });

    if (recentRequests >= MAX_OTP_REQUESTS_PER_WINDOW) {
        const oldestRequest = await OTP.findOne({
            phone,
            createdAt: { $gte: windowStart }
        }).sort({ createdAt: 1 });

        const waitTime = Math.ceil(
            (RATE_LIMIT_WINDOW_MINUTES * 60 * 1000 - (Date.now() - oldestRequest.createdAt)) / 1000 / 60
        );

        throw new Error(
            `Too many OTP requests. Please try again after ${waitTime} minute(s).`
        );
    }

    return true;
};

/**
 * Create and store OTP for a phone number
 */
export const createOTP = async (phone) => {
    try {
        // Check rate limit
        await checkRateLimit(phone);

        // Invalidate any existing unverified OTPs for this phone
        await OTP.updateMany(
            { phone, verified: false },
            { verified: true } // Mark as verified to prevent reuse
        );

        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // Create OTP record
        const otpRecord = await OTP.create({
            phone,
            otp,
            expiresAt,
            attempts: 0,
            requestCount: 1
        });

        console.log(`📱 OTP generated for ${phone}: ${otp} (expires in ${OTP_EXPIRY_MINUTES} minutes)`);

        return {
            success: true,
            otp, // In production, don't return this - send via SMS/Email
            expiresIn: OTP_EXPIRY_MINUTES * 60 // seconds
        };
    } catch (error) {
        console.error('Error creating OTP:', error);
        throw error;
    }
};

/**
 * Verify OTP for a phone number
 */
export const verifyOTP = async (phone, otp) => {
    try {
        // Find the most recent unverified OTP for this phone
        const otpRecord = await OTP.findOne({
            phone,
            verified: false,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            throw new Error('OTP expired or not found. Please request a new OTP.');
        }

        // Check if max attempts exceeded
        if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
            // Mark as verified to prevent further attempts
            otpRecord.verified = true;
            await otpRecord.save();
            throw new Error('Maximum OTP attempts exceeded. Please request a new OTP.');
        }

        // Verify OTP
        if (otpRecord.otp !== otp) {
            // Increment attempt count
            otpRecord.attempts += 1;
            await otpRecord.save();

            const remainingAttempts = MAX_OTP_ATTEMPTS - otpRecord.attempts;
            throw new Error(
                `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`
            );
        }

        // OTP is valid - mark as verified
        otpRecord.verified = true;
        await otpRecord.save();

        console.log(`✅ OTP verified successfully for ${phone}`);

        return {
            success: true,
            message: 'OTP verified successfully'
        };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
};

/**
 * Clean up expired OTPs (optional - TTL index handles this automatically)
 */
export const cleanupExpiredOTPs = async () => {
    try {
        const result = await OTP.deleteMany({
            expiresAt: { $lt: new Date() }
        });
        console.log(`🧹 Cleaned up ${result.deletedCount} expired OTPs`);
        return result.deletedCount;
    } catch (error) {
        console.error('Error cleaning up OTPs:', error);
        return 0;
    }
};

/**
 * Get OTP statistics for a phone number (for debugging)
 */
export const getOTPStats = async (phone) => {
    const stats = await OTP.aggregate([
        { $match: { phone } },
        {
            $group: {
                _id: '$phone',
                totalRequests: { $sum: 1 },
                verifiedCount: {
                    $sum: { $cond: ['$verified', 1, 0] }
                },
                activeOTPs: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ['$verified', false] },
                                    { $gt: ['$expiresAt', new Date()] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);

    return stats[0] || { totalRequests: 0, verifiedCount: 0, activeOTPs: 0 };
};

export default {
    createOTP,
    verifyOTP,
    cleanupExpiredOTPs,
    getOTPStats
};
