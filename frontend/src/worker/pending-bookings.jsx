import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaClock, FaQuestionCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://backend.ranx24.com/api";

export default function WorkerPendingBookings() {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const mobile = user?.mobileNumber;

    if (!mobile) return navigate("/worker-login");

    const loadData = async () => {
      try {
        const { data: workerData } = await axios.get(
          `${API_URL}/workers/mobile/${mobile}`
        );
        setWorker(workerData);

        const { data: bookingsData } = await axios.get(
          `${API_URL}/bookings/worker/${workerData._id}`
        );

        setPendingBookings(
          bookingsData.filter((b) => b.status === "pending")
        );
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const handleAccept = async (id) => {
    try {
      await axios.put(`${API_URL}/bookings/${id}/accept`);
      setPendingBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`${API_URL}/bookings/${id}/reject`);
      setPendingBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-blue-700 text-xl">
        Loading pending bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-[Poppins] px-5 py-10">
      <h1 className="text-3xl font-extrabold text-yellow-600 mb-8 border-b-4 border-yellow-400 inline-block pb-2">
        Pending Bookings
      </h1>

      {pendingBookings.length === 0 ? (
        <p className="text-gray-500 text-center mt-20 text-lg">
          No pending bookings right now.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pendingBookings.map((b) => (
            <div
              key={b._id}
              className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5 hover:shadow-xl transition"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-yellow-700 flex items-center gap-2">
                  <FaQuestionCircle className="text-yellow-500" /> {b.serviceName}
                </h3>

                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                  Pending
                </span>
              </div>

              {/* CUSTOMER INFO */}
              <div className="mt-3 text-gray-700 space-y-1 text-sm">
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
                <FaClock className="text-yellow-500" />
                <span>{new Date(b.date).toLocaleString()}</span>
              </div>

              {/* BUTTONS */}
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => handleAccept(b._id)}
                  className="w-1/2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold transition"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleReject(b._id)}
                  className="w-1/2 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-semibold transition"
                >
                  Reject
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
