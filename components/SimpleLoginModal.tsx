import React, { useState } from 'react';
import { CloseIcon } from './Icons';

interface SimpleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  usageCount: number;
  maxUses: number;
}

const SimpleLoginModal: React.FC<SimpleLoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onLogin,
  usageCount,
  maxUses 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onLogin(email, password);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-bounce-in">
        {/* Close button - but discouraged */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {/* Fun Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4 animate-bounce">🎓</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-2">
            Keep Learning! 🚀
          </h2>
          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-4 mb-4">
            <p className="text-lg font-bold text-gray-800 mb-1">
              You've used {usageCount} of {maxUses} free tries!
            </p>
            <p className="text-sm text-gray-600">
              Sign in to continue your homework journey! ✨
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 px-4 rounded-full font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? '⏳ Loading...' : mode === 'login' ? '🚀 Sign In' : '✨ Create Account'}
          </button>
        </form>

        {/* Fun Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {mode === 'login' 
              ? "Don't have an account? Click Sign Up above! 👆" 
              : "Already have an account? Click Sign In above! 👆"}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>🔒 Safe</span>
            <span>•</span>
            <span>🎯 Free Forever</span>
            <span>•</span>
            <span>⚡ Instant Access</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLoginModal;

