import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

export default function StarRating({
    rating = 0,
    maxRating = 5,
    size = 20,
    interactive = false,
    onChange = null,
    color = '#F59E0B'
}) {
    const handleClick = (selectedRating) => {
        if (interactive && onChange) {
            onChange(selectedRating);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {[...Array(maxRating)].map((_, index) => {
                const starNumber = index + 1;
                const isFilled = starNumber <= rating;
                const isHalfFilled = starNumber - 0.5 === rating;

                return (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleClick(starNumber)}
                        disabled={!interactive}
                        className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
                        style={{ fontSize: `${size}px` }}
                    >
                        {isFilled ? (
                            <FaStar style={{ color }} />
                        ) : isHalfFilled ? (
                            <FaStarHalfAlt style={{ color }} />
                        ) : (
                            <FaRegStar style={{ color: '#D1D5DB' }} />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
