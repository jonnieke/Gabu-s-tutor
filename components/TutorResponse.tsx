import React, { useState, useEffect, useCallback, useRef } from 'react';
import ttsService, { isTTSSupported } from '../services/ttsService';
import { PlayIcon, PauseIcon, StopIcon, GabuIcon, SendIcon, AttachmentIcon, ImageIcon, AudioFileIcon, SettingsIcon, MicrophoneIcon, TrashIcon, QuizIcon, CopyIcon, BookmarkIcon, BookmarkFilledIcon, CheckCircleIcon, HomeIcon } from './Icons';
import { ChatMessage, FileAttachment, UserSettings, Quiz } from '../types';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { generateQuiz } from '../services/geminiService';
import { saveBookmark, getBookmarks } from '../services/progressService';
import QuizView from './QuizView';
import QuizPromptModal from './QuizPromptModal';

interface TutorResponseProps {
  image: string | null;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string, attachment?: FileAttachment) => void;
  onSystemMessage: (message: string) => void;
  isReplying: boolean;
  onReset: () => void;
  onOpenSettings: () => void;
  onHome: () => void;
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

const TutorResponse: React.FC<TutorResponseProps> = ({ image, chatHistory, onSendMessage, onSystemMessage, isReplying, onReset, onOpenSettings, onHome, userSettings }) => {
  const [ttsState, setTtsState] = useState<'IDLE' | 'PLAYING' | 'PAUSED'>('IDLE');
  const [highlightRange, setHighlightRange] = useState<{ start: number; end: number } | null>(null);
  const [userInput, setUserInput] = useState('');
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const [ttsUnavailable, setTtsUnavailable] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [bookmarkedMessages, setBookmarkedMessages] = useState<Set<number>>(new Set());
  const [showQuizPrompt, setShowQuizPrompt] = useState(false);
  const [hasSeenQuizPrompt, setHasSeenQuizPrompt] = useState(false);
  const [quizPromptDismissed, setQuizPromptDismissed] = useState(false);
  const [navigationAction, setNavigationAction] = useState<(() => void) | null>(null);
  
  const { isRecording, audioData, startRecording, stopRecording, resetRecording, error: micError } = useAudioRecorder();
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const lastModelMessage = chatHistory.slice().reverse().find(m => m.role === 'model');
  const textToSpeak = lastModelMessage?.content || '';

  // Extract topic from the conversation for quiz prompt
  const getTopicFromConversation = () => {
    if (image) return 'the scanned content';
    const firstUserMessage = chatHistory.find(m => m.role === 'user');
    if (firstUserMessage?.content) {
      const question = firstUserMessage.content.toLowerCase();
      if (question.includes('math') || question.includes('calculate') || question.includes('solve')) return 'math';
      if (question.includes('science') || question.includes('experiment')) return 'science';
      if (question.includes('history') || question.includes('past')) return 'history';
      if (question.includes('english') || question.includes('grammar') || question.includes('writing')) return 'English';
      if (question.includes('what') || question.includes('how') || question.includes('why')) return 'this topic';
    }
    return 'this topic';
  };

  const handleCopy = (text: string, index: number) => {
    if (!navigator.clipboard) {
        console.error('Clipboard API not available');
        return;
    }
    navigator.clipboard.writeText(text).then(() => {
        setCopiedMessageIndex(index);
        setTimeout(() => {
            setCopiedMessageIndex(null);
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!dateObj || isNaN(dateObj.getTime())) return '';
    return dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

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
    setTtsUnavailable(!isTTSSupported());
    return () => ttsService.cancel();
  }, []);

  useEffect(() => {
    handleTTSAction('stop');
  }, [textToSpeak, handleTTSAction]);

  // Navigation detection for quiz prompt
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (lastModelMessage && !hasSeenQuizPrompt && !quizPromptDismissed && !quiz) {
        e.preventDefault();
        e.returnValue = '';
        setShowQuizPrompt(true);
        setHasSeenQuizPrompt(true);
        return '';
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && lastModelMessage && !hasSeenQuizPrompt && !quizPromptDismissed && !quiz) {
        setShowQuizPrompt(true);
        setHasSeenQuizPrompt(true);
      }
    };

    // Add event listeners for navigation detection
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [lastModelMessage, hasSeenQuizPrompt, quizPromptDismissed, quiz]);
  
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
      const isImage = file.type.startsWith('image/');
      const isAudio = file.type.startsWith('audio/');
      const sizeMB = file.size / (1024 * 1024);
      const MAX_IMAGE_MB = 8;
      const MAX_AUDIO_MB = 20;

      if (!isImage && !isAudio) {
        setUploadError('Please choose an image or audio file.');
        return;
      }
      if (isImage && sizeMB > MAX_IMAGE_MB) {
        setUploadError(`Image is too large. Max ${MAX_IMAGE_MB} MB.`);
        return;
      }
      if (isAudio && sizeMB > MAX_AUDIO_MB) {
        setUploadError(`Audio is too large. Max ${MAX_AUDIO_MB} MB.`);
        return;
      }
      setUploadError(null);

      const inferredType: 'image' | 'audio' = isImage ? 'image' : 'audio';
      if (base64Data) {
        setAttachment({
          type: inferredType,
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
        setUploadError(null);
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

  const handleQuizPromptDismiss = () => {
    setQuizPromptDismissed(true);
    setShowQuizPrompt(false);
    // Execute stored navigation action if it exists
    if (navigationAction) {
      navigationAction();
      setNavigationAction(null);
    }
  }

  const handleQuizPromptStart = () => {
    setShowQuizPrompt(false);
    handleStartQuiz();
    // Clear navigation action since user chose to take quiz
    setNavigationAction(null);
  }

  // Function to check if user should see quiz prompt before navigating away
  const checkNavigationWithQuizPrompt = (navigationAction: () => void) => {
    if (lastModelMessage && !hasSeenQuizPrompt && !quizPromptDismissed && !quiz) {
      setShowQuizPrompt(true);
      setHasSeenQuizPrompt(true);
      // Store the navigation action to execute after quiz prompt
      setNavigationAction(() => navigationAction);
    } else {
      navigationAction();
    }
  }

  const handleBookmark = (messageIndex: number, message: ChatMessage) => {
    if (message.role !== 'model' || !message.content) return;
    
    const title = message.content.split('\n')[0].slice(0, 50) + (message.content.length > 50 ? '...' : '');
    const topic = image ? 'Scanned Content' : 'Quick Question';
    
    saveBookmark({
      title,
      content: message.content,
      topic,
      type: 'explanation',
      tags: [topic]
    });
    
    setBookmarkedMessages(prev => new Set([...prev, messageIndex]));
  };

  if (quiz) {
    return <QuizView quiz={quiz} onComplete={handleQuizComplete} onHome={onHome} />;
  }

  return (
    <div className="mobile-padding w-full h-full flex flex-col overflow-hidden mobile-scroll">
       <input type="file" accept="image/*,audio/*" ref={fileInputRef} onChange={handleFileSelected} className="hidden" />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start flex-grow min-h-0">
        <div className="flex flex-col items-center h-full">
            <div className="w-full max-w-sm flex justify-between items-center mb-2">
                <p className="text-sm sm:text-base font-bold text-gray-500">What you're studying</p>
                <button onClick={onOpenSettings} className="p-2 rounded-full text-gray-400 hover:text-purple-500 hover:bg-purple-50 transition-colors touch-manipulation" aria-label="Settings">
                    <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6"/>
                </button>
            </div>
          {image ? (
            <img src={image} alt="Scanned text" className="rounded-xl sm:rounded-2xl shadow-lg w-full max-w-xs max-h-32 object-contain" />
          ) : (
            <div className="rounded-xl sm:rounded-2xl shadow-lg w-full max-w-sm bg-gray-100 aspect-square flex flex-col items-center justify-center text-center p-4">
                <AudioFileIcon className="w-16 h-16 sm:w-24 sm:h-24 text-indigo-400 mb-4"/>
                <h3 className="text-base sm:text-lg font-bold text-gray-700">Audio Topic</h3>
                <p className="text-sm sm:text-base text-gray-500">Gabu is explaining the uploaded audio.</p>
            </div>
          )}
        </div>
        <div className="flex flex-col h-full max-h-[60vh] sm:max-h-[70vh] lg:max-h-full">
          <div ref={chatContainerRef} className="bg-gray-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl mobile-scroll flex-grow space-y-3 sm:space-y-4">
            {chatHistory.map((msg, index) => (
               <div key={index} className={`flex flex-col w-full ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`flex items-end gap-2 w-full ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'model' && <GabuIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0" />}
                  <div className={`group relative max-w-xs lg:max-w-md p-2 sm:p-3 rounded-xl sm:rounded-2xl ${msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-white text-gray-800'}`}>
                    {msg.attachment?.type === 'image' && (
                      <img src={`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`} alt="User upload" className="rounded-lg mb-2 max-h-32 object-contain"/>
                    )}
                    {msg.attachment?.type === 'audio' && (
                       <div className={`flex items-center gap-2 p-2 rounded-lg mb-2 ${msg.role === 'user' ? 'bg-orange-400' : 'bg-gray-200'}`}>
                          <AudioFileIcon className={`w-6 h-6 ${msg.role === 'user' ? 'text-white' : 'text-gray-600'}`}/>
                          <span className="text-sm font-medium">Audio attached</span>
                      </div>
                    )}
                    {msg.content && <p className="mobile-text leading-relaxed break-words">
                      {msg === lastModelMessage ? renderTextWithHighlight(msg.content) : msg.content}
                    </p>}
                     {msg.role === 'model' && msg.content && (
                        <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200">
                            <button
                                onClick={() => handleBookmark(index, msg)}
                                className="touch-target p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all duration-200 touch-manipulation"
                                aria-label="Bookmark this explanation"
                            >
                                {bookmarkedMessages.has(index) ? (
                                    <BookmarkFilledIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                                ) : (
                                    <BookmarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                            </button>
                            <button
                                onClick={() => handleCopy(msg.content, index)}
                                className="touch-target p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all duration-200 touch-manipulation"
                                aria-label={copiedMessageIndex === index ? "Copied" : "Copy message"}
                            >
                                {copiedMessageIndex === index ? (
                                    <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 animate-check-pop" />
                                ) : (
                                    <CopyIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                            </button>
                        </div>
                    )}
                  </div>
                </div>
                 <p className={`text-xs text-gray-400 mt-1 px-2 ${msg.role === 'user' ? 'mr-0' : 'ml-10'}`}>
                    {formatTime(msg.timestamp)}
                </p>
              </div>
            ))}
            {isReplying && (
                <div className="flex items-end gap-2">
                    <GabuIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0 animate-gentle-bounce" />
                    <div className="max-w-xs p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white">
                        <p className="text-sm sm:text-base leading-relaxed text-gray-500">Gabu is thinking...</p>
                    </div>
                </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-4">
            {ttsState === 'PLAYING' ? (
              <button onClick={() => handleTTSAction('pause')} className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-amber-500 rounded-full hover:bg-amber-600 transition-all text-white font-bold text-sm sm:text-lg transform active:scale-95 touch-manipulation">
                <PauseIcon className="w-5 h-5 sm:w-6 sm:h-6" /> <span>Pause</span>
              </button>
            ) : (
              <button onClick={() => ttsState === 'PAUSED' ? handleTTSAction('resume') : handleTTSAction('play')} disabled={!textToSpeak || isReplying || isGeneratingQuiz || ttsUnavailable} className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-teal-500 rounded-full hover:bg-teal-600 transition-all text-white font-bold text-sm sm:text-lg transform active:scale-95 disabled:bg-gray-300 touch-manipulation">
                <PlayIcon className="w-5 h-5 sm:w-6 sm:h-6" /> <span>{ttsState === 'PAUSED' ? 'Resume' : 'Play'}</span>
              </button>
            )}
            {(ttsState === 'PLAYING' || ttsState === 'PAUSED') && (
              <button onClick={() => handleTTSAction('stop')} className="flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-2 sm:py-3 bg-rose-500 rounded-full hover:bg-rose-600 transition-all text-white font-semibold text-sm sm:text-base transform active:scale-95 touch-manipulation">
                <StopIcon className="w-5 h-5 sm:w-6 sm:h-6" /> <span>Stop</span>
              </button>
            )}
            <button onClick={handleStartQuiz} disabled={isReplying || isGeneratingQuiz} className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 rounded-full hover:bg-purple-700 transition-all text-white font-bold text-sm sm:text-lg transform active:scale-95 disabled:bg-gray-300 touch-manipulation">
                <QuizIcon className="w-5 h-5 sm:w-6 sm:h-6" /> <span>{isGeneratingQuiz ? 'Creating...' : 'Quiz Me!'}</span>
            </button>
            <button onClick={() => checkNavigationWithQuizPrompt(onHome)} className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-orange-500 rounded-full hover:bg-orange-600 transition-all text-white font-bold text-sm sm:text-lg transform active:scale-95 touch-manipulation">
                <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6" /> <span>Home</span>
            </button>
          </div>
          {ttsUnavailable && (
            <p className="text-center text-sm text-gray-500 mt-2">Text-to-speech is not supported in this browser. Try Chrome on desktop or mobile.</p>
          )}
           {quizError && <p className="text-center text-red-500 mt-2">{quizError}</p>}
            {micError && (
                <p className="mt-2 text-center text-sm text-red-500">{micError}</p>
            )}
            {uploadError && (
                <p className="mt-2 text-center text-sm text-red-500">{uploadError}</p>
            )}
            {attachment && (
                <div className="mt-3 p-2 bg-gray-200 rounded-lg flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        {attachment.type === 'image' ? <ImageIcon className="w-5 h-5"/> : <AudioFileIcon className="w-5 h-5"/>}
                        <span>{attachment.type === 'image' ? 'Image' : 'Audio'} attached</span>
                    </div>
                    <button onClick={clearAttachment} aria-label="Remove attachment" className="text-red-500 hover:text-red-700 font-bold p-1 rounded-full">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                </div>
            )}
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2 mt-2">
             <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Attach a file" className="touch-target p-3 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 disabled:bg-gray-300 transform active:scale-95 transition">
              <AttachmentIcon className="w-6 h-6" />
            </button>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask a follow-up question..."
              disabled={isReplying || isRecording}
              aria-label="Your message"
              className="w-full px-4 py-3 mobile-text border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition mobile-focus"
            />
            <button type="button" onClick={handleMicClick} disabled={isReplying} aria-label={isRecording ? 'Stop recording' : 'Start recording'} className={`touch-target p-3 rounded-full text-white transform active:scale-95 transition ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-indigo-500 hover:bg-indigo-600'}`}>
                <MicrophoneIcon className="w-6 h-6"/>
            </button>
            <button type="submit" disabled={isReplying || isRecording || (!userInput.trim() && !attachment)} aria-label="Send message" className="touch-target p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:bg-gray-300 transform active:scale-95 transition">
              <SendIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
      <div className="text-center mt-6">
        <button
          onClick={() => checkNavigationWithQuizPrompt(onReset)}
          className="mobile-button px-6 py-3 bg-orange-500 text-white font-bold rounded-full shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200"
        >
          Start a New Topic
        </button>
      </div>

      {/* Quiz Prompt Modal */}
      <QuizPromptModal
        isOpen={showQuizPrompt}
        onClose={() => setShowQuizPrompt(false)}
        onStartQuiz={handleQuizPromptStart}
        onDismiss={handleQuizPromptDismiss}
        topic={getTopicFromConversation()}
      />
    </div>
  );
};

export default TutorResponse;