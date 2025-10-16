import React from 'react';
import HeroSection from './HeroSection';
import RoleCardsSection from './RoleCardsSection';
import FeaturesSection from './FeaturesSection';
import Footer from './Footer';

interface LandingPageProps {
  onStartLearning: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartLearning }) => {
  return (
    <div className="min-h-screen bg-[#fefdf8]">
      <HeroSection onStartLearning={onStartLearning} />
      <RoleCardsSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
