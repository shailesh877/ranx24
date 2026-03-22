import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';
import { LucideCalendar, LucideUser, LucideArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://www.ranx24.com';

const HomeTips = () => {
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTips = async () => {
            try {
                const { data } = await axiosInstance.get('/home-tips');
                setTips(data);
            } catch (error) {
                console.error("Error fetching home tips:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTips();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-10 pb-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Home Maintenance Tips</h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">Expert advice to keep your home in top condition.</p>
                </div>

                {tips.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No tips found at the moment. Check back later!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tips.map((tip) => (
                            <div key={tip._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-full border border-gray-100">
                                <div className="h-56 overflow-hidden relative group">
                                    <img
                                        src={tip.image && tip.image !== 'default-tip.jpg' ? `${SERVER_URL}/${tip.image}` : 'https://images.unsplash.com/photo-1581578731117-104f2a863a30?q=80&w=600&auto=format&fit=crop'}
                                        alt={tip.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1581578731117-104f2a863a30?q=80&w=600&auto=format&fit=crop'; }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                        <span className="flex items-center gap-1"><LucideCalendar size={14} /> {new Date(tip.createdAt).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><LucideUser size={14} /> RanX24 Expert</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">{tip.title}</h3>
                                    <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed flex-1">{tip.content}</p>

                                    {/* Read More Button (Optional - currently opens updated view or just visually indicates content) */}
                                    <div className="mt-auto pt-4 border-t border-gray-50">
                                        <Link to={`/home-tips/${tip._id}`} className="text-blue-600 font-semibold text-sm flex items-center group cursor-pointer hover:underline">
                                            Read More <LucideArrowRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeTips;
