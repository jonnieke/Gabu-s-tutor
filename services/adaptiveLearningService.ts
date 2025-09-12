// Adaptive Learning service for Gabu's Tutor
// Handles personalized learning paths, difficulty adjustment, and learning analytics

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  prerequisites: string[];
  learningObjectives: string[];
  modules: LearningModule[];
  isCompleted: boolean;
  progress: number; // 0-100
  recommendedFor: string[]; // user characteristics
}

export interface LearningModule {
  id: string;
  title: string;
  type: 'video' | 'interactive' | 'quiz' | 'practice' | 'reading';
  content: string;
  estimatedTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisites: string[];
  learningObjectives: string[];
  isCompleted: boolean;
  score?: number;
  timeSpent: number; // minutes
  attempts: number;
}

export interface LearningProfile {
  userId: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  preferredPace: 'slow' | 'medium' | 'fast';
  strengths: string[];
  weaknesses: string[];
  interests: string[];
  currentLevel: {
    [subject: string]: 'beginner' | 'intermediate' | 'advanced';
  };
  learningHistory: {
    topic: string;
    score: number;
    timeSpent: number;
    difficulty: string;
    date: Date;
  }[];
  adaptiveSettings: {
    autoAdjustDifficulty: boolean;
    personalizedRecommendations: boolean;
    learningPathSuggestions: boolean;
    progressTracking: boolean;
  };
}

export interface LearningRecommendation {
  id: string;
  type: 'path' | 'module' | 'topic' | 'practice';
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  difficulty: string;
  subject: string;
  confidence: number; // 0-100, how confident we are this is a good recommendation
}

class AdaptiveLearningService {
  private static instance: AdaptiveLearningService;
  private learningPaths: LearningPath[] = [];
  private learningProfile: LearningProfile | null = null;
  private recommendations: LearningRecommendation[] = [];

  private constructor() {
    this.loadData();
    this.initializeDefaultPaths();
  }

  public static getInstance(): AdaptiveLearningService {
    if (!AdaptiveLearningService.instance) {
      AdaptiveLearningService.instance = new AdaptiveLearningService();
    }
    return AdaptiveLearningService.instance;
  }

  private loadData(): void {
    try {
      const savedProfile = localStorage.getItem('gabu-learning-profile');
      if (savedProfile) {
        this.learningProfile = JSON.parse(savedProfile);
      }

      const savedPaths = localStorage.getItem('gabu-learning-paths');
      if (savedPaths) {
        this.learningPaths = JSON.parse(savedPaths);
      }

      const savedRecommendations = localStorage.getItem('gabu-recommendations');
      if (savedRecommendations) {
        this.recommendations = JSON.parse(savedRecommendations);
      }
    } catch (error) {
      console.error('Failed to load adaptive learning data:', error);
    }
  }

  private saveData(): void {
    try {
      if (this.learningProfile) {
        localStorage.setItem('gabu-learning-profile', JSON.stringify(this.learningProfile));
      }
      localStorage.setItem('gabu-learning-paths', JSON.stringify(this.learningPaths));
      localStorage.setItem('gabu-recommendations', JSON.stringify(this.recommendations));
    } catch (error) {
      console.error('Failed to save adaptive learning data:', error);
    }
  }

