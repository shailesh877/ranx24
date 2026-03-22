import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheckCircle, FaCalendarCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://backend.ranx24.com/api";

export default function WorkerCompletedBookings() {
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [completedBookings, setCompletedBookings] = useState([]);
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

        setCompletedBookings(
          bookingsData.filter((b) => b.status === "completed")
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-green-700 text-xl">
        Loading completed bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-[Poppins] px-5 py-10">
      <h1 className="text-3xl font-extrabold text-green-700 mb-8 border-b-4 border-green-400 inline-block pb-2">
        Completed Bookings
      </h1>

      {completedBookings.length === 0 ? (
        <p className="text-gray-500 text-center mt-20 text-lg">
          No completed bookings found.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {completedBookings.map((b) => (
            <div
              key={b._id}
              className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5 hover:shadow-xl transition"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" /> {b.serviceName}
                </h3>

                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                  Completed
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
                  <span className="font-semibold">Amount Earned:</span>{" "}
                  <span className="text-green-700 font-bold">₹{b.amount}</span>
                </p>
              </div>

              {/* DATE */}
              <div className="mt-4 flex items-center gap-2 text-gray-600 text-sm">
                <FaCalendarCheck className="text-green-500" />
                <span>
                  {new Date(b.completedAt || b.date).toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => navigate(`/worker/booking/${b._id}`)}
                className="mt-5 w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
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
