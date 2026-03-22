import React, { useState } from 'react';
import { LucideMail, LucidePhone, LucideMapPin, LucideSend, LucideCheckCircle, LucideFacebook, LucideInstagram, LucideYoutube } from 'lucide-react';
import axiosInstance from '../utils/axiosConfig';
import { toast } from 'react-hot-toast';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Assuming there's a support endpoint, otherwise just simulate success for now
            // await axiosInstance.post('/support/contact', formData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setSubmitted(true);
            toast.success('Message sent successfully!');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Have questions about our services? We're here to help. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Contact Information */}
                    <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-lg h-full">
                        <h2 className="text-2xl font-bold mb-8">Contact Information</h2>

                        <div className="space-y-8">
                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-500 p-3 rounded-lg">
                                    <LucidePhone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Phone</h3>
                                    <p className="text-blue-100">+91 9546806196</p>

                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-500 p-3 rounded-lg">
                                    <LucideMail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Email</h3>
                                    <p className="text-blue-100">support@ranx24.com</p>
                                    <p className="text-blue-100">info@ranx24.com</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-500 p-3 rounded-lg">
                                    <LucideMapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Office</h3>
                                    <p className="text-blue-100">
                                        Shubhankarpur,Patahi, Muzaffarpur,<br />
                                        Bihar,
                                        India - 843113
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16">
                            <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
                            <div className="flex space-x-4">
                                <a href="https://www.facebook.com/profile.php?id=61584155575066" target="_blank" rel="noopener noreferrer" className="bg-blue-500 p-2 rounded-full hover:bg-blue-400 transition-colors text-white">
                                    <span className="sr-only">Facebook</span>
                                    <LucideFacebook size={24} />
                                </a>
                                <a href="https://www.instagram.com/ranx24homeservice/" target="_blank" rel="noopener noreferrer" className="bg-blue-500 p-2 rounded-full hover:bg-blue-400 transition-colors text-white">
                                    <span className="sr-only">Instagram</span>
                                    <LucideInstagram size={24} />
                                </a>
                                <a href="https://www.youtube.com/@RanX24" target="_blank" rel="noopener noreferrer" className="bg-blue-500 p-2 rounded-full hover:bg-blue-400 transition-colors text-white">
                                    <span className="sr-only">YouTube</span>
                                    <LucideYoutube size={24} />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                        {submitted ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-12">
                                <div className="bg-green-100 p-4 rounded-full mb-6">
                                    <LucideCheckCircle size={48} className="text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h2>
                                <p className="text-gray-600 mb-8">Thank you for contacting us. We will get back to you shortly.</p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="text-blue-600 font-semibold hover:text-blue-700"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            required
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="How can we help?"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                        <textarea
                                            name="message"
                                            required
                                            rows="5"
                                            value={formData.message}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                            placeholder="Tell us more about your inquiry..."
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                        ) : (
                                            <>
                                                <span>Send Message</span>
                                                <LucideSend size={18} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
