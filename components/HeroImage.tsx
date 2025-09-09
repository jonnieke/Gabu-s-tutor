import React from 'react';

const HeroImage: React.FC = () => (
  <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md mx-auto">
    <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" aria-label="An illustration of Gabu, a friendly boy, smiling while sitting at a desk with a book.">
        <defs>
            <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" style={{stopColor: '#ede9fe', stopOpacity: 1}} />
                <stop offset="100%" style={{stopColor: '#d8b4fe', stopOpacity: 1}} />
            </radialGradient>
        </defs>
        <circle cx="150" cy="150" r="140" fill="url(#grad1)" />
        <g transform="translate(0, 20)">
            {/* Hair */}
            <path d="M 100 80 Q 150 40 200 80 C 220 120, 180 150, 150 150 C 120 150, 80 120, 100 80 Z" fill="#333" />
            {/* Face */}
            <ellipse cx="150" cy="125" rx="60" ry="70" fill="#8d5524" />
            {/* Eyes */}
            <circle cx="130" cy="115" r="8" fill="#fff" />
            <circle cx="170" cy="115" r="8" fill="#fff" />
            <circle cx="132" cy="117" r="4" fill="#222" />
            <circle cx="172" cy="117" r="4" fill="#222" />
            {/* Smile */}
            <path d="M 135 150 Q 150 165 165 150" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Shirt */}
            <path d="M 90 190 C 100 220, 200 220, 210 190 L 190 180 L 110 180 Z" fill="#fb923c" />
            {/* Book */}
            <rect x="70" y="210" width="160" height="40" rx="5" ry="5" fill="#f0f9ff" stroke="#e0f2fe" strokeWidth="2" />
            <rect x="148" y="210" width="4" height="40" fill="#cbd5e1" />
             <line x1="80" y1="225" x2="140" y2="225" stroke="#9ca3af" strokeWidth="2" />
             <line x1="160" y1="225" x2="220" y2="225" stroke="#9ca3af" strokeWidth="2" />
             <line x1="80" y1="235" x2="140" y2="235" stroke="#9ca3af" strokeWidth="2" />
             <line x1="160" y1="235" x2="220" y2="235" stroke="#9ca3af" strokeWidth="2" />
        </g>
    </svg>
  </div>
);

export default HeroImage;
