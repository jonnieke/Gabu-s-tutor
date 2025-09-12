import { Bookmark, StudySession, LearningProgress } from '../types';
import { offlineService } from './offlineService';

const STORAGE_KEYS = {
  BOOKMARKS: 'gabu-bookmarks',
  SESSIONS: 'gabu-sessions',
  PROGRESS: 'gabu-progress',
  CURRENT_SESSION: 'gabu-current-session'
};

// Bookmark Management
export const saveBookmark = (bookmark: Omit<Bookmark, 'id' | 'timestamp'>): Bookmark => {
  const newBookmark: Bookmark = {
    ...bookmark,
    id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date()
  };
  
  const bookmarks = getBookmarks();
  bookmarks.unshift(newBookmark); // Add to beginning
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  
  // Cache for offline use
  offlineService.cacheData('bookmarks', bookmarks);
  
  // Update progress
  updateProgress({ bookmarksCount: bookmarks.length });
  
  return newBookmark;
};

export const getBookmarks = (): Bookmark[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (!stored) return [];
    
    const bookmarks = JSON.parse(stored);
    // Convert timestamp strings back to Date objects
    return bookmarks.map((bookmark: any) => ({
      ...bookmark,
      timestamp: new Date(bookmark.timestamp)
    }));
  } catch {
    return [];
  }
};

export const deleteBookmark = (id: string): void => {
  const bookmarks = getBookmarks().filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  updateProgress({ bookmarksCount: bookmarks.length });
};

export const searchBookmarks = (query: string): Bookmark[] => {
  const bookmarks = getBookmarks();
  const lowercaseQuery = query.toLowerCase();
  
  return bookmarks.filter(bookmark => 
    bookmark.title.toLowerCase().includes(lowercaseQuery) ||
    bookmark.content.toLowerCase().includes(lowercaseQuery) ||
    bookmark.topic.toLowerCase().includes(lowercaseQuery) ||
    bookmark.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

// Study Session Management
export const startStudySession = (topics: string[] = []): StudySession => {
  const session: StudySession = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    startTime: new Date(),
    topics,
    questionsAsked: 0,
    bookmarksCreated: 0,
    totalTime: 0
  };
  
  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
  return session;
};

export const getCurrentSession = (): StudySession | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    if (!stored) return null;
    
    const session = JSON.parse(stored);
    return {
      ...session,
      startTime: new Date(session.startTime)
    };
  } catch {
    return null;
  }
};

export const updateCurrentSession = (updates: Partial<StudySession>): void => {
  const current = getCurrentSession();
  if (!current) return;
  
  const updated = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(updated));
};

export const endStudySession = (): StudySession | null => {
  const current = getCurrentSession();
  if (!current) return null;
  
  const endTime = new Date();
  const totalTime = Math.round((endTime.getTime() - current.startTime.getTime()) / (1000 * 60)); // minutes
  
  const completedSession: StudySession = {
    ...current,
    endTime,
    totalTime
  };
  
  // Save to sessions history
  const sessions = getStudySessions();
  sessions.unshift(completedSession);
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  
  // Clear current session
  localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  
  // Update progress
  updateProgress({
    totalStudyTime: getProgress().totalStudyTime + totalTime,
    sessionsToday: getProgress().sessionsToday + 1,
    lastStudyDate: endTime
  });
  
  return completedSession;
};

export const getStudySessions = (): StudySession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!stored) return [];
    
    const sessions = JSON.parse(stored);
    return sessions.map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : undefined
    }));
  } catch {
    return [];
  }
};

// Progress Tracking
export const getProgress = (): LearningProgress => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!stored) {
      // Initialize with default values
      const defaultProgress: LearningProgress = {
        totalStudyTime: 0,
        sessionsToday: 0,
        currentStreak: 0,
        longestStreak: 0,
        topicsStudied: [],
        bookmarksCount: 0,
        lastStudyDate: new Date(),
        weeklyGoal: 300, // 5 hours per week
        weeklyProgress: 0
      };
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(defaultProgress));
      return defaultProgress;
    }
    
    const progress = JSON.parse(stored);
    return {
      ...progress,
      lastStudyDate: new Date(progress.lastStudyDate)
    };
  } catch {
    return {
      totalStudyTime: 0,
      sessionsToday: 0,
      currentStreak: 0,
      longestStreak: 0,
      topicsStudied: [],
      bookmarksCount: 0,
      lastStudyDate: new Date(),
      weeklyGoal: 300,
      weeklyProgress: 0
    };
  }
};

export const updateProgress = (updates: Partial<LearningProgress>): void => {
  const current = getProgress();
  const updated = { ...current, ...updates };
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(updated));
  
  // Cache for offline use
  offlineService.cacheData('progress', updated);
};

export const addTopicStudied = (topic: string): void => {
  const progress = getProgress();
  const topics = [...new Set([...progress.topicsStudied, topic])]; // Remove duplicates
  updateProgress({ topicsStudied: topics });
};

export const updateStreak = (): void => {
  const progress = getProgress();
  const today = new Date();
  const lastStudy = new Date(progress.lastStudyDate);
  
  // Check if last study was yesterday (maintain streak) or today (already counted)
  const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    // Maintain streak
    updateProgress({ currentStreak: progress.currentStreak + 1 });
  } else if (daysDiff > 1) {
    // Break streak
    updateProgress({ 
      currentStreak: 1,
      longestStreak: Math.max(progress.longestStreak, progress.currentStreak)
    });
  }
  // If daysDiff === 0, streak already counted for today
};

// Utility functions
export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const getWeeklyProgressPercentage = (): number => {
  const progress = getProgress();
  return Math.min((progress.weeklyProgress / progress.weeklyGoal) * 100, 100);
};

export const getTodaySessions = (): StudySession[] => {
  const sessions = getStudySessions();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return sessions.filter(session => {
    const sessionDate = new Date(session.startTime);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });
};
