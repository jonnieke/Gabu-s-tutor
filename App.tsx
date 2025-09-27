import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, ChatMessage, FileAttachment, UserSettings } from './types';
import { explainTextFromImage, explainAudio, continueChat } from './services/geminiService';
import Scanner from './components/Scanner';
import TutorResponse from './components/TutorResponse';
import Loader from './components/Loader';
import SettingsModal from './components/SettingsModal';
import IdleScreen from './components/IdleScreen';
import BookmarksView from './components/BookmarksView';
import StudyTimer from './components/StudyTimer';
import MaterialsLibrary from './components/MaterialsLibrary';
import RemindersView from './components/RemindersView';
import OfflineIndicator from './components/OfflineIndicator';
import CollaborativeDashboard from './components/CollaborativeDashboard';
import AdaptiveLearningDashboard from './components/AdaptiveLearningDashboard';
import IllustrateView from './components/IllustrateView';
import ErrorBoundary from './components/ErrorBoundary';
import AchievementsPanel from './components/AchievementsPanel';
import Celebration from './components/Celebration';
import { HomeIcon, CameraIcon, BookIcon, UserIcon, BellIcon, UsersIcon, BrainIcon, TrophyIcon, GabuIcon } from './components/Icons';
import { startStudySession, endStudySession, addTopicStudied, updateStreak } from './services/progressService';
import { offlineService } from './services/offlineService';
import { reminderService } from './services/reminderService';
import { collaborationService } from './services/collaborationService';
import { adaptiveLearningService } from './services/adaptiveLearningService';

