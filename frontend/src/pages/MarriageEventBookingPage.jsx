import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance, { getRazorpayConfig } from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { 
    LucideArrowLeft, 
    LucideCalendar, 
    LucideInfo, 
    LucideChevronLeft, 
    LucideChevronRight, 
    LucideCheckCircle, 
    LucideAlertCircle, 
    LucideLoader2,
    LucideFileText,
    LucideCreditCard
} from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const toDateStr = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// ─── Custom Web Calendar Component ───────────────────────────────────────────
function CustomWebCalendar({ selectedDate, onSelect, bookedDates }) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewYear(y => y - 1);
            setViewMonth(11);
        } else {
            setViewMonth(m => m - 1);
        }
    };

    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewYear(y => y + 1);
            setViewMonth(0);
        } else {
            setViewMonth(m => m + 1);
        }
    };

    // Grid Construction
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    const isPast = (d) => toDateStr(viewYear, viewMonth, d) <= todayStr;
    const isBooked = (d) => bookedDates.includes(toDateStr(viewYear, viewMonth, d));
    const isSelected = (d) => toDateStr(viewYear, viewMonth, d) === selectedDate;
    const isToday = (d) => toDateStr(viewYear, viewMonth, d) === todayStr;

    const canGoPrev =
        viewYear > today.getFullYear() ||
        (viewYear === today.getFullYear() && viewMonth > today.getMonth());

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 max-w-md mx-auto">
            {/* Header: Navigation */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={prevMonth}
                    disabled={!canGoPrev}
                    className={`p-2 hover:bg-gray-100 rounded-xl transition-all ${!canGoPrev ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                    <LucideChevronLeft className="text-gray-600" size={20} />
                </button>
                <h3 className="font-bold text-gray-900 text-lg">
                    {MONTHS[viewMonth]} {viewYear}
                </h3>
                <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-all"
                >
                    <LucideChevronRight className="text-gray-600" size={20} />
                </button>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                {DAYS.map(d => (
                    <div key={d}>{d}</div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 text-center">
                {cells.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="h-10"></div>;

                    const past = isPast(day);
                    const booked = isBooked(day);
                    const selected = isSelected(day);
                    const todayDay = isToday(day);
                    const disabled = past || booked;

                    let btnClass = "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600";
                    if (selected) {
                        btnClass = "bg-indigo-600 text-white shadow-md font-bold shadow-indigo-600/20";
                    } else if (booked) {
                        btnClass = "bg-red-50 text-red-500 line-through cursor-not-allowed font-medium";
                    } else if (past) {
                        btnClass = "text-gray-300 cursor-not-allowed";
                    } else if (todayDay) {
                        btnClass = "border border-indigo-600 text-indigo-600 font-bold";
                    }

                    return (
                        <button
                            key={`day-${idx}`}
                            disabled={disabled}
                            onClick={() => onSelect(toDateStr(viewYear, viewMonth, day))}
                            className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-semibold transition-all select-none mx-auto ${btnClass}`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-gray-100 text-xs font-semibold text-gray-500">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-200"></span>
                    <span>Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-gray-100 border border-gray-200"></span>
                    <span>Past/Unavailable</span>
                </div>
            </div>
        </div>
    );
}

