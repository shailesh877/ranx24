import Address from '../model/Address.js';
import { toBoolean } from '../utils/typeConverter.js';


// Get all addresses for a user
export const getUserAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        res.json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Add new address
export const addAddress = async (req, res) => {
    try {
        const { type, addressLine1, addressLine2, city, state, pincode, landmark, latitude, longitude, isDefault } = req.body;

        // Validation
        if (!addressLine1 || !city || !state || !pincode) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const address = new Address({
            user: req.user._id,
            type,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            landmark,
            latitude,
            longitude,
            isDefault: toBoolean(isDefault || false),
        });

        const savedAddress = await address.save();
        res.status(201).json(savedAddress);
    } catch (error) {
        console.error('Error adding address:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update address
export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, addressLine1, addressLine2, city, state, pincode, landmark, latitude, longitude, isDefault } = req.body;

        const address = await Address.findOne({ _id: id, user: req.user._id });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Update fields
        if (type) address.type = type;
        if (addressLine1) address.addressLine1 = addressLine1;
        if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
        if (city) address.city = city;
        if (state) address.state = state;
        if (pincode) address.pincode = pincode;
        if (landmark !== undefined) address.landmark = landmark;
        if (latitude !== undefined) address.latitude = latitude;
        if (longitude !== undefined) address.longitude = longitude;
        if (isDefault !== undefined) address.isDefault = toBoolean(isDefault);

        const updatedAddress = await address.save();
        res.json(updatedAddress);
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete address
export const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Set default address
export const setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findOne({ _id: id, user: req.user._id });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        address.isDefault = true;
        await address.save();

        res.json({ message: 'Default address updated' });
    } catch (error) {
        console.error('Error setting default address:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
