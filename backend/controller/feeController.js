import FeeConfig from '../model/FeeConfig.js';

// @desc    Get fee configuration
// @route   GET /api/admin/fees
// @access  Private (Admin)
export const getFees = async (req, res) => {
    try {
        const config = await FeeConfig.getSingleton();
        res.json(config);
    } catch (error) {
        console.error('Error fetching fees:', error);
        res.status(500).json({ message: 'Server error fetching fees' });
    }
};

// @desc    Update fee configuration
// @route   PUT /api/admin/fees
// @access  Private (Admin)
export const updateFees = async (req, res) => {
    try {
        const { platformFee, percentageCharge, isActive } = req.body;

        const config = await FeeConfig.getSingleton();

        if (platformFee !== undefined) config.platformFee = platformFee;
        if (percentageCharge !== undefined) config.percentageCharge = percentageCharge;
        if (isActive !== undefined) config.isActive = isActive;

        await config.save();
        res.json(config);
    } catch (error) {
        console.error('Error updating fees:', error);
        res.status(500).json({ message: 'Server error updating fees' });
    }
};
