import React, { useState, useEffect } from 'react';
import { StarIcon, FireIcon, TrophyIcon, TargetIcon } from './Icons';

interface AchievementProps {
  type: 'streak' | 'quiz' | 'learning' | 'exploration';
  title: string;
  description: string;
  icon: React.ReactNode;
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const Achievement: React.FC<AchievementProps> = ({ 
  type, 
  title, 
  description, 
  icon, 
  isUnlocked, 
  progress = 0, 
  maxProgress = 1 
}) => {
  const progressPercentage = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;
  
  return (
    <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
      isUnlocked 
        ? 'border-yellow-400 bg-yellow-50 shadow-lg' 
        : 'border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isUnlocked ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-300 text-gray-600'
        }`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className={`font-bold text-sm ${
            isUnlocked ? 'text-yellow-900' : 'text-gray-600'
          }`}>
            {title}
          </h3>
          <p className={`text-xs ${
            isUnlocked ? 'text-yellow-700' : 'text-gray-500'
          }`}>
            {description}
          </p>
        </div>
        {isUnlocked && (
          <div className="text-yellow-600">
            <StarIcon className="w-5 h-5" />
          </div>
        )}
      </div>
      
      {!isUnlocked && maxProgress > 1 && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{progress}/{maxProgress}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface AchievementsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userSettings: {
    name: string;
    grade: string;
  };
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ isOpen, onClose, userSettings }) => {
  const [achievements, setAchievements] = useState({
    streak: { unlocked: false, progress: 0, maxProgress: 7 },
    quiz: { unlocked: false, progress: 0, maxProgress: 5 },
    learning: { unlocked: false, progress: 0, maxProgress: 10 },
    exploration: { unlocked: false, progress: 0, maxProgress: 3 }
  });

  useEffect(() => {
    if (isOpen) {
      // Load achievements from localStorage
      try {
        const saved = localStorage.getItem('gabu-achievements');
        if (saved) {
          setAchievements(JSON.parse(saved));
        }
      } catch (error) {
        console.warn('Failed to load achievements:', error);
      }
    }
  }, [isOpen]);

  const updateAchievement = (type: keyof typeof achievements, progress: number) => {
    setAchievements(prev => {
      const updated = {
        ...prev,
        [type]: {
          ...prev[type],
          progress: Math.min(progress, prev[type].maxProgress),
          unlocked: progress >= prev[type].maxProgress
        }
      };
      
      // Save to localStorage
      try {
        localStorage.setItem('gabu-achievements', JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save achievements:', error);
      }
      
      return updated;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Your Achievements</h2>
              <p className="text-gray-600 text-sm">
                Keep learning to unlock more! 🌟
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            <Achievement
              type="streak"
              title="Learning Streak"
              description="Study for 7 days in a row"
              icon={<FireIcon className="w-5 h-5" />}
              isUnlocked={achievements.streak.unlocked}
              progress={achievements.streak.progress}
              maxProgress={achievements.streak.maxProgress}
            />
            
            <Achievement
              type="quiz"
              title="Quiz Master"
              description="Complete 5 quizzes with good scores"
              icon={<TrophyIcon className="w-5 h-5" />}
              isUnlocked={achievements.quiz.unlocked}
              progress={achievements.quiz.progress}
              maxProgress={achievements.quiz.maxProgress}
            />
            
            <Achievement
              type="learning"
              title="Knowledge Seeker"
              description="Ask 10 questions and get answers"
              icon={<TargetIcon className="w-5 h-5" />}
              isUnlocked={achievements.learning.unlocked}
              progress={achievements.learning.progress}
              maxProgress={achievements.learning.maxProgress}
            />
            
            <Achievement
              type="exploration"
              title="Explorer"
              description="Try all 3 input methods (camera, voice, upload)"
              icon={<StarIcon className="w-5 h-5" />}
              isUnlocked={achievements.exploration.unlocked}
              progress={achievements.exploration.progress}
              maxProgress={achievements.exploration.maxProgress}
            />
          </div>
          
          <div className="mt-6 p-4 bg-purple-50 rounded-xl">
            <h3 className="font-bold text-purple-900 mb-2">Keep Going!</h3>
            <p className="text-purple-700 text-sm">
              Every question you ask and every quiz you take brings you closer to unlocking these achievements. 
              You're doing great! 🎉
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPanel;
export { AchievementsPanel };
