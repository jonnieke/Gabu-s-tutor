// Collaboration service for Gabu's Tutor
// Handles parent/teacher oversight, progress sharing, and collaborative learning

export interface LearningReport {
  id: string;
  studentName: string;
  period: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  totalStudyTime: number;
  sessionsCompleted: number;
  topicsStudied: string[];
  bookmarksCreated: number;
  quizScores: number[];
  averageScore: number;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  parentNotes?: string;
  teacherNotes?: string;
}

export interface ParentTeacher {
  id: string;
  name: string;
  email: string;
  role: 'parent' | 'teacher' | 'tutor';
  relationship: string; // e.g., "Mother", "Math Teacher", "Private Tutor"
  permissions: {
    viewProgress: boolean;
    viewReports: boolean;
    addNotes: boolean;
    setGoals: boolean;
    viewBookmarks: boolean;
  };
  isActive: boolean;
  lastAccess: Date;
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  subject: string;
  targetDate: Date;
  isCompleted: boolean;
  progress: number; // 0-100
  createdBy: string; // Parent/Teacher ID
  milestones: {
    id: string;
    title: string;
    isCompleted: boolean;
    completedDate?: Date;
  }[];
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  topics: string[];
  questionsAsked: number;
  bookmarksCreated: number;
  quizScore?: number;
  parentNotes?: string;
  teacherNotes?: string;
}

class CollaborationService {
  private static instance: CollaborationService;
  private parentsTeachers: ParentTeacher[] = [];
  private learningGoals: LearningGoal[] = [];
  private studySessions: StudySession[] = [];

  private constructor() {
    this.loadData();
  }

  public static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  private loadData(): void {
    try {
      const savedParentsTeachers = localStorage.getItem('gabu-parents-teachers');
      if (savedParentsTeachers) {
        this.parentsTeachers = JSON.parse(savedParentsTeachers);
      }

      const savedGoals = localStorage.getItem('gabu-learning-goals');
      if (savedGoals) {
        this.learningGoals = JSON.parse(savedGoals);
      }

      const savedSessions = localStorage.getItem('gabu-study-sessions');
      if (savedSessions) {
        this.studySessions = JSON.parse(savedSessions);
      }
    } catch (error) {
      console.error('Failed to load collaboration data:', error);
    }
  }

  private saveData(): void {
    try {
      localStorage.setItem('gabu-parents-teachers', JSON.stringify(this.parentsTeachers));
      localStorage.setItem('gabu-learning-goals', JSON.stringify(this.learningGoals));
      localStorage.setItem('gabu-study-sessions', JSON.stringify(this.studySessions));
    } catch (error) {
      console.error('Failed to save collaboration data:', error);
    }
  }

