import mongoose from 'mongoose';

const userMembershipSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MembershipPlan',
        required: true
    },
    start_date: {
        type: String, // String format as seen in screenshot "YYYY-MM-DD"
        required: true
    },
    expiry_date: {
        type: String, // String format "YYYY-MM-DD"
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Expired'],
        default: 'Active'
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const UserMembership = mongoose.model('UserMembership', userMembershipSchema, 'memberships');

export default UserMembership;
