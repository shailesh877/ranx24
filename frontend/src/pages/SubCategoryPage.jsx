import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { LucideSearch, LucideArrowLeft, LucideCheck, LucideClock, LucideX } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com';

export default function SubCategoryPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [subCategoryName, setSubCategoryName] = useState('');
    const [selectedServiceDesc, setSelectedServiceDesc] = useState(null);

    useEffect(() => {
        fetchServices();
    }, [id]);

    const fetchServices = async () => {
        try {
            const { data } = await axiosInstance.get(`/services?subCategory=${id}`);
            setServices(data);

            if (data.length > 0 && data[0].subCategory) {
                setSubCategoryName(data[0].subCategory.name);
            } else {
                setSubCategoryName('Services');
            }

        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredServices = services.filter((service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const { addToCart } = useCart();

    const handleQuickAddToCart = (service) => {
        const bookingItem = {
            workerId: null,
            workerName: "Pending Assignment",
            serviceName: service.name,
            serviceId: service._id,
            category: service.category?.name || subCategoryName,
            date: "Pending",
            time: "Pending",
            duration: 1,
            price: service.basePrice,
            totalPrice: service.basePrice,
            address: "Pending",
            image: service.image,
            isPendingDetails: true // Flag to identify incomplete items
        };

        addToCart(bookingItem);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-blue-900 text-white py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581578731117-104f2a863a30?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/90 to-blue-900/95"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{subCategoryName}</h1>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8">
                        Select a service to book your professional.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-lg mx-auto bg-white rounded-full p-2 flex shadow-xl">
                        <div className="flex-grow flex items-center px-4">
                            <LucideSearch className="text-gray-400 mr-3" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search services..."
                                className="w-full py-2 outline-none text-gray-700 placeholder-gray-400"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 -mt-8 relative z-20">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl h-64 shadow-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                            <LucideSearch className="text-gray-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
                        <p className="text-gray-500 mb-6">We couldn't find any services matching "{searchTerm}"</p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="text-blue-600 font-medium hover:underline"
                        >
                            Clear Search
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredServices.map((service) => (
                            <div key={service._id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col">
                                <div className="h-48 overflow-hidden relative bg-gray-100">
                                    <img
                                        src={`${SERVER_URL}/${service.image?.replace(/\\/g, '/')}`}
                                        alt={service.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = 'https://placehold.co/1500?text=Service'; }}
                                    />
                                </div>

                                <div className="p-5 flex-grow flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{service.name}</h3>
                                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                                            ₹{service.basePrice}
                                        </span>
                                    </div>

                                    <div className="mb-4 flex-grow">
                                        <p className="text-gray-500 text-sm">
                                            {service.description?.length > 80
                                                ? `${service.description.substring(0, 80)}... `
                                                : (service.description || 'Professional service with verified experts.')}
                                            {service.description?.length > 80 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedServiceDesc(service);
                                                    }}
                                                    className="text-blue-600 font-semibold hover:underline text-xs"
                                                >
                                                    See More
                                                </button>
                                            )}
                                        </p>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-xs text-gray-500">
                                            <LucideCheck size={14} className="text-green-500 mr-2" />
                                            Verified Professional
                                        </div>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <LucideClock size={14} className="text-blue-500 mr-2" />
                                            On-time Guarantee
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuickAddToCart(service);
                                            }}
                                            className="flex-1 bg-white border border-blue-600 text-blue-600 font-medium py-2.5 rounded-lg transition-colors hover:bg-blue-50 cursor-pointer"
                                        >
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/book-worker/service?serviceId=${service._id}&service=${encodeURIComponent(service.name)}&category=${encodeURIComponent(service.category?.name || '')}`);
                                            }}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm hover:shadow-md cursor-pointer"
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="text-center mt-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors"
                    >
                        <LucideArrowLeft size={16} />
                        Back
                    </button>
                </div>
            </div>
            {/* Description Modal */}
            {selectedServiceDesc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedServiceDesc(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
                        <div className="relative h-48 bg-gray-100">
                            <img
                                src={`${SERVER_URL}/${selectedServiceDesc.image?.replace(/\\/g, '/')}`}
                                alt={selectedServiceDesc.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = 'https://placehold.co/1500?text=Service'; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <button
                                onClick={() => setSelectedServiceDesc(null)}
                                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full p-2 text-white transition-colors"
                            >
                                <LucideX size={20} />
                            </button>
                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="text-2xl font-bold">{selectedServiceDesc.name}</h3>
                                <span className="inline-block mt-2 bg-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                                    ₹{selectedServiceDesc.basePrice}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                            <p className="text-gray-700 leading-relaxed text-lg">
                                {selectedServiceDesc.description || 'No description available for this service.'}
                            </p>

                            <div className="mt-8 flex gap-3">
                                <button
                                    onClick={() => {
                                        handleQuickAddToCart(selectedServiceDesc);
                                        setSelectedServiceDesc(null);
                                    }}
                                    className="flex-1 border border-blue-600 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => {
                                        navigate(`/book-worker/service?serviceId=${selectedServiceDesc._id}&service=${encodeURIComponent(selectedServiceDesc.name)}&category=${encodeURIComponent(selectedServiceDesc.category?.name || '')}`);
                                    }}
                                    className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}