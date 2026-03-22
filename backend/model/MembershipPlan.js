import mongoose from 'mongoose';

const membershipPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: mongoose.Schema.Types.Mixed, // Handles both Number and String as seen in screenshot
        required: true
    },
    duration_months: {
        type: mongoose.Schema.Types.Mixed, // Handles both Number and String
        required: true
    },
    description: {
        type: String,
        default: null
    },
    discount_tiers: {
        type: Array,
        default: []
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const MembershipPlan = mongoose.model('MembershipPlan', membershipPlanSchema, 'membership_plans');

export default MembershipPlan;
