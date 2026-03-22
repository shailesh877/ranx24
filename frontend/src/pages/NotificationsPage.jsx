import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBell, FaCheckDouble, FaCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            const { data } = await axios.get(`${API_URL}/notifications`, config);
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            await axios.put(`${API_URL}/notifications/${id}/read`, {}, config);

            // Update local state
            setNotifications(prev =>
                prev.map(notif =>
                    notif._id === id ? { ...notif, read: true } : notif
                )
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            await axios.put(`${API_URL}/notifications/read-all`, {}, config);

            // Update local state
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'booking_status':
                return <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><FaBell /></div>;
            case 'payment':
                return <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600"><FaCheckDouble /></div>;
            case 'promotion':
                return <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600"><FaBell /></div>;
            default:
                return <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"><FaBell /></div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                        <p className="text-gray-600 mt-1">Stay updated with your activities</p>
                    </div>
                    {notifications.some(n => !n.read) && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={markAllAsRead}
                            icon={<FaCheckDouble />}
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton height="100px" count={5} />
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <Card
                                key={notification._id}
                                className={`transition-colors ${!notification.read ? 'bg-blue-50 border-blue-100' : 'bg-white'}`}
                                onClick={() => !notification.read && markAsRead(notification._id)}
                            >
                                <div className="flex gap-4">
                                    {/* Icon */}
                                    <div className="flex-shrink-0">
                                        {getIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`text-lg font-semibold ${!notification.read ? 'text-blue-900' : 'text-gray-900'}`}>
                                                {notification.title}
                                            </h3>
                                            <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className={`mt-1 ${!notification.read ? 'text-blue-800' : 'text-gray-600'}`}>
                                            {notification.message}
                                        </p>
                                    </div>

                                    {/* Unread Indicator */}
                                    {!notification.read && (
                                        <div className="flex-shrink-0 self-center">
                                            <FaCircle className="text-blue-600 text-xs" />
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<FaBell size={64} />}
                        title="No Notifications"
                        description="You're all caught up! Check back later for updates."
                    />
                )}
            </div>
        </div>
    );
}
