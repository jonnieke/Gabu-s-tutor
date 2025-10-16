import React, { useState } from 'react';
import { HomeIcon, CameraIcon, BookIcon, UserIcon, BellIcon, UsersIcon, BrainIcon, TrophyIcon, GabuIcon, StarIcon, ShieldIcon, ClockIcon, HeartIcon } from './Icons';

interface ParentLandingPageProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

const ParentLandingPage: React.FC<ParentLandingPageProps> = ({ onGetStarted, onLearnMore }) => {
  const [activeTab, setActiveTab] = useState<'benefits' | 'features' | 'testimonials'>('benefits');

  const benefits = [
    {
      icon: <BrainIcon className="w-8 h-8 text-purple-600" />,
      title: "AI-Powered Learning",
      description: "Advanced AI technology that adapts to your child's learning style and provides personalized explanations."
    },
    {
      icon: <ShieldIcon className="w-8 h-8 text-green-600" />,
      title: "Safe & Secure",
      description: "Child-safe environment with no inappropriate content. Your child's privacy and safety are our top priority."
    },
    {
      icon: <ClockIcon className="w-8 h-8 text-blue-600" />,
      title: "Saves Time",
      description: "Reduces homework time by 50% while improving understanding. More family time, less stress!"
    },
    {
      icon: <HeartIcon className="w-8 h-8 text-red-600" />,
      title: "Builds Confidence",
      description: "Step-by-step explanations help your child understand concepts, building confidence and reducing anxiety."
    }
  ];

  const features = [
    {
      icon: <CameraIcon className="w-6 h-6 text-purple-600" />,
      title: "Camera Scanning",
      description: "Simply take a photo of any homework problem for instant help"
    },
    {
      icon: <BellIcon className="w-6 h-6 text-orange-600" />,
      title: "Voice Questions",
      description: "Your child can ask questions out loud in natural language"
    },
    {
      icon: <BookIcon className="w-6 h-6 text-blue-600" />,
      title: "All Subjects",
      description: "Math, Science, English, History - we cover it all"
    },
    {
      icon: <TrophyIcon className="w-6 h-6 text-yellow-600" />,
      title: "Progress Tracking",
      description: "Monitor your child's learning progress and achievements"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Mother of 12-year-old",
      content: "My daughter was struggling with math until we found Gabu's Tutor. Now she actually looks forward to doing homework! The step-by-step explanations are perfect.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Father of 14-year-old",
      content: "Finally, a homework helper that teaches instead of just giving answers. My son's grades have improved from C's to B+'s in just one month!",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Mother of 10-year-old",
      content: "As a working mom, I can't always help with homework. Gabu's Tutor is like having a patient tutor available 24/7. Highly recommended!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <GabuIcon className="w-16 h-16 text-purple-600" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
              The <span className="text-purple-600">#1 AI Homework Helper</span>
              <br />
              <span className="text-2xl sm:text-3xl lg:text-4xl text-gray-600">Trusted by Parents Nationwide</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              🌟 <strong>Over 10,000 parents</strong> trust Gabu's Tutor to help their children succeed in school. 
              Safe, effective, and designed by education experts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-purple-600 text-white font-bold rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200 text-lg"
              >
                Start Free Today - No Credit Card Required
              </button>
              <button
                onClick={onLearnMore}
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-full shadow-lg border-2 border-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200 text-lg"
              >
                See How It Works
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">10,000+</div>
                <div className="text-sm text-gray-600">Happy Parents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">4.8/5</div>
                <div className="text-sm text-gray-600">Parent Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">50%</div>
                <div className="text-sm text-gray-600">Less Homework Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">100%</div>
                <div className="text-sm text-gray-600">Safe & Secure</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('benefits')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'benefits'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Why Parents Love Us
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'features'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => setActiveTab('testimonials')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'testimonials'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Parent Reviews
            </button>
          </nav>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {activeTab === 'benefits' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {benefit.icon}
                  <h3 className="text-xl font-bold text-gray-900 ml-3">{benefit.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'features' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6">"{testimonial.content}"</p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call to Action */}
      <div className="bg-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Child's Learning?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of parents who have already seen the difference Gabu's Tutor makes.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-purple-600 font-bold rounded-full shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white/50 transform hover:scale-105 active:scale-95 transition-all duration-200 text-lg"
          >
            Get Started Free Today
          </button>
          <p className="text-purple-200 text-sm mt-4">
            ✓ No credit card required ✓ 100% safe ✓ Works on any device
          </p>
        </div>
      </div>
    </div>
  );
};

export default ParentLandingPage;