  private initializeDefaultPaths(): void {
    if (this.learningPaths.length === 0) {
      this.learningPaths = [
        {
          id: 'math-basics',
          title: 'Math Fundamentals',
          description: 'Learn basic math concepts including addition, subtraction, multiplication, and division',
          subject: 'Math',
          difficulty: 'beginner',
          estimatedDuration: 120,
          prerequisites: [],
          learningObjectives: [
            'Understand basic arithmetic operations',
            'Solve simple word problems',
            'Apply math concepts to real-world situations'
          ],
          modules: [
            {
              id: 'addition-basics',
              title: 'Addition Basics',
              type: 'interactive',
              content: 'Learn how to add numbers together',
              estimatedTime: 20,
              difficulty: 'easy',
              prerequisites: [],
              learningObjectives: ['Add single-digit numbers', 'Add multi-digit numbers'],
              isCompleted: false,
              timeSpent: 0,
              attempts: 0
            },
            {
              id: 'subtraction-basics',
              title: 'Subtraction Basics',
              type: 'interactive',
              content: 'Learn how to subtract numbers',
              estimatedTime: 20,
              difficulty: 'easy',
              prerequisites: ['addition-basics'],
              learningObjectives: ['Subtract single-digit numbers', 'Subtract multi-digit numbers'],
              isCompleted: false,
              timeSpent: 0,
              attempts: 0
            }
          ],
          isCompleted: false,
          progress: 0,
          recommendedFor: ['beginner', 'elementary']
        },
        {
          id: 'science-exploration',
          title: 'Science Exploration',
          description: 'Discover the wonders of science through interactive experiments and observations',
          subject: 'Science',
          difficulty: 'beginner',
          estimatedDuration: 90,
          prerequisites: [],
          learningObjectives: [
            'Understand basic scientific concepts',
            'Learn about the scientific method',
            'Explore different branches of science'
          ],
          modules: [
            {
              id: 'scientific-method',
              title: 'The Scientific Method',
              type: 'video',
              content: 'Learn about observation, hypothesis, and experimentation',
              estimatedTime: 15,
              difficulty: 'easy',
              prerequisites: [],
              learningObjectives: ['Understand the steps of the scientific method'],
              isCompleted: false,
              timeSpent: 0,
              attempts: 0
            }
          ],
          isCompleted: false,
          progress: 0,
          recommendedFor: ['beginner', 'curious']
        }
      ];
      this.saveData();
    }
  }

  // Learning Profile Management
  public initializeLearningProfile(userId: string): LearningProfile {
    this.learningProfile = {
      userId,
      learningStyle: 'visual',
      preferredPace: 'medium',
      strengths: [],
      weaknesses: [],
      interests: [],
      currentLevel: {},
      learningHistory: [],
      adaptiveSettings: {
        autoAdjustDifficulty: true,
        personalizedRecommendations: true,
        learningPathSuggestions: true,
        progressTracking: true
      }
    };
    this.saveData();
    return this.learningProfile;
  }

  public updateLearningProfile(updates: Partial<LearningProfile>): void {
    if (this.learningProfile) {
      this.learningProfile = { ...this.learningProfile, ...updates };
      this.saveData();
      this.generateRecommendations();
    }
  }

  public getLearningProfile(): LearningProfile | null {
    return this.learningProfile;
  }

  // Learning Path Management
  public getLearningPaths(): LearningPath[] {
    return [...this.learningPaths];
  }

  public getRecommendedPaths(): LearningPath[] {
    if (!this.learningProfile) return [];

    return this.learningPaths.filter(path => {
      // Filter based on user's current level and interests
      const userLevel = this.learningProfile!.currentLevel[path.subject] || 'beginner';
      const levelMatch = this.isLevelMatch(userLevel, path.difficulty);
      const interestMatch = this.learningProfile!.interests.some(interest => 
        path.title.toLowerCase().includes(interest.toLowerCase()) ||
        path.description.toLowerCase().includes(interest.toLowerCase())
      );
      
      return levelMatch && (interestMatch || this.learningProfile!.interests.length === 0);
    });
  }

  private isLevelMatch(userLevel: string, pathDifficulty: string): boolean {
    const levels = ['beginner', 'intermediate', 'advanced'];
    const userIndex = levels.indexOf(userLevel);
    const pathIndex = levels.indexOf(pathDifficulty);
    
    // Allow same level or one level up
    return pathIndex <= userIndex + 1;
  }

  // Learning Analytics
  public recordLearningActivity(topic: string, score: number, timeSpent: number, difficulty: string): void {
    if (!this.learningProfile) return;

    const activity = {
      topic,
      score,
      timeSpent,
      difficulty,
      date: new Date()
    };

    this.learningProfile.learningHistory.push(activity);
    
    // Update strengths and weaknesses based on performance
    this.updateStrengthsAndWeaknesses(activity);
    
    // Update current level based on performance
    this.updateCurrentLevel(topic, score, difficulty);
    
    this.saveData();
    this.generateRecommendations();
  }

