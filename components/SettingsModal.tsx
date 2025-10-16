import React, { useState, useEffect, useCallback } from 'react';
import { UserSettings } from '../types';
import { getAvailableVoices, isTTSSupported } from '../services/ttsService';
import { CloseIcon, HomeIcon } from './Icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onHome: () => void;
    onSave: (settings: UserSettings) => void;
    currentSettings: UserSettings;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onHome, onSave, currentSettings }) => {
    const [settings, setSettings] = useState(currentSettings);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        setSettings(currentSettings);
    }, [currentSettings, isOpen]);
    
    const fetchVoices = useCallback(() => {
       const voices = getAvailableVoices();
       setAvailableVoices(voices);
    }, []);

    useEffect(() => {
        if (isOpen) {
            // Voices might load asynchronously, so we check on open and also listen for the event.
            fetchVoices();
            window.speechSynthesis.onvoiceschanged = fetchVoices;
        } else {
             window.speechSynthesis.onvoiceschanged = null;
        }
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, [isOpen, fetchVoices]);
    
    const handleSave = () => {
        onSave(settings);
    };

    // Language now selected via radio buttons for accessibility.

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 safe-area-inset" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-4 sm:p-6 relative max-h-[90vh] mobile-scroll overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Settings</h2>
                {/* First-time user notice */}
                {(!currentSettings.name || !currentSettings.grade || !currentSettings.context) && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 sm:p-4 rounded-xl mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-xl sm:text-2xl">👋</div>
                      <div>
                        <h3 className="font-bold text-base sm:text-lg mb-1">Welcome to Soma AI!</h3>
                        <p className="text-xs sm:text-sm opacity-90">Please fill out your profile so Gabu can give you personalized explanations!</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button onClick={onHome} className="p-2 rounded-full hover:bg-purple-100 transition-colors" aria-label="Go Home">
                        <HomeIcon className="w-5 h-5 text-purple-600"/>
                    </button>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <CloseIcon className="w-6 h-6"/>
                    </button>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name</label>
                        <input type="text" id="name" value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} placeholder="e.g., Alex" className="mt-1 block w-full px-3 py-3 mobile-text border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 mobile-focus"/>
                    </div>
                     <div>
                        <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade / Class</label>
                        <input type="text" id="grade" value={settings.grade} onChange={e => setSettings({...settings, grade: e.target.value})} placeholder="e.g., 5th Grade" className="mt-1 block w-full px-3 py-3 mobile-text border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 mobile-focus"/>
                    </div>
                     <div>
                        <label htmlFor="context" className="block text-sm font-medium text-gray-700">Subject / Teacher</label>
                        <input type="text" id="context" value={settings.context} onChange={e => setSettings({...settings, context: e.target.value})} placeholder="e.g., Science with Mrs. Davis" className="mt-1 block w-full px-3 py-3 mobile-text border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 mobile-focus"/>
                    </div>
                     <div>
                        <fieldset>
                            <legend className="block text-sm font-medium text-gray-700 mb-2">Learning Level</legend>
                            <div className="grid grid-cols-2 gap-2">
                                <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${settings.learningLevel === 'young' ? 'border-purple-400 ring-2 ring-purple-200 bg-purple-50' : 'border-gray-300 hover:border-gray-400'}`}>
                                    <input
                                        type="radio"
                                        name="learningLevel"
                                        value="young"
                                        checked={settings.learningLevel === 'young'}
                                        onChange={() => setSettings(prev => ({ ...prev, learningLevel: 'young' }))}
                                        className="h-4 w-4"
                                    />
                                    <div>
                                        <div className="font-medium text-sm">Young Learner</div>
                                        <div className="text-xs text-gray-500">Grade 6 & below</div>
                                    </div>
                                </label>
                                <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${settings.learningLevel === 'advanced' ? 'border-purple-400 ring-2 ring-purple-200 bg-purple-50' : 'border-gray-300 hover:border-gray-400'}`}>
                                    <input
                                        type="radio"
                                        name="learningLevel"
                                        value="advanced"
                                        checked={settings.learningLevel === 'advanced'}
                                        onChange={() => setSettings(prev => ({ ...prev, learningLevel: 'advanced' }))}
                                        className="h-4 w-4"
                                    />
                                    <div>
                                        <div className="font-medium text-sm">Advanced</div>
                                        <div className="text-xs text-gray-500">High School & above</div>
                                    </div>
                                </label>
                            </div>
                        </fieldset>
                    </div>
                    <div>
                        <fieldset>
                            <legend className="block text-sm font-medium text-gray-700 mb-2">Language</legend>
                            <div className="grid grid-cols-2 gap-2">
                                <label className={`flex items-center gap-2 p-2 rounded-lg border ${settings.language === 'en' ? 'border-purple-400 ring-2 ring-purple-200' : 'border-gray-300'}`}>
                                    <input
                                        type="radio"
                                        name="language"
                                        value="en"
                                        checked={settings.language === 'en'}
                                        onChange={() => setSettings(prev => ({ ...prev, language: 'en' }))}
                                        className="h-4 w-4"
                                    />
                                    <span>English</span>
                                </label>
                                <label className={`flex items-center gap-2 p-2 rounded-lg border ${settings.language === 'sw' ? 'border-purple-400 ring-2 ring-purple-200' : 'border-gray-300'}`}>
                                    <input
                                        type="radio"
                                        name="language"
                                        value="sw"
                                        checked={settings.language === 'sw'}
                                        onChange={() => setSettings(prev => ({ ...prev, language: 'sw' }))}
                                        className="h-4 w-4"
                                    />
                                    <span>Swahili</span>
                                </label>
                            </div>
                        </fieldset>
                    </div>
                    <div>
                        <label htmlFor="voice" className="block text-sm font-medium text-gray-700">Gabu's Voice</label>
                         <select id="voice" value={settings.voiceURI || ''} onChange={e => setSettings({...settings, voiceURI: e.target.value || null})} className="mt-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 rounded-md">
                            <option value="">Default Voice</option>
                            {availableVoices.map(voice => (
                                <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>
                            ))}
                        </select>
                        {!isTTSSupported() && (
                          <p className="text-xs text-gray-500 mt-1">Text-to-speech isn’t supported in this browser. Try Chrome for best results.</p>
                        )}
                        {isTTSSupported() && availableVoices.length === 0 && (
                          <p className="text-xs text-gray-500 mt-1">Loading voices… If empty, try clicking this button after a few seconds.</p>
                        )}
                    </div>
                </div>

                <div className="mt-6 sm:mt-8 text-center sm:text-right">
                    <button onClick={handleSave} className="mobile-button px-6 py-3 bg-purple-600 text-white font-bold rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transform active:scale-95 transition-all duration-200">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
