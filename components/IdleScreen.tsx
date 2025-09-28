import React, { useState, useEffect } from 'react';
import { SettingsIcon, GabuIcon, CameraIcon, ImageIcon, AudioIcon, SendIcon, BookmarkFilledIcon, IllustrateIcon, MicrophoneIcon } from './Icons';
import ProgressRing from './ProgressRing';
import AudioRecordingModal from './AudioRecordingModal';
import Tooltip from './Tooltip';
import { getProgress } from '../services/progressService';
import { LearningProgress } from '../types';
import { tutorialService } from '../services/tutorialService';

interface IdleScreenProps {
  onStartScan: () => void;
  onUploadImage: () => void;
  onUploadAudio: () => void;
  onRecordedAudio: (audioBlob: Blob, mimeType: string) => void;
  onOpenIllustrate: () => void;
  onOpenSettings: () => void;
  onQuickAsk: (question: string) => void;
  onOpenBookmarks: () => void;
  recentTopics?: string[];
  onSelectRecent?: (topic: string) => void;
  userSettings?: { learningLevel: 'young' | 'advanced' };
  onToggleLearningLevel?: () => void;
  isFirstTimeUser?: boolean;
  onStartTutorial?: (tutorialId: string) => void;
}

// A realistic, heartwarming image of a young African boy, around 8 years old, sitting at a wooden desk in a cozy, sunlit room, focused on his homework.
const heroBackgroundImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoGBxMUExYUExQYFhYYGCcYGBgYGBsYGhoaGhkbGhsaGBkbHysiGhwoHhgfIzQjKCwuMTExGSE3PDcwOyswMS4BCwsLDw4PHRERHTAnIigwMDAwMDAwMDIyMDAwMDAwMjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMP/AABEIARoAvgMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAADAAECBAUGB//EAEUQAAIBAgMFAwgGBwUIAwAAAAECEQADBBIhBTFBUQYTImFxgZEyobHwFEJScsHR4RYjM4KS8RYkQ1Njc6KywhclY4T/xAAZAQEBAQEBAQAAAAAAAAAAAAAAAQIDBAX/xAAiEQEBAAIBBAMBAQEAAAAAAAAAAQIRAxIhMQRBE1EiMmH/2gAMAwEAAhEDEQA/APcUpClpQKBS0tIBaUpQAtKUoAKUpQAtKUoAWlKUoAWlKUoAWlKUoAKUpQAtKUoAWlKUAFLS0tMBaUpQAtKUoAWlKUAKKVKKBilpKVQxSlKAClKUAFLS0tABRRRQAtKUoAKUpQAtKUoAKUpQAUUUUALSlKAClKUAFLS0tMBaUpQAUtJSigYooooAKKKKACiiigAoopaBiilooAKKKKBiilooAKKKKACilooAKKKKACilooAKKKKACiiigApaWlpgLS0lLSAKKKKACiiigApaSlFABS0lKAClpKWgApaKWgYopaWgYopaKACiiigYopaSgApaKWgApaSloAKKKKACiiigApaWlpgLSUlLSAKKKKACilpKACiiloGKKKKACiiigAooooAKKKKACiiigAooooGKKKKBiilpKACiiigAooooAKKKKACloooAWiiimAtJS0tIBaSlFABRRRQAUUUUAFFFFABRRRQAUUUUALRRRQAUUUUAFLRRQAUUUUAFLRRQAUUUUAFLRRQAUUUtAC0UUUwFooooAKKKWgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKWigBaKKKYC0UUUAFLRRQAUUUUAFLSUUAFLSUUALSUUtABS0lLQAUUUUAFFFFABSUtFABRRRQAUUUUAFLSUUALSUUUAFLRRQAtFFFMBeiikoGKWkooAKKKKACiikoAWiiigApaSigYpaSigApaSigYpaSigApaSloGKWkooAKKKWgYopaSgApaSigAooooAKKKKYC0lFFAxS0lLQMUtJS0DFLSUUALSUUtAxaSiloGKKWkoAKKKWgYopaSgAopaSgYpaSloAWkoooGKKWkoAWkoooAKKKKACiiimAtJSUtAxaSiloGKWkooAKSlFABRRRQAtJS0UAFLSUUAFLSUUAFFFFABSUtFABRRRQAUUUUAFFFFABSUtFAxRRRTAWkoooGKKKKBiilooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKYC0lLSUDFpKWloGKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiikoAWiiimAtJS0lAxRRRQAUlLSUDFpKWigAooooGKWkpaACkpaKACkpaSgYooooAKKKWgYopaSgAooooAKKKKBiilpKBilpKKACiiimAtJSUtAxS0lFAxS0lLQAtJS0UDFLSUUAFLSUtAxaKKKACiiigApaSigYtJS0lAxaKKKACiiloAKWkooAKKKKACiiigAooooAKKKKYC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//Z';

