import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { LucideSearch, LucideMapPin, LucideArrowRight, LucideInfo, LucideSparkles, LucideCalendar } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com';

export default function MarriageEventPackagesPage() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPackages();
    }, []);

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

    const fetchPackages = async () => {
        try {
            const { data } = await axiosInstance.get('/marriage-event-packages');
            const normalized = data.map((p) => ({
                ...p,
                images: parseImages(p.images),
            }));
            setPackages(normalized);
        } catch (error) {
            console.error('Error fetching packages:', error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imgPath) => {
        if (!imgPath) return 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600&auto=format&fit=crop';
        const clean = imgPath.replace(/\\/g, '/');
        return clean.startsWith('http') ? clean : `${SERVER_URL}/${clean.replace(/^\//, '')}`;
    };

    const filtered = packages.filter((pkg) =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg.hall_name && pkg.hall_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pt-28 pb-16">
            {/* Hero section */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-16 relative overflow-hidden mb-12">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-950/80 to-blue-900/90"></div>

                <div className="container mx-auto px-6 md:px-12 relative z-10 text-center">
                    <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-500/30">
                        <LucideSparkles size={14} /> Elegant Celebrations
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                        Marriage & Event Packages
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8 font-medium">
                        Book premium lawns, banquets, catering, decor, and full execution plans in a single click.
                    </p>

                    {/* Search bar */}
                    <div className="max-w-xl mx-auto bg-white rounded-2xl p-2 flex shadow-xl border border-gray-100">
                        <div className="flex-grow flex items-center px-4">
                            <LucideSearch className="text-gray-400 mr-3" size={20} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by venue or package name..."
                                className="w-full py-2 outline-none text-gray-700 placeholder-gray-400 font-medium"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-3xl h-96 shadow-sm border border-gray-100 animate-pulse"></div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-lg mx-auto">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <LucideInfo className="text-gray-400" size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Packages Found</h3>
                        <p className="text-gray-500 font-medium px-6">
                            We couldn't find any packages matching "{searchTerm}". Try exploring other venues.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map((pkg) => {
                            const firstImage = pkg.images?.[0] ? getImageUrl(pkg.images[0]) : '';
                            const finalPrice = pkg.discounted_price || pkg.price;
                            const discount = pkg.discounted_price && pkg.price
                                ? Math.round(((pkg.price - pkg.discounted_price) / pkg.price) * 100)
                                : 0;

                            return (
                                <div 
                                    key={pkg._id} 
                                    className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group h-full"
                                >
                                    {/* Image Wrapper */}
                                    <div className="h-56 relative overflow-hidden shrink-0">
                                        <img
                                            src={firstImage}
                                            alt={pkg.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600&auto=format&fit=crop'; }}
                                        />
                                        {discount > 0 && (
                                            <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg">
                                                {discount}% OFF
                                            </span>
                                        )}
                                        {pkg.hall_name && (
                                            <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl text-white flex items-center gap-1.5 text-xs font-semibold">
                                                <LucideMapPin size={14} className="text-blue-300" />
                                                <span className="truncate">{pkg.hall_name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Body */}
                                    <div className="p-6 flex-grow flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
                                                {pkg.name}
                                            </h3>
                                            {pkg.description && (
                                                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
                                                    {pkg.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pricing starting at</span>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-2xl font-black text-indigo-600">₹{finalPrice.toLocaleString('en-IN')}</span>
                                                    {pkg.discounted_price && pkg.discounted_price < pkg.price && (
                                                        <span className="text-sm text-gray-400 line-through">₹{pkg.price.toLocaleString('en-IN')}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <Link
                                                to={`/marriage-event-package/${pkg._id}`}
                                                className="bg-gray-900 text-white p-3 rounded-2xl group-hover:bg-blue-600 transition-all shadow-md group-hover:shadow-blue-500/20 active:scale-95"
                                            >
                                                <LucideArrowRight size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