  private updateStrengthsAndWeaknesses(activity: any): void {
    if (!this.learningProfile) return;

    const { topic, score, difficulty } = activity;
    
    if (score >= 80) {
      if (!this.learningProfile.strengths.includes(topic)) {
        this.learningProfile.strengths.push(topic);
      }
      // Remove from weaknesses if it was there
      this.learningProfile.weaknesses = this.learningProfile.weaknesses.filter(w => w !== topic);
    } else if (score < 60) {
      if (!this.learningProfile.weaknesses.includes(topic)) {
        this.learningProfile.weaknesses.push(topic);
      }
      // Remove from strengths if it was there
      this.learningProfile.strengths = this.learningProfile.strengths.filter(s => s !== topic);
    }
  }

  private updateCurrentLevel(topic: string, score: number, difficulty: string): void {
    if (!this.learningProfile) return;

    const subject = this.getSubjectFromTopic(topic);
    const currentLevel = this.learningProfile.currentLevel[subject] || 'beginner';
    
    if (score >= 85 && difficulty === 'hard') {
      // Promote to next level
      const levels = ['beginner', 'intermediate', 'advanced'];
      const currentIndex = levels.indexOf(currentLevel);
      if (currentIndex < levels.length - 1) {
        this.learningProfile.currentLevel[subject] = levels[currentIndex + 1] as any;
      }
    } else if (score < 50 && difficulty === 'easy') {
      // Demote to previous level
      const levels = ['beginner', 'intermediate', 'advanced'];
      const currentIndex = levels.indexOf(currentLevel);
      if (currentIndex > 0) {
        this.learningProfile.currentLevel[subject] = levels[currentIndex - 1] as any;
      }
    }
  }

  private getSubjectFromTopic(topic: string): string {
    // Simple topic-to-subject mapping
    const mathKeywords = ['math', 'addition', 'subtraction', 'multiplication', 'division', 'fractions', 'geometry'];
    const scienceKeywords = ['science', 'biology', 'chemistry', 'physics', 'experiment', 'scientific'];
    const englishKeywords = ['english', 'grammar', 'reading', 'writing', 'vocabulary', 'literature'];
    
    const lowerTopic = topic.toLowerCase();
    
    if (mathKeywords.some(keyword => lowerTopic.includes(keyword))) return 'Math';
    if (scienceKeywords.some(keyword => lowerTopic.includes(keyword))) return 'Science';
    if (englishKeywords.some(keyword => lowerTopic.includes(keyword))) return 'English';
    
    return 'General';
  }

  // Recommendation Generation
  public generateRecommendations(): void {
    if (!this.learningProfile) return;

    this.recommendations = [];
    
    // Generate recommendations based on weaknesses
    this.learningProfile.weaknesses.forEach(weakness => {
      const recommendation: LearningRecommendation = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'topic',
        title: `Practice ${weakness}`,
        description: `Focus on improving your understanding of ${weakness}`,
        reason: 'This topic appears in your areas for improvement',
        priority: 'high',
        estimatedTime: 30,
        difficulty: 'medium',
        subject: this.getSubjectFromTopic(weakness),
        confidence: 85
      };
      this.recommendations.push(recommendation);
    });

    // Generate recommendations based on interests
    this.learningProfile.interests.forEach(interest => {
      const matchingPaths = this.learningPaths.filter(path => 
        path.title.toLowerCase().includes(interest.toLowerCase()) ||
        path.description.toLowerCase().includes(interest.toLowerCase())
      );

      matchingPaths.forEach(path => {
        const recommendation: LearningRecommendation = {
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'path',
          title: path.title,
          description: path.description,
          reason: `Based on your interest in ${interest}`,
          priority: 'medium',
          estimatedTime: path.estimatedDuration,
          difficulty: path.difficulty,
          subject: path.subject,
          confidence: 70
        };
        this.recommendations.push(recommendation);
      });
    });

    // Generate recommendations based on learning history
    this.generateHistoryBasedRecommendations();

