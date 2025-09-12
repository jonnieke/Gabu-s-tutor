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