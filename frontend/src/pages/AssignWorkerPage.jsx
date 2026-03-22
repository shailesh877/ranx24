import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const AssignWorkerPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch Booking Details
            const bookingRes = await api.get(`/bookings/${id}`);
            const bookingData = bookingRes.data;
            setBooking(bookingData);

            // Fetch Workers filtered by Category
            // Note: The backend getWorkers supports 'category' query param
            const workersRes = await api.get(`/workers?category=${bookingData.category}&status=approved`);
            setWorkers(workersRes.data.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedWorker) return;

        try {
            setAssigning(true);
            await api.put(`/bookings/${id}/assign`, { workerId: selectedWorker._id });
            toast.success("Worker assigned successfully!");
            navigate('/admin-dashboard/bookings'); // Redirect back to bookings list
        } catch (error) {
            console.error("Error assigning worker:", error);
            toast.error(error.response?.data?.message || "Failed to assign worker");
        } finally {
            setAssigning(false);
            setShowConfirm(false);
        }
    };

    const filteredWorkers = workers.filter(worker => {
        const query = searchQuery.toLowerCase();
        return (
            worker.firstName?.toLowerCase().includes(query) ||
            worker.lastName?.toLowerCase().includes(query) ||
            worker.mobileNumber?.includes(query)
        );
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!booking) return <div className="p-8 text-center text-red-500">Booking not found</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <button onClick={() => navigate('/admin-dashboard/bookings')} className="text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-arrow-left"></i> Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Assign Professional</h1>
                <p className="text-gray-600 mt-2">Select a professional for <span className="font-semibold text-blue-600">{booking.service}</span> ({booking.category})</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Booking Details Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Customer</label>
                                <p className="text-gray-800 font-medium">{booking.user?.name || 'Unknown'}</p>
                                <p className="text-gray-600 text-sm">{booking.user?.mobileNumber}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Service Address</label>
                                <p className="text-gray-800 text-sm">
                                    {booking.address?.street}, {booking.address?.city}<br />
                                    {booking.address?.state} - {booking.address?.zipCode}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Date & Time</label>
                                <p className="text-gray-800 font-medium">
                                    {new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Amount</label>
                                <p className="text-green-600 font-bold text-lg">₹{(booking.finalPrice || booking.totalPrice).toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workers List */}
                <div className="lg:col-span-2">
                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                            />
                        </div>
                    </div>

                    {/* Workers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredWorkers.length > 0 ? (
                            filteredWorkers.map(worker => (
                                <div key={worker._id} className={`bg-white rounded-xl p-4 border transition cursor-pointer hover:shadow-md ${selectedWorker?._id === worker._id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100'}`}
                                    onClick={() => setSelectedWorker(worker)}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {worker.profilePicture ? (
                                                <img src={worker.profilePicture} alt={worker.firstName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-gray-500 font-bold text-lg">{worker.firstName?.[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-800">{worker.firstName} {worker.lastName}</h3>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                <i className="fa-solid fa-star text-yellow-400"></i>
                                                <span>{worker.averageRating || 'New'}</span>
                                                <span className="text-gray-300">|</span>
                                                <i className="fa-solid fa-phone text-gray-400"></i>
                                                <span>{worker.mobileNumber}</span>
                                            </div>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {worker.categories?.slice(0, 2).map((cat, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">{cat}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedWorker?._id === worker._id ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                                {selectedWorker?._id === worker._id && <i className="fa-solid fa-check text-white text-xs"></i>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No professionals found for this category.</p>
                            </div>
                        )}
                    </div>

                    {/* Action Bar */}
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={() => selectedWorker && setShowConfirm(true)}
                            disabled={!selectedWorker}
                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition transform hover:-translate-y-1"
                        >
                            Assign Selected Professional
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && selectedWorker && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fa-solid fa-user-check text-2xl text-blue-600"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Confirm Assignment</h3>
                            <p className="text-gray-600 mt-2">
                                Are you sure you want to assign <span className="font-bold text-gray-800">{selectedWorker.firstName} {selectedWorker.lastName}</span> to this booking?
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm text-gray-600">
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2"><i className="fa-solid fa-check-circle text-green-500"></i> Notification will be sent to the professional.</li>
                                <li className="flex items-center gap-2"><i className="fa-solid fa-check-circle text-green-500"></i> Notification will be sent to the customer.</li>
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={assigning}
                                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                                {assigning ? (
                                    <>
                                        <i className="fa-solid fa-circle-notch fa-spin"></i> Assigning...
                                    </>
                                ) : (
                                    'Confirm Assignment'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignWorkerPage;
