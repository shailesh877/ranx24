import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCalendarCheck, FaWallet, FaMapMarkerAlt, FaHeadset, FaClock, FaArrowRight } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

export default function UserDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: 'User', email: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/otp-login');
        }
        // Ideally fetch user data here
    }, [navigate]);

    const dashboardItems = [
        {
            title: 'My Bookings',
            icon: <FaCalendarCheck />,
            desc: 'View and manage your service bookings',
            link: '/my-bookings',
            color: 'bg-blue-50 text-blue-600',
            btnVariant: 'primary'
        },
        {
            title: 'My Wallet',
            icon: <FaWallet />,
            desc: 'Check balance and transaction history',
            link: '/user-wallet',
            color: 'bg-purple-50 text-purple-600',
            btnVariant: 'secondary' // Assuming secondary is purple-ish or neutral
        },
        {
            title: 'My Address',
            icon: <FaMapMarkerAlt />,
            desc: 'Manage your saved addresses',
            link: '/my-address',
            color: 'bg-green-50 text-green-600',
            btnVariant: 'success'
        },
        {
            title: 'Help & Support',
            icon: <FaHeadset />,
            desc: 'Get help with your orders',
            link: '/user-help',
            color: 'bg-orange-50 text-orange-600',
            btnVariant: 'warning'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-[Poppins]">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">My Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back! Manage your account and services here.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dashboardItems.map((item, index) => (
                        <Card key={index} className="hover:shadow-lg transition-all duration-300 border-transparent">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 ${item.color}`}>
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-500 text-sm mb-6 min-h-[40px]">{item.desc}</p>
                            <Button
                                fullWidth
                                variant={item.btnVariant === 'secondary' ? 'outline' : 'primary'} // Simplified for now as Button might not have all variants
                                onClick={() => navigate(item.link)}
                                icon={<FaArrowRight />}
                            >
                                View Details
                            </Button>
                        </Card>
                    ))}
                </div>

                {/* Recent Activity Section */}
                <div className="mt-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                        <Link to="/my-bookings" className="text-blue-600 font-medium hover:underline flex items-center gap-1">
                            View All <FaArrowRight size={12} />
                        </Link>
                    </div>

                    <Card className="py-12">
                        <EmptyState
                            icon={<FaClock size={48} className="text-gray-300" />}
                            title="No recent activity"
                            description="You haven't booked any services recently."
                            action={
                                <Button onClick={() => navigate('/categories')}>
                                    Book a Service Now
                                </Button>
                            }
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
}
