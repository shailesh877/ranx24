import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import axiosInstance, { getRazorpayConfig } from '../utils/axiosConfig';
import {
  LucideMapPin,
  LucideTicket,
  LucideCoins,
  LucideCreditCard,
  LucideBanknote,
  LucideLock,
  LucideShieldCheck,
  LucideChevronRight,
  LucideCalendar,
  LucideClock,
  LucideLoader,
  LucideCheckCircle
} from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart, loading: cartLoading } = useCart();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [userAddress, setUserAddress] = useState(null);

  // Coupon & Coins State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [coinDiscount, setCoinDiscount] = useState(0);
  const [maxCoinsAllowed, setMaxCoinsAllowed] = useState(0);
  const [feeConfig, setFeeConfig] = useState(null);
  const [platformFee, setPlatformFee] = useState(0);
  const [percentageFee, setPercentageFee] = useState(0);
  const [activeMembership, setActiveMembership] = useState(null);
  const [membershipDiscount, setMembershipDiscount] = useState(0);

  // Determine items to checkout
  const directBookingData = location.state?.directBooking;
  const validCartItems = cartItems.filter(item => item.category && item.serviceName);
  const checkoutItems = directBookingData ? [directBookingData] : validCartItems;
  const isDirectBooking = !!directBookingData;

  useEffect(() => {
    if (checkoutItems.length > 0 && checkoutItems[0].address) {
      const addr = checkoutItems[0].address;
      if (typeof addr === 'object') {
        setUserAddress(addr);
      } else {
        // Fallback for old string addresses
        setUserAddress({
          street: addr,
          city: '',
          state: '',
          zipCode: '',
          name: '',
          mobileNumber: ''
        });
      }
    }
  }, [checkoutItems]);

  useEffect(() => {
    if (!cartLoading && checkoutItems.length === 0) {
      toast.error('No items to checkout');
      navigate('/');
    }
    fetchUserCoins();
    fetchFeeConfig();
    fetchActiveMembership();
  }, [checkoutItems, cartLoading, navigate]);

  useEffect(() => {
    calculateMaxCoins();
  }, [couponDiscount, userCoins]);

  const fetchUserCoins = async () => {
    try {
      const { data } = await axiosInstance.get(`/coins/my-balance`);
      setUserCoins(data.balance || 0);
    } catch (error) {
      console.error('Error fetching coins:', error);
    }
  };

  const fetchFeeConfig = async () => {
    try {
      const { data } = await axiosInstance.get('/admin/fees');
      setFeeConfig(data);
      if (data.isActive) {
        setPlatformFee(data.platformFee || 0);
      }
    } catch (error) {
      console.error('Error fetching fee config:', error);
    }
  };

  const fetchActiveMembership = async () => {
    try {
      const { data } = await axiosInstance.get('/membership-plans/my-membership');
      if (data.success) {
        setActiveMembership(data.data);
      }
    } catch (error) {
      console.error('Error fetching active membership:', error);
    }
  };

  const calculateSubtotal = () => {
    return checkoutItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateTotalPrice = () => {
    const itemsTotal = calculateSubtotal();
    const subtotalAfterDiscounts = itemsTotal - membershipDiscount - couponDiscount - coinDiscount + platformFee + percentageFee;
    const gstAmount = Math.round(Math.max(0, subtotalAfterDiscounts) * 0.18);
    const total = subtotalAfterDiscounts + gstAmount;
    return Math.max(0, total);
  };

  const calculateMaxCoins = async () => {
    if (userCoins === 0) return;
    try {
      const priceAfterModifiers = calculateSubtotal() - membershipDiscount - couponDiscount;

      if (priceAfterModifiers <= 0) {
        setMaxCoinsAllowed(0);
        return;
      }

      const { data } = await axiosInstance.post(
        `/coins/calculate`,
        { bookingAmount: priceAfterModifiers }
      );
      setMaxCoinsAllowed(data.maxCoinsAllowed);
    } catch (error) {
      console.error('Error calculating coins:', error);
    }
  };

  const calculateMembershipDiscount = () => {
    if (!activeMembership || !activeMembership.plan_id) {
      setMembershipDiscount(0);
      return;
    }

    const itemsTotal = calculateSubtotal();
    const tiers = activeMembership.plan_id.discount_tiers || [];
    let applicablePercentage = 0;

    tiers.forEach((tier) => {
      const minAmount = parseFloat(tier.min_amount || 0);
      const discountPercent = parseFloat(tier.discount_percentage || 0);
      if (itemsTotal >= minAmount && discountPercent > applicablePercentage) {
        applicablePercentage = discountPercent;
      }
    });

    if (applicablePercentage > 0) {
      setMembershipDiscount(Math.round((itemsTotal * applicablePercentage) / 100));
    } else {
      setMembershipDiscount(0);
    }
  };

  const calculatePercentageServiceFee = () => {
    if (!feeConfig?.isActive || !feeConfig?.percentageCharge) {
      setPercentageFee(0);
      return;
    }
    const itemsTotal = calculateSubtotal();
    setPercentageFee(Math.round((itemsTotal * feeConfig.percentageCharge) / 100));
  };

  useEffect(() => {
    calculateMembershipDiscount();
    calculatePercentageServiceFee();
  }, [checkoutItems, activeMembership, feeConfig]);

  const advanceRequired = Math.ceil(calculateTotalPrice() * 0.15);
  const remainingBalance = calculateTotalPrice() - advanceRequired;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      const { data } = await axiosInstance.post(
        `/coupons/validate`,
        {
          code: couponCode,
          orderValue: calculateSubtotal(),
          serviceIds: checkoutItems.map(item => item.serviceId).filter(id => id)
        }
      );

      if (data.valid) {
        setAppliedCoupon(data.coupon);
        setCouponDiscount(data.coupon.discountAmount);
        toast.success(`Coupon applied! Saved ₹${data.coupon.discountAmount}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
      setCouponCode('');
    }
  };

  const handleCoinsChange = (value) => {
    const coins = parseInt(value) || 0;
    const maxAllowed = Math.min(userCoins, maxCoinsAllowed);
    const actualCoins = Math.min(coins, maxAllowed);

    setCoinsToUse(actualCoins);
    setCoinDiscount(actualCoins); // Assuming 1 Coin = ₹1
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to place order');
        navigate('/login');
        return;
      }

      // Payment method is now always online for advance
      const totalAmount = advanceRequired; // Website now follows 15% advance rule
      if (totalAmount === 0) {
        await createBookings('partial'); // Status is partial (paid) if total is somehow 0
        return;
      }

      // 1. Fetch Razorpay Key from backend
      const razorpayKey = await getRazorpayConfig();

      // 2. Create Razorpay Order
      const { data: orderData } = await axiosInstance.post(
        `/payment/order`,
        { amount: totalAmount }
      );

      const options = {
        key: razorpayKey, // Dynamically fetched from backend
        amount: orderData.amount,
        currency: orderData.currency,
        name: "RanX24",
        description: "Service Booking",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            const verifyRes = await axiosInstance.post(
              `/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            if (verifyRes.data.success) {
              await createBookings('partial', response.razorpay_payment_id);
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: "#3B82F6" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Failed to place order');
      setLoading(false);
    }
  };

  const createBookings = async (status, paymentId = null) => {
    try {
      const bookings = checkoutItems.map(item => ({
        workerId: item.workerId,
        category: item.category,
        service: item.serviceName,
        description: `Booking for ${item.serviceName}`,
        bookingDate: item.date,
        bookingTime: item.time,
        price: item.totalPrice,
        bookingType: 'hourly', // Defaulting to hourly as per new flow
        duration: item.duration,
        address: item.address
      }));

      await axiosInstance.post(
        `/bookings/bulk`,
        {
          bookings,
          paymentStatus: status,
          paymentId,
          couponCode: appliedCoupon?.code,
          coinsUsed: coinsToUse,
          address: userAddress,
          platformFee,
          percentageFee,
          gstAmount: Math.round(Math.max(0, calculateSubtotal() - membershipDiscount - couponDiscount - coinDiscount + platformFee + percentageFee) * 0.18),
          isAdvancePayment: true,
          advanceAmount: advanceRequired,
          amountPaid: advanceRequired
        }
      );

      toast.success('Booking placed successfully!');
      if (!isDirectBooking) clearCart();
      navigate('/my-bookings');
    } catch (error) {
      console.error("Booking creation failed", error);
      toast.error('Failed to create bookings');
    } finally {
      setLoading(false);
    }
  };

  if (!userAddress) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <LucideChevronRight className="text-gray-400" />
          <span className="text-gray-500 font-medium">Review & Pay</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Address Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <LucideMapPin className="text-blue-600" size={20} />
                  </div>
                  <h2 className="font-bold text-gray-900 text-lg">Service Address</h2>
                </div>
                <button onClick={() => navigate('/my-address')} className="text-blue-600 text-sm font-semibold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                  Change
                </button>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-lg">{userAddress?.name}</span>
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">Home</span>
                    </div>
                    <p className="text-gray-600 mb-1">{userAddress?.street}</p>
                    <p className="text-gray-600">{userAddress?.city}, {userAddress?.state} - {userAddress?.zipCode}</p>
                    <p className="text-gray-500 text-sm mt-2">Mobile: <span className="text-gray-900 font-medium">{userAddress?.mobileNumber}</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="font-bold text-gray-900 text-lg">Order Summary</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {checkoutItems.map((item, index) => (
                  <div key={index} className="p-5 flex gap-4 hover:bg-gray-50 transition-colors">
                    <img
                      src={item.image ? `${SERVER_URL}/${item.image.replace(/\\/g, '/')}` : 'https://via.placeholder.com/100'}
                      alt={item.serviceName}
                      className="w-20 h-20 rounded-xl object-cover border border-gray-100"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Service'; }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">{item.serviceName}</h3>
                        <span className="font-bold text-gray-900">₹{item.totalPrice.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{item.category}</p>

                      <div className="flex flex-wrap gap-3">
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                          <LucideCalendar size={14} className="text-blue-500" />
                          {item.date}
                        </div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                          <LucideClock size={14} className="text-orange-500" />
                          {item.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Offers & Benefits */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="font-bold text-gray-900 text-lg">Offers & Benefits</h2>
              </div>

              <div className="p-5 space-y-6">
                {/* Coupons */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <LucideTicket className="text-green-600" size={18} />
                    <span className="font-medium text-gray-900">Apply Coupon</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                          <LucideCheckCircle className="text-green-600" size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-green-800">{appliedCoupon.code}</p>
                          <p className="text-sm text-green-600">You saved ₹{couponDiscount}</p>
                        </div>
                      </div>
                      <button onClick={() => {
                        setAppliedCoupon(null);
                        setCouponDiscount(0);
                        setCouponCode('');
                      }} className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded-lg transition-colors">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="w-full pl-4 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase font-medium transition-all"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-black transition-all shadow-lg shadow-gray-200"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Coins */}
                {userCoins > 0 && (
                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <LucideCoins className="text-yellow-500" size={18} />
                      <span className="font-medium text-gray-900">Use YC Coins</span>
                    </div>

                    <div className="bg-yellow-50/50 rounded-xl p-5 border border-yellow-100">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-yellow-800 font-medium">
                          Balance: <span className="font-bold">{userCoins}</span>
                        </p>
                        <p className="text-sm text-yellow-800 font-medium">
                          Max usable: <span className="font-bold">{maxCoinsAllowed}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0"
                          max={maxCoinsAllowed}
                          value={coinsToUse}
                          onChange={(e) => handleCoinsChange(e.target.value)}
                          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        />
                        <div className="bg-white px-3 py-1 rounded-lg border border-yellow-200 font-bold text-gray-900 w-16 text-center shadow-sm">
                          {coinsToUse}
                        </div>
                      </div>

                      {coinsToUse > 0 && (
                        <p className="text-green-600 text-sm mt-3 font-medium flex items-center gap-1">
                          <LucideCheckCircle size={14} />
                          ₹{coinDiscount} saved with coins
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="font-bold text-gray-900 text-lg">Payment Method</h2>
              </div>
              <div className="p-5">
                <div
                  className="relative p-5 rounded-xl border-2 border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <LucideCreditCard className="text-blue-600" size={24} />
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center border-blue-600">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900">Online Payment (15% Advance)</h3>
                  <p className="text-sm text-gray-500 mt-1">UPI, Cards, Net Banking</p>
                </div>
                <p className="text-xs text-gray-400 mt-3 italic text-center">Cash on delivery is not available for advance payments.</p>
              </div>
            </div>
          </div>

          {/* Right Column - Sticky Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Details</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Item Total</span>
                  <span className="font-medium">₹{calculateSubtotal().toLocaleString()}</span>
                </div>

                {membershipDiscount > 0 && (
                  <div className="flex justify-between text-blue-600 bg-blue-50 p-2 rounded-lg">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      Membership ({activeMembership?.plan_id?.name})
                    </span>
                    <span className="font-bold">-₹{membershipDiscount}</span>
                  </div>
                )}

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 bg-green-50 p-2 rounded-lg">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <LucideTicket size={14} /> Coupon
                    </span>
                    <span className="font-bold">-₹{couponDiscount}</span>
                  </div>
                )}

                {coinDiscount > 0 && (
                  <div className="flex justify-between text-yellow-600 bg-yellow-50 p-2 rounded-lg">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <LucideCoins size={14} /> Coins
                    </span>
                    <span className="font-bold">-₹{coinDiscount}</span>
                  </div>
                )}

                {platformFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Platform Fee</span>
                    <span>₹{platformFee}</span>
                  </div>
                )}

                {percentageFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Service Charge ({feeConfig?.percentageCharge}%)</span>
                    <span>₹{percentageFee}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span>₹{Math.round(Math.max(0, calculateSubtotal() - membershipDiscount - couponDiscount - coinDiscount + platformFee + percentageFee) * 0.18)}</span>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <span className="text-gray-500 text-sm block mb-1">Total Amount</span>
                      <span className="font-bold text-gray-900 text-2xl">
                        ₹{calculateTotalPrice().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex justify-between mb-2">
                      <span className="text-blue-900 font-bold">Advance Payment (15%)</span>
                      <span className="text-blue-900 font-bold">₹{advanceRequired.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">Balance to pay later (85%)</span>
                      <span className="text-blue-700">₹{remainingBalance.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-blue-600 mt-2 italic">* Advance payment is required to confirm booking.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <LucideLoader className="animate-spin" size={20} /> Processing...
                  </>
                ) : (
                  <>
                    Pay ₹{advanceRequired.toLocaleString()} (15%)
                    <LucideChevronRight size={20} />
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs font-medium bg-gray-50 py-2 rounded-lg">
                <LucideShieldCheck size={14} className="text-green-500" />
                100% Secure Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}