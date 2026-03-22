import React, { useState, useEffect } from 'react';
import axiosInstance, { getRazorpayConfig } from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import { 
  LucideCalendar, 
  LucideClock, 
  LucideMapPin, 
  LucideMessageSquare, 
  LucideStar, 
  LucideCreditCard,
  LucideChevronRight,
  LucideCheckCircle,
  LucideAlertCircle,
  LucideLoader
} from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await axiosInstance.get(`/bookings/my`);
      // The backend returns a paginated response with a 'data' property
      if (data.data && Array.isArray(data.data)) {
        setBookings(data.data);
      } else if (data.bookings && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      } else if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handlePayBalance = async (booking) => {
    setPayingId(booking._id);
    try {
      const total = booking.finalPrice || 0;
      const paid = Math.max(booking.amountPaid || 0, booking.advanceAmount || 0);
      const balanceAmount = total - paid;
      
      if (balanceAmount <= 0) {
        toast.error('No balance to pay.');
        setPayingId(null);
        return;
      }

      const razorpayKey = await getRazorpayConfig();

      const { data: orderData } = await axiosInstance.post(
        `/payment/order`,
        { amount: balanceAmount }
      );

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "RanX24",
        description: `Remaining Balance for ${booking.service}`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyRes = await axiosInstance.post(
              `/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: booking._id // Pass bookingId for backend update
              }
            );

            if (verifyRes.data.success) {
              toast.success('Payment successful! Booking confirmed.');
              fetchBookings();
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            console.error('Payment callback error:', err);
            toast.error('Payment verification failed');
          } finally {
            setPayingId(null);
          }
        },
        theme: { color: "#3B82F6" },
        modal: {
          ondismiss: function() {
            setPayingId(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment');
      setPayingId(null);
    }
  };

  const handleOpenReviewModal = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
    setRating(5);
    setComment('');
  };

  const handleOpenChat = (booking) => {
    setSelectedBooking(booking);
    setShowChatModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      return toast.error('Please write a comment');
    }

    try {
      await axiosInstance.post(
        `/reviews`,
        {
          worker: selectedBooking.worker?._id,
          booking: selectedBooking._id,
          rating,
          comment,
        }
      );

      toast.success('Review submitted successfully!');
      setShowReviewModal(false);
      fetchBookings();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending': return { color: 'text-amber-700 bg-amber-50 border-amber-100', icon: LucideClock, label: 'Pending' };
      case 'confirmed': return { color: 'text-blue-700 bg-blue-50 border-blue-100', icon: LucideCheckCircle, label: 'Confirmed' };
      case 'in-progress': return { color: 'text-purple-700 bg-purple-50 border-purple-100', icon: LucideLoader, label: 'In Progress' };
      case 'completed': return { color: 'text-emerald-700 bg-emerald-50 border-emerald-100', icon: LucideCheckCircle, label: 'Completed' };
      case 'cancelled': return { color: 'text-rose-700 bg-rose-50 border-rose-100', icon: LucideAlertCircle, label: 'Cancelled' };
      default: return { color: 'text-gray-700 bg-gray-50 border-gray-100', icon: LucideAlertCircle, label: status };
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return booking.status === 'pending';
    if (activeTab === 'active') return ['confirmed', 'in-progress', 'accepted'].includes(booking.status);
    if (activeTab === 'completed') return ['completed', 'cancelled'].includes(booking.status);
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Bookings</h1>
            <p className="text-gray-500 mt-1 font-medium">Manage and track your service requests</p>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Book New Service
            <LucideChevronRight size={18} />
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 p-1 bg-gray-200/50 rounded-2xl mb-8 w-fit overflow-x-auto whitespace-nowrap scrollbar-hide">
          {['all', 'pending', 'active', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === tab 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LucideLoader className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-gray-500 font-medium">Loading your bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <LucideCalendar className="text-blue-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No bookings found</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              You haven't made any bookings in this category yet. Start your first service request now!
            </p>
            <button 
              onClick={() => navigate('/')} 
              className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition-all"
            >
              Explore Services
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredBookings.map((booking) => {
              const status = getStatusInfo(booking.status);
              const totalAmount = booking.finalPrice || (booking.price + (booking.platformFee || 0) + (booking.percentageFee || 0) - (booking.couponDiscount || 0) - (booking.membershipDiscount || 0));
              const amountPaid = Math.max(booking.amountPaid || 0, booking.advanceAmount || 0);
              const balance = totalAmount - amountPaid;
              
              return (
                <div key={booking._id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                  <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-2.5 rounded-xl group-hover:bg-blue-100 transition-colors">
                          <LucideCalendar className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{new Date(booking.bookingDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-[10px] text-gray-400 font-mono tracking-tighter">ID: #{booking._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider ${status.color}`}>
                        <status.icon size={14} strokeWidth={3} />
                        {status.label}
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Left: Service Info */}
                      <div className="flex-1 flex gap-5">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                          <img 
                            src={booking.worker?.livePhoto ? `${SERVER_URL}/${booking.worker.livePhoto.replace(/\\/g, '/')}` : 'https://cdn-icons-png.flaticon.com/512/12145/12145443.png'} 
                            alt={booking.service}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/12145/12145443.png'; }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-1">{booking.service}</h3>
                          <p className="text-blue-600 font-bold text-sm mb-4">{booking.category}</p>
                          
                          <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5 font-medium">
                              <LucideClock size={16} className="text-gray-400" />
                              {booking.bookingTime}
                            </div>
                            <div className="flex items-center gap-1.5 font-medium">
                              <LucideMapPin size={16} className="text-gray-400" />
                              {booking.address?.city || 'Location'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Payment Info */}
                      <div className="lg:w-72 bg-gray-50/80 rounded-2xl p-5 border border-gray-100">
                        <div className="space-y-1 mb-3">
                          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                            <span>Booking Price</span>
                            <span>₹{booking.price}</span>
                          </div>
                          {(booking.platformFee > 0 || booking.percentageFee > 0) && (
                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                              <span>Fees</span>
                              <span>₹{(booking.platformFee || 0) + (booking.percentageFee || 0)}</span>
                            </div>
                          )}
                          {(booking.couponDiscount > 0 || booking.membershipDiscount > 0) && (
                            <div className="flex justify-between text-[10px] font-bold text-green-500 uppercase">
                              <span>Discounts</span>
                              <span>-₹{(booking.couponDiscount || 0) + (booking.membershipDiscount || 0)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                            <span className="text-sm font-bold text-gray-900">Total</span>
                            <span className="text-lg font-black text-gray-900">₹{totalAmount}</span>
                          </div>
                        </div>

                        {/* Advanced Payment Breakdown */}
                        {(booking.isAdvancePayment || booking.platformFee > 0 || booking.percentageFee > 0) ? (
                          <div className={`p-4 rounded-2xl border ${booking.paymentStatus === 'paid' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-[10px] font-black uppercase tracking-wider ${booking.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-700'}`}>
                                Advance Paid (15%)
                              </span>
                              <span className={`text-sm font-black ${booking.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-800'}`}>
                                ₹{booking.advanceAmount || Math.round(totalAmount * 0.15)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className={`text-[10px] font-black uppercase tracking-wider ${booking.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-700'}`}>
                                {booking.paymentStatus === 'paid' ? 'Balance Paid (85%)' : 'Remaining Balance (85%)'}
                              </span>
                              <span className={`text-sm font-black ${booking.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-900 font-black'}`}>
                                ₹{totalAmount - (booking.advanceAmount || Math.round(totalAmount * 0.15))}
                              </span>
                            </div>
                            {booking.paymentStatus === 'paid' && (
                              <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center justify-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase">
                                <LucideCheckCircle size={12} />
                                Fully Paid
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`p-4 rounded-2xl border text-center ${booking.paymentStatus === 'paid' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                              {booking.paymentStatus === 'paid' && <LucideCheckCircle size={14} />}
                              {booking.paymentStatus === 'paid' ? 'Paid in Full' : 'Status: ' + booking.paymentStatus}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
                      {booking.paymentStatus === 'partial' && (
                        <button 
                          onClick={() => handlePayBalance(booking)}
                          disabled={payingId === booking._id}
                          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 disabled:opacity-70"
                        >
                          {payingId === booking._id ? <LucideLoader className="animate-spin" size={18} /> : <LucideCreditCard size={18} />}
                          Pay Balance ₹{balance}
                        </button>
                      )}
                      
                      {['confirmed', 'in-progress', 'accepted'].includes(booking.status) && (
                        <button 
                          onClick={() => handleOpenChat(booking)}
                          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-100 transition-all"
                        >
                          <LucideMessageSquare size={18} />
                          Message Worker
                        </button>
                      )}

                      {booking.status === 'completed' && (
                        <button 
                          onClick={() => handleOpenReviewModal(booking)}
                          className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-amber-50 text-amber-600 px-6 py-3 rounded-xl font-bold hover:bg-amber-100 transition-all border border-amber-100"
                        >
                          <LucideStar size={18} />
                          Rate Experience
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedBooking && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900">Share Your Review</h2>
                  <button onClick={() => setShowReviewModal(false)} className="bg-gray-100 p-2 rounded-full text-gray-400 hover:text-rose-500 transition-colors">
                    <LucideChevronRight className="rotate-90" size={20} />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-2xl">
                  <img 
                    src={selectedBooking.worker?.livePhoto ? `${SERVER_URL}/${selectedBooking.worker.livePhoto.replace(/\\/g, '/')}` : 'https://cdn-icons-png.flaticon.com/512/12145/12145443.png'} 
                    className="w-14 h-14 rounded-xl object-cover"
                    alt="Worker"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{selectedBooking.worker?.firstName} {selectedBooking.worker?.lastName}</p>
                    <p className="text-xs text-gray-500 font-medium">{selectedBooking.service}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Overall Rating</p>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-1 transition-transform active:scale-95 ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`}
                        >
                          <LucideStar size={40} fill={star <= rating ? "currentColor" : "none"} strokeWidth={2.5} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2 px-1">Write your experience</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 h-32 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none text-gray-700 font-medium"
                      placeholder="Was the service helpful? How was the behavior?"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    Submit Review
                    <LucideCheckCircle size={20} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Chat Window */}
        <ChatWindow
          bookingId={selectedBooking?._id}
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          userRole="user"
        />
      </div>
    </div>
  );
}