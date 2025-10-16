import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, ChatMessage, FileAttachment, UserSettings } from './types';
import { explainTextFromImage, explainAudio, continueChat, getAI } from './services/geminiService';
import Scanner from './components/Scanner';
import Loader from './components/Loader';
import SettingsModal from './components/SettingsModal';
import SimpleLoginModal from './components/SimpleLoginModal';
import { usageTracker } from './services/usageTracker';
import { auth } from './config/firebase';

// New components
import LandingPage from './components/landing';
import Onboarding from './components/onboarding';
import { ChatInterface } from './components/chat';

// App flow states
type AppFlowState = 'landing' | 'onboarding' | 'idle' | 'scanning' | 'processing' | 'result' | 'error';

const App: React.FC = () => {
  const [appFlowState, setAppFlowState] = useState<AppFlowState>('landing');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatProcessing, setIsChatProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: '',
    grade: '',
    context: '',
    language: 'en',
    voiceURI: null,
    learningLevel: 'young',
  });
  const [recentTopics, setRecentTopics] = useState<string[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'student' | 'parent' | 'teacher' | null>(null);
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);
  const [highlightRange, setHighlightRange] = useState<{ start: number; end: number } | null>(null);
  const [bookmarkedMessages, setBookmarkedMessages] = useState<Set<number>>(new Set());
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('gabu-settings');
      if (savedSettings) {
        setUserSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.warn('Failed to load saved settings:', error);
    }
    
    try {
      const savedTopics = localStorage.getItem('gabu-recent-topics');
      if (savedTopics) {
        const parsed: string[] = JSON.parse(savedTopics);
        setRecentTopics(parsed.slice(0, 4));
      }
    } catch (error) {
      console.warn('Failed to load recent topics:', error);
    }

    // Initialize usage tracking
    setUsageCount(usageTracker.getUsageCount());
    setIsAuthenticated(usageTracker.isAuthenticated());
  }, []);

  const handleSaveSettings = (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    localStorage.setItem('gabu-settings', JSON.stringify(newSettings));
    setIsSettingsOpen(false);
  };

  // Check if user can perform action (usage limit)
  const checkUsageLimit = (): boolean => {
    if (usageTracker.shouldShowPaywall()) {
      setIsLoginModalOpen(true);
      return false;
    }
    return true;
  };

  // Track usage for actions
  const trackUsage = () => {
    if (!isAuthenticated) {
      const newCount = usageTracker.incrementUsage();
      setUsageCount(newCount);
    }
  };

  // Landing page handlers
  const handleStartLearning = () => {
    setAppFlowState('onboarding');
  };

  // Onboarding handlers
  const handleOnboardingComplete = (role: 'student' | 'parent' | 'teacher') => {
    setUserRole(role);
    setAppFlowState('idle');
    setAppState(AppState.IDLE);
  };

  const handleStartScan = () => {
    if (!checkUsageLimit()) return;
    trackUsage();
    setAppFlowState('scanning');
    setAppState(AppState.SCANNING);
  };

  const handleUploadImage = () => {
    if (!checkUsageLimit()) return;
    trackUsage();
    imageInputRef.current?.click();
  };

  const handleQuickAsk = (question: string) => {
    if (!checkUsageLimit()) return;
    trackUsage();
    startQuickChat(question);
  };

  const handleLogin = async (email: string, password: string) => {
    usageTracker.setAuthenticated(true);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
  };

  const processTextFromImage = useCallback(async (imageDataUrl: string) => {
    setScannedImage(imageDataUrl);
    setAppFlowState('processing');
    setAppState(AppState.PROCESSING);
    setErrorMessage('');
    setChatHistory([]);
    try {
      const explanation = await explainTextFromImage(imageDataUrl, userSettings);
      if (!explanation) {
          throw new Error("The AI could not provide an explanation. The image might not contain clear text.");
      }
      setChatHistory([{ role: 'model', content: explanation, timestamp: new Date() }]);
      setAppFlowState('result');
      setAppState(AppState.RESULT);
      addRecentTopicFromAnswer(explanation);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setErrorMessage(`Failed to get explanation. ${message}`);
      setAppFlowState('error');
      setAppState(AppState.ERROR);
    }
  }, [userSettings, recentTopics]);
  
  const processAudio = useCallback(async (audioDataUrl: string) => {
    setScannedImage(null);
    setAppFlowState('processing');
    setAppState(AppState.PROCESSING);
    setErrorMessage('');
    setChatHistory([]);
    try {
        const explanation = await explainAudio(audioDataUrl, userSettings);
         if (!explanation) {
            throw new Error("The AI could not understand the audio.");
        }
        setChatHistory([{ role: 'model', content: explanation, timestamp: new Date() }]);
        setAppFlowState('result');
        setAppState(AppState.RESULT);
        addRecentTopicFromAnswer(explanation);
    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        setErrorMessage(`Failed to process audio. ${message}`);
        setAppFlowState('error');
        setAppState(AppState.ERROR);
    }
  }, [userSettings, recentTopics]);

  const processRecordedAudio = useCallback(async (audioBlob: Blob, mimeType: string) => {
    if (!checkUsageLimit()) return;
    trackUsage();
    
    setScannedImage(null);
    setAppFlowState('processing');
    setAppState(AppState.PROCESSING);
    setErrorMessage('');
    setChatHistory([]);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const audioDataUrl = e.target?.result as string;
        if (!audioDataUrl) {
          throw new Error("Failed to process recorded audio.");
        }
        
        try {
          const explanation = await explainAudio(audioDataUrl, userSettings);
          if (!explanation) {
            throw new Error("The AI could not understand the audio.");
          }
          setChatHistory([{ role: 'model', content: explanation, timestamp: new Date() }]);
          setAppFlowState('result');
          setAppState(AppState.RESULT);
          addRecentTopicFromAnswer(explanation);
        } catch (error) {
          console.error(error);
          const message = error instanceof Error ? error.message : "An unknown error occurred.";
          setErrorMessage(`Failed to process recorded audio. ${message}`);
          setAppFlowState('error');
          setAppState(AppState.ERROR);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setErrorMessage(`Failed to process recorded audio. ${message}`);
      setAppFlowState('error');
      setAppState(AppState.ERROR);
    }
  }, [userSettings, recentTopics, isAuthenticated]);
  
  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const MAX_IMAGE_MB = 8;
    const MAX_AUDIO_MB = 20;
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');

    if ((fileType === 'image' && !isImage) || (fileType === 'audio' && !isAudio)) {
      setErrorMessage(`Please select a valid ${fileType} file.`);
      setAppFlowState('error');
      setAppState(AppState.ERROR);
      event.target.value = '';
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (fileType === 'image' && sizeMB > MAX_IMAGE_MB) {
      setErrorMessage(`Image is too large. Max ${MAX_IMAGE_MB} MB.`);
      setAppFlowState('error');
      setAppState(AppState.ERROR);
      event.target.value = '';
      return;
    }
    if (fileType === 'audio' && sizeMB > MAX_AUDIO_MB) {
      setErrorMessage(`Audio is too large. Max ${MAX_AUDIO_MB} MB.`);
      setAppFlowState('error');
      setAppState(AppState.ERROR);
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (fileType === 'image') {
        processTextFromImage(dataUrl);
      } else {
        processAudio(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleReset = useCallback(() => {
    setAppFlowState('idle');
    setAppState(AppState.IDLE);
    setScannedImage(null);
    setChatHistory([]);
    setErrorMessage('');
    setAttachment(null);
  }, []);

  const handleSendMessage = useCallback(async (message: string, attachment?: FileAttachment) => {
    if ((!message.trim() && !attachment) || isChatProcessing) return;

    const newUserMessage: ChatMessage = { role: 'user', content: message, attachment, timestamp: new Date() };
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setIsChatProcessing(true);

    try {
      const modelResponse = await continueChat(updatedHistory, userSettings);
      const newModelMessage: ChatMessage = { role: 'model', content: modelResponse, timestamp: new Date() };
      setChatHistory(prev => [...prev, newModelMessage]);
    } catch (error) {
      const errorResponseMessage: ChatMessage = { role: 'model', content: "Oh no! I had a little trouble thinking just now. Could you please ask me that again?", timestamp: new Date() };
      setChatHistory(prev => [...prev, errorResponseMessage]);
    } finally {
      setIsChatProcessing(false);
    }
  }, [chatHistory, isChatProcessing, userSettings]);

  const startQuickChat = useCallback(async (question: string) => {
    setScannedImage(null);
    setAppFlowState('processing');
    setAppState(AppState.PROCESSING);
    setErrorMessage('');
    setChatHistory([]);
    
    try {
      const intro: ChatMessage = { role: 'user', content: question, timestamp: new Date() };
      const reply = await continueChat([intro], userSettings);
      setChatHistory([{ role: 'model', content: reply, timestamp: new Date() }]);
      setAppFlowState('result');
      setAppState(AppState.RESULT);
      addRecentTopicFromQuestion(question);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setErrorMessage(`Failed to get an answer. ${message}`);
      setAppFlowState('error');
      setAppState(AppState.ERROR);
    }
  }, [userSettings, recentTopics]);

  const addRecentTopicFromAnswer = useCallback((answer: string) => {
    const title = (answer.split(/[.!?]/)[0] || '').trim().slice(0, 50) || 'New topic';
    setRecentTopics(prev => {
      const next = [title, ...prev.filter(t => t !== title)].slice(0, 4);
      localStorage.setItem('gabu-recent-topics', JSON.stringify(next));
      return next;
    });
  }, []);

  const addRecentTopicFromQuestion = useCallback((question: string) => {
    const title = question.trim().slice(0, 50);
    if (!title) return;
    setRecentTopics(prev => {
      const next = [title, ...prev.filter(t => t !== title)].slice(0, 4);
      localStorage.setItem('gabu-recent-topics', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleSystemMessage = useCallback((content: string) => {
    const newModelMessage: ChatMessage = { role: 'model', content, timestamp: new Date() };
    setChatHistory(prev => [...prev, newModelMessage]);
  }, []);

  // Chat interface handlers
  const handleAttachmentChange = (newAttachment: FileAttachment | null) => {
    setAttachment(newAttachment);
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const [, base64Data] = dataUrl.split(',');
      const isImage = file.type.startsWith('image/');
      const isAudio = file.type.startsWith('audio/');
      
      if (base64Data) {
        setAttachment({
          type: isImage ? 'image' : 'audio',
          data: base64Data,
          mimeType: file.type
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMicClick = () => {
    // This would integrate with the audio recorder hook
    console.log('Mic clicked');
  };

  const handleCopy = (text: string) => {
    if (!navigator.clipboard) {
      console.error('Clipboard API not available');
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      // Show success feedback
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleBookmark = (message: ChatMessage) => {
    if (message.role !== 'model' || !message.content) return;
    
    const messageIndex = chatHistory.findIndex(m => m === message);
    if (messageIndex !== -1) {
      setBookmarkedMessages(prev => new Set([...prev, messageIndex]));
    }
  };

  const renderContent = () => {
    switch (appFlowState) {
      case 'landing':
        return <LandingPage onStartLearning={handleStartLearning} />;
      
      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} />;
      
      case 'idle':
        return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 via-blue-50 to-purple-50 px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-4xl">🌟</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Welcome to Gabu, {userRole}!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Ready to learn? Choose how you'd like to get help.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={handleStartScan}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  📷 Scan Homework
                </button>
                
                <button
                  onClick={handleUploadImage}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  📁 Upload Image
                </button>
                
                <button
                  onClick={() => handleQuickAsk("Help me understand this topic")}
                  className="w-full px-6 py-4 bg-gradient-to-r from-orange-600 to-pink-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  💬 Ask a Question
                </button>
              </div>
              
              {recentTopics.length > 0 && (
                <div className="mt-8">
                  <p className="text-sm text-gray-500 mb-3">Recent topics:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {recentTopics.map((topic, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAsk(topic)}
                        className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'scanning':
        return <Scanner onCapture={processTextFromImage} onCancel={() => setAppFlowState('idle')} />;
      
      case 'processing':
        return <Loader />;
      
      case 'result':
        return (
          <div className="h-screen">
            <ChatInterface
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              onHome={handleReset}
              onOpenSettings={() => setIsSettingsOpen(true)}
              isReplying={isChatProcessing}
              userSettings={userSettings}
              attachment={attachment}
              onAttachmentChange={handleAttachmentChange}
              onMicClick={handleMicClick}
              onFileSelect={handleFileSelect}
              highlightRange={highlightRange}
              onCopy={handleCopy}
              onBookmark={handleBookmark}
              bookmarkedMessages={bookmarkedMessages}
            />
          </div>
        );
      
      case 'error':
        return (
          <div className="text-center p-8 flex flex-col items-center justify-center h-full min-h-screen">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-3xl font-bold text-red-500 mb-4">Oops!</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md">{errorMessage}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                className="px-8 py-4 bg-orange-500 text-white font-bold text-lg rounded-full shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Try Again 🔄
              </button>
              <button
                onClick={() => setAppFlowState('idle')}
                className="px-8 py-4 bg-purple-500 text-white font-bold text-lg rounded-full shadow-lg hover:bg-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Go Home 🏠
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full">
      <main className="w-full min-h-screen">
        {renderContent()}
      </main>
      
      {/* Hidden file input */}
      <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => handleFileSelected(e, 'image')} className="hidden" />
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onHome={() => { setIsSettingsOpen(false); setAppFlowState('idle'); }}
        onSave={handleSaveSettings}
        currentSettings={userSettings}
      />
      
      <SimpleLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        usageCount={usageCount}
        maxUses={usageTracker.getMaxFreeUses()}
      />
    </div>
  );
};

export default App;