const IdleScreen: React.FC<IdleScreenProps> = ({ onStartScan, onUploadImage, onUploadAudio, onRecordedAudio, onOpenIllustrate, onOpenSettings, onQuickAsk, onOpenBookmarks, recentTopics = [], onSelectRecent, userSettings, onToggleLearningLevel, isFirstTimeUser = false, onStartTutorial }) => {
  const [question, setQuestion] = useState('');
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  
  const suggestions = [
    'Explain photosynthesis simply',
    'What is a noun?',
    'Show 7 times 8 in steps',
    'Why do seasons change?',
  ];

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const submitQuickAsk = (q?: string) => {
    const value = (q ?? question).trim();
    if (!value) return;
    onQuickAsk(value);
    setQuestion('');
  };

  const handleRecordedAudio = (audioBlob: Blob, mimeType: string) => {
    onRecordedAudio(audioBlob, mimeType);
  };

  const handleRecordAudio = () => {
    // Check if we should show audio tutorial
    if (tutorialService.shouldShowTutorial('audio-features') && onStartTutorial) {
      onStartTutorial('audio-features');
      return;
    }
    
    setIsRecordingModalOpen(true);
  };

  const handleUploadAudio = () => {
    onUploadAudio();
  };
  return (
    <div 
      className="relative w-full min-h-screen bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${heroBackgroundImage})` }}
      role="main"
      aria-labelledby="hero-heading"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-yellow-300/20 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute top-32 right-16 w-12 h-12 bg-blue-300/20 rounded-full animate-bounce delay-2000"></div>
        <div className="absolute top-64 left-20 w-20 h-20 bg-green-300/20 rounded-full animate-bounce delay-3000"></div>
        <div className="absolute top-40 right-32 w-14 h-14 bg-purple-300/20 rounded-full animate-bounce delay-4000"></div>
        <div className="absolute bottom-32 left-16 w-18 h-18 bg-pink-300/20 rounded-full animate-bounce delay-5000"></div>
        <div className="absolute bottom-20 right-20 w-10 h-10 bg-orange-300/20 rounded-full animate-bounce delay-6000"></div>
        
        {/* Floating Educational Icons */}
        <div className="absolute top-24 right-12 text-2xl animate-pulse delay-1000">📚</div>
        <div className="absolute top-48 left-8 text-3xl animate-pulse delay-2000">🧮</div>
        <div className="absolute top-80 right-24 text-2xl animate-pulse delay-3000">🔬</div>
        <div className="absolute bottom-40 left-12 text-3xl animate-pulse delay-4000">🌍</div>
        <div className="absolute bottom-60 right-8 text-2xl animate-pulse delay-5000">🎨</div>
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-green-500/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-white/70"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 min-h-screen overflow-y-auto text-center pb-20 sm:pb-24 lg:pb-32">
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
          {/* Learning Level Toggle */}
          {userSettings && onToggleLearningLevel && (
            <button 
              onClick={onToggleLearningLevel} 
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 touch-manipulation ${
                userSettings.learningLevel === 'advanced' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-orange-400 to-pink-500 text-white shadow-lg'
              }`}
              aria-label={`Switch to ${userSettings.learningLevel === 'advanced' ? 'Young Learner' : 'Advanced'} mode`}
            >
              {userSettings.learningLevel === 'advanced' ? '🎓 Advanced' : '🌟 Young Learner'}
            </button>
          )}
          <Tooltip content="View your saved explanations and bookmarks" position="bottom">
            <button onClick={onOpenBookmarks} className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors touch-manipulation" aria-label="Bookmarks">
              <BookmarkFilledIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600"/>
            </button>
          </Tooltip>
          <Tooltip content="Set up your profile and preferences" position="bottom">
            <button onClick={onOpenSettings} className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors touch-manipulation" aria-label="Settings">
              <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600"/>
            </button>
          </Tooltip>
        </div>
        
            <div className="max-w-6xl w-full px-4">
            {/* Enhanced Hero Section */}
            <div className="relative mb-8">
              <GabuIcon className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 text-purple-500 mb-4 mx-auto animate-gentle-bounce" />
              {/* Sparkle Effects around Gabu */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 text-2xl animate-ping delay-1000">✨</div>
              <div className="absolute top-4 right-1/4 text-xl animate-ping delay-2000">⭐</div>
              <div className="absolute top-8 left-1/4 text-lg animate-ping delay-3000">🌟</div>
            </div>
            
            <h1 id="hero-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 animate-fade-in">
              Making homework easy, step-by-step! 🎯
            </h1>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-700 mb-6 max-w-4xl mx-auto font-medium">
                Hey there! I'm Gabu, your super smart homework buddy! 🤖✨ Just snap a photo, ask me anything, and I'll make learning super fun and easy to understand! 🚀
            </p>

            {/* First-time user notice */}
            {isFirstTimeUser && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 sm:p-6 rounded-xl lg:rounded-2xl shadow-lg mb-6 max-w-4xl mx-auto animate-bounce-in">
                <div className="flex items-center justify-center gap-3">
                  <div className="text-2xl sm:text-3xl">👋</div>
                  <div className="text-center">
                    <h3 className="text-lg sm:text-xl font-bold mb-1">Welcome to Soma AI!</h3>
                    <p className="text-sm sm:text-base opacity-90">Please set up your profile first so I can give you the perfect explanations! Click any button below to get started.</p>
                  </div>
                  <div className="text-2xl sm:text-3xl">⚙️</div>
                </div>
              </div>
            )}
            
            {/* Fun Stats */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm sm:text-base shadow-lg animate-bounce-in">
                📚 All Subjects
              </div>
              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full font-bold text-sm sm:text-base shadow-lg animate-bounce-in delay-200">
                🎯 Step-by-Step
              </div>
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm sm:text-base shadow-lg animate-bounce-in delay-400">
                🚀 Super Fast
              </div>
            </div>

            {/* Enhanced Input Method Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 w-full mb-8">
                <Tooltip content="Take a photo of your homework and get instant step-by-step explanations" position="top">
                  <div className="flex flex-col items-center w-full group">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-4 border-white shadow-lg mb-[-16px] sm:mb-[-20px] z-10 group-hover:scale-110 transition-transform duration-300">1</div>
                  <button
                      onClick={onStartScan}
                      className={`flex flex-col items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-500/50 transform hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 touch-manipulation w-full border-2 border-orange-400/20 ${isFirstTimeUser ? 'animate-pulse' : ''}`}
                  >
                      <CameraIcon className="w-6 h-6 sm:w-8 sm:h-8 group-hover:animate-pulse"/>
                      <span>Scan n Learn</span>
                      {isFirstTimeUser && <span className="text-xs opacity-75">Setup needed</span>}
                  </button>
                  </div>
                </Tooltip>
                <Tooltip content="Record your voice asking a question and get a spoken explanation" position="top">
                  <div className="flex flex-col items-center w-full group">
                  <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-4 border-white shadow-lg mb-[-16px] sm:mb-[-20px] z-10 group-hover:scale-110 transition-transform duration-300">2</div>
                  <button
                      onClick={handleRecordAudio}
                      className={`flex flex-col items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 bg-gradient-to-br from-indigo-500 to-blue-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transform hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 touch-manipulation w-full border-2 border-indigo-400/20 ${isFirstTimeUser ? 'animate-pulse' : ''}`}
                  >
                      <MicrophoneIcon className="w-6 h-6 sm:w-8 sm:h-8 group-hover:animate-pulse"/>
                      <span>Record Audio</span>
                      {isFirstTimeUser && <span className="text-xs opacity-75">Setup needed</span>}
                  </button>
                  </div>
                </Tooltip>
                <Tooltip content="Upload a photo from your device to get help with homework" position="top">
                  <div className="flex flex-col items-center w-full group">
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-4 border-white shadow-lg mb-[-16px] sm:mb-[-20px] z-10 group-hover:scale-110 transition-transform duration-300">3</div>
                  <button
                      onClick={onUploadImage}
                      className={`flex flex-col items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-500/50 transform hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 touch-manipulation w-full border-2 border-teal-400/20 ${isFirstTimeUser ? 'animate-pulse' : ''}`}
                  >
                      <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 group-hover:animate-pulse"/>
                      <span>Upload Image</span>
                      {isFirstTimeUser && <span className="text-xs opacity-75">Setup needed</span>}
                  </button>
                  </div>
                </Tooltip>
                <Tooltip content="Create visual diagrams and illustrations to help explain concepts" position="top">
                  <div className="flex flex-col items-center w-full group">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-4 border-white shadow-lg mb-[-16px] sm:mb-[-20px] z-10 group-hover:scale-110 transition-transform duration-300">4</div>
                  <button
                      onClick={onOpenIllustrate}
                      className={`flex flex-col items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-500/50 transform hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 touch-manipulation w-full border-2 border-green-400/20 ${isFirstTimeUser ? 'animate-pulse' : ''}`}
                  >
                      <IllustrateIcon className="w-6 h-6 sm:w-8 sm:h-8 group-hover:animate-pulse"/>
                      <span>Create Diagram</span>
                      {isFirstTimeUser && <span className="text-xs opacity-75">Setup needed</span>}
                  </button>
                  </div>
                </Tooltip>
                <Tooltip content="Upload an audio file to get help with spoken content or lectures" position="top">
                  <div className="flex flex-col items-center w-full group">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-4 border-white shadow-lg mb-[-16px] sm:mb-[-20px] z-10 group-hover:scale-110 transition-transform duration-300">5</div>
                  <button
                      onClick={handleUploadAudio}
                      className={`flex flex-col items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-500/50 transform hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 touch-manipulation w-full border-2 border-purple-400/20 ${isFirstTimeUser ? 'animate-pulse' : ''}`}
                  >
                      <AudioIcon className="w-6 h-6 sm:w-8 sm:h-8 group-hover:animate-pulse"/>
                      <span>Upload Audio</span>
                      {isFirstTimeUser && <span className="text-xs opacity-75">Setup needed</span>}
                  </button>
                  </div>
                </Tooltip>
            </div>

            {/* Balanced Ask Gabu Section - Centered and Compact */}
            <div className={`bg-gradient-to-r from-white/90 to-purple-50/80 backdrop-blur-sm rounded-xl shadow-lg border border-purple-200/50 p-4 mb-6 w-full max-w-2xl mx-auto hover:shadow-xl transition-all duration-300 ${isFirstTimeUser ? 'animate-pulse border-yellow-400' : ''}`}>
              <div className="text-center mb-3">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">🎯 Ask Gabu Anything!</h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {isFirstTimeUser ? 'Setup profile first for personalized help!' : 'Quick questions and suggestions'}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What would you like to learn? 🤔"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-full border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300/50 focus:border-purple-400 bg-white/80 transition-all duration-300"
                  aria-label="Ask a question"
                />
                <button onClick={() => submitQuickAsk()} aria-label="Send question" className="p-2 sm:p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transform active:scale-95 hover:scale-105 transition-all duration-300 shadow-md">
                  <SendIcon className="w-5 h-5 sm:w-6 sm:h-6"/>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3 justify-center">
                {suggestions.slice(0, 2).map((s, i) => (
                  <button key={i} onClick={() => submitQuickAsk(s)} className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-gray-700 border border-purple-200 hover:border-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-sm font-medium">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Balanced Progress Section - Centered and Compact */}
            {progress && (
              <div className="mb-6 bg-gradient-to-r from-white/90 to-blue-50/80 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200/50 p-4 max-w-md mx-auto hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex-shrink-0">
                    <ProgressRing progress={progress} size="sm" showDetails={false} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm sm:text-base font-bold text-gray-800">🏆 Learning Progress</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{progress.totalQuestions} questions completed</p>
                  </div>
                </div>
              </div>
            )}

            {/* Balanced Recent Topics - Centered and Compact */}
            {recentTopics.length > 0 && (
              <div className="mt-6 w-full max-w-5xl mx-auto">
                <h2 className="text-base sm:text-lg lg:text-xl font-extrabold text-gray-800 mb-3 text-center">📚 Recent Topics</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                  {recentTopics.slice(0, 8).map((t, idx) => (
                    <button key={idx} onClick={() => onSelectRecent?.(t)} className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-gradient-to-br from-white/90 to-purple-50/80 backdrop-blur-sm shadow-md hover:shadow-lg text-left touch-manipulation transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 border border-purple-200/50 group">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 grid place-items-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                        <span className="text-xs font-extrabold text-white">{Math.min(99, (idx+1)*7)}%</span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 font-semibold line-clamp-1 group-hover:text-purple-700 transition-colors duration-300">{t}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Audio Recording Modal */}
      <AudioRecordingModal
        isOpen={isRecordingModalOpen}
        onClose={() => setIsRecordingModalOpen(false)}
        onAudioRecorded={handleRecordedAudio}
      />
    </div>
  );
};

export default IdleScreen;
