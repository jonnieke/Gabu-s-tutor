import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, ChatMessage, FileAttachment, UserSettings } from './types';
import { explainTextFromImage, explainAudio, continueChat } from './services/geminiService';
import Scanner from './components/Scanner';
import TutorResponse from './components/TutorResponse';
import Loader from './components/Loader';
import SettingsModal from './components/SettingsModal';
import IdleScreen from './components/IdleScreen';

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

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const savedSettings = localStorage.getItem('gabu-settings');
    if (savedSettings) {
      setUserSettings(JSON.parse(savedSettings));
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
    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        setErrorMessage(`Failed to process audio. ${message}`);
        setAppState(AppState.ERROR);
    }
  }, [userSettings]);
  
  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'audio') => {
    const file = event.target.files?.[0];
    if (!file) return;

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
            userSettings={userSettings}
          />
        );
      case AppState.ERROR:
        return (
          <div className="text-center p-8 flex flex-col items-center justify-center h-full">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Uh Oh!</h2>
            <p className="text-gray-600 mb-6 max-w-md">{errorMessage}</p>
            <button
              onClick={handleReset}
              className="px-8 py-4 bg-orange-500 text-white font-bold rounded-full shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        );
      case AppState.IDLE:
      default:
        return (
          <>
            <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => handleFileSelected(e, 'image')} className="hidden" />
            <input type="file" accept="audio/*" ref={audioInputRef} onChange={(e) => handleFileSelected(e, 'audio')} className="hidden" />
            <IdleScreen
                onStartScan={() => setAppState(AppState.SCANNING)}
                onUploadImage={() => imageInputRef.current?.click()}
                onUploadAudio={() => audioInputRef.current?.click()}
                onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </>
        );
    }
  };

  const headerTextColor = appState === AppState.SCANNING ? 'text-white/90' : 'text-gray-800';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <main className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[85vh] flex flex-col justify-center relative">
            <header className="absolute top-6 left-8 z-20">
                <h1 className={`text-2xl font-extrabold ${headerTextColor} transition-colors`}>Gabu's Tutor</h1>
            </header>
            {renderContent()}
        </div>
      </main>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentSettings={userSettings}
      />
    </div>
  );
};

export default App;