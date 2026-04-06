import mongoose from 'mongoose';

const userAMCSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contract_number: {
        type: String,
        required: true,
        unique: true
    },
    plans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AMCPlan'
    }],
    start_date: {
        type: String, // "YYYY-MM-DD"
        required: true
    },
    end_date: {
        type: String, // "YYYY-MM-DD"
        required: true
    },
    payment_mode: {
        type: String,
        enum: ['Full', 'EMI'],
        default: 'Full'
    },
    payment_status: {
        type: String,
        enum: ['Paid', 'Pending', 'Overdue'],
        default: 'Paid'
    },
    total_principal: {
        type: Number,
        default: 0
    },
    total_interest: {
        type: Number,
        default: 0
    },
    total_visits: {
        type: Number,
        default: 0
    },
    remaining_visits: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Expired', 'Pending'],
        default: 'Active'
    },
    technician_assigned_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker'
    },
    technician_name: {
        type: String
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const UserAMC = mongoose.model('UserAMC', userAMCSchema, 'amcs');

export default UserAMC;
