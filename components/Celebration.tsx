import React, { useState, useEffect } from 'react';
import { StarIcon, CheckCircleIcon, ClockIcon } from './Icons';

interface CelebrationProps {
  type: 'achievement' | 'streak' | 'quiz' | 'learning';
  title: string;
  message: string;
  isVisible: boolean;
  onComplete: () => void;
}

const Celebration: React.FC<CelebrationProps> = ({ 
  type, 
  title, 
  message, 
  isVisible, 
  onComplete 
}) => {
  const [show, setShow] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      setAnimationPhase('enter');
      
      const timer1 = setTimeout(() => setAnimationPhase('hold'), 500);
      const timer2 = setTimeout(() => setAnimationPhase('exit'), 3000);
      const timer3 = setTimeout(() => {
        setShow(false);
        onComplete();
      }, 3500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isVisible, onComplete]);

  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'achievement':
        return <StarIcon className="w-8 h-8 text-yellow-500" />;
      case 'streak':
        return <span className="text-2xl">🔥</span>;
      case 'quiz':
        return <CheckCircleIcon className="w-8 h-8 text-green-500" />;
      case 'learning':
        return <ClockIcon className="w-8 h-8 text-blue-500" />;
      default:
        return <StarIcon className="w-8 h-8 text-purple-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'achievement':
        return 'bg-yellow-400 border-yellow-500 text-yellow-900';
      case 'streak':
        return 'bg-orange-400 border-orange-500 text-orange-900';
      case 'quiz':
        return 'bg-green-400 border-green-500 text-green-900';
      case 'learning':
        return 'bg-blue-400 border-blue-500 text-blue-900';
      default:
        return 'bg-purple-400 border-purple-500 text-purple-900';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className={`relative transform transition-all duration-500 ${
        animationPhase === 'enter' ? 'scale-0 opacity-0' : 
        animationPhase === 'hold' ? 'scale-100 opacity-100' : 
        'scale-110 opacity-0'
      }`}>
        {/* Main celebration card */}
        <div className={`${getColors()} rounded-2xl shadow-2xl p-6 border-2 max-w-sm mx-4`}>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-full bg-white/20 flex items-center justify-center animate-bounce`}>
                {getIcon()}
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-sm font-medium">{message}</p>
          </div>
        </div>

        {/* Confetti effect */}
        {animationPhase === 'hold' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${
                  ['bg-yellow-400', 'bg-orange-400', 'bg-red-400', 'bg-pink-400', 'bg-purple-400'][i % 5]
                } animate-ping`}
                style={{
                  left: `${20 + (i * 5)}%`,
                  top: `${30 + (i * 3)}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        )}

        {/* Sparkle effect */}
        {animationPhase === 'hold' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${15 + (i * 10)}%`,
                  top: `${25 + (i * 6)}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Celebration;
