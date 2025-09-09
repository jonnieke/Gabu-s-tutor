import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, ChatMessage, FileAttachment, UserSettings } from './types';
import { explainTextFromImage, explainAudio, continueChat } from './services/geminiService';
import Scanner from './components/Scanner';
import TutorResponse from './components/TutorResponse';
import Loader from './components/Loader';
import { GabuIcon, CameraIcon, ImageIcon, AudioIcon, SettingsIcon } from './components/Icons';
import SettingsModal from './components/SettingsModal';

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
      setChatHistory([{ role: 'model', content: explanation }]);
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
        setChatHistory([{ role: 'model', content: explanation }]);
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

    const newUserMessage: ChatMessage = { role: 'user', content: message, attachment };
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setIsChatProcessing(true);

    try {
      const modelResponse = await continueChat(updatedHistory, userSettings);
      const newModelMessage: ChatMessage = { role: 'model', content: modelResponse };
      setChatHistory(prev => [...prev, newModelMessage]);
    } catch (error) {
      const errorResponseMessage: ChatMessage = { role: 'model', content: "Oh no! I had a little trouble thinking just now. Could you please ask me that again?" };
      setChatHistory(prev => [...prev, errorResponseMessage]);
    } finally {
      setIsChatProcessing(false);
    }
  }, [chatHistory, isChatProcessing, userSettings]);

  const handleSystemMessage = useCallback((content: string) => {
    const newModelMessage: ChatMessage = { role: 'model', content };
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
          <div className="flex flex-col items-center justify-center text-center p-8 relative h-full">
             <button onClick={() => setIsSettingsOpen(true)} className="absolute top-4 right-4 text-purple-500 hover:text-purple-700 transition-colors" aria-label="Settings">
                <SettingsIcon className="w-8 h-8"/>
            </button>
            <input type="file" accept="image/*" ref={imageInputRef} onChange={(e) => handleFileSelected(e, 'image')} className="hidden" />
            <input type="file" accept="audio/*" ref={audioInputRef} onChange={(e) => handleFileSelected(e, 'audio')} className="hidden" />
            
            <GabuIcon className="w-32 h-32 text-purple-500 mb-4 animate-gentle-bounce" />
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-gray-800">Let's Learn Something New!</h1>
            <p className="text-lg text-gray-600 mb-10 max-w-xl">
              I'm Gabu! I make learning easy with simple, step-by-step instructions. How do you want to start?
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-3xl">
                <div className="flex flex-col items-center">
                    <div className="bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl border-4 border-white shadow-md mb-[-20px] z-10">1</div>
                    <button
                        onClick={() => setAppState(AppState.SCANNING)}
                        className="flex flex-col items-center justify-center gap-3 px-6 pt-8 pb-5 bg-orange-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                        <CameraIcon className="w-8 h-8"/>
                        <span>Scan with Camera</span>
                    </button>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-teal-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl border-4 border-white shadow-md mb-[-20px] z-10">2</div>
                    <button
                        onClick={() => imageInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-3 px-6 pt-8 pb-5 bg-teal-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:bg-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                        <ImageIcon className="w-8 h-8"/>
                        <span>Upload an Image</span>
                    </button>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl border-4 border-white shadow-md mb-[-20px] z-10">3</div>
                    <button
                        onClick={() => audioInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-3 px-6 pt-8 pb-5 bg-indigo-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                        <AudioIcon className="w-8 h-8"/>
                        <span>Upload Audio</span>
                    </button>
                </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <main className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[85vh] flex flex-col justify-center">
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