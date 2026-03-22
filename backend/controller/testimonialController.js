import Testimonial from '../model/Testimonial.js';

// @desc    Get all testimonials (Public - only active)
// @route   GET /api/testimonials
// @access  Public
export const getTestimonials = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ active: true }).sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (error) {
        console.error('Error fetching testimonials:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all testimonials (Admin - all)
// @route   GET /api/testimonials/admin
// @access  Admin
export const getAllTestimonialsAdmin = async (req, res) => {
    try {
        const testimonials = await Testimonial.find({}).sort({ createdAt: -1 });
        res.json(testimonials);
    } catch (error) {
        console.error('Error fetching testimonials (admin):', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Admin
export const createTestimonial = async (req, res) => {
    const { clientName, videoUrl, comment, rating, active } = req.body;

    try {
        const testimonial = new Testimonial({
            clientName,
            videoUrl,
            comment,
            rating,
            active: active === undefined ? true : active
        });

        const createdTestimonial = await testimonial.save();
        res.status(201).json(createdTestimonial);
    } catch (error) {
        console.error('Error creating testimonial:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Admin
export const updateTestimonial = async (req, res) => {
    const { clientName, videoUrl, comment, rating, active } = req.body;

    try {
        const testimonial = await Testimonial.findById(req.params.id);

        if (testimonial) {
            if (clientName) testimonial.clientName = clientName;
            if (videoUrl) testimonial.videoUrl = videoUrl;
            if (comment !== undefined) testimonial.comment = comment;
            if (rating) testimonial.rating = rating;
            if (active !== undefined) testimonial.active = active;

            const updatedTestimonial = await testimonial.save();
            res.json(updatedTestimonial);
        } else {
            res.status(404).json({ message: 'Testimonial not found' });
        }
    } catch (error) {
        console.error('Error updating testimonial:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Admin
export const deleteTestimonial = async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);

        if (testimonial) {
            await Testimonial.deleteOne({ _id: req.params.id });
            res.json({ message: 'Testimonial removed' });
        } else {
            res.status(404).json({ message: 'Testimonial not found' });
        }
    } catch (error) {
        console.error('Error deleting testimonial:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
