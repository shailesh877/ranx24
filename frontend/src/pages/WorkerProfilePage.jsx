import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaStar, FaBriefcase, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { MdWork } from 'react-icons/md';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import ReviewCard from '../components/ReviewCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com';

export default function WorkerProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [worker, setWorker] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    useEffect(() => {
        fetchWorkerDetails();
        fetchWorkerReviews();
    }, [id]);

    const fetchWorkerDetails = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/workers/${id}`);
            setWorker(data);
        } catch (error) {
            console.error('Error fetching worker:', error);
            toast.error('Failed to load worker profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkerReviews = async () => {
        setReviewsLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/reviews/worker/${id}`);
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <Skeleton height="300px" className="mb-6" />
                    <Skeleton height="200px" count={3} />
                </div>
            </div>
        );
    }

    if (!worker) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <EmptyState
                        icon={<FaUser size={64} />}
                        title="Worker Not Found"
                        description="The worker profile you're looking for doesn't exist."
                        action={
                            <Button onClick={() => navigate('/categories')}>
                                Browse Services
                            </Button>
                        }
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header Card */}
                <Card className="mb-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Profile Image */}
                        <div className="flex-shrink-0">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                                {worker.profileImage ? (
                                    <img
                                        src={`${SERVER_URL}/${worker.profileImage}`}
                                        alt={`${worker.firstName} ${worker.lastName}`}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FaUser className="text-blue-600 text-5xl" />
                                )}
                            </div>
                        </div>

                        {/* Worker Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {worker.firstName} {worker.lastName}
                            </h1>
                            <p className="text-gray-600 mb-4">Professional Service Provider</p>

                            {/* Rating */}
                            <div className="flex items-center gap-3 mb-4">
                                <StarRating rating={worker.averageRating || 0} size={20} />
                                <span className="text-lg font-semibold text-gray-900">
                                    {worker.averageRating ? worker.averageRating.toFixed(1) : 'New'}
                                </span>
                                <span className="text-gray-600">
                                    ({worker.totalReviews || 0} reviews)
                                </span>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {worker.experience || '1+'}
                                    </div>
                                    <div className="text-sm text-gray-600">Years Exp.</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {worker.completedJobs || 0}
                                    </div>
                                    <div className="text-sm text-gray-600">Jobs Done</div>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {worker.city || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-600">City</div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    variant="primary"
                                    onClick={() => navigate(`/booking/${worker.services?.[0]?.category?._id}`, {
                                        state: { workerId: worker._id }
                                    })}
                                    icon={<MdWork />}
                                >
                                    Book Now
                                </Button>
                                <Button variant="outline">
                                    <FaPhone className="mr-2" />
                                    Contact
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Documents Section */}
                <Card className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Verification Documents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Live Photo */}
                        <div className="border rounded-lg p-2">
                            <p className="text-sm font-semibold mb-2">Upload Photo (Selfie)</p>
                            {worker.livePhoto ? (
                                <div className="relative h-48 cursor-pointer" onClick={() => window.open(`${SERVER_URL}/uploads/${worker.livePhoto}`, '_blank')}>
                                    <img
                                        src={`${SERVER_URL}/uploads/${worker.livePhoto}`}
                                        alt="Live Photo"
                                        className="w-full h-full object-cover rounded"
                                    />
                                    <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 m-1 rounded">Click to View</div>
                                </div>
                            ) : (
                                <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded text-gray-400">
                                    Not Uploaded
                                </div>
                            )}
                        </div>

                        {/* Aadhaar Front */}
                        <div className="border rounded-lg p-2">
                            <p className="text-sm font-semibold mb-2">Aadhaar Front</p>
                            {worker.aadhaarFront ? (
                                <div className="relative h-48 cursor-pointer" onClick={() => window.open(`${SERVER_URL}/uploads/${worker.aadhaarFront}`, '_blank')}>
                                    <img
                                        src={`${SERVER_URL}/uploads/${worker.aadhaarFront}`}
                                        alt="Aadhaar Front"
                                        className="w-full h-full object-cover rounded"
                                    />
                                    <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 m-1 rounded">Click to View</div>
                                </div>
                            ) : worker.aadhaarCard ? (
                                // Fallback for legacy
                                <div className="relative h-48 cursor-pointer" onClick={() => window.open(`${SERVER_URL}/uploads/${worker.aadhaarCard}`, '_blank')}>
                                    <img
                                        src={`${SERVER_URL}/uploads/${worker.aadhaarCard}`}
                                        alt="Aadhaar Card (Legacy)"
                                        className="w-full h-full object-cover rounded"
                                    />
                                    <div className="absolute top-0 right-0 bg-yellow-400 text-xs px-1 rounded-bl">Legacy</div>
                                    <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 m-1 rounded">Click to View</div>
                                </div>
                            ) : (
                                <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded text-gray-400">
                                    Not Uploaded
                                </div>
                            )}
                        </div>

                        {/* Aadhaar Back */}
                        <div className="border rounded-lg p-2">
                            <p className="text-sm font-semibold mb-2">Aadhaar Back</p>
                            {worker.aadhaarBack ? (
                                <div className="relative h-48 cursor-pointer" onClick={() => window.open(`${SERVER_URL}/uploads/${worker.aadhaarBack}`, '_blank')}>
                                    <img
                                        src={`${SERVER_URL}/uploads/${worker.aadhaarBack}`}
                                        alt="Aadhaar Back"
                                        className="w-full h-full object-cover rounded"
                                    />
                                    <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 m-1 rounded">Click to View</div>
                                </div>
                            ) : (
                                <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded text-gray-400">
                                    {worker.aadhaarCard ? "N/A (Legacy)" : "Not Uploaded"}
                                </div>
                            )}
                        </div>

                        {/* PAN Card */}
                        <div className="border rounded-lg p-2">
                            <p className="text-sm font-semibold mb-2">PAN Card</p>
                            {worker.panCard ? (
                                <div className="relative h-48 cursor-pointer" onClick={() => window.open(`${SERVER_URL}/uploads/${worker.panCard}`, '_blank')}>
                                    <img
                                        src={`${SERVER_URL}/uploads/${worker.panCard}`}
                                        alt="PAN Card"
                                        className="w-full h-full object-cover rounded"
                                    />
                                    <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-2 py-1 m-1 rounded">Click to View</div>
                                </div>
                            ) : (
                                <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded text-gray-400">
                                    Not Uploaded
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* About Section */}
                <Card className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                    <p className="text-gray-700 leading-relaxed">
                        {worker.bio || `Hi, I am ${worker.firstName}. I am a professional worker providing high-quality services. I am dedicated to my work and ensure customer satisfaction.`}
                    </p>
                </Card>

                {/* Services/Categories Section */}
                <Card className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {(worker.services && worker.services.length > 0) ? "Services Offered" : "Categories"}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {((worker.services && worker.services.length > 0) ? worker.services : (worker.categories || [])).map((item, index) => (
                            <span
                                key={index}
                                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2"
                            >
                                <FaBriefcase className="text-xs" />
                                {item.name || item}
                            </span>
                        ))}
                        {(!worker.services?.length && !worker.categories?.length) && (
                            <span className="text-gray-500 italic">No services or categories listed</span>
                        )}
                    </div>
                </Card>

                {/* Reviews Section */}
                <Card>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                        {worker.averageRating > 0 && (
                            <div className="flex items-center gap-2">
                                <StarRating rating={worker.averageRating} size={18} />
                                <span className="font-semibold text-gray-700">
                                    {worker.averageRating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>

                    {reviewsLoading ? (
                        <Skeleton height="100px" count={3} />
                    ) : reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <ReviewCard
                                    key={review._id}
                                    userName={review.user?.name || 'Anonymous'}
                                    rating={review.rating}
                                    comment={review.comment}
                                    date={review.createdAt}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={<FaStar size={48} />}
                            title="No Reviews Yet"
                            description="This worker hasn't received any reviews yet. Be the first to book and review!"
                        />
                    )}
                </Card>
            </div>
        </div>
    );
}
