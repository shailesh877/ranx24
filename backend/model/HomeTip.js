import mongoose from 'mongoose';

const homeTipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A home tip must have a title'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'A home tip must have content']
    },
    link: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: 'default-tip.jpg'
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const HomeTip = mongoose.model('HomeTip', homeTipSchema);

export default HomeTip;
