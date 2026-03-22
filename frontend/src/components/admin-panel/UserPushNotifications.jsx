import React, { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Send, Users, Bell } from 'lucide-react';

export default function UserPushNotifications() {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        image: ''
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/notifications/broadcast', {
                ...formData,
                recipientModel: 'User'
            });
            toast.success('Notification sent to all users!');
            setFormData({ title: '', message: '', image: '' });
        } catch (error) {
            console.error('Error sending notification:', error);
            toast.error(error.response?.data?.message || 'Failed to send notification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
                    <Users className="w-8 h-8" />
                    User Push Notifications
                </h1>
                <p className="text-gray-600 mt-2">Send offers, updates, and alerts to all registered users.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-blue-600" />
                        Compose Message
                    </h2>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notification Title
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="e.g., Special Weekend Offer! 🎉"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message Body
                            </label>
                            <textarea
                                required
                                rows="4"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                placeholder="Enter your message here..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Image URL (Optional)
                            </label>
                            <input
                                type="url"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="https://example.com/image.jpg"
                            />
                            <p className="mt-1 text-xs text-gray-500">Provide a direct link to an image to include it in the notification.</p>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all
                                    ${loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:transform active:scale-[0.98]'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send to All Users
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Tips for higher engagement:</h3>
                <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                    <li>Keep titles short and catchy (under 40 characters).</li>
                    <li>Use emojis to grab attention 🚀.</li>
                    <li>Send notifications during peak usage hours (e.g., evenings or weekends).</li>
                    <li>Include clear calls to action in the message.</li>
                </ul>
            </div>
        </div>
    );
}
