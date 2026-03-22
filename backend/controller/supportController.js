import SupportTicket from '../model/SupportTicket.js';
import User from '../model/User.js';

// @desc    Create a new support ticket
// @route   POST /api/support
// @access  Private (User/Worker)
export const createTicket = async (req, res) => {
    const { subject, message, userType } = req.body;

    if (!subject || !message || !userType) {
        return res.status(400).json({ message: 'Subject, message, and userType are required' });
    }

    try {
        const ticket = new SupportTicket({
            user: req.user._id,
            userType,
            subject,
            messages: [
                {
                    sender: 'user',
                    senderId: req.user._id,
                    senderModel: userType === 'worker' ? 'Worker' : 'User',
                    message,
                },
            ],
            status: 'open',
        });

        const createdTicket = await ticket.save();
        res.status(201).json(createdTicket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Server error while creating ticket' });
    }
};

// @desc    Get all tickets for logged-in user
// @route   GET /api/support/my
// @access  Private (User/Worker)
export const getUserTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find({ user: req.user._id })
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        res.status(500).json({ message: 'Server error while fetching tickets' });
    }
};

// @desc    Get all tickets (Admin only)
// @route   GET /api/support/admin/all
// @access  Private (Admin)
export const getAllTickets = async (req, res) => {
    const { userType } = req.query; // 'user' or 'worker'

    try {
        const filter = userType ? { userType } : {};
        const tickets = await SupportTicket.find(filter)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (error) {
        console.error('Error fetching all tickets:', error);
        res.status(500).json({ message: 'Server error while fetching tickets' });
    }
};

// @desc    Add message to ticket
// @route   POST /api/support/:id/message
// @access  Private (User/Worker/Admin)
export const addMessage = async (req, res) => {
    const { message, sender } = req.body; // sender: 'user' or 'admin'

    if (!message || !sender) {
        return res.status(400).json({ message: 'Message and sender are required' });
    }

    try {
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Check authorization
        if (sender === 'user' && ticket.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        ticket.messages.push({
            sender,
            senderId: req.user._id,
            senderModel: sender === 'admin' ? 'Admin' : ticket.userType === 'worker' ? 'Worker' : 'User',
            message,
        });

        // Update status to in-progress if admin responds
        if (sender === 'admin' && ticket.status === 'open') {
            ticket.status = 'in-progress';
        }

        const updatedTicket = await ticket.save();

        // Emit Socket.io event for real-time update
        if (req.io) {
            const targetRoom = sender === 'admin' ? ticket.user.toString() : 'admin';
            req.io.to(targetRoom).emit('support_message', {
                ticketId: ticket._id,
                message: updatedTicket.messages[updatedTicket.messages.length - 1],
            });
        }

        res.json(updatedTicket);
    } catch (error) {
        console.error('Error adding message:', error);
        res.status(500).json({ message: 'Server error while adding message' });
    }
};

// @desc    Update ticket status
// @route   PATCH /api/support/:id/status
// @access  Private (Admin)
export const updateTicketStatus = async (req, res) => {
    const { status } = req.body;

    if (!['open', 'in-progress', 'resolved'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        ticket.status = status;
        const updatedTicket = await ticket.save();

        // Emit Socket.io event
        if (req.io) {
            req.io.to(ticket.user.toString()).emit('ticket_status_updated', {
                ticketId: ticket._id,
                status,
            });
        }

        res.json(updatedTicket);
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Server error while updating status' });
    }
};

// @desc    Mark messages as read
// @route   PATCH /api/support/:id/read
// @access  Private (User/Worker/Admin)
export const markAsRead = async (req, res) => {
    const { sender } = req.body; // 'user' or 'admin' (who is reading)

    try {
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Mark messages from the OTHER party as read
        let hasUpdates = false;
        ticket.messages.forEach(msg => {
            if (msg.sender !== sender && !msg.read) {
                msg.read = true;
                hasUpdates = true;
            }
        });

        if (hasUpdates) {
            await ticket.save();

            // Emit Socket.io event
            if (req.io) {
                const targetRoom = sender === 'admin' ? ticket.user.toString() : 'admin';
                req.io.to(targetRoom).emit('messages_read', {
                    ticketId: ticket._id,
                    readBy: sender
                });
            }
        }

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
