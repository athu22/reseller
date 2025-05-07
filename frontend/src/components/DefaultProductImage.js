import React from 'react';

const DefaultProductImage = ({ className = '', size = 'full' }) => {
  return (
    <div 
      className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      style={{ width: size === 'full' ? '100%' : size, height: size === 'full' ? '100%' : size }}
    >
      <svg 
        className="w-1/2 h-1/2 text-gray-400" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
      </svg>
    </div>
  );
};

export default DefaultProductImage; 