  // Parent/Teacher Management
  public addParentTeacher(parentTeacher: Omit<ParentTeacher, 'id' | 'lastAccess'>): ParentTeacher {
    const newParentTeacher: ParentTeacher = {
      ...parentTeacher,
      id: `pt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastAccess: new Date()
    };
    this.parentsTeachers.push(newParentTeacher);
    this.saveData();
    return newParentTeacher;
  }

  public updateParentTeacher(id: string, updates: Partial<ParentTeacher>): boolean {
    const index = this.parentsTeachers.findIndex(pt => pt.id === id);
    if (index !== -1) {
      this.parentsTeachers[index] = { ...this.parentsTeachers[index], ...updates };
      this.saveData();
      return true;
    }
    return false;
  }

  public getParentsTeachers(): ParentTeacher[] {
    return [...this.parentsTeachers];
  }

  public getActiveParentsTeachers(): ParentTeacher[] {
    return this.parentsTeachers.filter(pt => pt.isActive);
  }

  // Learning Goals Management
  public addLearningGoal(goal: Omit<LearningGoal, 'id' | 'progress' | 'isCompleted'>): LearningGoal {
    const newGoal: LearningGoal = {
      ...goal,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      progress: 0,
      isCompleted: false
    };
    this.learningGoals.push(newGoal);
    this.saveData();
    return newGoal;
  }

  public updateGoalProgress(id: string, progress: number): boolean {
    const goal = this.learningGoals.find(g => g.id === id);
    if (goal) {
      goal.progress = Math.min(100, Math.max(0, progress));
      goal.isCompleted = goal.progress >= 100;
      this.saveData();
      return true;
    }
    return false;
  }

  public getLearningGoals(): LearningGoal[] {
    return [...this.learningGoals];
  }

  public getActiveGoals(): LearningGoal[] {
    return this.learningGoals.filter(g => !g.isCompleted);
  }

  // Study Session Management
  public addStudySession(session: Omit<StudySession, 'id'>): StudySession {
    const newSession: StudySession = {
      ...session,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    this.studySessions.push(newSession);
    this.saveData();
    return newSession;
  }

  public getStudySessions(): StudySession[] {
    return [...this.studySessions];
  }

  public getRecentSessions(days: number = 7): StudySession[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.studySessions.filter(session => 
      new Date(session.startTime) >= cutoffDate
    );
  }

  // Report Generation
  public generateLearningReport(period: 'daily' | 'weekly' | 'monthly'): LearningReport {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'daily':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    const sessionsInPeriod = this.studySessions.filter(session => 
      new Date(session.startTime) >= startDate && new Date(session.startTime) <= now
    );

    const totalStudyTime = sessionsInPeriod.reduce((total, session) => total + session.duration, 0);
    const topicsStudied = [...new Set(sessionsInPeriod.flatMap(session => session.topics))];
    const bookmarksCreated = sessionsInPeriod.reduce((total, session) => total + session.bookmarksCreated, 0);
    const quizScores = sessionsInPeriod
      .filter(session => session.quizScore !== undefined)
      .map(session => session.quizScore!);
    
    const averageScore = quizScores.length > 0 
      ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length 
      : 0;

    // Analyze strengths and areas for improvement
    const strengths = this.analyzeStrengths(sessionsInPeriod);
    const areasForImprovement = this.analyzeAreasForImprovement(sessionsInPeriod);
    const recommendations = this.generateRecommendations(sessionsInPeriod, averageScore);

    return {
      id: `report_${Date.now()}`,
      studentName: 'Student', // This would come from user settings
      period,
      startDate,
      endDate: now,
      totalStudyTime,
      sessionsCompleted: sessionsInPeriod.length,
      topicsStudied,
      bookmarksCreated,
      quizScores,
      averageScore,
      strengths,
      areasForImprovement,
      recommendations
    };
  }

  private analyzeStrengths(sessions: StudySession[]): string[] {
    const strengths: string[] = [];
    
    if (sessions.length > 0) {
      const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
      if (avgDuration > 20) {
        strengths.push('Good focus and attention span');
      }
      
      const totalQuestions = sessions.reduce((sum, s) => sum + s.questionsAsked, 0);
      if (totalQuestions > sessions.length * 3) {
        strengths.push('Curious and asks good questions');
      }
      
      const totalBookmarks = sessions.reduce((sum, s) => sum + s.bookmarksCreated, 0);
      if (totalBookmarks > sessions.length) {
        strengths.push('Good at identifying important information');
      }
    }
    
    return strengths;
  }

  private analyzeAreasForImprovement(sessions: StudySession[]): string[] {
    const areas: string[] = [];
    
    if (sessions.length > 0) {
      const avgDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;
      if (avgDuration < 10) {
        areas.push('Could benefit from longer study sessions');
      }
      
      const totalQuestions = sessions.reduce((sum, s) => sum + s.questionsAsked, 0);
      if (totalQuestions < sessions.length) {
        areas.push('Could ask more questions to deepen understanding');
      }
      
      const quizScores = sessions
        .filter(s => s.quizScore !== undefined)
        .map(s => s.quizScore!);
      
      if (quizScores.length > 0) {
        const avgScore = quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length;
        if (avgScore < 70) {
          areas.push('Could focus on improving quiz performance');
        }
      }
    }
    
    return areas;
  }

  private generateRecommendations(sessions: StudySession[], averageScore: number): string[] {
    const recommendations: string[] = [];
    
    if (sessions.length < 3) {
      recommendations.push('Try to study more regularly for better retention');
    }
    
    if (averageScore < 70 && averageScore > 0) {
      recommendations.push('Review difficult topics and ask for help when needed');
    }
    
    if (sessions.length > 0) {
      const totalBookmarks = sessions.reduce((sum, s) => sum + s.bookmarksCreated, 0);
      if (totalBookmarks < sessions.length) {
        recommendations.push('Create more bookmarks to save important information');
      }
    }
    
    recommendations.push('Keep up the great work and stay curious!');
    
    return recommendations;
  }

  // Progress Sharing
  public shareProgressWithParentTeacher(parentTeacherId: string, report: LearningReport): boolean {
    const parentTeacher = this.parentsTeachers.find(pt => pt.id === parentTeacherId);
    if (!parentTeacher || !parentTeacher.isActive) {
      return false;
    }

    // In a real app, this would send an email or notification
    console.log(`Sharing progress with ${parentTeacher.name}:`, report);
    
    // Update last access time
    parentTeacher.lastAccess = new Date();
    this.saveData();
    
    return true;
  }

  // Goal Tracking
  public updateGoalMilestone(goalId: string, milestoneId: string): boolean {
    const goal = this.learningGoals.find(g => g.id === goalId);
    if (!goal) return false;

    const milestone = goal.milestones.find(m => m.id === milestoneId);
    if (!milestone) return false;

    milestone.isCompleted = true;
    milestone.completedDate = new Date();

    // Update overall goal progress
    const completedMilestones = goal.milestones.filter(m => m.isCompleted).length;
    goal.progress = (completedMilestones / goal.milestones.length) * 100;
    goal.isCompleted = goal.progress >= 100;

    this.saveData();
    return true;
  }

  // Analytics
  public getStudyAnalytics(days: number = 30): {
    totalStudyTime: number;
    averageSessionLength: number;
    mostStudiedTopics: string[];
    studyStreak: number;
    weeklyProgress: number[];
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentSessions = this.studySessions.filter(session => 
      new Date(session.startTime) >= cutoffDate
    );

    const totalStudyTime = recentSessions.reduce((sum, session) => sum + session.duration, 0);
    const averageSessionLength = recentSessions.length > 0 
      ? totalStudyTime / recentSessions.length 
      : 0;

    // Count topic frequency
    const topicCounts: { [key: string]: number } = {};
    recentSessions.forEach(session => {
      session.topics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });

    const mostStudiedTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    // Calculate study streak
    const studyStreak = this.calculateStudyStreak();

    // Weekly progress (last 4 weeks)
    const weeklyProgress = this.calculateWeeklyProgress();

    return {
      totalStudyTime,
      averageSessionLength,
      mostStudiedTopics,
      studyStreak,
      weeklyProgress
    };
  }

  private calculateStudyStreak(): number {
    const sortedSessions = this.studySessions
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].startTime);
      sessionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  private calculateWeeklyProgress(): number[] {
    const weeklyProgress: number[] = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7 + 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const weekSessions = this.studySessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= weekStart && sessionDate < weekEnd;
      });
      
      const weekTime = weekSessions.reduce((sum, session) => sum + session.duration, 0);
      weeklyProgress.push(weekTime);
    }
    
    return weeklyProgress;
  }
}

export const collaborationService = CollaborationService.getInstance();
