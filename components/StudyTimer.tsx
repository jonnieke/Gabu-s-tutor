import React, { useState, useEffect, useCallback } from 'react';
import { ClockIcon, PlayIcon, PauseIcon, StopIcon } from './Icons';
import { startStudySession, endStudySession, updateCurrentSession, getCurrentSession } from '../services/progressService';

interface StudyTimerProps {
  onSessionEnd?: (sessionData: any) => void;
  className?: string;
}

const StudyTimer: React.FC<StudyTimerProps> = ({ onSessionEnd, className = '' }) => {
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [sessionCount, setSessionCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const focusTime = 25 * 60; // 25 minutes
  const breakTime = 5 * 60; // 5 minutes
  const longBreakTime = 15 * 60; // 15 minutes after 4 sessions

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeLeft]);

  const handleTimerComplete = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    
    if (sessionType === 'focus') {
      setSessionCount(prev => prev + 1);
      setSessionType('break');
      setTimeLeft(sessionCount >= 3 ? longBreakTime : breakTime);
      
      // End focus session
      const session = endStudySession();
      if (session && onSessionEnd) {
        onSessionEnd(session);
      }
      
      // Show break notification
      if (Notification.permission === 'granted') {
        new Notification('Focus session complete!', {
          body: 'Time for a break! You earned it.',
          icon: '/favicon.ico'
        });
      }
    } else {
      // Break is over, start new focus session
      setSessionType('focus');
      setTimeLeft(focusTime);
      
      if (Notification.permission === 'granted') {
        new Notification('Break time is over!', {
          body: 'Ready for another focus session?',
          icon: '/favicon.ico'
        });
      }
    }
  }, [sessionType, sessionCount, onSessionEnd]);

  const startTimer = () => {
    if (!isActive) {
      // Start new focus session
      startStudySession(['Pomodoro Study Session']);
      setSessionType('focus');
      setTimeLeft(focusTime);
    }
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const stopTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(focusTime);
    setSessionType('focus');
    
    // End current session
    const session = endStudySession();
    if (session && onSessionEnd) {
      onSessionEnd(session);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const totalTime = sessionType === 'focus' ? focusTime : (sessionCount >= 3 ? longBreakTime : breakTime);
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <ClockIcon className="w-6 h-6 text-purple-500" />
          <h3 className="text-xl font-bold text-gray-800">
            {sessionType === 'focus' ? 'Focus Time' : 'Break Time'}
          </h3>
        </div>

        {/* Progress Ring */}
        <div className="relative w-32 h-32 mx-auto mb-6">
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
              strokeDasharray={2 * Math.PI * 45}
              strokeDashoffset={2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-linear ${
                sessionType === 'focus' ? 'text-purple-500' : 'text-green-500'
              }`}
            />
          </svg>
          {/* Time display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-gray-500">
                Session {sessionCount + 1}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isActive ? (
            <button
              onClick={startTimer}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition-colors"
            >
              <PlayIcon className="w-5 h-5" />
              Start Focus
            </button>
          ) : (
            <>
              <button
                onClick={pauseTimer}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white font-medium rounded-full hover:bg-gray-600 transition-colors"
              >
                {isPaused ? <PlayIcon className="w-4 h-4" /> : <PauseIcon className="w-4 h-4" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={stopTimer}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 transition-colors"
              >
                <StopIcon className="w-4 h-4" />
                Stop
              </button>
            </>
          )}
        </div>

        {/* Session Info */}
        <div className="mt-4 text-sm text-gray-600">
          {sessionType === 'focus' ? (
            <p>Focus on your studies for 25 minutes</p>
          ) : (
            <p>Take a {sessionCount >= 3 ? '15' : '5'} minute break</p>
          )}
        </div>

        {/* Pomodoro Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Pomodoro Technique:</strong> Work in 25-minute focused sessions, 
            then take short breaks. After 4 sessions, take a longer break.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudyTimer;
