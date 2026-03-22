import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Briefcase,
    Download
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import api from '../../services/api';

const FinanceManagement = () => {
    const { stats, loading } = useAdmin();
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        // Fetch recent transactions if API exists, for now we simulate or use withdrawals
        // fetchTransactions();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading finance data...</div>;

    const wallet = stats.wallet || {};

    const cardData = [
        {
            title: 'Total Collected',
            amount: wallet.totalIn || 0,
            icon: ArrowUpRight,
            color: 'bg-emerald-500',
            textColor: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            desc: 'Total payment received from users'
        },
        {
            title: 'Pending Payments',
            amount: wallet.pending || 0,
            icon: Clock,
            color: 'bg-amber-500',
            textColor: 'text-amber-600',
            bgColor: 'bg-amber-50',
            desc: 'Completed jobs not yet paid'
        },
        {
            title: 'Paid to Workers',
            amount: wallet.totalOut || 0,
            icon: ArrowDownRight,
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            desc: 'Total payouts processed'
        },
        {
            title: 'Available Balance',
            amount: wallet.available || 0,
            icon: Wallet,
            color: 'bg-indigo-500',
            textColor: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            desc: 'Current platform holdings'
        }
    ];

    const pieData = [
        { name: 'Collected', value: wallet.totalIn || 0 },
        { name: 'Pending', value: wallet.pending || 0 },
        { name: 'Paid Out', value: wallet.totalOut || 0 },
    ];
    const COLORS = ['#10B981', '#F59E0B', '#3B82F6'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Finance Overview</h2>
                    <p className="text-slate-500">Manage and track all financial activities</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition">
                    <Download size={18} />
                    <span>Download Report</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cardData.map((card, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-lg ${card.bgColor} ${card.textColor}`}>
                                <card.icon size={24} />
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.textColor} bg-opacity-10`}>
                                INR
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-800 mb-1">
                            ₹{card.amount.toLocaleString('en-IN')}
                        </h3>
                        <p className="text-sm font-medium text-slate-500">{card.title}</p>
                        <p className="text-xs text-slate-400 mt-2">{card.desc}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Distribution Chart */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Payment Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quick Actions / Info */}
                <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-xl shadow-lg text-white">
                    <h3 className="text-lg font-bold mb-4">Financial Actions</h3>
                    <p className="text-slate-300 mb-6">
                        Generate reports, manage withdrawal requests, or configure payment settings.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/20 transition cursor-pointer">
                            <div className="flex items-center gap-3 mb-2">
                                <Wallet size={20} className="text-emerald-400" />
                                <h4 className="font-semibold">Withdrawals</h4>
                            </div>
                            <p className="text-xs text-slate-400">Manage worker pay-out requests</p>
                        </div>

                        <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10 hover:bg-white/20 transition cursor-pointer">
                            <div className="flex items-center gap-3 mb-2">
                                <Briefcase size={20} className="text-blue-400" />
                                <h4 className="font-semibold">Platform Fees</h4>
                            </div>
                            <p className="text-xs text-slate-400">Configure platform commission rates</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceManagement;
