import path from 'path';
import fs from 'fs';
import HomeTip from '../model/HomeTip.js';

// @desc    Get all home tips
// @route   GET /api/home-tips
// @access  Public
export const getHomeTips = async (req, res) => {
    try {
        const tips = await HomeTip.find({ active: true }).sort({ createdAt: -1 });
        res.json(tips);
    } catch (error) {
        console.error('Error fetching home tips:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all home tips (Admin)
// @route   GET /api/home-tips/admin
// @access  Admin
export const getAllHomeTipsAdmin = async (req, res) => {
    try {
        const tips = await HomeTip.find({}).sort({ createdAt: -1 });
        res.json(tips);
    } catch (error) {
        console.error('Error fetching home tips (admin):', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single home tip
// @route   GET /api/home-tips/:id
// @access  Public
export const getHomeTipById = async (req, res) => {
    try {
        const tip = await HomeTip.findById(req.params.id);
        if (!tip) {
            return res.status(404).json({ message: 'Home Tip not found' });
        }
        res.json(tip);
    } catch (error) {
        console.error('Error fetching home tip:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a home tip
// @route   POST /api/home-tips
// @access  Admin
export const createHomeTip = async (req, res) => {
    const { title, content, active, link } = req.body;
    let imagePath = '';

    if (req.file) {
        imagePath = req.file.path.replace(/\\/g, "/"); // Normalize path
    }

    try {
        const tip = new HomeTip({
            title,
            content,
            link,
            image: imagePath,
            active: active === 'true' || active === true,
        });

        const createdTip = await tip.save();
        res.status(201).json(createdTip);
    } catch (error) {
        console.error('Error creating home tip:', error);
        // Delete uploaded image if error
        if (imagePath) {
            const fullPath = path.join(process.cwd(), imagePath);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a home tip
// @route   PUT /api/home-tips/:id
// @access  Admin
export const updateHomeTip = async (req, res) => {
    const { title, content, active, link } = req.body;

    try {
        const tip = await HomeTip.findById(req.params.id);

        if (tip) {
            if (title) tip.title = title;
            if (content) tip.content = content;
            if (link !== undefined) tip.link = link;
            if (active !== undefined) tip.active = active === 'true' || active === true;

            if (req.file) {
                // Delete old image
                if (tip.image && tip.image !== 'default-tip.jpg') {
                    const oldImagePath = path.join(process.cwd(), tip.image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                tip.image = req.file.path.replace(/\\/g, "/");
            }

            const updatedTip = await tip.save();
            res.json(updatedTip);
        } else {
            res.status(404).json({ message: 'Home Tip not found' });
        }
    } catch (error) {
        console.error('Error updating home tip:', error);
        // Delete uploaded image if error
        if (req.file) {
            const fullPath = path.join(process.cwd(), req.file.path);
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a home tip
// @route   DELETE /api/home-tips/:id
// @access  Admin
export const deleteHomeTip = async (req, res) => {
    try {
        const tip = await HomeTip.findById(req.params.id);

        if (tip) {
            if (tip.image && tip.image !== 'default-tip.jpg') {
                const imagePath = path.join(process.cwd(), tip.image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
            await HomeTip.deleteOne({ _id: req.params.id });
            res.json({ message: 'Home Tip removed' });
        } else {
            res.status(404).json({ message: 'Home Tip not found' });
        }
    } catch (error) {
        console.error('Error deleting home tip:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
