import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { LucideCalendar, LucideUser, LucideArrowLeft } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://www.ranx24.com';

const HomeTipDetail = () => {
    const { id } = useParams();
    const [tip, setTip] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTip = async () => {
            try {
                const { data } = await axiosInstance.get(`/home-tips/${id}`);
                setTip(data);
            } catch (error) {
                console.error("Error fetching home tip:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTip();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!tip) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <p className="text-gray-500 text-lg mb-4">Tip not found.</p>
                <Link to="/home-tips" className="text-blue-600 hover:underline flex items-center gap-2">
                    <LucideArrowLeft size={20} /> Back to Tips
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-10 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/home-tips" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-8 transition-colors">
                    <LucideArrowLeft size={20} className="mr-2" /> Back to All Tips
                </Link>

                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{tip.title}</h1>

                <div className="flex items-center gap-6 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-8">
                    <span className="flex items-center gap-2"><LucideCalendar size={18} /> {new Date(tip.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-2"><LucideUser size={18} /> RanX24 Expert</span>
                </div>

                <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-10 shadow-lg relative">
                    <img
                        src={tip.image && tip.image !== 'default-tip.jpg' ? `${SERVER_URL}/${tip.image}` : 'https://images.unsplash.com/photo-1581578731117-104f2a863a30?q=80&w=600&auto=format&fit=crop'}
                        alt={tip.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1581578731117-104f2a863a30?q=80&w=600&auto=format&fit=crop'; }}
                    />
                </div>

                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    {tip.content.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                </div>

                {tip.link && (
                    <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                        <h3 className="text-lg font-bold text-blue-900 mb-2">Related Information</h3>
                        <a href={tip.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                            View Link / Watch Video <span className="text-xl">↗</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeTipDetail;
