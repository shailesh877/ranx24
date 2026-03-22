import React from "react";
import { useNavigate } from "react-router-dom";
import { LucideCheckCircle, LucideHome, LucideList } from "lucide-react";

export default function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <LucideCheckCircle className="text-green-600" size={48} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600 mb-8 text-lg">
          Your service request has been successfully placed. We've sent a confirmation email to you.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/my-bookings')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <LucideList size={20} />
            View My Bookings
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-xl border border-gray-200 flex items-center justify-center gap-2 transition-all"
          >
            <LucideHome size={20} />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
