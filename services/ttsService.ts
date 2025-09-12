interface SpeechService {
  speak: (text: string, onEnd: () => void, onBoundary?: (charIndex: number) => void, voiceURI?: string) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  isSpeaking: () => boolean;
}

export const isTTSSupported = (): boolean => typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined';

export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
    return window.speechSynthesis?.getVoices() ?? [];
};

let tutorVoice: SpeechSynthesisVoice | null = null;

const selectTutorVoice = () => {
    const voices = getAvailableVoices();
    if (voices.length === 0) {
        return;
    }
    const preferredVoices = [
        { name: 'Google US English', lang: 'en-US' },
        { name: 'Samantha', lang: 'en-US' },
        { name: 'Microsoft Zira Desktop - English (United States)', lang: 'en-US' },
        { name: 'Microsoft Zira Mobile - English (United States)', lang: 'en-US' },
        { name: 'Google UK English Male', lang: 'en-GB' },
        { name: 'Alex', lang: 'en-US' },
    ];
    let selectedVoice: SpeechSynthesisVoice | null = null;
    for (const pref of preferredVoices) {
        const found = voices.find(voice => voice.name === pref.name && voice.lang === pref.lang);
        if (found) {
            selectedVoice = found;
            break;
        }
    }
    if (!selectedVoice) {
        selectedVoice = voices.find(voice => voice.lang === 'en-US') || null;
    }
    if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
    }
    tutorVoice = selectedVoice;
};

if (typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined') {
    selectTutorVoice();
    window.speechSynthesis.onvoiceschanged = selectTutorVoice;
}

const ttsService: SpeechService = {
  speak: (text, onEnd, onBoundary, voiceURI) => {
    if (typeof window.speechSynthesis === 'undefined') {
      console.warn('Text-to-speech is not supported in this browser.');
      return;
    }
    ttsService.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    let finalVoice: SpeechSynthesisVoice | null = null;
    if (voiceURI) {
        finalVoice = getAvailableVoices().find(v => v.voiceURI === voiceURI);
    }

    if (finalVoice) {
      utterance.voice = finalVoice;
      utterance.lang = finalVoice.lang;
    } else if (tutorVoice) {
      utterance.voice = tutorVoice;
      utterance.lang = tutorVoice.lang;
    } else {
      utterance.lang = 'en-US';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      onEnd();
    };
    
    utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance.onerror', event);
        onEnd();
    };

    if (onBoundary) {
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          onBoundary(event.charIndex);
        }
      };
    }

    window.speechSynthesis.speak(utterance);
  },
  pause: () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  },
  resume: () => {
    if (window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  },
  cancel: () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  },
  isSpeaking: () => {
    return window.speechSynthesis ? window.speechSynthesis.speaking : false;
  }
};

export default ttsService;
