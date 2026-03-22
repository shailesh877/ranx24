import SupportTicket from '../model/SupportTicket.js';
import { createNotification } from './notificationController.js';

// @desc    Create a support ticket (Worker)
// @route   POST /api/support/worker
// @access  Private (Worker)
export const createWorkerTicket = async (req, res) => {
    try {
        const { subject, message, category } = req.body;

        if (!subject || !message) {
            return res.status(400).json({ message: 'Subject and message are required' });
        }

        const ticket = await SupportTicket.create({
            user: req.user._id,
            userModel: 'Worker',
            subject,
            message,
            category: category || 'general',
            status: 'open'
        });

        // Notify admin (you can implement admin notification logic here)
        console.log('New support ticket created:', ticket._id);

        res.status(201).json({
            message: 'Support ticket created successfully',
            ticket
        });

    } catch (error) {
        console.error('Error creating support ticket:', error);
        res.status(500).json({ message: 'Server error while creating support ticket' });
    }
};

// @desc    Get worker's support tickets
// @route   GET /api/support/worker
// @access  Private (Worker)
export const getWorkerTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({
            user: req.user._id,
            userModel: 'Worker'
        }).sort({ createdAt: -1 });

        res.json({ tickets });

    } catch (error) {
        console.error('Error fetching support tickets:', error);
        res.status(500).json({ message: 'Server error while fetching support tickets' });
    }
};

// @desc    Get single ticket details
// @route   GET /api/support/worker/:id
// @access  Private (Worker)
export const getWorkerTicketById = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Verify this worker owns this ticket
        if (ticket.user.toString() !== req.user._id.toString() || ticket.userModel !== 'Worker') {
            return res.status(403).json({ message: 'Not authorized to view this ticket' });
        }

        res.json({ ticket });

    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({ message: 'Server error while fetching ticket' });
    }
};

// @desc    Add reply to ticket (Worker)
// @route   POST /api/support/worker/:id/reply
// @access  Private (Worker)
export const addWorkerReply = async (req, res) => {
    try {
        const { message } = req.body;
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Verify this worker owns this ticket
        if (ticket.user.toString() !== req.user._id.toString() || ticket.userModel !== 'Worker') {
            return res.status(403).json({ message: 'Not authorized to reply to this ticket' });
        }

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        ticket.replies.push({
            sender: req.user._id,
            senderModel: 'Worker',
            message,
            createdAt: new Date()
        });

        ticket.status = 'in-progress'; // Update status when worker replies
        await ticket.save();

        res.json({
            message: 'Reply added successfully',
            ticket
        });

    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ message: 'Server error while adding reply' });
    }
};

// @desc    Upload portfolio photo (Worker)
// @route   POST /api/workers/portfolio
// @access  Private (Worker)
export const uploadPortfolioPhoto = async (req, res) => {
    try {
        const { photoUrl } = req.body;

        if (!photoUrl) {
            return res.status(400).json({ message: 'Photo URL is required' });
        }

        // Add photo to worker's portfolio
        req.user.portfolioPhotos = req.user.portfolioPhotos || [];
        req.user.portfolioPhotos.push(photoUrl);
        await req.user.save();

        res.json({
            message: 'Portfolio photo added successfully',
            portfolioPhotos: req.user.portfolioPhotos
        });

    } catch (error) {
        console.error('Error uploading portfolio photo:', error);
        res.status(500).json({ message: 'Server error while uploading photo' });
    }
};

// @desc    Delete portfolio photo (Worker)
// @route   DELETE /api/workers/portfolio/:photoUrl
// @access  Private (Worker)
export const deletePortfolioPhoto = async (req, res) => {
    try {
        const { photoUrl } = req.params;

        req.user.portfolioPhotos = req.user.portfolioPhotos.filter(
            photo => photo !== decodeURIComponent(photoUrl)
        );
        await req.user.save();

        res.json({
            message: 'Portfolio photo deleted successfully',
            portfolioPhotos: req.user.portfolioPhotos
        });

    } catch (error) {
        console.error('Error deleting portfolio photo:', error);
        res.status(500).json({ message: 'Server error while deleting photo' });
    }
};
