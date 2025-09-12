import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useCamera } from '../hooks/useCamera';
import { CloseIcon, SwitchCameraIcon, FlashIcon } from './Icons';

interface ScannerProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { stream, error, startCamera, stopCamera, switchCamera, supportsTorch, isTorchOn, toggleTorch, zoomRange, zoom, setZoomLevel, facingMode } = useCamera();
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
    const tappedX = event.clientX - rect.left;
    const mirroredX = rect.width - tappedX;
    const y = event.clientY - rect.top;

    setFocusIndicator({ x: mirroredX, y, key: Date.now() });

    focusTimeoutRef.current = window.setTimeout(() => {
      setFocusIndicator(null);
    }, 750);
  }, []);
  
  if (error) {
    return (
        <div className="p-8 text-center flex flex-col items-center justify-center h-full">
            <h2 className="text-xl font-bold text-red-500 mb-2">Camera Error</h2>
            <p className="text-gray-600 mb-6 max-w-md">{error}</p>
            <div className="text-sm text-gray-500 mb-4 max-w-md">
                <p>Tips:</p>
                <ul className="list-disc list-inside text-left">
                    <li>Allow camera access in your browser settings.</li>
                    <li>On mobile, ensure your browser has camera permissions enabled in system settings.</li>
                    <li>Try switching cameras after allowing access.</li>
                </ul>
            </div>
            <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition-colors"
            >
                Back
            </button>
            <button
                onClick={startCamera}
                className="mt-3 px-6 py-3 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition-colors"
            >
                Try Again
            </button>
        </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black rounded-3xl overflow-hidden pt-safe pb-safe">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain rounded-2xl cursor-pointer transform -scale-x-100"
        onClick={handleVideoTap}
      />
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={switchCamera}
          className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm"
          aria-label="Switch camera"
        >
          <SwitchCameraIcon className="w-6 h-6" />
        </button>
        {supportsTorch && (
          <button
            onClick={toggleTorch}
            className={`p-2 rounded-full backdrop-blur-sm ${isTorchOn ? 'bg-yellow-400 text-black' : 'bg-black/60 text-white hover:bg-black/80'}`}
            aria-label="Toggle flash"
          >
            <FlashIcon className="w-6 h-6" />
          </button>
        )}
      </div>
       <div className="absolute top-0 left-0 right-0 p-6 pt-10 text-center bg-gradient-to-b from-black/70 to-transparent z-10 pointer-events-none">
        <h2 className="text-xl font-bold text-white tracking-wide">Scan Text</h2>
        <p className="text-white/80">Position the text within the corners.</p>
      </div>
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
        <div className="w-full max-w-md h-1/2 relative">
            <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-3xl animate-pulse-corners" />
            <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-3xl animate-pulse-corners" />
            <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-3xl animate-pulse-corners" />
            <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-3xl animate-pulse-corners" />
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
      {zoomRange && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-28 w-64 z-20">
          <input
            type="range"
            min={zoomRange.min}
            max={zoomRange.max}
            step={zoomRange.step}
            value={zoom ?? zoomRange.min}
            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            className="w-full accent-yellow-400"
            aria-label="Zoom"
          />
        </div>
      )}
      <div className="absolute bottom-6 pb-safe flex justify-center items-center w-full z-10">
        <div className="w-full max-w-sm flex justify-between items-center">
             <button
                onClick={onCancel}
                className="p-4 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-red-500 transition-all duration-200 transform active:scale-90"
                aria-label="Cancel scan"
                >
                <CloseIcon className="w-8 h-8" />
            </button>
            <button
                onClick={handleCapture}
                className="w-20 h-20 p-1.5 bg-white rounded-full shadow-lg ring-4 ring-white/50 hover:scale-110 active:scale-100 transition-transform duration-200"
                aria-label="Capture image"
                >
                <div className="w-full h-full bg-white rounded-full border-4 border-black" />
            </button>
            <div className="w-16 h-16" />
        </div>
      </div>
    </div>
  );
};

export default Scanner;