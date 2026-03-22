import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { LucideCalendar, LucideClock, LucideMapPin, LucideChevronLeft, LucideShieldCheck } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com';

export default function BookingPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Parse query params
  const queryParams = new URLSearchParams(location.search);
  const serviceId = id || queryParams.get('serviceId');
  const serviceNameParam = queryParams.get('service');
  const categoryNameParam = queryParams.get('category');

  const [serviceDetails, setServiceDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [address, setAddress] = useState({
    name: '',
    mobileNumber: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    landmark: '',
    alternateNumber: ''
  });
  // const [totalPrice, setTotalPrice] = useState(0); // Derived from service price directly now

  useEffect(() => {
    if (!serviceId && !serviceNameParam) {
      toast.error("Invalid service selection");
      navigate('/categories');
      return;
    }
    fetchServiceDetails();
  }, [serviceId, serviceNameParam]);

  const fetchServiceDetails = async () => {
    try {
      let data;
      if (serviceId) {
        const response = await axiosInstance.get(`/services/${serviceId}`);
        data = response.data;
      } else {
        const response = await axiosInstance.get(`/services`);
        data = response.data.find(s => s.name === serviceNameParam);
      }

      if (data) {
        setServiceDetails(data);
      } else {
        toast.error("Service details not found");
        navigate('/categories');
      }
    } catch (error) {
      console.error("Error fetching service details:", error);
      if (error.response && error.response.status === 404) {
        toast.error("Service no longer exists. Please select another.");
        navigate('/categories');
      } else {
        toast.error("Failed to load service details");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = (action) => {
    if (!date || !time || !address.street || !address.city || !address.state || !address.zipCode || !address.name || !address.mobileNumber) {
      toast.error("Please fill in all required details");
      return;
    }

    const bookingItem = {
      workerId: null,
      workerName: "Pending Assignment",
      serviceName: serviceDetails?.name || serviceNameParam,
      category: serviceDetails?.category?.name || categoryNameParam,
      date: date.toISOString().split('T')[0],
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration: 1, // Default to 1 or remove if backend allows
      price: serviceDetails?.basePrice || 0,
      totalPrice: serviceDetails?.basePrice || 0,
      address: address,
      image: serviceDetails?.image
    };

    if (action === 'cart') {
      addToCart(bookingItem);
      toast.success("Added to cart!");
      // Optional: Navigate to cart or stay
      // navigate('/user_cart'); 
    } else {
      // Direct Booking - Pass item directly to checkout
      navigate('/checkout', { state: { directBooking: bookingItem } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!serviceDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
          <p className="text-gray-500 mb-6">We couldn't load the details for this service.</p>
          <button
            onClick={() => navigate('/categories')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Browse Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* App-like Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <LucideChevronLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Book Service</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Service Card */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
          <img
            src={`${SERVER_URL}/${serviceDetails.image?.replace(/\\/g, '/')}`}
            alt={serviceDetails.name}
            className="w-20 h-20 rounded-xl object-cover"
            onError={(e) => { e.target.src = 'https://placehold.co/300?text=Service'; }}
          />
          <div>
            <h2 className="text-lg font-bold text-gray-900">{serviceDetails.name}</h2>
            <p className="text-sm text-gray-500 mb-1">{serviceDetails.category?.name || categoryNameParam}</p>
            <p className="text-blue-600 font-bold">₹{serviceDetails.basePrice}</p>
          </div>
        </div>

        {/* Date & Time Section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <LucideCalendar size={18} className="text-blue-600" />
            Select Date & Time
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Date</label>
              <div className="relative">
                <DatePicker
                  selected={date}
                  onChange={(d) => setDate(d)}
                  minDate={new Date()}
                  dateFormat="MMMM d, yyyy"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Time</label>
              <div className="relative">
                <DatePicker
                  selected={time}
                  onChange={(t) => setTime(t)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={30}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <LucideMapPin size={18} className="text-blue-600" />
            Service Location
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Name</label>
                <input
                  type="text"
                  value={address.name || ''}
                  onChange={(e) => setAddress({ ...address, name: e.target.value })}
                  placeholder="Name"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Mobile Number</label>
                <input
                  type="tel"
                  value={address.mobileNumber || ''}
                  onChange={(e) => setAddress({ ...address, mobileNumber: e.target.value })}
                  placeholder="Mobile Number"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Pincode</label>
                <input
                  type="text"
                  value={address.zipCode || ''}
                  onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                  placeholder="Pincode"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">City/Town</label>
                <input
                  type="text"
                  value={address.city || ''}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="City/Town"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">State</label>
                <input
                  type="text"
                  value={address.state || ''}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  placeholder="State"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Alternate Number</label>
                <input
                  type="tel"
                  value={address.alternateNumber || ''}
                  onChange={(e) => setAddress({ ...address, alternateNumber: e.target.value })}
                  placeholder="Alternate Number (Optional)"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Address (House No, Building, Street)</label>
              <textarea
                rows="2"
                value={address.street || ''}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                placeholder="Enter your full address"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-700"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Landmark</label>
              <input
                type="text"
                value={address.landmark || ''}
                onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                placeholder="Landmark (Optional)"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-24">
          <LucideShieldCheck size={14} className="text-green-600" />
          <span>Secure Booking & Verified Professionals</span>
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="container mx-auto max-w-lg flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500">Total Amount</p>
              <p className="text-xl font-bold text-gray-900">₹{serviceDetails.basePrice}</p>
            </div>
            <div className="flex gap-3 flex-grow max-w-[300px]">
              <button
                onClick={() => handleBookingAction('cart')}
                className="flex-1 bg-white border border-blue-600 text-blue-600 font-bold py-3 px-4 rounded-xl hover:bg-blue-50 transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={() => handleBookingAction('book')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
