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
    
    console.log('TTS: Starting to speak text:', text.substring(0, 50) + '...');
    ttsService.cancel();
    
    // Wait for voices to load if they're not available yet
    const speakWithVoices = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      let finalVoice: SpeechSynthesisVoice | null = null;
      if (voiceURI) {
          finalVoice = getAvailableVoices().find(v => v.voiceURI === voiceURI);
      }

      if (finalVoice) {
        utterance.voice = finalVoice;
        utterance.lang = finalVoice.lang;
        console.log('TTS: Using user-selected voice:', finalVoice.name);
      } else if (tutorVoice) {
        utterance.voice = tutorVoice;
        utterance.lang = tutorVoice.lang;
        console.log('TTS: Using tutor voice:', tutorVoice.name);
      } else {
        utterance.lang = 'en-US';
        console.log('TTS: Using default language');
      }

      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        console.log('TTS: Speech started');
      };

      utterance.onend = () => {
        console.log('TTS: Speech ended');
        onEnd();
      };
      
      utterance.onerror = (event) => {
          console.error('TTS: Speech error:', event.error, event);
          onEnd();
      };

      if (onBoundary) {
        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            onBoundary(event.charIndex);
          }
        };
      }

      try {
        window.speechSynthesis.speak(utterance);
        console.log('TTS: Utterance queued successfully');
      } catch (error) {
        console.error('TTS: Failed to speak:', error);
        onEnd();
      }
    };

    // If voices are not loaded yet, wait for them
    if (getAvailableVoices().length === 0) {
      console.log('TTS: Waiting for voices to load...');
      const waitForVoices = () => {
        if (getAvailableVoices().length > 0) {
          speakWithVoices();
        } else {
          setTimeout(waitForVoices, 100);
        }
      };
      waitForVoices();
    } else {
      speakWithVoices();
    }
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
