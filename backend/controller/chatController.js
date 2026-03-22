import Chat from '../model/Chat.js';
import Booking from '../model/Booking.js';

// @desc    Get or create chat for a booking
// @route   POST /api/chat/booking/:bookingId
// @access  Private (User/Worker)
export const getOrCreateChat = async (req, res) => {
    const { bookingId } = req.params;

    try {
        // Check if booking exists
        const booking = await Booking.findById(bookingId).populate('user worker');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user is part of this booking
        const isUser = booking.user._id.toString() === req.user._id.toString();
        const isWorker = booking.worker._id.toString() === req.user._id.toString();

        if (!isUser && !isWorker) {
            return res.status(403).json({ message: 'Not authorized to access this chat' });
        }

        // Check if chat already exists
        let chat = await Chat.findOne({ booking: bookingId });

        if (!chat) {
            // Create new chat
            chat = new Chat({
                booking: bookingId,
                participants: [
                    { userId: booking.user._id, userModel: 'User' },
                    { userId: booking.worker._id, userModel: 'Worker' },
                ],
                messages: [],
            });
            await chat.save();
        }

        // Populate for response
        chat = await Chat.findById(chat._id)
            .populate('booking', 'service bookingDate')
            .populate({
                path: 'messages.sender',
                select: 'name firstName lastName',
            });

        res.json(chat);
    } catch (error) {
        console.error('Error getting/creating chat:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Send message in chat
// @route   POST /api/chat/:chatId/message
// @access  Private (User/Worker)
export const sendMessage = async (req, res) => {
    const { chatId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ message: 'Message cannot be empty' });
    }

    try {
        const chat = await Chat.findById(chatId).populate('booking');
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check authorization
        const booking = chat.booking;
        const isUser = booking.user.toString() === req.user._id.toString();
        const isWorker = booking.worker.toString() === req.user._id.toString();

        if (!isUser && !isWorker) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Determine sender model
        const senderModel = isUser ? 'User' : 'Worker';

        // Add message
        const newMessageObj = {
            sender: req.user._id,
            senderModel,
            message: message.trim(),
            delivered: true,
            read: false,
            type: req.body.type || 'text',
            mediaUrl: req.body.mediaUrl || '',
        };

        chat.messages.push(newMessageObj);

        chat.lastMessage = req.body.type === 'image' ? '📷 Image' : message.trim();
        chat.lastMessageTime = new Date();

        await chat.save();

        const newMessage = chat.messages[chat.messages.length - 1];

        // Emit Socket.io event for real-time update to chat room
        if (req.io) {
            // Emit to the chat room (all participants in this chat)
            req.io.to(`chat_${chat._id}`).emit('new_message', {
                chatId: chat._id,
                message: newMessage,
                timestamp: new Date(),
            });

            console.log(`📨 Real-time message sent to chat_${chat._id}`);
        }

        res.json(chat);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get chat messages
// @route   GET /api/chat/:chatId
// @access  Private (User/Worker)
export const getChatMessages = async (req, res) => {
    const { chatId } = req.params;

    try {
        const chat = await Chat.findById(chatId)
            .populate('booking', 'service bookingDate user worker')
            .populate({
                path: 'messages.sender',
                select: 'name firstName lastName',
            });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Check authorization
        const booking = chat.booking;
        const isUser = booking.user.toString() === req.user._id.toString();
        const isWorker = booking.worker.toString() === req.user._id.toString();

        if (!isUser && !isWorker) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(chat);
    } catch (error) {
        console.error('Error fetching chat:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Mark messages as read
// @route   PATCH /api/chat/:chatId/read
// @access  Private (User/Worker)
export const markAsRead = async (req, res) => {
    const { chatId } = req.params;

    try {
        const chat = await Chat.findById(chatId).populate('booking');
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Mark all messages sent by the other person as read
        let hasUpdates = false;
        chat.messages.forEach((msg) => {
            if (msg.sender.toString() !== req.user._id.toString() && !msg.read) {
                msg.read = true;
                hasUpdates = true;
            }
        });

        if (hasUpdates) {
            await chat.save();

            // Emit Socket.io event
            if (req.io) {
                const booking = chat.booking;
                // Determine recipient (the one who sent the messages we just read)
                // Actually, we want to notify the SENDER that their messages were read.
                // If I am User, I read Worker's messages. I notify Worker.
                const isUser = booking.user.toString() === req.user._id.toString();
                const recipientId = isUser ? booking.worker.toString() : booking.user.toString();

                req.io.to(recipientId).emit('messages_read', {
                    chatId: chat._id,
                    bookingId: booking._id,
                    readBy: isUser ? 'User' : 'Worker'
                });
            }
        }

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all chats for user/worker
// @route   GET /api/chat
// @access  Private (User/Worker)
export const getChats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find chats where user is a participant
        const chats = await Chat.find({
            'participants.userId': userId
        })
            .populate({
                path: 'booking',
                select: 'service bookingDate user worker',
                populate: [
                    { path: 'user', select: 'name firstName lastName profileImage' },
                    { path: 'worker', select: 'name firstName lastName profileImage' }
                ]
            })
            .sort({ lastMessageTime: -1 });

        // Process chats to add unread count and other person's details
        const processedChats = chats.map(chat => {
            const isUser = chat.booking.user._id.toString() === userId.toString();
            const otherPerson = isUser ? chat.booking.worker : chat.booking.user;

            // Calculate unread count
            const unreadCount = chat.messages.filter(
                msg => msg.sender.toString() !== userId.toString() && !msg.read
            ).length;

            return {
                _id: chat._id,
                bookingId: chat.booking._id,
                serviceName: chat.booking.service,
                otherPerson: {
                    _id: otherPerson._id,
                    name: otherPerson.name || `${otherPerson.firstName} ${otherPerson.lastName}`,
                    profileImage: otherPerson.profileImage
                },
                lastMessage: chat.lastMessage,
                lastMessageTime: chat.lastMessageTime,
                unreadCount
            };
        });

        res.json(processedChats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Upload chat media
// @route   POST /api/chat/upload
// @access  Private (User/Worker)
export const uploadChatMedia = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Return the file URL
        // Assuming server serves 'uploads' folder statically
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.json({ url: fileUrl });
    } catch (error) {
        console.error('Error uploading media:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get chat messages by booking ID
// @route   GET /api/chat/booking/:bookingId/messages
// @access  Private (User/Worker)
export const getChatMessagesByBookingId = async (req, res) => {
    const { bookingId } = req.params;

    try {
        const chat = await Chat.findOne({ booking: bookingId })
            .populate('booking', 'service bookingDate user worker')
            .populate({
                path: 'messages.sender',
                select: 'name firstName lastName',
            });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found for this booking' });
        }

        // Check authorization
        const booking = chat.booking;
        const isUser = booking.user._id.toString() === req.user._id.toString();
        const isWorker = booking.worker._id.toString() === req.user._id.toString();

        if (!isUser && !isWorker) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(chat.messages);
    } catch (error) {
        console.error('Error fetching chat messages by booking ID:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
