import React from 'react';
import { FaUser } from 'react-icons/fa';
import StarRating from './StarRating';

export default function ReviewCard({ userName, rating, comment, date }) {
    const formatDate = (dateString) => {
        const reviewDate = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - reviewDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-600 text-sm" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{userName}</h4>
                    <p className="text-xs text-gray-500">{formatDate(date)}</p>
                </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
                <StarRating rating={rating} size={16} />
                <span className="text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
            </div>

            {/* Comment */}
            <p className="text-gray-700 text-sm leading-relaxed">{comment}</p>
        </div>
    );
}
