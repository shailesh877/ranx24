import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory', // Assuming you have a SubCategory model or it's embedded in Category
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    basePrice: {
        type: Number,
        required: true,
        min: 0,
    },
    priceUnit: {
        type: String, // e.g., 'per hour', 'per day', 'fixed'
        default: 'fixed',
    },
    image: {
        type: String, // URL to service image
        required: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;
