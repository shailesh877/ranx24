import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { useLocation } from '../context/LocationContext';
import { LucideSearch, LucideArrowRight, LucideArrowLeft } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com';

export default function CategoriesPage() {
    const navigate = useNavigate();
    const { location } = useLocation();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();
    }, [location]);

    const fetchCategories = async () => {
        try {
            const params = new URLSearchParams();
            if (location.latitude && location.longitude) {
                params.append('latitude', location.latitude);
                params.append('longitude', location.longitude);
                if (location.city) params.append('city', location.city);
            }

            const { data } = await axiosInstance.get(`/categories?${params.toString()}`);
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-blue-900 text-white py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581578731117-104f2a863a30?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/90 to-blue-900/95"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6">Explore Our Services</h1>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10">
                        Find the right professional for every job, from cleaning to repairs.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto bg-white rounded-full p-2 flex shadow-xl">
                        <div className="flex-grow flex items-center px-4 md:px-6">
                            <LucideSearch className="text-gray-400 mr-3" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search for a service..."
                                className="w-full py-2 outline-none text-gray-700 placeholder-gray-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 -mt-10 relative z-20">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl h-80 shadow-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredCategories.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <LucideSearch className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
                        <p className="text-gray-500 mb-6">We couldn't find any services matching "{searchTerm}"</p>
                        <div className="flex flex-col items-center gap-4">
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-blue-600 font-medium hover:underline"
                            >
                                Clear Search
                            </button>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors"
                            >
                                <LucideArrowLeft size={16} />
                                Back to Home
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredCategories.map((category) => (
                            <Link key={category._id} to={`/category/${category._id}`} className="group">
                                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden h-full flex flex-col">
                                    <div className="h-48 overflow-hidden relative">
                                        <img
                                            src={`${SERVER_URL}/${category.image}`}
                                            alt={category.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => { e.target.src = 'https://placehold.co/300?text=' + category.name; }}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                    </div>
                                    <div className="p-5 flex-grow flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{category.name}</h3>
                                            <p className="text-sm text-gray-500">Professional {category.name} services</p>
                                        </div>
                                        <div className="mt-4 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                            Book Now <LucideArrowRight size={14} className="ml-1" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
