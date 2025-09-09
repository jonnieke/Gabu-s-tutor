import React, { useState, useEffect, useCallback, useRef } from 'react';
import ttsService from '../services/ttsService';
import { PlayIcon, PauseIcon, StopIcon, GabuIcon, SendIcon, AttachmentIcon, ImageIcon, AudioFileIcon, SettingsIcon, MicrophoneIcon, TrashIcon, QuizIcon } from './Icons';
import { ChatMessage, FileAttachment, UserSettings, Quiz } from '../types';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { generateQuiz } from '../services/geminiService';
import QuizView from './QuizView';

interface TutorResponseProps {
  image: string | null;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string, attachment?: FileAttachment) => void;
  onSystemMessage: (message: string) => void;
  isReplying: boolean;
  onReset: () => void;
  onOpenSettings: () => void;
  userSettings: UserSettings;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            const [, data] = base64String.split(',');
            resolve(data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const TutorResponse: React.FC<TutorResponseProps> = ({ image, chatHistory, onSendMessage, onSystemMessage, isReplying, onReset, onOpenSettings, userSettings }) => {
  const [ttsState, setTtsState] = useState<'IDLE' | 'PLAYING' | 'PAUSED'>('IDLE');
  const [highlightRange, setHighlightRange] = useState<{ start: number; end: number } | null>(null);
  const [userInput, setUserInput] = useState('');
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  
  const { isRecording, audioData, startRecording, stopRecording, resetRecording } = useAudioRecorder();
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const lastModelMessage = chatHistory.slice().reverse().find(m => m.role === 'model');
  const textToSpeak = lastModelMessage?.content || '';

  const handleTTSAction = useCallback((action: 'play' | 'pause' | 'stop' | 'resume') => {
    const handleEnd = () => {
      setTtsState('IDLE');
      setHighlightRange(null);
    };

    const handleBoundary = (charIndex: number) => {
      const end = textToSpeak.indexOf(' ', charIndex);
      setHighlightRange({
        start: charIndex,
        end: end === -1 ? textToSpeak.length : end,
      });
    };
    
    switch(action) {
      case 'play':
        ttsService.speak(textToSpeak, handleEnd, handleBoundary, userSettings.voiceURI || undefined);
        setTtsState('PLAYING');
        break;
      case 'pause':
        ttsService.pause();
        setTtsState('PAUSED');
        break;
      case 'resume':
        ttsService.resume();
        setTtsState('PLAYING');
        break;
      case 'stop':
        ttsService.cancel();
        setTtsState('IDLE');
        setHighlightRange(null);
        break;
    }
  }, [textToSpeak, userSettings.voiceURI]);

  useEffect(() => {
    return () => ttsService.cancel();
  }, []);

  useEffect(() => {
    handleTTSAction('stop');
  }, [textToSpeak, handleTTSAction]);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (audioData) {
        const processAudio = async () => {
            const base64 = await blobToBase64(audioData.blob);
            setAttachment({
                type: 'audio',
                data: base64,
                mimeType: audioData.mimeType,
            });
        }
        processAudio();
    }
  }, [audioData]);

  const renderTextWithHighlight = (text: string) => {
    if (!highlightRange || (ttsState !== 'PLAYING' && ttsState !== 'PAUSED')) {
        return text;
    }
    return (
        <>
            {text.substring(0, highlightRange.start)}
            <span className="bg-yellow-300/70 rounded-md">{text.substring(highlightRange.start, highlightRange.end)}</span>
            {text.substring(highlightRange.end)}
        </>
    );
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() || attachment) {
      onSendMessage(userInput, attachment);
      setUserInput('');
      setAttachment(null);
      resetRecording();
    }
  };
  
  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const [, base64Data] = dataUrl.split(',');
      const fileType = file.type.startsWith('image/') ? 'image' : 
                       file.type.startsWith('audio/') ? 'audio' : null;
      if (fileType && base64Data) {
        setAttachment({
          type: fileType,
          data: base64Data,
          mimeType: file.type
        });
        resetRecording();
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };
  
  const handleMicClick = () => {
    if (isRecording) {
        stopRecording();
    } else {
        setAttachment(null);
        startRecording();
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    resetRecording();
  }
  
  const handleStartQuiz = async () => {
    setIsGeneratingQuiz(true);
    setQuizError(null);
    try {
        const generatedQuiz = await generateQuiz(chatHistory, userSettings);
        setQuiz(generatedQuiz);
    } catch(err) {
        setQuizError(err instanceof Error ? err.message : "Could not create quiz.");
    } finally {
        setIsGeneratingQuiz(false);
    }
  };
  
  const handleQuizComplete = (score: number, total: number) => {
    const message = `Great job on the quiz! You scored ${score}/${total}. Let me know if you want to review anything!`;
    onSystemMessage(message);
    setQuiz(null);
  }

  if (quiz) {
    return <QuizView quiz={quiz} onComplete={handleQuizComplete} />;
  }

  return (
    <div className="p-4 sm:p-8 w-full h-full flex flex-col">
       <input type="file" accept="image/*,audio/*" ref={fileInputRef} onChange={handleFileSelected} className="hidden" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start flex-grow min-h-0">
        <div className="flex flex-col items-center h-full">
            <div className="w-full max-w-sm flex justify-between items-center mb-2">
                <p className="font-bold text-gray-500">What you're studying</p>
                <button onClick={onOpenSettings} className="text-gray-400 hover:text-purple-500 transition-colors" aria-label="Settings">
                    <SettingsIcon className="w-6 h-6"/>
                </button>
            </div>
          {image ? (
            <img src={image} alt="Scanned text" className="rounded-2xl shadow-lg w-full max-w-sm" />
          ) : (
            <div className="rounded-2xl shadow-lg w-full max-w-sm bg-gray-100 aspect-square flex flex-col items-center justify-center text-center p-4">
                <AudioFileIcon className="w-24 h-24 text-indigo-400 mb-4"/>
                <h3 className="text-lg font-bold text-gray-700">Audio Topic</h3>
                <p className="text-gray-500">Gabu is explaining the uploaded audio.</p>
            </div>
          )}
        </div>
        <div className="flex flex-col h-full max-h-[70vh] md:max-h-full">
          <div ref={chatContainerRef} className="bg-gray-100 p-4 rounded-2xl overflow-y-auto flex-grow space-y-4">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && <GabuIcon className="w-8 h-8 text-purple-500 flex-shrink-0" />}
                <div className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-white text-gray-800'}`}>
                  {msg.attachment?.type === 'image' && (
                    <img src={`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`} alt="User upload" className="rounded-lg mb-2 max-h-40"/>
                  )}
                  {msg.attachment?.type === 'audio' && (
                     <div className={`flex items-center gap-2 p-2 rounded-lg mb-2 ${msg.role === 'user' ? 'bg-orange-400' : 'bg-gray-200'}`}>
                        <AudioFileIcon className={`w-6 h-6 ${msg.role === 'user' ? 'text-white' : 'text-gray-600'}`}/>
                        <span className="text-sm font-medium">Audio attached</span>
                    </div>
                  )}
                  {msg.content && <p className="text-base leading-relaxed break-words">
                    {msg === lastModelMessage ? renderTextWithHighlight(msg.content) : msg.content}
                  </p>}
                </div>
              </div>
            ))}
            {isReplying && (
                <div className="flex items-end gap-2">
                    <GabuIcon className="w-8 h-8 text-purple-500 flex-shrink-0 animate-gentle-bounce" />
                    <div className="max-w-xs p-3 rounded-2xl bg-white">
                        <p className="text-base leading-relaxed text-gray-500">Gabu is thinking...</p>
                    </div>
                </div>
            )}
          </div>
          <div className="flex items-center justify-center space-x-4 mt-4">
            {ttsState === 'PLAYING' ? (
              <button onClick={() => handleTTSAction('pause')} className="flex items-center gap-2 px-6 py-3 bg-amber-500 rounded-full hover:bg-amber-600 transition-all text-white font-bold text-lg transform active:scale-95">
                <PauseIcon className="w-6 h-6" /> <span>Pause</span>
              </button>
            ) : (
              <button onClick={() => ttsState === 'PAUSED' ? handleTTSAction('resume') : handleTTSAction('play')} disabled={!textToSpeak || isReplying || isGeneratingQuiz} className="flex items-center gap-2 px-6 py-3 bg-teal-500 rounded-full hover:bg-teal-600 transition-all text-white font-bold text-lg transform active:scale-95 disabled:bg-gray-300">
                <PlayIcon className="w-6 h-6" /> <span>{ttsState === 'PAUSED' ? 'Resume' : 'Play'}</span>
              </button>
            )}
            {(ttsState === 'PLAYING' || ttsState === 'PAUSED') && (
              <button onClick={() => handleTTSAction('stop')} className="flex items-center gap-2 px-5 py-3 bg-rose-500 rounded-full hover:bg-rose-600 transition-all text-white font-semibold transform active:scale-95">
                <StopIcon className="w-6 h-6" /> <span>Stop</span>
              </button>
            )}
            <button onClick={handleStartQuiz} disabled={isReplying || isGeneratingQuiz} className="flex items-center gap-2 px-6 py-3 bg-purple-600 rounded-full hover:bg-purple-700 transition-all text-white font-bold text-lg transform active:scale-95 disabled:bg-gray-300">
                <QuizIcon className="w-6 h-6" /> <span>{isGeneratingQuiz ? 'Creating...' : 'Quiz Me!'}</span>
            </button>
          </div>
           {quizError && <p className="text-center text-red-500 mt-2">{quizError}</p>}
            {attachment && (
                <div className="mt-3 p-2 bg-gray-200 rounded-lg flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        {attachment.type === 'image' ? <ImageIcon className="w-5 h-5"/> : <AudioFileIcon className="w-5 h-5"/>}
                        <span>{attachment.type === 'image' ? 'Image' : 'Audio'} attached</span>
                    </div>
                    <button onClick={clearAttachment} className="text-red-500 hover:text-red-700 font-bold p-1 rounded-full">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
            )}
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2 mt-2">
             <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 disabled:bg-gray-300 transform active:scale-95 transition">
              <AttachmentIcon className="w-6 h-6" />
            </button>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask a follow-up question..."
              disabled={isReplying || isRecording}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            />
            <button type="button" onClick={handleMicClick} disabled={isReplying} className={`p-3 rounded-full text-white transform active:scale-95 transition ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-indigo-500 hover:bg-indigo-600'}`}>
                <MicrophoneIcon className="w-6 h-6"/>
            </button>
            <button type="submit" disabled={isReplying || isRecording || (!userInput.trim() && !attachment)} className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-300 transform active:scale-95 transition">
              <SendIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
      <div className="text-center mt-6">
        <button
          onClick={onReset}
          className="px-8 py-4 bg-orange-500 text-white font-bold rounded-full shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200"
        >
          Start a New Topic
        </button>
      </div>
    </div>
  );
};

export default TutorResponse;