import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CoinsManagement = () => {
    const [activeTab, setActiveTab] = useState('config');
    const [config, setConfig] = useState(null);
    const [users, setUsers] = useState([]);
    const [userBalances, setUserBalances] = useState([]);
    const [loading, setLoading] = useState(false);

    // Coin distribution
    const [selectedUser, setSelectedUser] = useState('');
    const [individualAmount, setIndividualAmount] = useState('');
    const [individualReason, setIndividualReason] = useState('');
    const [bulkAmount, setBulkAmount] = useState('');
    const [bulkReason, setBulkReason] = useState('');

    useEffect(() => {
        fetchConfig();
        fetchUsers();
        fetchUserBalances();
    }, []);

    const fetchConfig = async () => {
        try {
            const { data } = await api.get('/coins/config');
            setConfig(data);
        } catch (error) {
            console.error('Error fetching config:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchUserBalances = async () => {
        try {
            const { data } = await api.get('/coins/users');
            setUserBalances(data);
        } catch (error) {
            console.error('Error fetching balances:', error);
        }
    };

    const handleConfigUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put('/coins/config', config);
            toast.success('Configuration updated successfully');
            fetchConfig();
        } catch (error) {
            toast.error('Failed to update configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleCreditToUser = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/coins/credit-user', {
                userId: selectedUser,
                amount: parseInt(individualAmount),
                reason: individualReason
            });

            toast.success('Coins credited successfully');
            setSelectedUser('');
            setIndividualAmount('');
            setIndividualReason('');
            fetchUserBalances();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to credit coins');
        } finally {
            setLoading(false);
        }
    };

    const handleCreditToAll = async (e) => {
        e.preventDefault();

        if (!window.confirm(`Are you sure you want to credit ${bulkAmount} coins to ALL users?`)) {
            return;
        }

        setLoading(true);

        try {
            const { data } = await api.post('/coins/credit-all', {
                amount: parseInt(bulkAmount),
                reason: bulkReason
            });

            toast.success(`${data.message}`);
            setBulkAmount('');
            setBulkReason('');
            fetchUserBalances();
        } catch (error) {
            toast.error('Failed to credit coins to all users');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">YC Coins Management</h2>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
                {['config', 'distribute', 'balances'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-semibold transition cursor-pointer ${activeTab === tab
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 hover:text-blue-600'
                            }`}
                    >
                        {tab === 'config' && '⚙️ Configuration'}
                        {tab === 'distribute' && '💰 Distribute Coins'}
                        {tab === 'balances' && '👥 User Balances'}
                    </button>
                ))}
            </div>

            {/* Configuration Tab */}
            {activeTab === 'config' && config && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <form onSubmit={handleConfigUpdate} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Coin to Rupee Rate
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">1 Coin =</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={config.coinToRupeeRate}
                                        onChange={(e) => setConfig({ ...config, coinToRupeeRate: parseFloat(e.target.value) })}
                                        className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        min="0.01"
                                    />
                                    <span className="text-lg">₹</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Max Usage % in Booking
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={config.maxUsagePercentage}
                                        onChange={(e) => setConfig({ ...config, maxUsagePercentage: parseInt(e.target.value) })}
                                        className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                        max="100"
                                    />
                                    <span className="text-lg">%</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Welcome Bonus (Coins)
                                </label>
                                <input
                                    type="number"
                                    value={config.welcomeBonus}
                                    onChange={(e) => setConfig({ ...config, welcomeBonus: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Referral Bonus (Coins)
                                </label>
                                <input
                                    type="number"
                                    value={config.referralBonus}
                                    onChange={(e) => setConfig({ ...config, referralBonus: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Cashback Percentage
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={config.cashbackPercentage}
                                        onChange={(e) => setConfig({ ...config, cashbackPercentage: parseInt(e.target.value) })}
                                        className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                        max="100"
                                    />
                                    <span className="text-lg">%</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Coin Expiry (Months)
                                </label>
                                <input
                                    type="number"
                                    value={config.coinExpiryMonths}
                                    onChange={(e) => setConfig({ ...config, coinExpiryMonths: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </form>
                </div>
            )}

            {/* Distribute Tab */}
            {activeTab === 'distribute' && (
                <div className="grid grid-cols-2 gap-6">
                    {/* Individual User */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">📤 Credit to Individual User</h3>
                        <form onSubmit={handleCreditToUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Select User</label>
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Choose a user...</option>
                                    {users.map((user) => (
                                        <option key={user._id} value={user._id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (Coins)</label>
                                <input
                                    type="number"
                                    value={individualAmount}
                                    onChange={(e) => setIndividualAmount(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason</label>
                                <textarea
                                    value={individualReason}
                                    onChange={(e) => setIndividualReason(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? 'Sending...' : 'Send Coins'}
                            </button>
                        </form>
                    </div>

                    {/* Bulk Distribution */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">📢 Credit to All Users</h3>
                        <form onSubmit={handleCreditToAll} className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <p className="text-sm text-yellow-800">
                                    <i className="fa-solid fa-exclamation-triangle mr-2"></i>
                                    This will credit coins to ALL users in the system.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount per User (Coins)</label>
                                <input
                                    type="number"
                                    value={bulkAmount}
                                    onChange={(e) => setBulkAmount(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason</label>
                                <textarea
                                    value={bulkReason}
                                    onChange={(e) => setBulkReason(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? 'Processing...' : 'Credit to ALL Users'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Balances Tab */}
            {activeTab === 'balances' && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {userBalances.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                            🪙 {user.coins}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(user.updatedAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CoinsManagement;
