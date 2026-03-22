import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'messages.senderModel',
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['User', 'Worker'],
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ['text', 'image'],
        default: 'text',
    },
    mediaUrl: {
        type: String,
        default: '',
    },
    delivered: {
        type: Boolean,
        default: false,
    },
    read: {
        type: Boolean,
        default: false,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const chatSchema = new mongoose.Schema(
    {
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
            unique: true, // One chat per booking
        },
        participants: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    refPath: 'participants.userModel',
                },
                userModel: {
                    type: String,
                    required: true,
                    enum: ['User', 'Worker'],
                },
            },
        ],
        messages: [messageSchema],
        lastMessage: {
            type: String,
            default: '',
        },
        lastMessageTime: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
