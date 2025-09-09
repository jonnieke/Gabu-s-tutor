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