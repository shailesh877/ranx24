import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { 
    LucideArrowLeft, 
    LucideMapPin, 
    LucideSparkles, 
    LucideCalendar, 
    LucideCheck, 
    LucideUtensils, 
    LucideMusic, 
    LucideCamera, 
    LucidePaintbrush,
    LucideSmile,
    LucideLightbulb
} from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com';

export default function MarriageEventPackageDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pkg, setPkg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState('');

    useEffect(() => {
        fetchPackageDetails();
    }, [id]);

    const parseImages = (raw) => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string') {
            try {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return raw.trim() ? [raw] : [];
            }
        }
        return [];
    };

    const fetchPackageDetails = async () => {
        try {
            const { data } = await axiosInstance.get(`/marriage-event-packages/${id}`);
            const normalized = {
                ...data,
                images: parseImages(data.images),
            };
            setPkg(normalized);
            if (normalized.images && normalized.images.length > 0) {
                setActiveImage(normalized.images[0]);
            }
        } catch (error) {
            console.error('Error fetching package details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imgPath) => {
        if (!imgPath) return 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop';
        const clean = imgPath.replace(/\\/g, '/');
        return clean.startsWith('http') ? clean : `${SERVER_URL}/${clean.replace(/^\//, '')}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!pkg) {
        return (
            <div className="min-h-screen bg-gray-50 pt-32 pb-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Package Not Found</h2>
                <Link to="/marriage-event-packages" className="text-indigo-600 hover:underline">
                    Back to Packages
                </Link>
            </div>
        );
    }

    const finalPrice = pkg.discounted_price || pkg.price;
    const discount = pkg.discounted_price && pkg.price
        ? Math.round(((pkg.price - pkg.discounted_price) / pkg.price) * 100)
        : 0;

    const specs = [
        { label: 'Catering Details', content: pkg.catering_details, icon: LucideUtensils, color: 'text-orange-500 bg-orange-50' },
        { label: 'Decoration Details', content: pkg.decoration_details, icon: LucidePaintbrush, color: 'text-pink-500 bg-pink-50' },
        { label: 'Sound & DJ', content: pkg.sound_dj_details, icon: LucideMusic, color: 'text-purple-500 bg-purple-50' },
        { label: 'Photography & Videography', content: pkg.photography_videography_details, icon: LucideCamera, color: 'text-blue-500 bg-blue-50' },
        { label: 'Makeup Artist', content: pkg.makeup_details, icon: LucideSmile, color: 'text-indigo-500 bg-indigo-50' },
        { label: 'Lighting Details', content: pkg.lighting_details, icon: LucideLightbulb, color: 'text-amber-500 bg-amber-50' },
    ].filter(s => s.content && s.content.trim() !== '');

    return (
        <div className="min-h-screen bg-gray-50/50 pt-28 pb-16">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* Back Button */}
                <Link to="/marriage-event-packages" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-bold mb-8 transition-colors">
                    <LucideArrowLeft size={18} /> Back to Packages
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left Panel: Gallery & Description */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Main image */}
                        <div className="rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-lg h-[400px] md:h-[480px]">
                            <img
                                src={getImageUrl(activeImage)}
                                alt={pkg.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=800&auto=format&fit=crop'; }}
                            />
                        </div>

                        {/* Thumbnail Selector */}
                        {pkg.images && pkg.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                                {pkg.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                                            activeImage === img ? 'border-indigo-600 shadow-md' : 'border-gray-200 hover:border-indigo-300'
                                        }`}
                                    >
                                        <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Specifications & Details Grid */}
                        {specs.length > 0 && (
                            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                    <LucideSparkles className="text-indigo-600" size={24} /> Included Services
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {specs.map((s, idx) => (
                                        <div key={idx} className="p-5 rounded-2xl border border-gray-50 bg-gray-50/20 hover:border-indigo-100 transition-colors">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`p-2.5 rounded-xl ${s.color}`}>
                                                    <s.icon size={20} />
                                                </div>
                                                <h3 className="font-bold text-gray-900 text-base">{s.label}</h3>
                                            </div>
                                            <p className="text-sm text-gray-600 font-medium pl-1 leading-relaxed">
                                                {s.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Booking Summary Card */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-28 bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
                            {discount > 0 && (
                                <span className="inline-block bg-red-500 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-4 shadow-sm">
                                    Special Offer - {discount}% OFF
                                </span>
                            )}
                            <h1 className="text-3xl font-black text-gray-900 mb-2 leading-tight">
                                {pkg.name}
                            </h1>
                            {pkg.hall_name && (
                                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-6">
                                    <LucideMapPin size={16} />
                                    <span>{pkg.hall_name}</span>
                                </div>
                            )}

                            {pkg.description && (
                                <p className="text-gray-500 text-sm leading-relaxed font-medium mb-6">
                                    {pkg.description}
                                </p>
                            )}

                            <div className="bg-gray-50 p-6 rounded-3xl mb-8 border border-gray-100/50">
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Package Price</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-indigo-600">₹{finalPrice.toLocaleString('en-IN')}</span>
                                        {pkg.discounted_price && pkg.discounted_price < pkg.price && (
                                            <span className="text-base text-gray-400 line-through font-bold">₹{pkg.price.toLocaleString('en-IN')}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-green-600 pt-3 border-t border-gray-200 mt-3">
                                    <span>Booking Advance (15%)</span>
                                    <span>₹{Math.ceil(finalPrice * 0.15).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {/* CTAs */}
                            <button
                                onClick={() => navigate(`/marriage-event-booking/${pkg._id}`)}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-5 rounded-2xl text-lg font-black transition-all shadow-xl shadow-indigo-600/10 hover:shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98"
                            >
                                <LucideCalendar size={20} /> Proceed to Booking
                            </button>

                            <div className="mt-6 flex flex-col gap-3 text-xs text-gray-400 font-bold leading-relaxed px-2">
                                <div className="flex gap-2">
                                    <LucideCheck className="text-green-500 shrink-0" size={14} />
                                    <span>15% Advance booking option available.</span>
                                </div>
                                <div className="flex gap-2">
                                    <LucideCheck className="text-green-500 shrink-0" size={14} />
                                    <span>Date availability is reserved only after payment confirmation.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
