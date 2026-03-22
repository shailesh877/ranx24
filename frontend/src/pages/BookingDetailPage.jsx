import React, { useState, useEffect } from 'react';
import axiosInstance, { getRazorpayConfig } from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LucideCalendar, 
  LucideClock, 
  LucideMapPin, 
  LucideMessageSquare, 
  LucideStar, 
  LucideCreditCard,
  LucideChevronLeft,
  LucideCheckCircle,
  LucideAlertCircle,
  LucideLoader,
  LucideInfo,
  LucideArrowRight
} from 'lucide-react';
import ReviewModal from '../components/ReviewModal';
import Navbar from '../components/Navbar';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com';

export default function BookingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/bookings/${id}`);
      setBooking(data);
      if (data.status === 'completed') {
        fetchUserReview();
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
      toast.error('Failed to load booking details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReview = async () => {
    try {
      const { data } = await axiosInstance.get(`/reviews/my`);
      const review = data.find((r) => r.booking?._id === id);
      setUserReview(review || null);
    } catch (err) {
      console.error('Error fetching user review:', err);
    }
  };

  const handlePayBalance = async () => {
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
                bookingId: booking._id // Pass bookingId to have backend handle update
              }
            );

            if (verifyRes.data.success) {
              toast.success('Payment successful!');
              fetchBookingDetails();
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

  const statusMap = {
    pending: { color: 'text-amber-700 bg-amber-50 border-amber-100', icon: LucideClock, label: 'Waiting for Confirmation' },
    confirmed: { color: 'text-blue-700 bg-blue-50 border-blue-100', icon: LucideCheckCircle, label: 'Confirmed' },
    'in-progress': { color: 'text-purple-700 bg-purple-50 border-purple-100', icon: LucideLoader, label: 'In Progress' },
    completed: { color: 'text-emerald-700 bg-emerald-50 border-emerald-100', icon: LucideCheckCircle, label: 'Completed' },
    cancelled: { color: 'text-rose-700 bg-rose-50 border-rose-100', icon: LucideAlertCircle, label: 'Cancelled' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40">
          <LucideLoader className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-500 font-bold tracking-tight">Fetching booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="max-w-2xl mx-auto py-20 px-4 text-center">
          <div className="bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <LucideAlertCircle className="text-rose-500" size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Oops! Booking not found</h2>
          <p className="text-gray-500 mb-10 font-medium">We couldn't find the booking you're looking for. It might have been deleted or the link is invalid.</p>
          <button onClick={() => navigate('/my-bookings')} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const status = statusMap[booking.status] || { color: 'text-gray-700 bg-gray-50 border-gray-100', icon: LucideInfo, label: booking.status };
  const totalAmount = booking.finalPrice || (booking.price + (booking.platformFee || 0) + (booking.percentageFee || 0) - (booking.couponDiscount || 0) - (booking.membershipDiscount || 0));
  const amountPaid = Math.max(booking.amountPaid || 0, booking.advanceAmount || 0);
  const balance = totalAmount - amountPaid;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <Navbar />
      
      {/* Header Banner */}
      <div className="bg-white border-b border-gray-100 pt-8 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold mb-8 transition-colors group">
            <LucideChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider mb-4 ${status.color}`}>
                <status.icon size={14} strokeWidth={3} />
                {status.label}
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">{booking.service}</h1>
              <p className="text-blue-600 text-lg font-black">{booking.category}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mb-1">Booking ID</p>
              <p className="text-xl font-black text-gray-900">#{booking._id.toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Info Column */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Service & Worker */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <LucideInfo size={24} className="text-blue-600" />
                Service Details
              </h2>
              
              <div className="flex gap-6 mb-8">
                <div className="w-20 h-20 bg-gray-100 rounded-[20px] overflow-hidden border border-gray-100 shrink-0">
                  <img 
                    src={booking.worker?.livePhoto ? `${SERVER_URL}/${booking.worker.livePhoto.replace(/\\/g, '/')}` : 'https://cdn-icons-png.flaticon.com/512/12145/12145443.png'} 
                    alt="Service"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/12145/12145443.png'; }}
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Assigned Worker</p>
                  <p className="text-xl font-black text-gray-900">
                    {booking.worker ? `${booking.worker.firstName} ${booking.worker.lastName}` : 'Not Assigned Yet'}
                  </p>
                  {booking.worker && (
                    <button 
                      onClick={() => navigate(`/chat/${booking._id}`)}
                      className="mt-3 inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-all text-sm"
                    >
                      <LucideMessageSquare size={16} />
                      Chat with Worker
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <LucideCalendar size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Date</span>
                  </div>
                  <p className="font-black text-gray-900">{new Date(booking.bookingDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-400 mb-1">
                    <LucideClock size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Time Slot</span>
                  </div>
                  <p className="font-black text-gray-900">{booking.bookingTime}</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <LucideMapPin size={24} className="text-rose-500" />
                Service Location
              </h2>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p className="font-bold text-gray-900 mb-1">{booking.address?.street}</p>
                <p className="text-sm font-medium text-gray-500">
                  {booking.address?.city}, {booking.address?.state} - {booking.address?.zipCode}
                </p>
              </div>
            </div>

            {/* Extra Charges / Inspection */}
            {booking.inspectionDetails && booking.inspectionDetails.length > 0 && (
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 overflow-hidden">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <LucideAlertCircle size={24} className="text-orange-500" />
                  Inspection & Extra Charges
                </h2>
                <div className="space-y-4">
                  {booking.inspectionDetails.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-bold text-gray-800">{item.description}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Additional Service</p>
                      </div>
                      <span className="font-black text-gray-900">₹{item.price}</span>
                    </div>
                  ))}
                  <div className="bg-blue-50/50 p-4 rounded-2xl flex justify-between items-center mt-4">
                    <span className="font-black text-blue-900">Final Adjusted Total</span>
                    <span className="text-xl font-black text-blue-900">₹{booking.finalAmountToPay || (booking.price + (booking.inspectionTotal || 0))}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Payment Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-gray-900 rounded-[32px] p-8 shadow-2xl text-white sticky top-10">
              <h2 className="text-xl font-black mb-8 flex items-center gap-2">
                <LucideCreditCard size={24} className="text-blue-400" />
                Payment Info
              </h2>

              <div className="space-y-4 mb-10">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>Base Booking</span>
                  <span className="text-white">₹{booking.price}</span>
                </div>
                {(booking.platformFee > 0 || booking.percentageFee > 0) && (
                  <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span>Fees & Taxes</span>
                    <span className="text-white">₹{(booking.platformFee || 0) + (booking.percentageFee || 0)}</span>
                  </div>
                )}
                {(booking.couponDiscount > 0 || booking.membershipDiscount > 0) && (
                  <div className="flex justify-between text-xs font-bold text-emerald-400 uppercase tracking-widest">
                    <span>Discounts</span>
                    <span>-₹{(booking.couponDiscount || 0) + (booking.membershipDiscount || 0)}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-sm font-black text-gray-300">Total Price</span>
                  <span className="text-3xl font-black text-white">₹{totalAmount}</span>
                </div>
              </div>

              {(booking.isAdvancePayment || booking.platformFee > 0 || booking.percentageFee > 0) ? (
                <div className="space-y-6">
                  <div className={`rounded-2xl p-5 border ${booking.paymentStatus === 'paid' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gray-800 border-gray-700'}`}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Advance Paid (15%)</span>
                      <span className="text-emerald-400 font-black">₹{booking.advanceAmount || Math.round(totalAmount * 0.15)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                        {booking.paymentStatus === 'paid' ? 'Balance Paid (85%)' : 'Remaining Balance (85%)'}
                      </span>
                      <span className="text-white font-black text-xl">₹{totalAmount - (booking.advanceAmount || Math.round(totalAmount * 0.15))}</span>
                    </div>
                  </div>
                  
                  {booking.paymentStatus === 'partial' && (
                    <button 
                      onClick={handlePayBalance}
                      disabled={payingId === booking._id}
                      className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {payingId === booking._id ? <LucideLoader className="animate-spin" size={20} /> : <LucideCreditCard size={20} />}
                      Pay Now
                    </button>
                  )}
                  {booking.paymentStatus === 'paid' && (
                    <div className="text-center py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                      <LucideCheckCircle size={14} />
                      Fully Paid
                    </div>
                  )}
                </div>
              ) : (
                <div className={`p-4 rounded-2xl border text-center font-black text-sm uppercase tracking-widest ${
                  booking.paymentStatus === 'paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-gray-800 border-gray-700 text-gray-400'
                }`}>
                  {booking.paymentStatus === 'paid' ? (
                    <span className="flex items-center justify-center gap-2">
                      <LucideCheckCircle size={18} />
                      Paid in Full
                    </span>
                  ) : 'Payment: ' + booking.paymentStatus}
                </div>
              )}
            </div>

            {/* Review Card in Detail */}
            {booking.status === 'completed' && (
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <LucideStar size={24} className="text-amber-400" />
                  Your Feedback
                </h2>
                
                {userReview ? (
                  <div className="space-y-4">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <LucideStar key={s} size={16} className={s <= userReview.rating ? 'text-amber-400' : 'text-gray-200'} fill={s <= userReview.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <p className="text-sm font-medium text-gray-600 italic">"{userReview.comment}"</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(userReview.createdAt).toLocaleDateString()}</p>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowReviewModal(true)}
                    className="w-full group bg-amber-50 text-amber-600 py-4 rounded-2xl font-black border border-amber-100 hover:bg-amber-100 transition-all flex items-center justify-center gap-2"
                  >
                    Rate Service
                    <LucideArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          bookingId={booking._id}
          workerId={booking.worker?._id}
          workerName={booking.worker ? `${booking.worker.firstName} ${booking.worker.lastName}` : 'Worker'}
          onSubmitSuccess={() => {
            fetchUserReview();
            toast.success('Thank you for your review!');
          }}
        />
      )}
    </div>
  );
}
