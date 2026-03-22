import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "https://backend.ranx24.com/api";

export default function WorkerReviews() {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("latest");

  useEffect(() => {
    fetchReviews();
  }, [sortOrder]);

  const fetchReviews = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const workerId = user?._id;

      if (!workerId) return;

      const { data } = await axios.get(
        `${API_URL}/reviews/${workerId}?sort=${sortOrder}`
      );

      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-blue-900 text-xl">
        Loading reviews...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-[Poppins] px-5 py-10">

      {/* HEADER */}
      <h1 className="text-3xl font-extrabold text-blue-900 mb-8 border-b-4 border-yellow-400 inline-block pb-1">
        Reviews & Ratings
      </h1>

      <div className="max-w-5xl mx-auto">

        {/* Rating Summary Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Overall Rating</h2>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <h3 className="text-6xl font-semibold text-yellow-500">{averageRating.toFixed(1)}</h3>
              <p className="text-gray-600">out of 5</p>
            </div>

            <div className="flex gap-1 text-yellow-400 text-2xl">
              {Array(5)
                .fill()
                .map((_, i) => (
                  <FaStar key={i} className={i < Math.round(averageRating) ? "text-yellow-400" : "text-gray-300"} />
                ))}
            </div>

            <div className="text-gray-700 text-lg">
              {totalReviews} Reviews
            </div>
          </div>
        </div>

        {/* Sorting */}
        <div className="flex justify-end mb-4">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400"
          >
            <option value="latest">Latest</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>

        {/* Reviews List */}
        <div className="space-y-5">
          {reviews.length === 0 && (
            <p className="text-center text-gray-500 text-lg">No reviews yet.</p>
          )}

          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white p-6 rounded-xl shadow border hover:bg-blue-50 transition"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-blue-900 text-lg">{review.customerName}</h3>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`text-xl ${i < review.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                    />
                  ))}
                  <span className="ml-2 font-semibold text-gray-700">{review.rating}.0</span>
                </div>
              </div>

              <p className="text-gray-700 mt-3 italic">
                "{review.comment}"
              </p>

              <p className="text-xs text-gray-500 mt-2">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
