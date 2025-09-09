import React, { useState, useEffect } from 'react';
import { GabuIcon } from './Icons';

const loadingMessages = [
  "Gabu is thinking...",
  "Putting on my thinking cap!",
  "Figuring this out for you...",
  "Cooking up an explanation!",
  "Just a moment..."
];

const Loader: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <GabuIcon className="w-24 h-24 text-purple-500 animate-gentle-bounce mb-6" />
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Working on it!</h2>
      <p className="text-lg text-gray-600 transition-opacity duration-500">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default Loader;