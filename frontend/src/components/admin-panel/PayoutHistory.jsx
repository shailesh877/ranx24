import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaHistory, FaRupeeSign, FaCalendarAlt, FaUser, FaBuilding } from 'react-icons/fa';

const PayoutHistory = () => {
    const [history, setHistory] = useState([]);
    const [totalPaid, setTotalPaid] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await axios.get('https://backend.ranx24.com/api/admin/payout-history', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setHistory(data.history);
            setTotalPaid(data.totalPaid);
        } catch (error) {
            console.error('Error fetching payout history:', error);
            toast.error('Failed to load payout history');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <FaHistory className="text-blue-600" />
                    Payout History
                </h1>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg border border-green-200 flex items-center gap-2">
                    <span className="text-sm font-medium">Total Paid Out:</span>
                    <span className="text-lg font-bold flex items-center">
                        <FaRupeeSign size={14} />
                        {totalPaid.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Date & Time</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Worker</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Amount</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Payment Details</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {history.length > 0 ? (
                                history.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-sm text-slate-600">
                                                <span className="font-medium text-slate-800">
                                                    {new Date(item.processedAt || item.updatedAt).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {new Date(item.processedAt || item.updatedAt).toLocaleTimeString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    {item.worker?.firstName?.[0] || 'W'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-800 text-sm">
                                                        {item.worker?.firstName} {item.worker?.lastName}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {item.worker?.mobileNumber}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-700 flex items-center text-sm">
                                                <FaRupeeSign size={12} className="mr-1" />
                                                {item.amount}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-xs">
                                                {item.worker?.bankDetails?.accountNumber ? (
                                                    <>
                                                        <div className="font-semibold text-slate-700 flex items-center gap-1">
                                                            <FaBuilding className="text-slate-400" />
                                                            {item.worker.bankDetails.bankName}
                                                        </div>
                                                        <div className="text-slate-500 font-mono">
                                                            {item.worker.bankDetails.accountNumber}
                                                        </div>
                                                        <div className="text-slate-400">
                                                            IFSC: {item.worker.bankDetails.ifscCode}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400 italic">No Bank Info</span>
                                                )}
                                                {item.worker?.upiId && (
                                                    <div className="mt-1 pt-1 border-t border-slate-100 font-mono text-blue-600">
                                                        UPI: {item.worker.upiId}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                Paid
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 text-sm">
                                        No payout history found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PayoutHistory;
