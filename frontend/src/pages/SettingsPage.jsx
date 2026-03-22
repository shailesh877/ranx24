import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaShieldAlt, FaSave, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';

export default function SettingsPage() {
    const navigate = useNavigate();

    // Notification Preferences State
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        promotional: false,
    });

    // Password Change State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleNotificationChange = (e) => {
        setNotifications({ ...notifications, [e.target.name]: e.target.checked });
    };

    const savePreferences = async () => {
        // Mock API call for preferences
        toast.success('Preferences saved successfully');
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const updatePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            toast.error("New passwords don't match");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setPasswordLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };

            await axios.put(`${API_URL}/auth/updatepassword`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, config);

            toast.success('Password updated successfully');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });
        } catch (error) {
            console.error('Update password error:', error);
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600 mt-1">Manage your account preferences</p>
                </div>

                <div className="space-y-6">
                    {/* Notification Preferences */}
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                <FaBell />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                                <p className="text-sm text-gray-600">Manage how you receive updates</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                                    <p className="text-sm text-gray-600">Receive updates via email</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="email"
                                        checked={notifications.email}
                                        onChange={handleNotificationChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-gray-900">Push Notifications</h3>
                                    <p className="text-sm text-gray-600">Receive updates on your device</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="push"
                                        checked={notifications.push}
                                        onChange={handleNotificationChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-semibold text-gray-900">Promotional Emails</h3>
                                    <p className="text-sm text-gray-600">Receive offers and newsletters</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="promotional"
                                        checked={notifications.promotional}
                                        onChange={handleNotificationChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={savePreferences} variant="outline" icon={<FaSave />}>
                                    Save Preferences
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Security Settings (Change Password) */}
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <FaLock />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Security</h2>
                                <p className="text-sm text-gray-600">Update your password and security settings</p>
                            </div>
                        </div>

                        <form onSubmit={updatePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmNewPassword"
                                    value={passwordData.confirmNewPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit" variant="primary" loading={passwordLoading} icon={<FaSave />}>
                                    Update Password
                                </Button>
                            </div>
                        </form>
                    </Card>

                    {/* Privacy & Data */}
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                <FaShieldAlt />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Privacy & Data</h2>
                                <p className="text-sm text-gray-600">Manage your data and privacy</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                <h3 className="font-bold text-red-800 mb-2">Delete Account</h3>
                                <p className="text-sm text-red-600 mb-4">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                                <Button variant="danger" size="sm">
                                    Delete Account
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
