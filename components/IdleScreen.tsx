import React, { useState, useEffect } from 'react';
import { SettingsIcon, GabuIcon, CameraIcon, ImageIcon, AudioIcon, SendIcon, BookmarkFilledIcon, IllustrateIcon, MicrophoneIcon } from './Icons';
import ProgressRing from './ProgressRing';
import AudioRecordingModal from './AudioRecordingModal';
import { getProgress } from '../services/progressService';
import { LearningProgress } from '../types';

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
}

// A realistic, heartwarming image of a young African boy, around 8 years old, sitting at a wooden desk in a cozy, sunlit room, focused on his homework.
const heroBackgroundImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoGBxMUExYUExQYFhYYGCcYGBgYGBsYGhoaGhkbGhsaGBkbHysiGhwoHhgfIzQjKCwuMTExGSE3PDcwOyswMS4BCwsLDw4PHRERHTAnIigwMDAwMDAwMDIyMDAwMDAwMjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMP/AABEIARoAvgMBIgACEQEDEQH/xAAbAAABBQEBAAAAAAAAAAAAAAADAAECBAUGB//EAEUQAAIBAgMFAwgGBwUIAwAAAAECEQADBBIhBTFBUQYTImFxgZEyobHwFEJScsHR4RYjM4KS8RYkQ1Njc6KywhclY4T/xAAZAQEBAQEBAQAAAAAAAAAAAAAAAQIDBAX/xAAiEQEBAAIBBAMBAQEAAAAAAAAAAQIRAxIhMQRBE1EiMmH/2gAMAwEAAhEDEQA/APcUpClpQKBS0tIBaUpQAtKUoAKUpQAtKUoAWlKUoAWlKUoAWlKUoAKUpQAtKUoAWlKUAFLS0tMBaUpQAtKUoAWlKUAKKVKKBilpKVQxSlKAClKUAFLS0tABRRRQAtKUoAKUpQAtKUoAKUpQAUUUUALSlKAClKUAFLS0tMBaUpQAUtJSigYooooAKKKKACiiigAoopaBiilooAKKKKBiilooAKKKKACilooAKKKKACilooAKKKKACiiigApaWlpgLS0lLSAKKKKACiiigApaSlFABS0lKAClpKWgApaKWgYopaWgYopaKACiiigYopaSgApaKWgApaSloAKKKKACiiigApaWlpgLSUlLSAKKKKACilpKACiiloGKKKKACiiigAooooAKKKKACiiigAooooGKKKKBiilpKACiiigAooooAKKKKACloooAWiiimAtJS0tIBaSlFABRRRQAUUUUAFFFFABRRRQAUUUUALRRRQAUUUUAFLRRQAUUUUAFLRRQAUUUUAFLRRQAUUUtAC0UUUwFooooAKKKWgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKWigBaKKKYC0UUUAFLRRQAUUUUAFLSUUAFLSUUALSUUtABS0lLQAUUUUAFFFFABSUtFABRRRQAUUUUAFLSUUALSUUUAFLRRQAtFFFMBeiikoGKWkooAKKKKACiikoAWiiigApaSigYpaSigApaSigYpaSigApaSloGKWkooAKKKWgYopaSgApaSigAooooAKKKKYC0lFFAxS0lLQMUtJS0DFLSUUALSUUtAxaSiloGKKWkoAKKKWgYopaSgAopaSgYpaSloAWkoooGKKWkoAWkoooAKKKKACiiimAtJSUtAxaSiloGKWkooAKSlFABRRRQAtJS0UAFLSUUAFLSUUAFFFFABSUtFABRRRQAUUUUAFFFFABSUtFAxRRRTAWkoooGKKKKBiilooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKYC0lLSUDFpKWloGKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiikoAWiiimAtJS0lAxRRRQAUlLSUDFpKWigAooooGKWkpaACkpaKACkpaSgYooooAKKKWgYopaSgAooooAKKKKBiilpKBilpKKACiiimAtJSUtAxS0lFAxS0lLQAtJS0UDFLSUUAFLSUtAxaKKKACiiigApaSigYtJS0lAxaKKKACiiloAKWkooAKKKKACiiigAooooAKKKKYC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//Z';

