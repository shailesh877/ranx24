import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: [true, 'A testimonial must have a client name'],
        trim: true
    },
    videoUrl: {
        type: String,
        required: [true, 'A testimonial must have a video URL']
    },
    comment: {
        type: String,
        trim: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
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

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
