import React, { useState } from 'react';
import { CameraIcon, MicrophoneIcon, SendIcon } from './Icons';
import AudioRecordingModal from './AudioRecordingModal';

interface SimpleIdleScreenProps {
  onStartScan: () => void;
  onUploadImage: () => void;
  onRecordedAudio: (audioBlob: Blob, mimeType: string) => void;
  onQuickAsk: (question: string) => void;
  recentTopics?: string[];
  onSelectRecent?: (topic: string) => void;
  remainingUses: number;
  maxUses: number;
  isAuthenticated: boolean;
}

const SimpleIdleScreen: React.FC<SimpleIdleScreenProps> = ({ 
  onStartScan, 
  onUploadImage,
  onRecordedAudio,
  onQuickAsk,
  recentTopics = [],
  onSelectRecent,
  remainingUses,
  maxUses,
  isAuthenticated
}) => {
  const [question, setQuestion] = useState('');
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);

  const quickSuggestions = [
    '📐 Help with math homework',
    '📝 Explain this for me',
    '🔬 Science question',
    '📚 Reading help',
  ];

  const submitQuestion = () => {
    const value = question.trim();
    if (!value) return;
    onQuickAsk(value);
    setQuestion('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitQuestion();
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 overflow-hidden">
      {/* Friendly Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-200/30 rounded-full animate-bounce"></div>
        <div className="absolute top-40 right-16 w-16 h-16 bg-blue-200/30 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-green-200/30 rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-32 w-18 h-18 bg-purple-200/30 rounded-full animate-bounce" style={{animationDelay: '3s'}}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 pb-24">
        <div className="max-w-4xl w-full space-y-6">
          {/* Usage Badge */}
          {!isAuthenticated && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border-2 border-purple-200">
                <span className="text-2xl">🎯</span>
                <span className="text-sm font-bold text-gray-700">
                  {remainingUses} free {remainingUses === 1 ? 'try' : 'tries'} left!
                </span>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="text-center space-y-3">
            <div className="text-7xl mb-4 animate-bounce">🎓</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500">
              Homework Helper! 🚀
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 font-semibold max-w-2xl mx-auto">
              Snap, Ask, or Record - I'll help you understand anything! ✨
            </p>
          </div>

          {/* Main Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Scan Button */}
            <button
              onClick={onStartScan}
              className="group relative overflow-hidden bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-3xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CameraIcon className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-black mb-1">📸 Take Photo</h3>
                  <p className="text-sm opacity-90">Scan your homework</p>
                </div>
              </div>
            </button>

            {/* Voice Button */}
            <button
              onClick={() => setIsRecordingModalOpen(true)}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 text-white rounded-3xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MicrophoneIcon className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-black mb-1">🎤 Ask Aloud</h3>
                  <p className="text-sm opacity-90">Record your question</p>
                </div>
              </div>
            </button>

            {/* Upload Button */}
            <button
              onClick={onUploadImage}
              className="group relative overflow-hidden bg-gradient-to-br from-green-400 to-teal-500 text-white rounded-3xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-black mb-1">🖼️ Upload</h3>
                  <p className="text-sm opacity-90">Choose a photo</p>
                </div>
              </div>
            </button>
          </div>

          {/* Quick Ask Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border-2 border-purple-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
              <span>💬</span> Type Your Question
            </h3>
            
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What do you need help with? 🤔"
                className="flex-1 px-4 py-3 sm:py-4 text-base sm:text-lg rounded-full border-2 border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 outline-none transition-all bg-white"
              />
              <button
                onClick={submitQuestion}
                className="px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                <SendIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-2 justify-center">
              {quickSuggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => onQuickAsk(suggestion)}
                  className="px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-gray-700 border-2 border-purple-200 hover:border-purple-300 transition-all transform hover:scale-105"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Topics */}
          {recentTopics.length > 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
                <span>📚</span> Recent Topics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentTopics.slice(0, 4).map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectRecent?.(topic)}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-left transition-all transform hover:scale-105 border-2 border-blue-200 hover:border-blue-300"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 line-clamp-2">{topic}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fun Footer */}
          <div className="text-center text-sm text-gray-600 space-y-2">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <span>📐</span> Math
              </span>
              <span className="flex items-center gap-1">
                <span>🔬</span> Science
              </span>
              <span className="flex items-center gap-1">
                <span>📝</span> English
              </span>
              <span className="flex items-center gap-1">
                <span>🌍</span> Geography
              </span>
              <span className="flex items-center gap-1">
                <span>🎨</span> Art
              </span>
            </div>
            <p className="font-semibold">All subjects covered! Let's make learning fun! ✨</p>
          </div>
        </div>
      </div>

      {/* Audio Recording Modal */}
      <AudioRecordingModal
        isOpen={isRecordingModalOpen}
        onClose={() => setIsRecordingModalOpen(false)}
        onAudioRecorded={onRecordedAudio}
      />
    </div>
  );
};

export default SimpleIdleScreen;

