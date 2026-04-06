import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEdit, FaCog, FaWallet, FaMapMarkerAlt, FaHistory, FaStar, FaSignOutAlt, FaCrown } from 'react-icons/fa';
import { MdWork, MdCardMembership } from 'react-icons/md';
import { LucideShieldCheck, LucideCalendarCheck, LucideAlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import axiosInstance, { getRazorpayConfig } from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import MembershipCard from '../components/MembershipCard';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com';

export default function UserProfilePage() {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({
        totalBookings: 0,
        completedBookings: 0,
        totalSpent: 0,
        reviewsGiven: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
        fetchStats();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await axiosInstance.get(`/users/profile`);
            setProfile(data);
            // Update AuthContext user data to stay in sync with the latest membership/AMC info
            if (typeof updateUser === 'function') {
                updateUser(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            // Fetch bookings to calculate stats
            const bookingsRes = await axios.get(`${API_URL}/bookings/my`, config);
            const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data.data || []);

            const completed = bookings.filter(b => b.status === 'completed').length;
            const totalSpent = bookings
                .filter(b => b.paymentStatus === 'paid')
                .reduce((sum, b) => sum + (b.finalPrice || 0), 0);

            // Fetch reviews
            const reviewsRes = await axios.get(`${API_URL}/reviews/my`, config);

            setStats({
                totalBookings: bookings.length,
                completedBookings: completed,
                totalSpent,
                reviewsGiven: reviewsRes.data.length,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };


    const handlePayInstallment = async (installment) => {
        try {
            const razorpayKey = await getRazorpayConfig();
            
            // 1. Create Order
            const { data: orderData } = await axiosInstance.post(
                `/payment/order`,
                { amount: Math.round(installment.amount_due) }
            );

            // 2. Open Razorpay
            const options = {
                key: razorpayKey,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "RanX24",
                description: `AMC EMI Installment #${installment.installment_number}`,
                order_id: orderData.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await axiosInstance.post(
                            `/payment/verify`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                isInstallmentPayment: true,
                                installmentId: installment._id
                            }
                        );

                        if (verifyRes.data.success) {
                            toast.success(`Installment #${installment.installment_number} Paid Successfully!`);
                            fetchProfile(); // Refresh Data
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch (err) {
                        toast.error('Payment failed');
                    }
                },
                theme: { color: "#4F46E5" }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            toast.error('Error initiating EMI payment');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <Skeleton height="200px" className="mb-6" />
                    <Skeleton height="150px" count={2} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Profile Header */}
                <Card className="mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                                {profile?.profileImage ? (
                                    <img
                                        src={`${SERVER_URL}/${profile.profileImage}`}
                                        alt={profile.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FaUser className="text-blue-600 text-4xl" />
                                )}
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                {profile?.name || user?.name}
                            </h1>
                            <p className="text-gray-600 mb-2">{profile?.email || user?.email}</p>
                            <p className="text-gray-600">{profile?.phone || user?.phone}</p>
                        </div>

                        {/* Edit Button */}
                        <Button
                            variant="outline"
                            onClick={() => navigate('/edit-profile')}
                            icon={<FaEdit />}
                        >
                            Edit Profile
                        </Button>
                    </div>
                </Card>
                {/* Active Membership Section - Supports multiple plans (Gold, Silver, etc.) */}
                {profile?.memberships?.map((membership, index) => (
                    <div key={membership._id || index} className="mb-8 flex flex-col items-center">
                        <div className="w-full flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {membership.planName} Exclusive Membership
                            </h2>
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase tracking-widest">Active</span>
                        </div>
                        <MembershipCard 
                            userName={profile.name || user?.name}
                            cardNumber={membership.card_number}
                            expiryDate={membership.expiry_date}
                            planName={membership.planName}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 w-full">
                            {membership.planDetails?.discount_tiers?.map((tier, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm font-bold bg-white border border-gray-100 shadow-sm p-3 rounded-2xl">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-[10px] text-white">✓</div>
                                    <span className="text-gray-700">{tier.discount || tier.discount_percentage}% OFF {tier.min_amount && `above ₹${tier.min_amount}`}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Active AMC Section - Supports multiple AMCs */}
                {profile?.amcs?.map((amc, index) => (
                    <Card key={amc._id || index} className="mb-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-none shadow-emerald-500/20">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <LucideShieldCheck className="text-emerald-300" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black">{amc.planName} AMC</h2>
                                    <p className="text-emerald-100 text-sm font-medium">#{amc.contract_number}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Valid Till</p>
                                <p className="text-lg font-black">{amc.expiry}</p>
                            </div>
                        </div>
                        
                        {amc.plans_data && amc.plans_data.length > 0 && (
                            <div className="space-y-3 mt-4 pt-4 border-t border-white/10">
                                <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">Included Details</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {amc.plans_data.map((p, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm font-bold bg-white/10 p-2 rounded-xl">
                                            <div className="w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center text-[10px] text-white">✓</div>
                                            <span>{p.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <FaUser size={12} />
                                </div>
                                <span className="text-xs font-bold text-emerald-100">Technician: <span className="text-white">{amc.technician_name || 'Assigned Soon'}</span></span>
                            </div>
                            <span className="px-3 py-1 bg-emerald-500 text-[10px] font-black rounded-full uppercase tracking-widest leading-none">Status: {amc.status}</span>
                        </div>

                        {/* Installments Block if EMI */}
                        {amc.payment_mode === 'EMI' && amc.installments && amc.installments.length > 0 && (
                            <div className="bg-white/10 p-4 rounded-b-2xl mt-4 border-t border-emerald-400/30">
                                <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-3">Installment Schedule</p>
                                <div className="space-y-3">
                                    {amc.installments.map((inst, idx) => {
                                        const isPaid = inst.status === 'Paid';
                                        const isOverdue = new Date(inst.due_date) < new Date() && !isPaid;
                                        return (
                                            <div key={idx} className="flex justify-between items-center border-b border-emerald-400/20 pb-2 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="text-sm font-bold text-white">Installment #{inst.installment_number}</p>
                                                    <p className="text-[10px] text-emerald-100 uppercase tracking-wider">
                                                        Due: {new Date(inst.due_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-black text-xl">₹{Math.round(inst.amount_due)}</span>
                                                    {isPaid ? (
                                                        <span className="flex flex-col items-center ml-2 bg-emerald-500/50 p-1.5 rounded-lg px-3 border border-emerald-400">
                                                            <LucideCalendarCheck size={14} className="text-white" />
                                                            <span className="text-[9px] text-white font-black uppercase mt-1">Paid</span>
                                                        </span>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handlePayInstallment(inst)}
                                                            className={`ml-2 text-xs font-black uppercase tracking-widest py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm ${
                                                                isOverdue ? 'bg-red-500 hover:bg-red-600 text-white border border-red-400' : 'bg-white hover:bg-emerald-50 text-emerald-700'
                                                            }`}
                                                        >
                                                            {isOverdue && <LucideAlertCircle size={12} />}
                                                            Pay Now
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </Card>
                ))}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                            {stats.totalBookings}
                        </div>
                        <div className="text-sm text-gray-600">Total Bookings</div>
                    </Card>
                    <Card className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                            {stats.completedBookings}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                    </Card>
                    <Card className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                            ₹{stats.totalSpent.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Spent</div>
                    </Card>
                    <Card className="text-center">
                        <div className="text-3xl font-bold text-yellow-600 mb-1">
                            {stats.reviewsGiven}
                        </div>
                        <div className="text-sm text-gray-600">Reviews Given</div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                            onClick={() => navigate('/my-bookings')}
                            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                        >
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <MdWork className="text-blue-600 text-xl" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">My Bookings</div>
                                <div className="text-sm text-gray-600">View all your bookings</div>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/user-wallet')}
                            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                        >
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <FaWallet className="text-green-600 text-xl" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">Wallet & Coins</div>
                                <div className="text-sm text-gray-600">Manage your wallet</div>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/my-address')}
                            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                        >
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <FaMapMarkerAlt className="text-purple-600 text-xl" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">My Addresses</div>
                                <div className="text-sm text-gray-600">Manage saved addresses</div>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/help')}
                            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                        >
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <FaStar className="text-yellow-600 text-xl" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">Help & Support</div>
                                <div className="text-sm text-gray-600">Get assistance</div>
                            </div>
                        </button>
                    </div>
                </Card>

                {/* Settings & Logout */}
                <Card>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/settings')}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <FaCog className="text-gray-600 text-xl" />
                                <span className="font-semibold text-gray-900">Settings</span>
                            </div>
                            <span className="text-gray-400">→</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        >
                            <div className="flex items-center gap-3">
                                <FaSignOutAlt className="text-xl" />
                                <span className="font-semibold">Logout</span>
                            </div>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
