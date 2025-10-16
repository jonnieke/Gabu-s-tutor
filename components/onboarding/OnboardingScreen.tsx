import React, { useState } from 'react';
import RoleSelection from './RoleSelection';

interface OnboardingScreenProps {
  onComplete: (role: 'student' | 'parent' | 'teacher') => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'parent' | 'teacher' | null>(null);

  const handleRoleSelect = (role: 'student' | 'parent' | 'teacher') => {
    setSelectedRole(role);
  };

  const handleStartWithGabu = () => {
    if (selectedRole) {
      onComplete(selectedRole);
    }
  };

  const getRoleMessage = () => {
    switch (selectedRole) {
      case 'student':
        return "Perfect! Gabu will help you understand any topic step by step.";
      case 'parent':
        return "Great! You can monitor your child's learning progress and get insights.";
      case 'teacher':
        return "Excellent! Gabu will help you create engaging lessons and explanations.";
      default:
        return "";
    }
  };

  const getRoleEmoji = () => {
    switch (selectedRole) {
      case 'student':
        return "👩‍🎓";
      case 'parent':
        return "👨‍👩‍👧";
      case 'teacher':
        return "👨‍🏫";
      default:
        return "🌟";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-purple-50">
      {!selectedRole ? (
        <RoleSelection onRoleSelect={handleRoleSelect} />
      ) : (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
              <div className="text-4xl">{getRoleEmoji()}</div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Welcome to Gabu!
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              {getRoleMessage()}
            </p>

            <div className="space-y-4">
              <button
                onClick={handleStartWithGabu}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <span>🌟</span>
                Start with Gabu
                <span>→</span>
              </button>

              <button
                onClick={() => setSelectedRole(null)}
                className="block mx-auto text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                ← Choose a different role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingScreen;