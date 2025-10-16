import React from 'react';

interface GabuAvatarProps {
  isTyping?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const GabuAvatar: React.FC<GabuAvatarProps> = ({ 
  isTyping = false, 
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg ${isTyping ? 'animate-pulse' : ''}`}>
        <span className="text-white text-lg">🌟</span>
      </div>
    </div>
  );
};

export default GabuAvatar;