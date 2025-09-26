import React from 'react';
import { GabuIcon } from './Icons';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  showProgress?: boolean;
  progress?: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Gabu is thinking...", 
  subMessage,
  showProgress = false,
  progress = 0
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
      <div className="relative mb-6">
        <GabuIcon className="w-16 h-16 text-purple-500 animate-gentle-bounce" />
        {showProgress && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">{message}</h3>
      {subMessage && (
        <p className="text-gray-600 text-sm max-w-md">{subMessage}</p>
      )}
      
      {showProgress && (
        <p className="text-purple-600 text-sm font-medium mt-2">
          {Math.round(progress)}% complete
        </p>
      )}
    </div>
  );
};

export default LoadingState;
