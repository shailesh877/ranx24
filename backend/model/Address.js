import mongoose from 'mongoose';
import { booleanConverterPlugin } from '../utils/booleanConverterPlugin.js';


const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['home', 'work', 'other'],
        default: 'home',
    },
    addressLine1: {
        type: String,
        required: true,
    },
    addressLine2: {
        type: String,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    landmark: {
        type: String,
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

// Apply boolean converter plugin
addressSchema.plugin(booleanConverterPlugin);


// Ensure only one default address per user
addressSchema.pre('save', async function (next) {
    // Convert isDefault to boolean if it's a string
    if (typeof this.isDefault === 'string') {
        this.isDefault = this.isDefault === 'true' || this.isDefault === '1';
    }

    if (this.isDefault) {
        await this.constructor.updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
    next();
});

const Address = mongoose.model('Address', addressSchema);

export default Address;
