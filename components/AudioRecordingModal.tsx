import React, { useState } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { XMarkIcon, PlayIcon, StopIcon, MicrophoneIcon } from './Icons';

interface AudioRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioRecorded: (audioBlob: Blob, mimeType: string) => void;
}

const AudioRecordingModal: React.FC<AudioRecordingModalProps> = ({ isOpen, onClose, onAudioRecorded }) => {
  const { isRecording, audioData, error, startRecording, stopRecording, resetRecording } = useAudioRecorder();
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handlePlayRecording = () => {
    if (audioData && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleRetakeRecording = () => {
    resetRecording();
    setIsPlaying(false);
  };

  const handleUseRecording = () => {
    if (audioData) {
      onAudioRecorded(audioData.blob, audioData.mimeType);
      onClose();
    }
  };

  const handleClose = () => {
    resetRecording();
    setIsPlaying(false);
    onClose();
  };

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }, [audioData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Record Your Voice</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Recording Interface */}
        {!audioData ? (
          <div className="text-center">
            <div className="mb-6">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 relative ${
                isRecording 
                  ? 'bg-red-500 animate-pulse' 
                  : 'bg-indigo-100'
              }`}>
                <MicrophoneIcon className={`w-12 h-12 ${
                  isRecording ? 'text-white' : 'text-indigo-600'
                }`} />
                {isRecording && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
                )}
              </div>
              <p className="text-gray-600 mb-4">
                {isRecording 
                  ? '🎤 Recording... Click stop when finished' 
                  : 'Click the microphone to start recording your question'
                }
              </p>
              {isRecording && (
                <div className="flex items-center justify-center gap-2 text-red-600 text-sm font-medium">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>REC</span>
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg font-semibold"
                >
                  <MicrophoneIcon className="w-5 h-5" />
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg font-semibold animate-pulse"
                >
                  <StopIcon className="w-5 h-5" />
                  Stop Recording
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                <MicrophoneIcon className="w-12 h-12 text-green-600" />
              </div>
              <p className="text-gray-600 mb-4">Recording complete! Listen to your audio:</p>
            </div>

            {/* Audio Player */}
            <div className="mb-6">
              <audio
                ref={audioRef}
                src={audioData.url}
                controls
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3">
              <button
                onClick={handleRetakeRecording}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
              >
                Record Again
              </button>
              <button
                onClick={handleUseRecording}
                className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors"
              >
                Use This Recording
              </button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Tips for better recording:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Speak clearly and at a normal pace</li>
            <li>• Hold your device close to your mouth</li>
            <li>• Record in a quiet environment</li>
            <li>• Keep recordings under 2 minutes for best results</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AudioRecordingModal;
