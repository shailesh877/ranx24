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
