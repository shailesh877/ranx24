import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaClock, FaList } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://backend.ranx24.com/api";

export default function WorkerActiveBookings() {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const mobile = user?.mobileNumber;

    if (!mobile) return navigate("/worker-login");

    const loadData = async () => {
      try {
        // Fetch Worker
        const { data: workerData } = await axios.get(
          `${API_URL}/workers/mobile/${mobile}`
        );
        setWorker(workerData);

        // Fetch all bookings
        const { data: bookingsData } = await axios.get(
          `${API_URL}/bookings/worker/${workerData._id}`
        );

        // Filter → ACTIVE bookings only
        setActiveBookings(
          bookingsData.filter((b) => b.status === "active")
        );
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-xl text-blue-800">
        Loading active bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-[Poppins] px-5 py-10">
      <h1 className="text-3xl font-extrabold text-blue-700 mb-8 border-b-4 border-blue-400 inline-block pb-2">
        Active Bookings
      </h1>

      {activeBookings.length === 0 ? (
        <p className="text-gray-600 text-center mt-20 text-lg">
          No active bookings currently.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeBookings.map((b) => (
            <div
              key={b._id}
              className="bg-white shadow-lg rounded-2xl p-5 border border-gray-200 hover:shadow-xl transition"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                  <FaList className="text-blue-500" /> {b.serviceName}
                </h3>

                {/* Active Status */}
                <span className="px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 bg-blue-100 text-blue-700">
                  <FaCheckCircle /> Active
                </span>
              </div>

              {/* CUSTOMER INFO */}
              <div className="mt-4 text-gray-700 space-y-1 text-sm">
                <p>
                  <span className="font-semibold">Customer:</span>{" "}
                  {b.customerName}
                </p>
                <p>
                  <span className="font-semibold">Mobile:</span>{" "}
                  {b.customerMobile}
                </p>
                <p>
                  <span className="font-semibold">Address:</span> {b.address}
                </p>
                <p>
                  <span className="font-semibold">Price:</span> ₹{b.amount}
                </p>
              </div>

              {/* DATE */}
              <div className="mt-4 flex items-center gap-2 text-gray-600 text-sm">
                <FaClock className="text-blue-500" />
                <span>{new Date(b.date).toLocaleString()}</span>
              </div>

              {/* VIEW BOOKING BUTTON */}
              <button
                onClick={() => navigate(`/worker/booking/${b._id}`)}
                className="mt-5 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
