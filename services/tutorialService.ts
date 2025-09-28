import { Tutorial, TutorialProgress, TutorialStep } from '../types';

const TUTORIAL_STORAGE_KEY = 'gabu-tutorial-progress';

// Tutorial definitions
export const TUTORIALS: Tutorial[] = [
  {
    id: 'welcome',
    title: 'Welcome to Soma AI!',
    description: 'Let\'s get you started with your new learning assistant',
    category: 'onboarding',
    estimatedTime: 3,
    steps: [
      {
        id: 'welcome-1',
        title: 'Welcome! 👋',
        description: 'Hi! I\'m Gabu, your AI learning assistant. I\'m here to help make your homework easier and more fun!',
        position: 'center',
        tips: ['I can help with all subjects', 'Just ask me anything you\'re curious about']
      },
      {
        id: 'welcome-2',
        title: 'Let\'s set up your profile',
        description: 'First, let\'s tell me a bit about you so I can give you the best help possible!',
        action: 'click',
        actionTarget: 'settings-button',
        position: 'top',
        tips: ['This helps me understand your grade level', 'I\'ll use this to explain things just right for you']
      }
    ]
  },
  {
    id: 'scan-feature',
    title: 'How to Scan and Learn',
    description: 'Learn how to use the camera to get instant help with your homework',
    category: 'feature',
    prerequisites: ['welcome'],
    estimatedTime: 2,
    steps: [
      {
        id: 'scan-1',
        title: 'Scan Your Homework 📸',
        description: 'Take a photo of any text, math problem, or question you need help with',
        action: 'click',
        actionTarget: 'scan-button',
        position: 'top',
        tips: ['Make sure the text is clear and well-lit', 'You can scan from books, worksheets, or screens']
      },
      {
        id: 'scan-2',
        title: 'Get Instant Help',
        description: 'I\'ll read your text and give you a step-by-step explanation',
        position: 'center',
        tips: ['I can help with math, science, English, and more', 'Ask follow-up questions if you need more help']
      }
    ]
  },
  {
    id: 'ask-questions',
    title: 'Ask Gabu Anything',
    description: 'Learn how to ask questions and get personalized help',
    category: 'feature',
    prerequisites: ['welcome'],
    estimatedTime: 2,
    steps: [
      {
        id: 'ask-1',
        title: 'Type Your Question 💭',
        description: 'Use the text box to ask me anything you\'re curious about',
        targetElement: '.question-input',
        position: 'top',
        tips: ['Be as specific as you can', 'You can ask about any subject']
      },
      {
        id: 'ask-2',
        title: 'Try a Quick Question',
        description: 'Click one of these suggestions to see how it works',
        targetElement: '.suggestion-buttons',
        position: 'top',
        tips: ['These are just examples - ask anything!', 'I love helping with homework and curiosity questions']
      }
    ]
  },
  {
    id: 'audio-features',
    title: 'Audio Learning',
    description: 'Learn how to record and upload audio for help',
    category: 'feature',
    prerequisites: ['welcome'],
    estimatedTime: 2,
    steps: [
      {
        id: 'audio-1',
        title: 'Record Your Voice 🎤',
        description: 'Tap the microphone to record a question or explanation request',
        action: 'click',
        actionTarget: 'record-audio-button',
        position: 'top',
        tips: ['Great for when you can\'t type easily', 'I can understand spoken questions too']
      },
      {
        id: 'audio-2',
        title: 'Upload Audio Files',
        description: 'You can also upload audio files if you have recordings',
        action: 'click',
        actionTarget: 'upload-audio-button',
        position: 'top',
        tips: ['Supports most audio formats', 'Perfect for longer explanations or lectures']
      }
    ]
  },
  {
    id: 'advanced-features',
    title: 'Advanced Features',
    description: 'Discover powerful learning tools like quizzes and bookmarks',
    category: 'advanced',
    prerequisites: ['welcome', 'scan-feature'],
    estimatedTime: 3,
    steps: [
      {
        id: 'advanced-1',
        title: 'Take Quizzes 🧠',
        description: 'After I explain something, I can create a quiz to test your understanding',
        position: 'center',
        tips: ['Quizzes help you remember better', 'Don\'t worry - they\'re designed to help you learn']
      },
      {
        id: 'advanced-2',
        title: 'Save Important Info 📚',
        description: 'Bookmark explanations you want to review later',
        position: 'center',
        tips: ['Great for studying before tests', 'All your bookmarks are saved automatically']
      },
      {
        id: 'advanced-3',
        title: 'Track Your Progress',
        description: 'See how much you\'ve learned and keep your study streak going',
        position: 'center',
        tips: ['Learning a little every day is the best way', 'Celebrate your achievements!']
      }
    ]
  }
];

