import React, { useState, useEffect, useCallback } from 'react';
import { UserSettings } from '../types';
import { getAvailableVoices } from '../services/ttsService';
import { CloseIcon } from './Icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: UserSettings) => void;
    currentSettings: UserSettings;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentSettings }) => {
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

    const handleLanguageToggle = () => {
        setSettings(prev => ({ ...prev, language: prev.language === 'en' ? 'sw' : 'en' }));
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <CloseIcon className="w-6 h-6"/>
                </button>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name</label>
                        <input type="text" id="name" value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} placeholder="e.g., Alex" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"/>
                    </div>
                     <div>
                        <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade / Class</label>
                        <input type="text" id="grade" value={settings.grade} onChange={e => setSettings({...settings, grade: e.target.value})} placeholder="e.g., 5th Grade" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"/>
                    </div>
                     <div>
                        <label htmlFor="context" className="block text-sm font-medium text-gray-700">Subject / Teacher</label>
                        <input type="text" id="context" value={settings.context} onChange={e => setSettings({...settings, context: e.target.value})} placeholder="e.g., Science with Mrs. Davis" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <div className="relative rounded-full p-1 bg-gray-200 flex">
                           <button onClick={handleLanguageToggle} className={`w-1/2 rounded-full py-1.5 text-sm font-semibold transition-colors ${settings.language === 'en' ? 'bg-white text-purple-600 shadow' : 'text-gray-600'}`}>English</button>
                            <button onClick={handleLanguageToggle} className={`w-1/2 rounded-full py-1.5 text-sm font-semibold transition-colors ${settings.language === 'sw' ? 'bg-white text-purple-600 shadow' : 'text-gray-600'}`}>Swahili</button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="voice" className="block text-sm font-medium text-gray-700">Gabu's Voice</label>
                         <select id="voice" value={settings.voiceURI || ''} onChange={e => setSettings({...settings, voiceURI: e.target.value || null})} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md">
                            <option value="">Default Voice</option>
                            {availableVoices.map(voice => (
                                <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-8 text-right">
                    <button onClick={handleSave} className="px-6 py-2.5 bg-purple-600 text-white font-bold rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transform active:scale-95 transition-all duration-200">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
