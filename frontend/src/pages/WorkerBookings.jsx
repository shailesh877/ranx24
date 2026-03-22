import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiMapPin, FiDollarSign, FiUser, FiTool, FiCheck, FiX, FiPlay, FiFlag } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';

export default function WorkerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkerBookings();
  }, []);

  const fetchWorkerBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in as a worker to view bookings.');
        navigate('/worker-login'); // Assuming a worker login page
        return;
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`${API_URL}/bookings/worker/my`, config);
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching worker bookings:', err);
      setError('Failed to load worker bookings.');
      toast.error(err.response?.data?.message || 'Failed to load worker bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change this booking status to ${newStatus}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.put(`${API_URL}/bookings/${bookingId}/status`, { status: newStatus }, config);
      toast.success(`Booking status updated to ${newStatus}!`);
      fetchWorkerBookings(); // Refresh bookings
    } catch (err) {
      console.error('Error updating booking status:', err);
      toast.error(err.response?.data?.message || 'Failed to update booking status.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-blue-900 text-xl">Loading worker bookings...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-500 text-xl">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">My Worker Bookings</h1>

        {bookings.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">You have no bookings assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-gray-50 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{booking.service}</h2>
                    <p className="text-sm text-gray-600">Category: {booking.category}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                      }`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700 mb-4">
                  <p className="flex items-center gap-2"><FiUser className="text-blue-500" /> User: {booking.user?.name} ({booking.user?.phone})</p>
                  <p className="flex items-center gap-2"><FiCalendar className="text-blue-500" /> Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>
                  <p className="flex items-center gap-2"><FiClock className="text-blue-500" /> Time: {booking.bookingTime}</p>
                  <p className="flex items-center gap-2"><FiDollarSign className="text-blue-500" /> Price: ₹{booking.price.toLocaleString()}</p>
                  <p className="flex items-center gap-2 col-span-2"><FiMapPin className="text-blue-500" /> Address: {booking.address.street}, {booking.address.city}</p>
                </div>

                <div className="flex justify-end gap-3">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateBookingStatus(booking._id, 'accepted')}
                        className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <FiCheck /> Accept
                      </button>
                      <button
                        onClick={() => handleUpdateBookingStatus(booking._id, 'rejected')}
                        className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <FiX /> Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(booking._id, 'in-progress')}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <FiPlay /> Start Service
                    </button>
                  )}
                  {booking.status === 'in-progress' && (
                    <button
                      onClick={() => handleUpdateBookingStatus(booking._id, 'completed')}
                      className="flex items-center gap-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <FiFlag /> Mark Completed
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/worker/booking/${booking._id}`)}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
