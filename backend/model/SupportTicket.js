import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        enum: ['user', 'admin'],
        required: true,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'messages.senderModel',
    },
    senderModel: {
        type: String,
        enum: ['User', 'Admin', 'Worker'],
    },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    read: {
        type: Boolean,
        default: false,
    },
});

const supportTicketSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userType: {
            type: String,
            enum: ['user', 'worker'],
            required: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        messages: [messageSchema],
        status: {
            type: String,
            enum: ['open', 'in-progress', 'resolved'],
            default: 'open',
        },
    },
    {
        timestamps: true,
    }
);

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket;
