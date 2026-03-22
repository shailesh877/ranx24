import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LucideTrash2, LucideCheckCircle, LucideLock, LucideCalendar, LucideClock, LucideShoppingBag, LucideMapPin } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://backend.ranx24.com';

export default function UserCart() {
  const { cartItems, loading, error, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleRemove = async (workerId) => {
    await removeFromCart(workerId);
    toast.success('Item removed from cart!');
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
      toast.success('Cart cleared!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-red-500 mb-4 text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Cart</h2>
          <p>{error}</p>
        </div>
        <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Try Again</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your selections before checkout</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6 text-gray-300">
              <LucideShoppingBag size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added any services yet</p>
            <Link to="/categories" className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors">
              Explore Services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
                  {/* Worker Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={`${SERVER_URL}/${item.image?.replace(/\\/g, '/')}`}
                      alt={item.workerName}
                      className="w-24 h-24 rounded-xl object-cover border border-gray-100"
                      onError={(e) => { e.target.src = 'https://placehold.co/300?text=Worker'; }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{item.serviceName}</h3>
                        <p className="text-sm text-gray-500">by {item.workerName}</p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.workerId)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                        title="Remove item"
                      >
                        <LucideTrash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 mb-4">
                      {item.isPendingDetails ? (
                        <div className="col-span-2 bg-yellow-50 text-yellow-800 p-3 rounded-lg flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <LucideClock size={16} />
                            <span>Setup Required</span>
                          </span>
                          <button
                            onClick={() => {
                              handleRemove(item.workerId || item._id); // Remove incomplete item
                              navigate(`/book-worker/service?service=${encodeURIComponent(item.serviceName)}&category=${encodeURIComponent(item.category)}`);
                            }}
                            className="bg-yellow-100 hover:bg-yellow-200 text-yellow-900 px-3 py-1 rounded-md text-xs font-bold transition-colors"
                          >
                            Complete Now
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center">
                            <LucideCalendar size={14} className="mr-2 text-blue-500" />
                            {item.date}
                          </div>
                          <div className="flex items-center">
                            <LucideClock size={14} className="mr-2 text-blue-500" />
                            {item.time} ({item.duration} hrs)
                          </div>
                          <div className="flex items-center sm:col-span-2">
                            <LucideMapPin size={14} className="mr-2 text-blue-500" />
                            <span className="truncate">{item.address?.street ? `${item.address.street}, ${item.address.city}` : (typeof item.address === 'string' ? item.address : 'Address not set')}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <span className="text-sm text-gray-500">Price per hour: ₹{item.price}</span>
                      <span className="text-xl font-bold text-blue-600">₹{item.totalPrice}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Clear Cart Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleClearCart}
                  className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LucideTrash2 size={16} /> Clear Cart
                </button>
              </div>
            </div>

            {/* Order Summary - Sticky */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Items ({cartItems.length})</span>
                    <span className="font-semibold">₹{cartItems.reduce((acc, item) => acc + item.totalPrice, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Service Charges</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="border-t border-dashed border-gray-200 pt-3 mt-3"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-black text-blue-900">
                      ₹{cartItems.reduce((acc, item) => acc + item.totalPrice, 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <LucideCheckCircle size={20} />
                  Proceed to Checkout
                </button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <LucideLock size={12} />
                    Secure checkout guaranteed
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
