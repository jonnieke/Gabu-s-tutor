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
      className="relative w-full min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${heroBackgroundImage})` }}
      role="main"
      aria-labelledby="hero-heading"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/60" />
      
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
            <GabuIcon className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 text-purple-500 mb-4 mx-auto animate-gentle-bounce" />
            <h1 id="hero-heading" className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-extrabold mb-2 text-gray-800">Making homework easy, step-by-step.</h1>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-700 mb-6 max-w-4xl mx-auto">
                I'm Gabu! I'll be your friendly guide for any subject. Just show me what you're working on, and I'll explain it in a simple way.
            </p>

            {/* Input Method Cards - Now at the top */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 w-full mb-8">
                <div className="flex flex-col items-center w-full">
                <div className="bg-orange-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-4 border-white shadow-md mb-[-16px] sm:mb-[-20px] z-10">1</div>
                <button
                    onClick={onStartScan}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 bg-orange-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200 touch-manipulation w-full"
                >
                    <CameraIcon className="w-6 h-6 sm:w-8 sm:h-8"/>
                     <span>Scan n Learn</span>
                </button>
                </div>
                <div className="flex flex-col items-center w-full">
                <div className="bg-indigo-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-4 border-white shadow-md mb-[-16px] sm:mb-[-20px] z-10">2</div>
                <button
                    onClick={handleRecordAudio}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 bg-indigo-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200 touch-manipulation w-full"
                >
                    <MicrophoneIcon className="w-6 h-6 sm:w-8 sm:h-8"/>
                    <span>Record Audio</span>
                </button>
                </div>
                <div className="flex flex-col items-center w-full">
                <div className="bg-teal-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-4 border-white shadow-md mb-[-16px] sm:mb-[-20px] z-10">3</div>
                <button
                    onClick={onUploadImage}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 bg-teal-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200 touch-manipulation w-full"
                >
                    <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8"/>
                    <span>Upload an Image</span>
                </button>
                </div>
                <div className="flex flex-col items-center w-full">
                <div className="bg-green-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-4 border-white shadow-md mb-[-16px] sm:mb-[-20px] z-10">4</div>
                <button
                    onClick={onOpenIllustrate}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 bg-green-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:bg-green-600 focus:outline-none focus:ring-4 focus:ring-green-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200 touch-manipulation w-full"
                >
                    <IllustrateIcon className="w-6 h-6 sm:w-8 sm:h-8"/>
                    <span>Create Diagram</span>
                </button>
                </div>
                <div className="flex flex-col items-center w-full">
                <div className="bg-purple-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl border-4 border-white shadow-md mb-[-16px] sm:mb-[-20px] z-10">5</div>
                <button
                    onClick={handleUploadAudio}
                    className="flex flex-col items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-5 bg-purple-500 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg hover:bg-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200 touch-manipulation w-full"
                >
                    <AudioIcon className="w-6 h-6 sm:w-8 sm:h-8"/>
                    <span>Upload Audio</span>
                </button>
                </div>
            </div>

            {/* Ask Tutor Anything - Now in the middle */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-lg p-4 sm:p-5 lg:p-8 mb-8 w-full max-w-4xl">
              <div className="flex items-center gap-2 sm:gap-4">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask Tutor anything…"
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base lg:text-lg rounded-full border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
                  aria-label="Ask a question"
                />
                <button onClick={() => submitQuickAsk()} aria-label="Send question" className="p-3 sm:p-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 transform active:scale-95 transition-all">
                  <SendIcon className="w-6 h-6 sm:w-7 sm:h-7"/>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4 justify-center">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => submitQuickAsk(s)} className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-full bg-gray-100 hover:bg-purple-100 text-gray-700 border border-gray-200 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress Ring - Now at the bottom */}
            {progress && (
              <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl lg:rounded-3xl shadow-lg p-6 lg:p-8 max-w-2xl mx-auto">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-4">Your Learning Progress</h3>
                <ProgressRing progress={progress} size="md" showDetails={true} />
              </div>
            )}

            {recentTopics.length > 0 && (
              <div className="mt-8 sm:mt-10 lg:mt-12 w-full max-w-6xl">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-800 mb-3 sm:mb-4 text-left">Recent topics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  {recentTopics.map((t, idx) => (
                    <button key={idx} onClick={() => onSelectRecent?.(t)} className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-sm shadow hover:shadow-md text-left touch-manipulation transition-all hover:scale-105">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-purple-100 grid place-items-center flex-shrink-0">
                        <span className="text-xs sm:text-sm lg:text-base font-extrabold text-purple-600">{Math.min(99, (idx+1)*7)}%</span>
                      </div>
                      <span className="text-xs sm:text-sm lg:text-base text-gray-700 font-semibold line-clamp-1">{t}</span>
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
