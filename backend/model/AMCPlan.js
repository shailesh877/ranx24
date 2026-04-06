import mongoose from 'mongoose';

const amcPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    duration_months: {
        type: Number,
        default: 12
    },
    number_of_visits: {
        type: String,
        required: true
    },
    service_category: {
        type: String, // e.g., "AC", "RO", etc.
        required: true
    },
    total_price: {
        type: String,
        required: true
    },
    is_emi_available: {
        type: Boolean,
        default: false
    },
    available_emi_frequencies: {
        type: [String],
        default: ['Monthly']
    },
    emi_installments: {
        type: Number,
        default: 1
    },
    emi_interest_amount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const AMCPlan = mongoose.model('AMCPlan', amcPlanSchema, 'a_m_c_plans');

export default AMCPlan;
