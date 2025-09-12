import React from 'react';
import { LearningProgress } from '../types';
import { formatTime, getWeeklyProgressPercentage } from '../services/progressService';
import { ClockIcon, FireIcon, ChartBarIcon } from './Icons';

interface ProgressRingProps {
  progress: LearningProgress;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ 
  progress, 
  size = 'md', 
  showDetails = true 
}) => {
  const percentage = getWeeklyProgressPercentage();
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex items-center gap-4">
      {/* Progress Ring */}
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-purple-500 transition-all duration-500 ease-in-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold text-purple-600 ${textSizeClasses[size]}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="flex-1 space-y-2">
          {/* Weekly Goal */}
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {formatTime(progress.weeklyProgress)} / {formatTime(progress.weeklyGoal)} this week
            </span>
          </div>

          {/* Study Streak */}
          <div className="flex items-center gap-2">
            <FireIcon className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-600">
              {progress.currentStreak} day streak
            </span>
          </div>

          {/* Total Time */}
          <div className="flex items-center gap-2">
            <ChartBarIcon className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">
              {formatTime(progress.totalStudyTime)} total
            </span>
          </div>

          {/* Sessions Today */}
          {progress.sessionsToday > 0 && (
            <div className="text-xs text-green-600 font-medium">
              {progress.sessionsToday} session{progress.sessionsToday !== 1 ? 's' : ''} today
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressRing;
