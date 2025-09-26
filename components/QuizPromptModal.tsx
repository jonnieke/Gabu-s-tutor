import React from 'react';
import { QuizIcon, CloseIcon, StarIcon } from './Icons';

interface QuizPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartQuiz: () => void;
  onDismiss: () => void;
  topic?: string;
}

const QuizPromptModal: React.FC<QuizPromptModalProps> = ({ 
  isOpen, 
  onClose, 
  onStartQuiz, 
  onDismiss,
  topic = "this topic"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 animate-bounce-in">
        {/* Header with stars */}
        <div className="text-center mb-4">
          <div className="flex justify-center items-center gap-2 mb-3">
            <StarIcon className="w-6 h-6 text-yellow-400 animate-pulse" />
            <StarIcon className="w-8 h-8 text-yellow-500 animate-bounce" />
            <StarIcon className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Ready for a Challenge? 🎯
          </h2>
          <p className="text-gray-600 text-sm">
            Test what you learned about {topic}!
          </p>
        </div>

        {/* Fun quiz description */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <QuizIcon className="w-8 h-8 text-purple-600" />
            <div>
              <h3 className="font-bold text-purple-800 text-sm">Quick Quiz</h3>
              <p className="text-purple-600 text-xs">3 fun questions</p>
            </div>
          </div>
          <p className="text-gray-700 text-sm">
            See how well you understood the explanation! It's like a mini game! 🎮
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onStartQuiz();
              onClose();
            }}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <QuizIcon className="w-5 h-5" />
            <span>Yes, Quiz Me! 🚀</span>
          </button>
          
          <button
            onClick={() => {
              onDismiss();
              onClose();
            }}
            className="w-full px-6 py-3 bg-gray-100 text-gray-600 font-medium rounded-full hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-500/50 transition-all duration-200"
          >
            Maybe Later
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default QuizPromptModal;