    this.saveData();
  }

  private generateHistoryBasedRecommendations(): void {
    if (!this.learningProfile || this.learningProfile.learningHistory.length === 0) return;

    const recentHistory = this.learningProfile.learningHistory.slice(-10);
    const avgScore = recentHistory.reduce((sum, activity) => sum + activity.score, 0) / recentHistory.length;
    
    if (avgScore > 80) {
      // User is doing well, suggest more challenging content
      const recommendation: LearningRecommendation = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'path',
        title: 'Advanced Challenge',
        description: 'Try more challenging content to continue growing',
        reason: 'You\'re performing well and ready for advanced topics',
        priority: 'medium',
        estimatedTime: 45,
        difficulty: 'advanced',
        subject: 'General',
        confidence: 75
      };
      this.recommendations.push(recommendation);
    } else if (avgScore < 60) {
      // User is struggling, suggest review and practice
      const recommendation: LearningRecommendation = {
        id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'practice',
        title: 'Review and Practice',
        description: 'Spend time reviewing and practicing fundamental concepts',
        reason: 'Additional practice will help strengthen your understanding',
        priority: 'high',
        estimatedTime: 30,
        difficulty: 'easy',
        subject: 'General',
        confidence: 90
      };
      this.recommendations.push(recommendation);
    }
  }

  public getRecommendations(): LearningRecommendation[] {
    return [...this.recommendations];
  }

  public getHighPriorityRecommendations(): LearningRecommendation[] {
    return this.recommendations.filter(rec => rec.priority === 'high');
  }

  // Learning Path Progress
  public updatePathProgress(pathId: string, progress: number): void {
    const path = this.learningPaths.find(p => p.id === pathId);
    if (path) {
      path.progress = Math.min(100, Math.max(0, progress));
      path.isCompleted = path.progress >= 100;
      this.saveData();
    }
  }

  public updateModuleProgress(pathId: string, moduleId: string, score: number, timeSpent: number): void {
    const path = this.learningPaths.find(p => p.id === pathId);
    if (path) {
      const module = path.modules.find(m => m.id === moduleId);
      if (module) {
        module.score = score;
        module.timeSpent += timeSpent;
        module.attempts += 1;
        module.isCompleted = score >= 70; // 70% threshold for completion
        
        // Update path progress
        const completedModules = path.modules.filter(m => m.isCompleted).length;
        path.progress = (completedModules / path.modules.length) * 100;
        path.isCompleted = path.progress >= 100;
        
        this.saveData();
      }
    }
  }

  // Learning Analytics
  public getLearningAnalytics(): {
    totalTimeSpent: number;
    averageScore: number;
    completedPaths: number;
    currentStreak: number;
    favoriteSubjects: string[];
    learningVelocity: number;
  } {
    if (!this.learningProfile) {
      return {
        totalTimeSpent: 0,
        averageScore: 0,
        completedPaths: 0,
        currentStreak: 0,
        favoriteSubjects: [],
        learningVelocity: 0
      };
    }

    const totalTimeSpent = this.learningProfile.learningHistory.reduce((sum, activity) => sum + activity.timeSpent, 0);
    const averageScore = this.learningProfile.learningHistory.length > 0 
      ? this.learningProfile.learningHistory.reduce((sum, activity) => sum + activity.score, 0) / this.learningProfile.learningHistory.length
      : 0;
    
    const completedPaths = this.learningPaths.filter(path => path.isCompleted).length;
    
    // Calculate learning streak
    const currentStreak = this.calculateLearningStreak();
    
    // Find favorite subjects
    const subjectCounts: { [key: string]: number } = {};
    this.learningProfile.learningHistory.forEach(activity => {
      const subject = this.getSubjectFromTopic(activity.topic);
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });
    
    const favoriteSubjects = Object.entries(subjectCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([subject]) => subject);
    
    // Calculate learning velocity (points per hour)
    const learningVelocity = totalTimeSpent > 0 ? (averageScore * this.learningProfile.learningHistory.length) / (totalTimeSpent / 60) : 0;

    return {
      totalTimeSpent,
      averageScore,
      completedPaths,
      currentStreak,
      favoriteSubjects,
      learningVelocity
    };
  }

  private calculateLearningStreak(): number {
    if (!this.learningProfile || this.learningProfile.learningHistory.length === 0) return 0;

    const sortedHistory = this.learningProfile.learningHistory
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedHistory.length; i++) {
      const activityDate = new Date(sortedHistory[i].date);
      activityDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }
}

export const adaptiveLearningService = AdaptiveLearningService.getInstance();
