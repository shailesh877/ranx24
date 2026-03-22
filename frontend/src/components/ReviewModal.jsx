import React, { useState } from 'react';
import { FaTimes, FaStar, FaUser } from 'react-icons/fa';
import StarRating from './StarRating';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend.ranx24.com/api';

export default function ReviewModal({
    isOpen,
    onClose,
    bookingId,
    workerId,
    workerName,
    onSubmitSuccess
}) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (!comment.trim()) {
            toast.error('Please write a comment');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            await axios.post(
                `${API_URL}/reviews`,
                {
                    worker: workerId,
                    booking: bookingId,
                    rating,
                    comment: comment.trim(),
                },
                config
            );

            toast.success('Review submitted successfully!');
            setRating(0);
            setComment('');
            onClose();
            if (onSubmitSuccess) {
                onSubmitSuccess();
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const getRatingLabel = (rating) => {
        if (rating === 1) return '⭐ Poor';
        if (rating === 2) return '⭐⭐ Fair';
        if (rating === 3) return '⭐⭐⭐ Good';
        if (rating === 4) return '⭐⭐⭐⭐ Very Good';
        if (rating === 5) return '⭐⭐⭐⭐⭐ Excellent';
        return '';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">Write a Review</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Worker Info */}
                    <div className="bg-blue-50 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-blue-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{workerName}</p>
                            <p className="text-sm text-gray-600">Professional Worker</p>
                        </div>
                    </div>

                    {/* Rating Section */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            How would you rate this service?
                        </label>
                        <div className="flex flex-col items-center gap-3 py-4">
                            <StarRating
                                rating={rating}
                                size={40}
                                interactive={true}
                                onChange={setRating}
                            />
                            {rating > 0 && (
                                <p className="text-sm font-medium text-gray-600">
                                    {getRatingLabel(rating)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Comment Section */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Share your experience
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about your experience with this worker..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={6}
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">
                            {comment.length}/500
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
