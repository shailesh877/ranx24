import React from 'react';

export default function Card({
    children,
    className = '',
    padding = 'md',
    hover = false,
    onClick = null,
}) {
    const paddings = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
    };

    return (
        <div
            onClick={onClick}
            className={`
        bg-white rounded-xl border border-gray-200 shadow-sm
        ${paddings[padding]}
        ${hover ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
}
