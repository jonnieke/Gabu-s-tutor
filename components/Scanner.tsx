import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useCamera } from '../hooks/useCamera';
import { CameraIcon, CloseIcon } from './Icons';

interface ScannerProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { stream, error, startCamera, stopCamera } = useCamera();
  const [focusIndicator, setFocusIndicator] = useState<{ x: number; y: number; key: number } | null>(null);
  const focusTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
       if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(imageDataUrl);
        stopCamera();
      }
    }
  }, [onCapture, stopCamera]);

  const handleVideoTap = useCallback((event: React.MouseEvent<HTMLVideoElement>) => {
    if (!videoRef.current) return;

    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }

    const rect = videoRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setFocusIndicator({ x, y, key: Date.now() });

    focusTimeoutRef.current = window.setTimeout(() => {
      setFocusIndicator(null);
    }, 750);
  }, []);
  
  if (error) {
    return (
        <div className="p-8 text-center flex flex-col items-center justify-center h-full">
            <h2 className="text-xl font-bold text-red-500 mb-2">Camera Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors"
            >
                Back
            </button>
        </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 bg-black rounded-3xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain rounded-2xl cursor-pointer"
        onClick={handleVideoTap}
      />
      {focusIndicator && (
        <div
          key={focusIndicator.key}
          className="absolute border-4 border-yellow-400 rounded-2xl animate-focus-pulse pointer-events-none"
          style={{
            left: `${focusIndicator.x - 40}px`,
            top: `${focusIndicator.y - 40}px`,
            width: '80px',
            height: '80px',
          }}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
        <div className="w-full max-w-md h-1/2 border-4 border-white/70 rounded-3xl" />
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <div className="absolute bottom-6 flex justify-center items-center w-full gap-8">
        <button
          onClick={onCancel}
          className="p-4 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-red-500 transition-all duration-200 transform active:scale-90"
          aria-label="Cancel scan"
        >
          <CloseIcon className="w-8 h-8" />
        </button>
        <button
          onClick={handleCapture}
          className="p-5 bg-white rounded-full text-purple-600 shadow-lg ring-4 ring-white/50 hover:bg-purple-100 transition-all duration-200 transform hover:scale-110 active:scale-100"
          aria-label="Capture image"
        >
          <CameraIcon className="w-10 h-10" />
        </button>
      </div>
    </div>
  );
};

export default Scanner;