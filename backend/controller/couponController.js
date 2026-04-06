import Coupon from '../model/Coupon.js';
import CouponUsage from '../model/CouponUsage.js';
import { toBoolean } from '../utils/typeConverter.js';


// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = async (req, res) => {
    try {
        const { code, description, type, value, minOrderValue, maxDiscount, usageLimit, userUsageLimit, validFrom, validUntil, applicableOn, specificService } = req.body;

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            description,
            type,
            value,
            minOrderValue: minOrderValue || 0,
            maxDiscount,
            usageLimit,
            userUsageLimit: userUsageLimit || 1,
            validFrom: validFrom || Date.now(),
            validUntil,
            applicableOn: applicableOn || 'all',
            specificService: (applicableOn === 'specific-service') ? specificService : null,
            createdBy: req.user._id
        });

        res.status(201).json({ message: 'Coupon created successfully', coupon });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create coupon', error: error.message });
    }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch coupons', error: error.message });
    }
};

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id).populate('createdBy', 'name email');

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        res.status(200).json(coupon);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch coupon', error: error.message });
    }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        const { code, description, type, value, minOrderValue, maxDiscount, usageLimit, userUsageLimit, validFrom, validUntil, isActive, applicableOn, specificService } = req.body;

        // Update fields
        if (code) coupon.code = code.toUpperCase();
        if (description !== undefined) coupon.description = description;
        if (type) coupon.type = type;
        if (value !== undefined) coupon.value = value;
        if (minOrderValue !== undefined) coupon.minOrderValue = minOrderValue;
        if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
        if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
        if (userUsageLimit !== undefined) coupon.userUsageLimit = userUsageLimit;
        if (validFrom !== undefined) coupon.validFrom = validFrom;
        if (validUntil !== undefined) coupon.validUntil = validUntil;
        if (applicableOn) coupon.applicableOn = applicableOn;
        if (specificService !== undefined) coupon.specificService = (applicableOn === 'specific-service') ? (specificService || null) : null;
        if (isActive !== undefined) coupon.isActive = toBoolean(isActive);

        const updatedCoupon = await coupon.save();
        res.status(200).json({ message: 'Coupon updated successfully', coupon: updatedCoupon });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update coupon', error: error.message });
    }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        await coupon.deleteOne();
        res.status(200).json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete coupon', error: error.message });
    }
};

// @desc    Toggle coupon status
// @route   PATCH /api/coupons/:id/toggle
// @access  Private/Admin
const toggleCouponStatus = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        coupon.isActive = !coupon.isActive;
        const updatedCoupon = await coupon.save();

        res.status(200).json({ message: 'Coupon status updated', coupon: updatedCoupon });
    } catch (error) {
        res.status(500).json({ message: 'Failed to toggle coupon status', error: error.message });
    }
};

// @desc    Validate coupon for user
// @route   POST /api/coupons/validate
// @access  Private/User
const validateCoupon = async (req, res) => {
    try {
        const { code, orderValue, orderAmount, serviceId, serviceIds } = req.body;
        const userId = req.user._id;
        const amount = orderValue || orderAmount || 0;
        const idsToCheck = Array.isArray(serviceIds) ? serviceIds : (serviceId ? [serviceId] : []);

        // Find coupon
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(200).json({ message: 'Invalid coupon code', valid: false });
        }

        // Check if active
        if (!coupon.isActive) {
            return res.status(200).json({ message: 'Coupon is not active', valid: false });
        }

        // Check validity dates
        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) {
            return res.status(200).json({ message: 'Coupon has expired or not yet valid', valid: false });
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return res.status(200).json({ message: 'Coupon usage limit reached', valid: false });
        }

        // Check user usage limit
        const userUsageCount = await CouponUsage.countDocuments({
            coupon: coupon._id,
            user: userId
        });

        if (userUsageCount >= coupon.userUsageLimit) {
            return res.status(200).json({ message: 'You have already used this coupon', valid: false });
        }

        // Check minimum order value
        if (amount < coupon.minOrderValue) {
            return res.status(200).json({
                message: `Minimum order value of ₹${coupon.minOrderValue} required`,
                valid: false
            });
        }

        // Handle specific service restriction
        if (coupon.applicableOn === 'specific-service' && coupon.specificService) {
            const isApplicable = idsToCheck.some(id => id && id.toString() === coupon.specificService.toString());
            if (!isApplicable) {
                return res.status(200).json({
                    message: `This coupon is only valid for a specific service`,
                    valid: false
                });
            }
        }

        // Calculate discount
        let discountAmount;
        if (coupon.type === 'percentage') {
            discountAmount = (amount * coupon.value) / 100;
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        } else {
            discountAmount = coupon.value;
        }

        res.status(200).json({
            message: 'Coupon is valid',
            valid: true,
            coupon: {
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                discountAmount: Math.round(discountAmount)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to validate coupon', error: error.message, valid: false });
    }
};

// @desc    Get coupon statistics
// @route   GET /api/coupons/stats/:id
// @access  Private/Admin
const getCouponStats = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        const usages = await CouponUsage.find({ coupon: coupon._id })
            .populate('user', 'name email')
            .populate('booking', 'totalPrice createdAt')
            .sort({ usedAt: -1 });

        const totalDiscount = usages.reduce((sum, usage) => sum + usage.discountAmount, 0);

        res.status(200).json({
            coupon,
            stats: {
                totalUsages: coupon.usageCount,
                totalDiscount,
                usages
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch coupon statistics', error: error.message });
    }
};

export {
    createCoupon,
    getAllCoupons,
    getCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    validateCoupon,
    getCouponStats
};