// ─── Main Booking Page Component ─────────────────────────────────────────────
export default function MarriageEventBookingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pkg, setPkg] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [notes, setNotes] = useState('');
    const [bookedDates, setBookedDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkingDate, setCheckingDate] = useState(false);
    const [dateAvailable, setDateAvailable] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPackageDetails();
    }, [id]);

    const fetchPackageDetails = async () => {
        try {
            const { data } = await axiosInstance.get(`/marriage-event-packages/${id}`);
            setPkg(data);
        } catch (error) {
            console.error('Error fetching package details:', error);
            toast.error('Failed to load package details');
            navigate('/marriage-event-packages');
        } finally {
            setLoading(false);
        }
    };

    const handleDateSelect = async (date) => {
        setSelectedDate(date);
        setDateAvailable(null);
        setCheckingDate(true);

        try {
            const { data } = await axiosInstance.get(`/marriage-event-bookings/check-date?date=${date}`);
            setDateAvailable(data.available);
            if (!data.available) {
                setBookedDates(prev => [...new Set([...prev, date])]);
                toast.error('This date is already booked.');
            }
        } catch (error) {
            console.error('Error checking date:', error);
            setDateAvailable(true); // fallback
        } finally {
            setCheckingDate(false);
        }
    };

    const handleBookNow = async () => {
        if (!selectedDate) {
            toast.error('Please select an event date');
            return;
        }
        if (dateAvailable === false) {
            toast.error('Selected date is unavailable.');
            return;
        }

        setSubmitting(true);
        try {
            // 1. Create booking in backend
            const bookingRes = await axiosInstance.post('/marriage-event-bookings', {
                package_id: id,
                event_date: selectedDate,
                notes,
            });
            const booking = bookingRes.data.booking;
            const advance = bookingRes.data.advance_amount;

            // 2. Open Razorpay payment gateway
            const razorpayKey = await getRazorpayConfig();
            const orderRes = await axiosInstance.post('/payment/order', { amount: advance });
            const { id: order_id, currency, amount: rzpAmount } = orderRes.data;

            const options = {
                key: razorpayKey,
                amount: rzpAmount,
                currency,
                name: 'RanX24 Events',
                description: `Advance for ${pkg?.name || 'Package'}`,
                image: 'https://cdn-icons-png.flaticon.com/512/12145/12145443.png',
                order_id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        const verifyRes = await axiosInstance.post('/payment/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyRes.data.success) {
                            // 4. Confirm Payment in booking
                            await axiosInstance.post(`/marriage-event-bookings/${booking._id}/pay-advance`, {
                                razorpay_payment_id: response.razorpay_payment_id,
                                amount_paid: advance,
                            });
                            toast.success('Booking & Payment Confirmed!');
                            navigate('/my-bookings');
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch (err) {
                        console.error('Verification callback error:', err);
                        toast.error('Payment verification failed');
                    } finally {
                        setSubmitting(false);
                    }
                },
                theme: { color: '#4F46E5' },
                modal: {
                    ondismiss: function() {
                        setSubmitting(false);
                        toast.error('Payment cancelled');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Booking creation error:', error);
            const message = error.response?.data?.message || 'Failed to complete booking';
            toast.error(message);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const price = pkg?.discounted_price || pkg?.price || 0;
    const advanceAmount = Math.ceil(price * 0.15);
    const balanceAmount = price - advanceAmount;

    return (
        <div className="min-h-screen bg-gray-50/50 pt-28 pb-16">
            <div className="max-w-6xl mx-auto px-6 md:px-12">
                {/* Back Button */}
                <Link to={`/marriage-event-package/${id}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-bold mb-8 transition-colors">
                    <LucideArrowLeft size={18} /> Back to Details
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left Column: Calendar & Notes */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                <LucideCalendar className="text-indigo-600" size={24} /> Select Event Date
                            </h2>
                            <p className="text-sm text-gray-400 font-bold">
                                Select a date for your celebration. Red highlighted dates are already reserved by others.
                            </p>
                            <CustomWebCalendar
                                selectedDate={selectedDate}
                                onSelect={handleDateSelect}
                                bookedDates={bookedDates}
                            />

                            {/* Date Availability Indicator */}
                            {selectedDate && (
                                <div className="mt-4 flex items-center gap-2 p-4 rounded-2xl text-sm font-semibold">
                                    {checkingDate ? (
                                        <div className="flex items-center gap-2 text-gray-500 bg-gray-50 w-full p-2.5 rounded-xl border border-gray-100">
                                            <LucideLoader2 className="animate-spin text-indigo-600" size={18} />
                                            <span>Checking date availability...</span>
                                        </div>
                                    ) : dateAvailable === true ? (
                                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-full p-2.5 rounded-xl border border-emerald-100">
                                            <LucideCheckCircle size={18} />
                                            <span>{selectedDate} is available!</span>
                                        </div>
                                    ) : dateAvailable === false ? (
                                        <div className="flex items-center gap-2 text-red-600 bg-red-50 w-full p-2.5 rounded-xl border border-red-100">
                                            <LucideAlertCircle size={18} />
                                            <span>{selectedDate} is already booked. Please choose another date.</span>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Special Notes */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-4">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                <LucideFileText className="text-indigo-600" size={24} /> Special Requests (Optional)
                            </h2>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 h-32 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none text-gray-700 font-medium"
                                placeholder="Any specific decorations, guest count details, lighting requests, etc..."
                            />
                        </div>
                    </div>

                    {/* Right Column: Checkout Breakdown */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100 space-y-6">
                            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                <LucideCreditCard className="text-indigo-600" size={24} /> Booking Summary
                            </h2>

                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Package</span>
                                <span className="font-bold text-gray-900 text-lg leading-snug">{pkg?.name}</span>
                                {pkg?.hall_name && (
                                    <span className="text-xs text-gray-400 block mt-1">📍 {pkg.hall_name}</span>
                                )}
                            </div>

                            {/* Billing Details */}
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                    <span>Total Price</span>
                                    <span>₹{price.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-indigo-600 bg-indigo-50/50 px-4 py-2.5 rounded-xl">
                                    <span>Advance Amount (15% today)</span>
                                    <span>₹{advanceAmount.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-gray-500">
                                    <span>Remaining Balance (85% later)</span>
                                    <span>₹{balanceAmount.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <div className="flex justify-between items-baseline mb-6">
                                    <span className="text-lg font-black text-gray-900">Payable Today</span>
                                    <span className="text-3xl font-black text-indigo-600">₹{advanceAmount.toLocaleString('en-IN')}</span>
                                </div>

                                <button
                                    onClick={handleBookNow}
                                    disabled={submitting || !selectedDate || dateAvailable === false || checkingDate}
                                    className={`w-full py-5 rounded-2xl text-lg font-black transition-all shadow-xl flex items-center justify-center gap-2 ${
                                        (submitting || !selectedDate || dateAvailable === false || checkingDate)
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-indigo-600/30'
                                    }`}
                                >
                                    {submitting ? (
                                        <>
                                            <LucideLoader2 className="animate-spin" size={20} />
                                            Completing Order...
                                        </>
                                    ) : (
                                        'Confirm & Pay'
                                    )}
                                </button>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-xs text-blue-700 leading-relaxed font-semibold">
                                <LucideInfo className="shrink-0 text-blue-500" size={16} />
                                <span>Note: Balance payment is payable at the venue or before the event date directly via your Bookings History portal.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
