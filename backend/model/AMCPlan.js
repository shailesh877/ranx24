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
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const AMCPlan = mongoose.model('AMCPlan', amcPlanSchema, 'a_m_c_plans');

export default AMCPlan;
