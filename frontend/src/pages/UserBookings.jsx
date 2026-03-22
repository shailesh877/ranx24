import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaRupeeSign, FaUser, FaTimesCircle, FaEye, FaCalendarCheck } from 'react-icons/fa';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';

export default function UserBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to view your bookings.');
        navigate('/login');
        return;
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`${API_URL}/bookings/my`, config);
      if (data.data && Array.isArray(data.data)) {
        setBookings(data.data);
      } else {
        setBookings(data);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      setError('Failed to load your bookings.');
      toast.error(err.response?.data?.message || 'Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.put(`${API_URL}/bookings/${bookingId}/cancel`, {}, config);
      toast.success('Booking cancelled successfully!');
      fetchUserBookings(); // Refresh bookings
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'in-progress': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-[Poppins]">
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-4">
          <Skeleton height="200px" count={3} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 font-[Poppins]">
        <div className="max-w-4xl mx-auto py-10 px-4">
          <EmptyState
            title="Error Loading Bookings"
            description={error}
            icon={<FaTimesCircle size={48} className="text-red-400" />}
            action={<Button onClick={fetchUserBookings}>Try Again</Button>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-[Poppins]">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Track and manage your service requests</p>
        </div>

        {bookings.length === 0 ? (
          <Card className="py-12">
            <EmptyState
              icon={<FaCalendarCheck size={64} className="text-gray-300" />}
              title="No Bookings Found"
              description="You haven't booked any services yet."
              action={
                <Button onClick={() => navigate('/categories')}>
                  Book a Service
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking) => (
              <Card key={booking._id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{booking.service}</h2>
                    <p className="text-sm text-gray-500">Category: {booking.category}</p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(booking.status)}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-gray-700 mb-6 bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <FaUser size={14} />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Worker</span>
                      <span className="font-medium">{booking.worker?.firstName} {booking.worker?.lastName}</span>
                    </div>
                  </div>
                  <p className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <FaRupeeSign size={14} />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Price</span>
                      <span className="font-medium">₹{booking.price.toLocaleString()}</span>
                    </div>
                  </p>
                  <p className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                      <FaCalendarAlt size={14} />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Date</span>
                      <span className="font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</span>
                    </div>
                  </p>
                  <p className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <FaClock size={14} />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Time</span>
                      <span className="font-medium">{booking.bookingTime}</span>
                    </div>
                  </p>
                  <p className="flex items-center gap-3 col-span-1 md:col-span-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <FaMapMarkerAlt size={14} />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">Address</span>
                      <span className="font-medium">{booking.address.street}, {booking.address.city}</span>
                    </div>
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  {booking.status === 'pending' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelBooking(booking._id)}
                      icon={<FaTimesCircle />}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/booking/${booking._id}`)} // Assuming this route exists or will be updated
                    icon={<FaEye />}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
