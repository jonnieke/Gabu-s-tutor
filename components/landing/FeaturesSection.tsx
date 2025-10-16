import React from 'react';

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Features */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-[#2d3748] mb-6">
              Built for Kenyan learners. Powered by AI
            </h2>
            
            <div className="space-y-6">
              {/* CBC-aligned */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-black rounded-sm"></div>
                  <div className="w-4 h-4 bg-red-600 rounded-sm"></div>
                  <div className="w-4 h-4 bg-green-600 rounded-sm"></div>
                  <div className="w-4 h-4 bg-white border border-gray-300 rounded-sm"></div>
                </div>
                <span className="text-[#2d3748] font-semibold">CBC-aligned</span>
              </div>
              
              {/* Safe */}
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-[#f6e05e] rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-[#2d3748] rounded-full"></div>
                </div>
                <span className="text-[#2d3748] font-semibold">Safe</span>
              </div>
              
              {/* Teacher-reviewed */}
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-[#63b3ed] rounded-full flex items-center justify-center relative">
                  <div className="w-4 h-4 bg-[#2d3748] rounded-full"></div>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-[#2d3748] rounded-full"></div>
                </div>
                <span className="text-[#2d3748] font-semibold">Teacher-reviewed</span>
              </div>
            </div>
          </div>

          {/* Right Column - AI Interaction Example */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="space-y-4">
              {/* User Question */}
              <div className="text-right">
                <div className="inline-block bg-white border border-gray-200 rounded-2xl px-4 py-3 max-w-xs">
                  <p className="text-[#2d3748] text-sm">
                    Explain the water cycle in simple terms
                  </p>
                </div>
              </div>
              
              {/* AI Response */}
              <div className="text-left">
                <div className="inline-block bg-[#63b3ed] rounded-2xl px-4 py-3 max-w-md">
                  <p className="text-[#2d3748] text-sm">
                    The water cycle is the continuous movement of water from the earth's surface to the atmosphere and back. Water evaporates from sources like lakes and oceans, forms clouds, and then falls back to the earth as rain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;