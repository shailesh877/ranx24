import React from 'react';

export default function Skeleton({
    width = '100%',
    height = '20px',
    className = '',
    circle = false,
    count = 1,
}) {
    const skeletons = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            className={`
        animate-pulse bg-gray-200 
        ${circle ? 'rounded-full' : 'rounded-md'}
        ${className}
      `}
            style={{ width, height }}
        />
    ));

    return count > 1 ? <div className="space-y-3">{skeletons}</div> : skeletons[0];
}
