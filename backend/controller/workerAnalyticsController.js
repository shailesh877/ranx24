import Booking from '../model/Booking.js';
import Worker from '../model/Worker.js';

// @desc    Get earnings chart data (Daily/Weekly/Monthly)
// @route   GET /api/workers/analytics/earnings?period=week
// @access  Private (Worker)
export const getEarningsChart = async (req, res) => {
    try {
        const workerId = req.user._id;
        const period = req.query.period || 'week'; // 'week', 'month', 'year'

        let startDate = new Date();
        let groupBy = '$dayOfWeek';
        let labels = [];

        if (period === 'week') {
            startDate.setDate(startDate.getDate() - 7);
            labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            groupBy = { $dayOfWeek: '$createdAt' };
        } else if (period === 'month') {
            startDate.setDate(startDate.getDate() - 30);
            labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
            groupBy = { $dayOfMonth: '$createdAt' };
        } else if (period === 'year') {
            startDate.setMonth(startDate.getMonth() - 12);
            labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            groupBy = { $month: '$createdAt' };
        }

        const earnings = await Booking.aggregate([
            {
                $match: {
                    worker: workerId,
                    status: 'completed',
                    paymentStatus: 'paid',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    total: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        // Fill in missing days with 0
        const data = labels.map((label, index) => {
            const dayData = earnings.find(e => e._id === (index + 1));
            return dayData ? dayData.total : 0;
        });

        res.json({
            labels,
            data,
            period,
            totalEarnings: data.reduce((sum, val) => sum + val, 0),
            totalJobs: earnings.reduce((sum, e) => sum + e.count, 0)
        });

    } catch (error) {
        console.error('Error fetching earnings chart:', error);
        res.status(500).json({ message: 'Server error while fetching earnings data' });
    }
};

// @desc    Get incentive progress
// @route   GET /api/workers/analytics/incentives
// @access  Private (Worker)
export const getIncentiveProgress = async (req, res) => {
    try {
        const workerId = req.user._id;

        // Get today's completed jobs
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayJobs = await Booking.countDocuments({
            worker: workerId,
            status: 'completed',
            createdAt: { $gte: today }
        });

        // Get this week's completed jobs
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekJobs = await Booking.countDocuments({
            worker: workerId,
            status: 'completed',
            createdAt: { $gte: weekStart }
        });

        // Get this month's earnings
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEarnings = await Booking.aggregate([
            {
                $match: {
                    worker: workerId,
                    status: 'completed',
                    paymentStatus: 'paid',
                    createdAt: { $gte: monthStart }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        const currentMonthEarnings = monthEarnings.length > 0 ? monthEarnings[0].total : 0;

        // Define incentive targets
        const incentives = [
            {
                id: 'daily_5',
                title: 'Daily Champion',
                description: 'Complete 5 jobs today',
                target: 5,
                current: todayJobs,
                reward: '₹200 Bonus',
                progress: Math.min((todayJobs / 5) * 100, 100),
                completed: todayJobs >= 5
            },
            {
                id: 'weekly_20',
                title: 'Weekly Warrior',
                description: 'Complete 20 jobs this week',
                target: 20,
                current: weekJobs,
                reward: '₹1000 Bonus',
                progress: Math.min((weekJobs / 20) * 100, 100),
                completed: weekJobs >= 20
            },
            {
                id: 'monthly_10k',
                title: 'Monthly Master',
                description: 'Earn ₹10,000 this month',
                target: 10000,
                current: currentMonthEarnings,
                reward: '₹2000 Bonus',
                progress: Math.min((currentMonthEarnings / 10000) * 100, 100),
                completed: currentMonthEarnings >= 10000
            }
        ];

        res.json({ incentives });

    } catch (error) {
        console.error('Error fetching incentive progress:', error);
        res.status(500).json({ message: 'Server error while fetching incentive data' });
    }
};
