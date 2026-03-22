import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

export default function WithdrawalManagement() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const [filter, setFilter] = useState('all');

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/admin/withdrawals');
            setRequests(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching withdrawal requests:', err);
            setError('Failed to load withdrawal requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this withdrawal?')) return;

        setProcessingId(id);
        try {
            await api.put(`/admin/withdrawals/${id}/approve`);
            fetchRequests();
        } catch (err) {
            console.error('Error approving withdrawal:', err);
            alert('Failed to approve withdrawal');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt('Enter reason for rejection:');
        if (reason === null) return; // Cancelled

        setProcessingId(id);
        try {
            await api.put(`/admin/withdrawals/${id}/reject`, { reason });
            fetchRequests();
        } catch (err) {
            console.error('Error rejecting withdrawal:', err);
            alert('Failed to reject withdrawal');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true;
        return req.status === filter;
    });

    if (loading) return <div className="p-8 text-center">Loading requests...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Withdrawal Requests</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage worker payout requests</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {['all', 'pending', 'approved', 'rejected'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer ${filter === f
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchRequests}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Refresh"
                    >
                        <Clock size={20} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 border-b border-red-100 flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4 text-left">Worker</th>
                            <th className="px-6 py-4 text-left">Amount</th>
                            <th className="px-6 py-4 text-left">Status</th>
                            <th className="px-6 py-4 text-left">Date</th>
                            <th className="px-6 py-4 text-left">Bank Details</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredRequests.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                    No {filter !== 'all' ? filter : ''} withdrawal requests found
                                </td>
                            </tr>
                        ) : (
                            filteredRequests.map((request) => (
                                <tr key={request._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">
                                            {request.worker?.firstName} {request.worker?.lastName}
                                        </div>
                                        <div className="text-xs text-slate-500">{request.worker?.mobileNumber}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-slate-900">₹{request.amount}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${request.status === 'approved'
                                            ? 'bg-green-50 text-green-700 border-green-100'
                                            : request.status === 'rejected'
                                                ? 'bg-red-50 text-red-700 border-red-100'
                                                : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                            }`}>
                                            {request.status === 'approved' && <CheckCircle size={12} />}
                                            {request.status === 'rejected' && <XCircle size={12} />}
                                            {request.status === 'pending' && <Clock size={12} />}
                                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                        </span>
                                        {request.adminNote && (
                                            <div className="text-xs text-red-500 mt-1">Note: {request.adminNote}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                        <div className="text-xs text-slate-400">
                                            {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        <div className="flex flex-col gap-1 text-xs">
                                            {request.worker?.bankDetails?.accountNumber ? (
                                                <>
                                                    <div className="font-semibold text-slate-700">{request.worker.bankDetails.bankName}</div>
                                                    <div>A/C: <span className="font-mono text-slate-800">{request.worker.bankDetails.accountNumber}</span></div>
                                                    <div>IFSC: <span className="font-mono text-slate-800">{request.worker.bankDetails.ifscCode}</span></div>
                                                    <div>Holder: {request.worker.bankDetails.accountHolderName}</div>
                                                </>
                                            ) : (
                                                <div className="text-slate-400 italic">No Bank Info</div>
                                            )}
                                            {request.worker?.upiId && (
                                                <div className="mt-1 pt-1 border-t border-slate-100">
                                                    UPI: <span className="font-semibold text-blue-600 shadow-sm px-1 bg-blue-50 rounded">{request.worker.upiId}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {request.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleApprove(request._id)}
                                                    disabled={processingId === request._id}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(request._id)}
                                                    disabled={processingId === request._id}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                                    title="Reject"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
