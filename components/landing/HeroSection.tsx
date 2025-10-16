import React from 'react';

interface HeroSectionProps {
  onStartLearning: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStartLearning }) => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left side - Text content */}
          <div className="flex-1 text-left lg:text-left">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#2d3748] mb-6 leading-tight">
              Meet <span className="text-[#2d3748]">Gabu</span> —<br />
              Your AI Homework Helper
            </h1>
            
            <p className="text-xl md:text-2xl text-[#4a5568] mb-8 leading-relaxed">
              Ask questions. Get simple explanations. Learn at your pace.
            </p>
            
            <button
              onClick={onStartLearning}
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#38a169] text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Start Learning
            </button>
          </div>

          {/* Right side - Gabu Character */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative">
              {/* Main Gabu Character */}
              <div className="relative w-64 h-64 bg-gradient-to-br from-[#63b3ed] to-white rounded-full flex items-center justify-center shadow-2xl">
                {/* Gabu's head */}
                <div className="w-32 h-32 bg-white rounded-full relative">
                  {/* Eyes */}
                  <div className="absolute top-8 left-6 w-4 h-4 bg-[#2d3748] rounded-full"></div>
                  <div className="absolute top-8 right-6 w-4 h-4 bg-[#2d3748] rounded-full"></div>
                  
                  {/* Eye highlights */}
                  <div className="absolute top-9 left-7 w-1 h-1 bg-white rounded-full"></div>
                  <div className="absolute top-9 right-7 w-1 h-1 bg-white rounded-full"></div>
                  
                  {/* Smile */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-4 border-2 border-[#2d3748] border-t-0 rounded-full"></div>
                </div>
                
                {/* Book in hand */}
                <div className="absolute bottom-8 right-8 w-12 h-16 bg-[#805ad5] rounded transform rotate-12">
                  <div className="w-full h-full bg-gradient-to-b from-[#805ad5] to-[#6b46c1] rounded"></div>
                </div>
                
                {/* Lightbulb above head */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-[#f6e05e] rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-[#f6e05e] rounded-full"></div>
                </div>
              </div>
              
              {/* Floating dots around Gabu */}
              <div className="absolute -top-4 -left-4 w-3 h-3 bg-[#f6e05e] rounded-full animate-bounce"></div>
              <div className="absolute top-8 -right-8 w-2 h-2 bg-[#f6e05e] rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute -bottom-4 left-8 w-2 h-2 bg-[#f6e05e] rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;