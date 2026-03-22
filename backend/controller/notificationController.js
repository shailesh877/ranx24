import Notification from '../model/Notification.js';
import firebaseApp from '../config/firebase.js';

// Helper to create notification (internal use)
export const createNotification = async ({ recipient, recipientModel, title, message, type = 'info', data = {}, io = null }) => {
    try {
        const notification = await Notification.create({
            recipient,
            recipientModel,
            title,
            message,
            type,
            data
        });

        // Emit real-time notification if socket is available
        if (io) {
            io.to(`notifications_${recipient}`).emit('new_notification', notification);
            console.log(`Socket notification sent to notifications_${recipient}`);
        }


        // Send FCM Push Notification
        if (firebaseApp) {
            try {
                // Find recipient to get FCM token
                const Model = recipientModel === 'Worker' ?
                    (await import('../model/Worker.js')).default :
                    (await import('../model/User.js')).default;

                const user = await Model.findById(recipient);
                console.log(`🔍 Finding recipient: ${recipient} (Model: ${recipientModel})`);

                if (user && user.fcmToken) {
                    console.log(`✅ Found user with token: ${user.fcmToken.substring(0, 10)}...`);
                    // Ensure all data values are strings (FCM requirement)
                    const stringData = Object.keys(data).reduce((acc, key) => {
                        acc[key] = String(data[key]);
                        return acc;
                    }, {});

                    await firebaseApp.messaging().send({
                        token: user.fcmToken,
                        notification: {
                            title,
                            body: message
                        },
                        android: {
                            priority: 'high',
                            notification: {
                                channelId: 'default',
                                sound: 'default',
                                priority: 'high',
                                defaultSound: true,
                                defaultVibrateTimings: true
                            }
                        },
                        data: {
                            ...stringData,
                            type: String(type),
                            notificationId: notification._id.toString()
                        }
                    });
                    console.log('🔥 FCM Notification sent to:', recipient);
                } else {
                    console.log(`⚠️ User not found or no FCM token. User: ${!!user}, Token: ${!!user?.fcmToken}`);
                }
            } catch (fcmError) {
                console.error('❌ FCM Error:', fcmError);
            }
        }

    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// @desc    Send broadcast notification
// @route   POST /api/notifications/broadcast
// @access  Admin
export const sendBroadcastNotification = async (req, res) => {
    try {
        const { recipientModel, title, message, image } = req.body;

        if (!['User', 'Worker'].includes(recipientModel)) {
            return res.status(400).json({ message: 'Invalid recipient model' });
        }

        const Model = recipientModel === 'Worker' ?
            (await import('../model/Worker.js')).default :
            (await import('../model/User.js')).default;

        // 1. Find all users with FCM tokens
        const users = await Model.find({ fcmToken: { $exists: true, $ne: null } }).select('_id fcmToken');
        const tokens = users.map(u => u.fcmToken);

        if (tokens.length === 0) {
            return res.status(404).json({ message: 'No active users found to send notification' });
        }
        console.log(`[Broadcast] Found ${tokens.length} tokens. Sample: ${tokens[0].substring(0, 10)}...`);
        console.log(`📢 Sending broadcast to ${tokens.length} ${recipientModel}s`);

        // 2. Send Multicast FCM (Batched)
        if (firebaseApp) {
            const chunkSize = 500; // Firebase limit
            let successCount = 0;
            let failureCount = 0;

            for (let i = 0; i < tokens.length; i += chunkSize) {
                const chunk = tokens.slice(i, i + chunkSize);

                const messagePayload = {
                    notification: {
                        title,
                        body: message,
                    },
                    tokens: chunk, // Multicast to this chunk
                    android: {
                        priority: 'high',
                        notification: {
                            channelId: 'default',
                            sound: 'default'
                        }
                    },
                    data: {
                        type: 'broadcast',
                        image: image || ''
                    }
                };

                if (image) {
                    messagePayload.notification.imageUrl = image;
                }

                try {
                    const response = await firebaseApp.messaging().sendEachForMulticast(messagePayload);
                    successCount += response.successCount;
                    failureCount += response.failureCount;
                    console.log(`Batch ${i / chunkSize + 1}: ${response.successCount} success, ${response.failureCount} fail`);
                } catch (batchError) {
                    console.error(`Error sending batch ${i / chunkSize + 1}:`, batchError);
                }
            }
            console.log(`✅ Total Broadcast sent: ${successCount} successes, ${failureCount} failures`);
        }

        // 3. Create Notification records (Optional: might be heavy for thousands of users, but good for history)
        // For now, let's just create one "System" notification or skip individual DB records to save space
        // Alternatively, create individual records for "Inbox" functionality
        const notifications = users.map(u => ({
            recipient: u._id,
            recipientModel,
            title,
            message,
            type: 'info',
            data: { image },
            read: false
        }));

        await Notification.insertMany(notifications);

        // 4. Emit Socket Event (Broadcast)
        if (req.io) {
            // We can emit to a general room if we had one, or loop. 
            // Since we don't have a "all_users" room, we might skip or loop.
            // For scalability, usually we rely on FCM for broadcast.
            // But if we want in-app updates immediately:
            // req.io.emit(`broadcast_${recipientModel.toLowerCase()}`, { title, message });
        }

        res.json({ message: `Notification sent to ${tokens.length} recipients` });

    } catch (error) {
        console.error('Broadcast error:', error);
        res.status(500).json({ message: 'Server error during broadcast' });
    }
};

// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipient: req.user._id,
            recipientModel: req.user.role === 'worker' ? 'Worker' : 'User'
        }).sort({ createdAt: -1 });

        res.json(notifications);
    } catch (error) {
        console.error('getNotifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
    try {
        console.log(`📩 markAsRead called for ID: ${req.params.id}`);
        console.log(`👤 User attempting action: ${req.user?._id}`);

        const notification = await Notification.findOne({
            _id: req.params.id,
            recipient: req.user._id
        });

        if (!notification) {
            console.log(`❌ Notification not found or unauthorized. ID: ${req.params.id}, User: ${req.user._id}`);
            return res.status(404).json({ message: 'Notification not found' });
        }

        notification.read = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        console.error('❌ markAsRead error:', error);
        console.error('Stack:', error.stack);
        console.error('Params:', req.params);
        console.error('User:', req.user);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { $set: { read: true } }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('markAllAsRead error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            recipientModel: req.user.role === 'worker' ? 'Worker' : 'User',
            read: false
        });

        res.json({ count });
    } catch (error) {
        console.error('getUnreadCount error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update FCM Token
// @route   PUT /api/notifications/fcm-token
// @access  Private
export const updateFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;

        if (!fcmToken) {
            return res.status(400).json({ message: 'Token is required' });
        }

        const Model = req.user.role === 'worker' ?
            (await import('../model/Worker.js')).default :
            (await import('../model/User.js')).default;

        await Model.findByIdAndUpdate(req.user._id, { fcmToken });

        res.json({ message: 'FCM Token updated successfully' });
    } catch (error) {
        console.error('updateFcmToken error:', error);
        res.status(500).json({ message: 'Server error' });
    }

};
