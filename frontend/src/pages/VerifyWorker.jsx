import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { LucideCheckCircle, LucideAlertCircle, LucideArrowLeft, LucideUser, LucideMapPin, LucideBriefcase } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com';

const VerifyWorker = () => {
    const { id } = useParams();
    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWorker = async () => {
            try {
                const { data } = await axiosInstance.get(`/workers/${id}`);
                setWorker(data);
            } catch (err) {
                console.error("Error fetching worker:", err);
                setError(err.response?.data?.message || 'Worker not found or invalid URL.');
            } finally {
                setLoading(false);
            }
        };

        fetchWorker();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !worker) {
        return (
            <div className="min-h-screen flex flex-col items-center pt-20 bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border-t-4 border-red-500">
                    <LucideAlertCircle size={64} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                    <p className="text-gray-600 mb-6">{error || 'Could not verify this worker.'}</p>
                    <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition w-full">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    const isVerified = worker.status === 'approved';

    return (
        <div className="min-h-screen bg-gray-50 pt-10 pb-20 px-4">
            <div className="container mx-auto max-w-md">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header Strip */}
                    <div className={`h-32 ${isVerified ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'} relative`}>
                        <Link to="/" className="absolute top-4 left-4 text-white hover:text-white/80 transition bg-black/20 p-2 rounded-full">
                            <LucideArrowLeft size={20} />
                        </Link>
                    </div>

                    {/* Profile Section */}
                    <div className="relative px-6 pb-6 text-center -mt-16">
                        <div className="inline-block relative">
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white mx-auto">
                                <img 
                                    src={worker.livePhoto ? `${SERVER_URL}/uploads/${worker.livePhoto}` : 'https://via.placeholder.com/150'} 
                                    alt={worker.firstName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                                />
                            </div>
                            {isVerified && (
                                <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-md">
                                    <LucideCheckCircle size={28} className="text-green-500 fill-green-50" />
                                </div>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mt-4 leading-tight">
                            {worker.firstName} {worker.lastName}
                        </h1>

                        {isVerified ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 font-bold text-sm mt-2 border border-green-200 shadow-sm">
                                <LucideCheckCircle size={16} /> Verified Professional
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 font-bold text-sm mt-2 border border-yellow-200 shadow-sm">
                                <LucideAlertCircle size={16} /> Status: {worker.status}
                            </span>
                        )}

                        <div className="mt-8 space-y-4 text-left">
                            <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl">
                                <LucideBriefcase className="text-blue-500 shrink-0" />
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Services Provided</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {worker.services && worker.services.length > 0 ? (
                                            worker.services.map((service, index) => (
                                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded pt-1">
                                                    {service}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500">No services listed</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                                <LucideMapPin className="text-blue-500 shrink-0" />
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Location</h3>
                                    <p className="text-sm text-gray-600">{worker.city || 'City not specified'}, {worker.state || 'State not specified'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
                                <LucideUser className="text-blue-500 shrink-0" />
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Professional ID</h3>
                                    <p className="text-sm font-mono text-gray-600">#{worker._id?.slice(-6).toUpperCase()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <p className="text-xs text-gray-400">
                                This is an official digital verification card from RanX24. 
                                Always verify the professional's face with the photo above.
                            </p>
                            <Link to="/" className="inline-block mt-4 text-blue-600 font-semibold hover:underline text-sm focus:outline-none">
                                Download the RanX24 App for Home Services
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyWorker;
