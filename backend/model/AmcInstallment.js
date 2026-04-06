import mongoose from 'mongoose';

const amcInstallmentSchema = new mongoose.Schema({
    user_amc_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserAMC',
        required: true
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    installment_number: {
        type: Number,
        required: true
    },
    amount_due: {
        type: Number,
        required: true
    },
    due_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Overdue'],
        default: 'Pending'
    },
    payment_id: {
        type: String,
        default: null
    },
    paid_at: {
        type: Date,
        default: null
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

const AmcInstallment = mongoose.model('AmcInstallment', amcInstallmentSchema, 'amc_installments');

export default AmcInstallment;