class TutorialService {
  private progress: TutorialProgress;

  constructor() {
    this.progress = this.loadProgress();
  }

  private loadProgress(): TutorialProgress {
    try {
      const saved = localStorage.getItem(TUTORIAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          lastCompletedDate: parsed.lastCompletedDate ? new Date(parsed.lastCompletedDate) : undefined
        };
      }
    } catch (error) {
      console.warn('Failed to load tutorial progress:', error);
    }
    
    return {
      completedTutorials: [],
      skippedTutorials: [],
    };
  }

  private saveProgress(): void {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(this.progress));
    } catch (error) {
      console.warn('Failed to save tutorial progress:', error);
    }
  }

  getProgress(): TutorialProgress {
    return { ...this.progress };
  }

  getAvailableTutorials(): Tutorial[] {
    return TUTORIALS.filter(tutorial => {
      // Check if prerequisites are met
      if (tutorial.prerequisites) {
        return tutorial.prerequisites.every(prereq => 
          this.progress.completedTutorials.includes(prereq)
        );
      }
      return true;
    });
  }

  getNextTutorial(): Tutorial | null {
    const available = this.getAvailableTutorials();
    const notCompleted = available.filter(t => 
      !this.progress.completedTutorials.includes(t.id) && 
      !this.progress.skippedTutorials.includes(t.id)
    );
    
    return notCompleted.length > 0 ? notCompleted[0] : null;
  }

  startTutorial(tutorialId: string): boolean {
    const tutorial = TUTORIALS.find(t => t.id === tutorialId);
    if (!tutorial) return false;

    this.progress.currentTutorial = tutorialId;
    this.progress.currentStep = 0;
    this.saveProgress();
    return true;
  }

  completeTutorial(tutorialId: string): void {
    if (!this.progress.completedTutorials.includes(tutorialId)) {
      this.progress.completedTutorials.push(tutorialId);
    }
    this.progress.currentTutorial = undefined;
    this.progress.currentStep = undefined;
    this.progress.lastCompletedDate = new Date();
    this.saveProgress();
  }

  skipTutorial(tutorialId: string): void {
    if (!this.progress.skippedTutorials.includes(tutorialId)) {
      this.progress.skippedTutorials.push(tutorialId);
    }
    this.progress.currentTutorial = undefined;
    this.progress.currentStep = undefined;
    this.saveProgress();
  }

  getCurrentTutorial(): Tutorial | null {
    if (!this.progress.currentTutorial) return null;
    return TUTORIALS.find(t => t.id === this.progress.currentTutorial) || null;
  }

  getCurrentStep(): TutorialStep | null {
    const tutorial = this.getCurrentTutorial();
    if (!tutorial || this.progress.currentStep === undefined) return null;
    return tutorial.steps[this.progress.currentStep] || null;
  }

  nextStep(): boolean {
    const tutorial = this.getCurrentTutorial();
    if (!tutorial || this.progress.currentStep === undefined) return false;

    const nextStepIndex = this.progress.currentStep + 1;
    if (nextStepIndex >= tutorial.steps.length) {
      this.completeTutorial(tutorial.id);
      return false;
    }

    this.progress.currentStep = nextStepIndex;
    this.saveProgress();
    return true;
  }

  previousStep(): boolean {
    if (this.progress.currentStep === undefined || this.progress.currentStep <= 0) return false;
    
    this.progress.currentStep = this.progress.currentStep - 1;
    this.saveProgress();
    return true;
  }

  isTutorialCompleted(tutorialId: string): boolean {
    return this.progress.completedTutorials.includes(tutorialId);
  }

  isTutorialSkipped(tutorialId: string): boolean {
    return this.progress.skippedTutorials.includes(tutorialId);
  }

  shouldShowTutorial(tutorialId: string): boolean {
    return !this.isTutorialCompleted(tutorialId) && !this.isTutorialSkipped(tutorialId);
  }

  resetProgress(): void {
    this.progress = {
      completedTutorials: [],
      skippedTutorials: [],
    };
    this.saveProgress();
  }

  getTutorialById(id: string): Tutorial | null {
    return TUTORIALS.find(t => t.id === id) || null;
  }
}

export const tutorialService = new TutorialService();
