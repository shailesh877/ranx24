import MembershipPlan from '../model/MembershipPlan.js';
import UserMembership from '../model/UserMembership.js';
import AppError from '../utils/AppError.js';

export const getMembershipPlans = async (req, res, next) => {
    try {
        const plans = await MembershipPlan.find({});
        res.status(200).json(plans);
    } catch (error) {
        next(new AppError('Error fetching membership plans: ' + error.message, 500));
    }
};

export const getMembershipPlanById = async (req, res, next) => {
    try {
        const plan = await MembershipPlan.findById(req.params.id);
        if (!plan) {
            return next(new AppError('Membership plan not found', 404));
        }
        res.status(200).json(plan);
    } catch (error) {
        next(new AppError('Error fetching membership plan: ' + error.message, 500));
    }
};

export const buyMembership = async (req, res, next) => {
    try {
        const { planId } = req.body;
        const userId = req.user._id;

        const plan = await MembershipPlan.findById(planId);
        if (!plan) {
            return next(new AppError('Membership plan not found', 404));
        }

        // Calculate dates
        const start = new Date();
        const expiry = new Date();
        expiry.setMonth(start.getMonth() + parseInt(plan.duration_months));

        const formatDate = (date) => date.toISOString().split('T')[0];

        const newMembership = await UserMembership.create({
            customer_id: userId,
            plan_id: planId,
            start_date: formatDate(start),
            expiry_date: formatDate(expiry),
            status: 'Active'
        });

        res.status(201).json({
            success: true,
            data: newMembership
        });
    } catch (error) {
        next(new AppError('Error purchasing membership: ' + error.message, 500));
    }
};

export const getMyMembership = async (req, res, next) => {
    try {
        const membership = await UserMembership.findOne({ 
            customer_id: req.user._id,
            status: 'Active' 
        }).populate('plan_id');

        res.status(200).json({
            success: true,
            data: membership
        });
    } catch (error) {
        next(new AppError('Error fetching membership: ' + error.message, 500));
    }
};