const IdleScreen: React.FC<IdleScreenProps> = ({ onStartScan, onUploadImage, onUploadAudio, onRecordedAudio, onOpenIllustrate, onOpenSettings, onQuickAsk, onOpenBookmarks, recentTopics = [], onSelectRecent }) => {
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
          <button onClick={onOpenBookmarks} className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors touch-manipulation" aria-label="Bookmarks">
            <BookmarkFilledIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600"/>
          </button>
          <button onClick={onOpenSettings} className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors touch-manipulation" aria-label="Settings">
            <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600"/>
          </button>
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
                <div className="flex flex-col items-center w-full group">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-4 border-white shadow-lg mb-[-16px] sm:mb-[-20px] z-10 group-hover:scale-110 transition-transform duration-300">1</div>
                <button
                    onClick={onStartScan}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-500/50 transform hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 touch-manipulation w-full border-2 border-orange-400/20"
                >
                    <CameraIcon className="w-6 h-6 sm:w-8 sm:h-8 group-hover:animate-pulse"/>
                     <span>Scan n Learn</span>
                </button>
                </div>
                <div className="flex flex-col items-center w-full group">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-4 border-white shadow-lg mb-[-16px] sm:mb-[-20px] z-10 group-hover:scale-110 transition-transform duration-300">2</div>
                <button
                    onClick={handleRecordAudio}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 bg-gradient-to-br from-indigo-500 to-blue-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transform hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 touch-manipulation w-full border-2 border-indigo-400/20"
                >
                    <MicrophoneIcon className="w-6 h-6 sm:w-8 sm:h-8 group-hover:animate-pulse"/>
                    <span>Record Audio</span>
                </button>
                </div>
                <div className="flex flex-col items-center w-full group">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-4 border-white shadow-lg mb-[-16px] sm:mb-[-20px] z-10 group-hover:scale-110 transition-transform duration-300">3</div>
                <button
                    onClick={onUploadImage}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-500/50 transform hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 touch-manipulation w-full border-2 border-teal-400/20"
                >
                    <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 group-hover:animate-pulse"/>
                    <span>Upload Image</span>
                </button>
                </div>
                <div className="flex flex-col items-center w-full group">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-4 border-white shadow-lg mb-[-16px] sm:mb-[-20px] z-10 group-hover:scale-110 transition-transform duration-300">4</div>
                <button
                    onClick={onOpenIllustrate}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-500/50 transform hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 touch-manipulation w-full border-2 border-green-400/20"
                >
                    <IllustrateIcon className="w-6 h-6 sm:w-8 sm:h-8 group-hover:animate-pulse"/>
                    <span>Create Diagram</span>
                </button>
                </div>
                <div className="flex flex-col items-center w-full group">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-4 border-white shadow-lg mb-[-16px] sm:mb-[-20px] z-10 group-hover:scale-110 transition-transform duration-300">5</div>
                <button
                    onClick={handleUploadAudio}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-purple-500/50 transform hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 touch-manipulation w-full border-2 border-purple-400/20"
                >
                    <AudioIcon className="w-6 h-6 sm:w-8 sm:h-8 group-hover:animate-pulse"/>
                    <span>Upload Audio</span>
                </button>
                </div>
            </div>

            {/* Enhanced Ask Tutor Anything Section */}
            <div className="bg-gradient-to-br from-white/90 via-white/80 to-purple-50/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-xl border border-purple-200/50 p-4 sm:p-5 lg:p-8 mb-8 w-full max-w-4xl hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-4">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2">🎯 Ask Gabu Anything!</h3>
                <p className="text-sm sm:text-base text-gray-600">Type your question or choose a quick suggestion below</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What would you like to learn today? 🤔"
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base lg:text-lg rounded-full border-2 border-purple-200 focus:outline-none focus:ring-4 focus:ring-purple-300/50 focus:border-purple-400 bg-white/80 transition-all duration-300"
                  aria-label="Ask a question"
                />
                <button onClick={() => submitQuickAsk()} aria-label="Send question" className="p-3 sm:p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transform active:scale-95 hover:scale-105 transition-all duration-300 shadow-lg">
                  <SendIcon className="w-6 h-6 sm:w-7 sm:h-7"/>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4 justify-center">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => submitQuickAsk(s)} className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-gray-700 border border-purple-200 hover:border-purple-300 transition-all duration-300 hover:scale-105 hover:shadow-md font-medium">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Progress Ring */}
            {progress && (
              <div className="mb-8 bg-gradient-to-br from-white/90 via-blue-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-xl border border-blue-200/50 p-6 lg:p-8 max-w-2xl mx-auto hover:shadow-2xl transition-all duration-300">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4 text-center">🏆 Your Learning Progress</h3>
                <ProgressRing progress={progress} size="md" showDetails={true} />
              </div>
            )}

            {/* Enhanced Recent Topics */}
            {recentTopics.length > 0 && (
              <div className="mt-8 sm:mt-10 lg:mt-12 w-full max-w-6xl">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-800 mb-3 sm:mb-4 text-center">📚 Recent Topics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  {recentTopics.map((t, idx) => (
                    <button key={idx} onClick={() => onSelectRecent?.(t)} className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/90 to-purple-50/80 backdrop-blur-sm shadow-lg hover:shadow-xl text-left touch-manipulation transition-all duration-300 hover:scale-105 hover:-translate-y-1 border border-purple-200/50 group">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 grid place-items-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md">
                        <span className="text-xs sm:text-sm lg:text-base font-extrabold text-white">{Math.min(99, (idx+1)*7)}%</span>
                      </div>
                      <span className="text-xs sm:text-sm lg:text-base text-gray-700 font-semibold line-clamp-1 group-hover:text-purple-700 transition-colors duration-300">{t}</span>
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