const App: React.FC = () => {
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
  });
  const [recentTopics, setRecentTopics] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'scan' | 'materials' | 'profile'>('home');
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [isCollaborativeOpen, setIsCollaborativeOpen] = useState(false);
  const [isAdaptiveLearningOpen, setIsAdaptiveLearningOpen] = useState(false);
  const [isIllustrateOpen, setIsIllustrateOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [celebration, setCelebration] = useState<{
    type: 'achievement' | 'streak' | 'quiz' | 'learning';
    title: string;
    message: string;
    isVisible: boolean;
  }>({
    type: 'achievement',
    title: '',
    message: '',
    isVisible: false
  });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
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
        setRecentTopics(parsed.slice(0, 8));
      }
    } catch (error) {
      console.warn('Failed to load recent topics:', error);
    }
  }, []);

  const handleSaveSettings = (newSettings: UserSettings) => {
    setUserSettings(newSettings);
    localStorage.setItem('gabu-settings', JSON.stringify(newSettings));
    setIsSettingsOpen(false);
  };

  const processTextFromImage = useCallback(async (imageDataUrl: string) => {
    setScannedImage(imageDataUrl);
    setAppState(AppState.PROCESSING);
    setErrorMessage('');
    setChatHistory([]);
    try {
      const explanation = await explainTextFromImage(imageDataUrl, userSettings);
      if (!explanation) {
          throw new Error("The AI could not provide an explanation. The image might not contain clear text.");
      }
      setChatHistory([{ role: 'model', content: explanation, timestamp: new Date() }]);
      setAppState(AppState.RESULT);
      addRecentTopicFromAnswer(explanation);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setErrorMessage(`Failed to get explanation. ${message}`);
      setAppState(AppState.ERROR);
    }
  }, [userSettings]);
  
  const processAudio = useCallback(async (audioDataUrl: string) => {
    setScannedImage(null); // No image for audio uploads
    setAppState(AppState.PROCESSING);
    setErrorMessage('');
    setChatHistory([]);
    try {
        const explanation = await explainAudio(audioDataUrl, userSettings);
         if (!explanation) {
            throw new Error("The AI could not understand the audio.");
        }
        setChatHistory([{ role: 'model', content: explanation, timestamp: new Date() }]);
        setAppState(AppState.RESULT);
        addRecentTopicFromAnswer(explanation);
    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        setErrorMessage(`Failed to process audio. ${message}`);
        setAppState(AppState.ERROR);
    }
  }, [userSettings]);

  const processRecordedAudio = useCallback(async (audioBlob: Blob, mimeType: string) => {
    setScannedImage(null); // No image for audio uploads
    setAppState(AppState.PROCESSING);
    setErrorMessage('');
    setChatHistory([]);
    
    try {
      // Convert blob to data URL
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
          setAppState(AppState.RESULT);
          addRecentTopicFromAnswer(explanation);
        } catch (error) {
          console.error(error);
          const message = error instanceof Error ? error.message : "An unknown error occurred.";
          setErrorMessage(`Failed to process recorded audio. ${message}`);
          setAppState(AppState.ERROR);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      setErrorMessage(`Failed to process recorded audio. ${message}`);
      setAppState(AppState.ERROR);
    }
  }, [userSettings]);
  
  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const MAX_IMAGE_MB = 8;
    const MAX_AUDIO_MB = 20;
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');

    // Type guard
    if ((fileType === 'image' && !isImage) || (fileType === 'audio' && !isAudio)) {
      setErrorMessage(`Please select a valid ${fileType} file.`);
      setAppState(AppState.ERROR);
      event.target.value = '';
      return;
    }

    // Size guard
    const sizeMB = file.size / (1024 * 1024);
    if (fileType === 'image' && sizeMB > MAX_IMAGE_MB) {
      setErrorMessage(`Image is too large. Max ${MAX_IMAGE_MB} MB.`);
      setAppState(AppState.ERROR);
      event.target.value = '';
      return;
    }
    if (fileType === 'audio' && sizeMB > MAX_AUDIO_MB) {
      setErrorMessage(`Audio is too large. Max ${MAX_AUDIO_MB} MB.`);
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
    event.target.value = ''; // Reset input for same-file uploads
  };

  const handleReset = useCallback(() => {
    setAppState(AppState.IDLE);
    setScannedImage(null);
    setChatHistory([]);
    setErrorMessage('');
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
    setAppState(AppState.PROCESSING);
    setErrorMessage('');
    setChatHistory([]);
    
    // Start study session
    startStudySession([question]);
    updateStreak();
    
    try {
      const intro: ChatMessage = { role: 'user', content: question, timestamp: new Date() };
      const reply = await continueChat([intro], userSettings);
      setChatHistory([{ role: 'model', content: reply, timestamp: new Date() }]);
      setAppState(AppState.RESULT);
      addRecentTopicFromQuestion(question);
      addTopicStudied(question);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      setErrorMessage(`Failed to get an answer. ${message}`);
      setAppState(AppState.ERROR);
    }
  }, [userSettings]);

  const persistRecentTopics = (topics: string[]) => {
    setRecentTopics(topics);
    localStorage.setItem('gabu-recent-topics', JSON.stringify(topics));
  };

  const addRecentTopicFromAnswer = (answer: string) => {
    const title = (answer.split(/[.!?]/)[0] || '').trim().slice(0, 50) || 'New topic';
    const next = [title, ...recentTopics.filter(t => t !== title)].slice(0, 8);
    persistRecentTopics(next);
  };

  const addRecentTopicFromQuestion = (question: string) => {
    const title = question.trim().slice(0, 50);
    if (!title) return;
    const next = [title, ...recentTopics.filter(t => t !== title)].slice(0, 8);
    persistRecentTopics(next);
  };

  const handleSystemMessage = useCallback((content: string) => {
    const newModelMessage: ChatMessage = { role: 'model', content, timestamp: new Date() };
    setChatHistory(prev => [...prev, newModelMessage]);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.SCANNING:
        return <Scanner onCapture={processTextFromImage} onCancel={() => setAppState(AppState.IDLE)} />;
      case AppState.PROCESSING:
        return <Loader />;
      case AppState.RESULT:
        return (
          <TutorResponse
            image={scannedImage}
            chatHistory={chatHistory}
            onSendMessage={handleSendMessage}
            onSystemMessage={handleSystemMessage}
            isReplying={isChatProcessing}
            onReset={handleReset}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onHome={() => { setActiveTab('home'); setAppState(AppState.IDLE); }}
            userSettings={userSettings}
          />
        );
      case AppState.ERROR:
        return (
          <div className="text-center p-8 flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Uh Oh!</h2>
            <p className="text-gray-600 mb-6 max-w-md">{errorMessage}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                className="px-8 py-4 bg-orange-500 text-white font-bold rounded-full shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Try Again
              </button>
              <button
                onClick={() => { setActiveTab('home'); setAppState(AppState.IDLE); }}
                className="px-8 py-4 bg-purple-500 text-white font-bold rounded-full shadow-lg hover:bg-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <HomeIcon className="w-5 h-5 inline mr-2" />
                Go Home
              </button>
            </div>
          </div>
        );
      case AppState.IDLE:
      default:
        return (
          <>
            <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => handleFileSelected(e, 'image')} className="hidden" />
            <input type="file" accept="audio/*" ref={audioInputRef} onChange={(e) => handleFileSelected(e, 'audio')} className="hidden" />
            {activeTab === 'home' && (
              <IdleScreen
                onStartScan={() => { setActiveTab('scan'); setAppState(AppState.SCANNING); }}
                onUploadImage={() => imageInputRef.current?.click()}
                onUploadAudio={() => audioInputRef.current?.click()}
                onRecordedAudio={processRecordedAudio}
                onOpenIllustrate={() => setIsIllustrateOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onQuickAsk={startQuickChat}
                onOpenBookmarks={() => setIsBookmarksOpen(true)}
                recentTopics={recentTopics}
                onSelectRecent={startQuickChat}
              />
            )}
            {activeTab === 'scan' && (
              <Scanner onCapture={processTextFromImage} onCancel={() => { setActiveTab('home'); setAppState(AppState.IDLE); }} />
            )}
            {activeTab === 'materials' && (
              <MaterialsLibrary />
            )}
            {activeTab === 'profile' && (
              <div className="p-4 sm:p-6 h-full overflow-y-auto pb-20 sm:pb-24">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Study Tools</h2>
                    <p className="text-sm sm:text-base text-gray-600">Manage your study sessions and track your progress</p>
                  </div>
                  
                  <StudyTimer 
                    onSessionEnd={(sessionData) => {
                      console.log('Study session completed:', sessionData);
                      // Could show a success message or update progress
                    }}
                    className="mb-6 sm:mb-8"
                  />

                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Profile Settings</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      Customize your learning experience by setting your name, grade, and preferences.
                    </p>
                    <button
                      onClick={() => setIsSettingsOpen(true)}
                      className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white font-medium rounded-full hover:bg-purple-700 active:bg-purple-800 transition-colors touch-manipulation"
                    >
                      Open Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        );
    }
  };

  const headerTextColor = appState === AppState.SCANNING ? 'text-white/90' : 'text-gray-800';

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <main className="w-full min-h-screen">
        <div className="bg-white min-h-screen flex flex-col relative w-full">
            <header className="w-full relative top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="flex items-center">
                  <GabuIcon className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 mr-3" />
                  <div className="flex flex-col">
                    <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold ${headerTextColor} transition-colors`}>Soma AI</h1>
                    <p className={`text-sm sm:text-base lg:text-lg font-semibold ${headerTextColor} opacity-90`}>Gabu's Tutor Homework Assistant</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  <OfflineIndicator />
                  {appState === AppState.IDLE && (
                    <>
                      <button
                        onClick={() => setIsRemindersOpen(true)}
                        className="p-2 sm:p-3 lg:p-4 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                        aria-label="Study Reminders"
                      >
                        <BellIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setIsCollaborativeOpen(true)}
                        className="p-2 sm:p-3 lg:p-4 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                        aria-label="Collaborative Dashboard"
                      >
                        <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setIsAdaptiveLearningOpen(true)}
                        className="p-2 sm:p-3 lg:p-4 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                        aria-label="Adaptive Learning"
                      >
                        <BrainIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setIsAchievementsOpen(true)}
                        className="p-2 sm:p-3 lg:p-4 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                        aria-label="Achievements"
                      >
                        <TrophyIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-gray-600" />
                      </button>
                    </>
                  )}
                </div>
            </header>
            <div className="flex-1 flex flex-col overflow-hidden w-full">
              {renderContent()}
            </div>
            {appState === AppState.IDLE && (
              <nav className="w-full sticky bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between safe-area-pb z-30">
                <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center text-xs sm:text-sm lg:text-base py-2 px-3 sm:px-4 rounded-lg touch-manipulation transition-all ${activeTab==='home'?'text-purple-600 bg-purple-50':'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                  <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mb-1"/>
                  <span className="font-medium">Home</span>
                </button>
                <button onClick={() => { setActiveTab('scan'); setAppState(AppState.SCANNING); }} className={`flex flex-col items-center text-xs sm:text-sm lg:text-base py-2 px-3 sm:px-4 rounded-lg touch-manipulation transition-all ${activeTab==='scan'?'text-purple-600 bg-purple-50':'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                  <CameraIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mb-1"/>
                  <span className="font-medium">Scan</span>
                </button>
                <button onClick={() => setActiveTab('materials')} className={`flex flex-col items-center text-xs sm:text-sm lg:text-base py-2 px-3 sm:px-4 rounded-lg touch-manipulation transition-all ${activeTab==='materials'?'text-purple-600 bg-purple-50':'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                  <BookIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mb-1"/>
                  <span className="font-medium">Materials</span>
                </button>
                <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center text-xs sm:text-sm lg:text-base py-2 px-3 sm:px-4 rounded-lg touch-manipulation transition-all ${activeTab==='profile'?'text-purple-600 bg-purple-50':'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}>
                  <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mb-1"/>
                  <span className="font-medium">Profile</span>
                </button>
              </nav>
            )}
        </div>
      </main>
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onHome={() => { setIsSettingsOpen(false); setActiveTab('home'); setAppState(AppState.IDLE); }}
          onSave={handleSaveSettings}
          currentSettings={userSettings}
        />
        {isBookmarksOpen && (
          <BookmarksView
            onClose={() => setIsBookmarksOpen(false)}
            onHome={() => { setIsBookmarksOpen(false); setActiveTab('home'); setAppState(AppState.IDLE); }}
          />
        )}
        {isRemindersOpen && (
          <RemindersView
            onClose={() => setIsRemindersOpen(false)}
          />
        )}
        {isCollaborativeOpen && (
          <CollaborativeDashboard
            onClose={() => setIsCollaborativeOpen(false)}
          />
        )}
        {isAdaptiveLearningOpen && (
          <AdaptiveLearningDashboard
            onClose={() => setIsAdaptiveLearningOpen(false)}
          />
        )}
        {isIllustrateOpen && (
          <IllustrateView
            onClose={() => setIsIllustrateOpen(false)}
            onHome={() => { setIsIllustrateOpen(false); setActiveTab('home'); setAppState(AppState.IDLE); }}
            userSettings={userSettings}
          />
        )}
        
        {/* Achievements Panel */}
        <AchievementsPanel
          isOpen={isAchievementsOpen}
          onClose={() => setIsAchievementsOpen(false)}
          userSettings={userSettings}
        />
        
        {/* Celebration Modal */}
        <Celebration
          type={celebration.type}
          title={celebration.title}
          message={celebration.message}
          isVisible={celebration.isVisible}
          onComplete={() => setCelebration(prev => ({ ...prev, isVisible: false }))}
        />
    </div>
  );
};

export default App;