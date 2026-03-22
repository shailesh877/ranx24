import React from 'react';

const ReviewManagement = ({ reviews }) => {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`fa-solid fa-star ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        ></i>
      );
    }
    return stars;
  };

  return (
    <>
      <h2 className="text-2xl font-black text-blue-900 mb-4 flex items-center gap-2">
        <i className="fa-solid fa-star-half-stroke text-yellow-500"></i> Review Management
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Reviews */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">User Reviews</h3>
          <div className="space-y-4">
            {(reviews?.users || []).length > 0 ? (
              reviews.users.map((review) => (
                <div key={review.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{review.name}</span>
                    <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                  </div>
                  <p className="text-sm text-gray-600">{review.text}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No user reviews found.</p>
            )}
          </div>
        </div>

        {/* Worker Reviews */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Worker Reviews</h3>
          <div className="space-y-4">
            {(reviews?.workers || []).length > 0 ? (
              reviews.workers.map((review) => (
                <div key={review.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold">{review.name}</span>
                    <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                  </div>
                  <p className="text-sm text-gray-600">{review.text}</p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No worker reviews found.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewManagement;
