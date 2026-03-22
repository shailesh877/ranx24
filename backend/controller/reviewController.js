import Review from '../model/Review.js';
import Booking from '../model/Booking.js';
import Worker from '../model/Worker.js';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private (User)
export const createReview = async (req, res) => {
    const { worker, booking, rating, comment } = req.body;

    if (!worker || !booking || !rating || !comment) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if booking exists and belongs to this user
        const bookingDoc = await Booking.findById(booking);
        if (!bookingDoc) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (bookingDoc.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to review this booking' });
        }

        // Check if booking is completed
        if (bookingDoc.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed bookings' });
        }

        // Check if review already exists for this booking
        const existingReview = await Review.findOne({ user: req.user._id, booking });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this booking' });
        }

        // Create review
        const review = new Review({
            user: req.user._id,
            worker,
            booking,
            rating,
            comment,
        });

        const createdReview = await review.save();

        // Update worker's average rating and total reviews
        await updateWorkerRating(worker);

        res.status(201).json(createdReview);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ message: 'Server error while creating review' });
    }
};

// Helper function to update worker's rating
const updateWorkerRating = async (workerId) => {
    try {
        const reviews = await Review.find({ worker: workerId });

        if (reviews.length === 0) {
            await Worker.findByIdAndUpdate(workerId, {
                averageRating: 0,
                totalReviews: 0,
            });
            return;
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / reviews.length).toFixed(1);

        await Worker.findByIdAndUpdate(workerId, {
            averageRating: parseFloat(averageRating),
            totalReviews: reviews.length,
        });
    } catch (error) {
        console.error('Error updating worker rating:', error);
    }
};

// @desc    Get all reviews for a worker
// @route   GET /api/reviews/worker/:workerId
// @access  Public
export const getWorkerReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ worker: req.params.workerId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching worker reviews:', error);
        res.status(500).json({ message: 'Server error while fetching reviews' });
    }
};

// @desc    Get all reviews by logged-in user
// @route   GET /api/reviews/my
// @access  Private (User)
export const getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id })
            .populate('worker', 'firstName lastName')
            .populate('booking', 'service bookingDate')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ message: 'Server error while fetching reviews' });
    }
};
