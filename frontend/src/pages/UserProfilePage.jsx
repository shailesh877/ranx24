import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaEdit, FaCog, FaWallet, FaMapMarkerAlt, FaHistory, FaStar, FaSignOutAlt, FaCrown } from 'react-icons/fa';
import { MdWork, MdCardMembership } from 'react-icons/md';
import { LucideShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com';

export default function UserProfilePage() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({
        totalBookings: 0,
        completedBookings: 0,
        totalSpent: 0,
        reviewsGiven: 0,
    });
    const [membership, setMembership] = useState(null);
    const [amc, setAmc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
        fetchStats();
        fetchMembership();
        fetchAMCPackage();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const { data } = await axios.get(`${API_URL}/users/profile`, config);
            setProfile(data);
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

    const fetchMembership = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const { data } = await axios.get(`${API_URL}/membership-plans/my-membership`, config);
            if (data.success) {
                setMembership(data.data);
            }
        } catch (error) {
            console.error('Error fetching membership:', error);
        }
    };

    const fetchAMCPackage = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const { data } = await axios.get(`${API_URL}/amc-plans/my-amc`, config);
            if (data.success) {
                setAmc(data.data);
            }
        } catch (error) {
            console.error('Error fetching AMC package:', error);
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
                {/* Active Membership Section */}
                {membership && (
                    <Card className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-none shadow-blue-500/20">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <FaCrown className="text-yellow-400 text-2xl" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black">{membership.plan_id?.name || 'Active Plan'}</h2>
                                    <p className="text-blue-100 text-sm font-medium">Enjoying premium benefits</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-blue-200 uppercase tracking-wider">Expires On</p>
                                <p className="text-lg font-black">{membership.expiry_date}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10">
                            {membership.plan_id?.discount_tiers?.map((tier, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm font-bold bg-white/10 p-2 rounded-xl">
                                    <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center text-[10px] text-white">✓</div>
                                    <span>{tier.discount || tier.discount_percentage}% OFF {tier.min_amount && `above ₹${tier.min_amount}`}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Active AMC Section */}
                {amc && (
                    <Card className="mb-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-none shadow-emerald-500/20">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <LucideShieldCheck className="text-emerald-300" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black">Active AMC Package</h2>
                                    <p className="text-emerald-100 text-sm font-medium">#{amc.contract_number}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Valid Till</p>
                                <p className="text-lg font-black">{amc.end_date}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-3 mt-4 pt-4 border-t border-white/10">
                            <p className="text-xs font-bold text-emerald-200 uppercase tracking-widest">Included Plans</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {amc.plans?.map((plan, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm font-bold bg-white/10 p-2 rounded-xl">
                                        <div className="w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center text-[10px] text-white">✓</div>
                                        <span>{plan.name} ({plan.service_category})</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {amc.technician_name && (
                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                        <FaUser size={12} />
                                    </div>
                                    <span className="text-xs font-bold text-emerald-100">Technician: <span className="text-white">{amc.technician_name}</span></span>
                                </div>
                                <span className="px-3 py-1 bg-emerald-500 text-[10px] font-black rounded-full uppercase tracking-widest leading-none">Status: {amc.status}</span>
                            </div>
                        )}
                    </Card>
                )}

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
