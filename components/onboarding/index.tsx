import React from 'react';
import OnboardingScreen from './OnboardingScreen';

interface OnboardingProps {
  onComplete: (role: 'student' | 'parent' | 'teacher') => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  return <OnboardingScreen onComplete={onComplete} />;
};

export default Onboarding;
