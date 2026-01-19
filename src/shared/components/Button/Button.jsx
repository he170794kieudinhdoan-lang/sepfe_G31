
import React from 'react';

export const Button = ({ variant = 'primary', isDisabled, children, ...props }) => {
    const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors duration-200";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100",
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant] || variants.primary}`}
            disabled={isDisabled}
            {...props}
        >
            {children}
        </button>
    );
};
