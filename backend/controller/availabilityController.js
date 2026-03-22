import Worker from '../model/Worker.js';
import Booking from '../model/Booking.js';

/**
 * Set worker availability status
 */
export const setAvailability = async (req, res) => {
    try {
        const { isAvailable } = req.body;
        const workerId = req.user._id; // Assuming authenticated worker

        const worker = await Worker.findById(workerId);

        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        worker.isAvailable = isAvailable;
        await worker.save();

        res.json({
            message: `Availability set to ${isAvailable ? 'available' : 'unavailable'}`,
            isAvailable: worker.isAvailable
        });
    } catch (error) {
        console.error('Error setting availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get worker availability status
 */
export const getAvailability = async (req, res) => {
    try {
        const { workerId } = req.params;

        const worker = await Worker.findById(workerId).select('isAvailable workingHours');

        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        res.json({
            isAvailable: worker.isAvailable || false,
            workingHours: worker.workingHours || {}
        });
    } catch (error) {
        console.error('Error getting availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Check if worker is available for a specific date
 */
export const checkWorkerAvailability = async (req, res) => {
    try {
        const { workerId, date } = req.query;

        if (!workerId || !date) {
            return res.status(400).json({
                message: 'Worker ID and date are required'
            });
        }

        // Parse the date to start and end of day
        const bookingDate = new Date(date);
        const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

        // Check if worker exists
        const worker = await Worker.findById(workerId);
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        // Find all bookings for this worker on this date
        const existingBookings = await Booking.find({
            worker: workerId,
            scheduledDate: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: { $in: ['pending', 'confirmed', 'in-progress'] }
        }).select('scheduledTime bookingType');

        // Worker is unavailable if they have any active booking on this date
        const isAvailable = existingBookings.length === 0;

        // Get booked time slots
        const bookedSlots = existingBookings.map(booking => ({
            time: booking.scheduledTime,
            type: booking.bookingType
        }));

        // Find next available date (within next 30 days)
        let nextAvailableDate = null;
        if (!isAvailable) {
            for (let i = 1; i <= 30; i++) {
                const checkDate = new Date(startOfDay);
                checkDate.setDate(checkDate.getDate() + i);

                const checkStart = new Date(checkDate.setHours(0, 0, 0, 0));
                const checkEnd = new Date(checkDate.setHours(23, 59, 59, 999));

                const futureBookings = await Booking.countDocuments({
                    worker: workerId,
                    scheduledDate: {
                        $gte: checkStart,
                        $lte: checkEnd
                    },
                    status: { $in: ['pending', 'confirmed', 'in-progress'] }
                });

                if (futureBookings === 0) {
                    nextAvailableDate = checkStart.toISOString().split('T')[0];
                    break;
                }
            }
        }

        res.json({
            available: isAvailable,
            bookedSlots,
            nextAvailableDate,
            workerId,
            date: startOfDay.toISOString().split('T')[0]
        });
    } catch (error) {
        console.error('Error checking worker availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Update working hours
 */
export const updateWorkingHours = async (req, res) => {
    try {
        const { workingHours } = req.body;
        const workerId = req.user._id;

        const worker = await Worker.findById(workerId);

        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        worker.workingHours = workingHours;
        await worker.save();

        res.json({
            message: 'Working hours updated successfully',
            workingHours: worker.workingHours
        });
    } catch (error) {
        console.error('Error updating working hours:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export default {
    setAvailability,
    getAvailability,
    checkWorkerAvailability,
    updateWorkingHours
};

