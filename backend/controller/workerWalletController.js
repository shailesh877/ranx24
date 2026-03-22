import WorkerWallet from '../model/WorkerWallet.js';
import WithdrawalRequest from '../model/WithdrawalRequest.js';

// @desc    Get worker wallet (create if not exists)
// @route   GET /api/worker-wallet
// @access  Private (Worker)
export const getWallet = async (req, res) => {
    try {
        const workerId = req.user._id;

        let wallet = await WorkerWallet.findOne({ worker: workerId }).populate('transactions.bookingId', 'service finalPrice');

        if (!wallet) {
            // Create new wallet for worker
            wallet = await WorkerWallet.create({
                worker: workerId,
                balance: 0,
                transactions: []
            });
        }

        // Sort transactions by date desc
        wallet.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(wallet);
    } catch (error) {
        console.error('Error fetching worker wallet:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Request payout (Withdraw)
// @route   POST /api/worker-wallet/payout
// @access  Private (Worker)
export const requestPayout = async (req, res) => {
    try {
        const { amount, note } = req.body;
        const workerId = req.user._id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const wallet = await WorkerWallet.findOne({ worker: workerId });

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        if (wallet.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Check if there is already a pending request
        const pendingRequest = await WithdrawalRequest.findOne({ worker: workerId, status: 'pending' });
        if (pendingRequest) {
            return res.status(400).json({ message: 'You already have a pending withdrawal request' });
        }

        // Create withdrawal request
        const withdrawal = await WithdrawalRequest.create({
            worker: workerId,
            amount,
            adminNote: note
        });

        // Deduct balance immediately
        wallet.balance -= amount;
        wallet.transactions.push({
            type: 'debit',
            amount: amount,
            description: 'Withdrawal Request',
            withdrawalRequestId: withdrawal._id,
            date: new Date()
        });

        await wallet.save();

        res.json({ message: 'Payout request submitted', wallet, withdrawal });
    } catch (error) {
        console.error('Error requesting payout:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
