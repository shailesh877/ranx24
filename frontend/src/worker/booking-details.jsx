import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaTools,
} from "react-icons/fa";
import { MessageCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://backend.ranx24.com/api";

export default function WorkerBookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBooking(data);
      } catch (err) {
        console.error("Booking details error:", err);
        toast.error("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  const handleAccept = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/bookings/${id}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Booking accepted!");
      setBooking(prev => ({ ...prev, status: 'accepted' }));
    } catch (err) {
      console.error("Error accepting booking:", err);
      toast.error("Failed to accept booking");
    }
  };

  const handleReject = async () => {
    if (!window.confirm("Are you sure you want to reject this booking?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/bookings/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Booking rejected");
      setBooking(prev => ({ ...prev, status: 'rejected' }));
    } catch (err) {
      console.error("Error rejecting booking:", err);
      toast.error("Failed to reject booking");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-700 text-xl bg-gray-100">
        Loading booking details...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-xl bg-gray-100">
        Booking not found!
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-[Poppins] px-5 py-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-blue-800 border-b-4 border-blue-500 inline-block pb-2">
          Booking Details
        </h1>

        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 font-semibold transition"
        >
          Back
        </button>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 max-w-4xl mx-auto">
        {/* Status Badge */}
        <div className="flex justify-end mb-5">
          {booking.status === "completed" ? (
            <span className="px-4 py-2 bg-green-100 text-green-800 font-semibold rounded-full flex items-center gap-1">
              <FaCheckCircle /> Completed
            </span>
          ) : booking.status === "active" || booking.status === "accepted" || booking.status === "in-progress" ? (
            <span className="px-4 py-2 bg-blue-100 text-blue-800 font-semibold rounded-full flex items-center gap-1">
              <FaTools /> {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          ) : booking.status === "pending" ? (
            <span className="px-4 py-2 bg-yellow-100 text-yellow-800 font-semibold rounded-full flex items-center gap-1">
              <FaClock /> Pending
            </span>
          ) : (
            <span className="px-4 py-2 bg-red-100 text-red-800 font-semibold rounded-full flex items-center gap-1">
              <FaTimesCircle /> Rejected
            </span>
          )}
        </div>

        {/* Booking Info */}
        <div className="space-y-4 text-gray-800 text-lg">
          <p className="font-semibold text-2xl text-blue-900">
            {booking.service}
          </p>

          <p className="flex items-center gap-3">
            <FaUser className="text-gray-500" />
            <span>
              <b>Customer:</b> {booking.user?.name || 'N/A'}
            </span>
          </p>

          <p className="flex items-center gap-3">
            <FaPhone className="text-green-600" />
            <span>
              <b>Mobile:</b> {booking.user?.phone || 'N/A'}
            </span>
          </p>

          <div className="flex items-start gap-3">
            <FaMapMarkerAlt className="text-red-500 mt-1" />
            <span>
              <b>Address:</b> <br />
              {booking.address?.street}, {booking.address?.city}, <br />
              {booking.address?.state} - {booking.address?.zipCode}
            </span>
          </div>

          <p className="flex items-center gap-3">
            <FaRupeeSign className="text-green-600" />
            <span>
              <b>Amount:</b> ₹{booking.price}
            </span>
          </p>

          <p className="flex items-center gap-3">
            <FaClock className="text-blue-600" />
            <span>
              <b>Booking Time:</b>{" "}
              {new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime}
            </span>
          </p>

          {booking.completedAt && (
            <p className="flex items-center gap-3 text-green-700">
              <FaCheckCircle />
              <span>
                <b>Completed At:</b>{" "}
                {new Date(booking.completedAt).toLocaleString()}
              </span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          {/* Chat Button - Always visible */}
          <button
            onClick={() => navigate(`/worker/chat/${booking._id}`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with Customer
          </button>

          {booking.status === "pending" && (
            <>
              <button
                onClick={handleReject}
                className="flex-1 bg-red-100 text-red-700 py-3 rounded-xl font-bold hover:bg-red-200 transition border border-red-200"
              >
                Reject Booking
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg"
              >
                Accept Booking
              </button>
            </>
          )}

          {booking.status === "accepted" && (
            <button
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
              onClick={() => {
                toast.success("Job is ready to start!");
                // You can add logic here to change status to in-progress if needed
              }}
            >
              Start Job
            </button>
          )}

          {(booking.status === "active" || booking.status === "in-progress") && (
            <button
              onClick={() => navigate(`/worker/complete-job/${booking._id}`)}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition"
            >
              Mark as Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
