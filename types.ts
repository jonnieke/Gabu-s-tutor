export enum AppState {
  IDLE,
  SCANNING,
  PROCESSING,
  RESULT,
  ERROR,
}

export interface FileAttachment {
  type: 'image' | 'audio';
  data: string; // base64 encoded data
  mimeType: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  attachment?: FileAttachment;
  timestamp: Date;
}

export interface UserSettings {
  name: string;
  grade: string;
  context: string; // e.g., teacher's name or subject
  language: 'en' | 'sw';
  voiceURI: string | null;
  learningLevel: 'young' | 'advanced'; // Young learners (grade 6) vs Advanced (high school)
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  questions: QuizQuestion[];
}

export interface Bookmark {
  id: string;
  title: string;
  content: string;
  topic: string;
  timestamp: Date;
  type: 'explanation' | 'quiz' | 'illustration';
  tags: string[];
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  topics: string[];
  questionsAsked: number;
  bookmarksCreated: number;
  quizScore?: number;
  totalTime: number; // in minutes
}

export interface LearningProgress {
  totalStudyTime: number; // in minutes
  sessionsToday: number;
  currentStreak: number;
  longestStreak: number;
  topicsStudied: string[];
  bookmarksCount: number;
  lastStudyDate: Date;
  weeklyGoal: number; // minutes per week
  weeklyProgress: number; // minutes this week
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'scroll' | 'wait' | 'navigate';
  actionTarget?: string; // What to click or where to navigate
  image?: string; // Optional image to show
  video?: string; // Optional video to show
  tips?: string[]; // Additional tips
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  category: 'onboarding' | 'feature' | 'advanced';
  prerequisites?: string[]; // Other tutorials that should be completed first
  estimatedTime?: number; // in minutes
}

export interface TutorialProgress {
  completedTutorials: string[];
  currentTutorial?: string;
  currentStep?: number;
  skippedTutorials: string[];
  lastCompletedDate?: Date;
}