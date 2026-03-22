import AMCPlan from '../model/AMCPlan.js';
import UserAMC from '../model/UserAMC.js';
import AppError from '../utils/AppError.js';

export const getAMCPlans = async (req, res, next) => {
    try {
        const plans = await AMCPlan.find();
        res.status(200).json(plans);
    } catch (error) {
        next(new AppError('Error fetching AMC plans: ' + error.message, 500));
    }
};

export const purchaseAMCPackage = async (req, res, next) => {
    try {
        const { planIds } = req.body; // Array of AMC plan IDs
        const userId = req.user._id;

        if (!planIds || !Array.isArray(planIds) || planIds.length === 0) {
            return next(new AppError('Please select at least one AMC plan', 400));
        }

        const plans = await AMCPlan.find({ _id: { $in: planIds } });
        if (plans.length !== planIds.length) {
            return next(new AppError('One or more selected plans not found', 404));
        }

        // Generate contract number: RANX-XXXXXXXXXX
        const contractNumber = 'RANX-' + Math.floor(1000000000 + Math.random() * 9000000000);

        // Calculate dates
        const start = new Date();
        const end = new Date();
        // Use the duration from the first plan (usually 12 months)
        const duration = plans[0].duration_months || 12;
        end.setMonth(start.getMonth() + duration);

        const formatDate = (date) => date.toISOString().split('T')[0];

        const newUserAMC = await UserAMC.create({
            customer_id: userId,
            contract_number: contractNumber,
            plans: planIds,
            start_date: formatDate(start),
            end_date: formatDate(end),
            status: 'Active'
        });

        res.status(201).json({
            success: true,
            data: newUserAMC
        });
    } catch (error) {
        next(new AppError('Error purchasing AMC package: ' + error.message, 500));
    }
};

export const getMyAMCPackage = async (req, res, next) => {
    try {
        const amc = await UserAMC.findOne({ 
            customer_id: req.user._id,
            status: 'Active' 
        }).populate('plans');

        res.status(200).json({
            success: true,
            data: amc
        });
    } catch (error) {
        next(new AppError('Error fetching AMC package: ' + error.message, 500));
    }
};
