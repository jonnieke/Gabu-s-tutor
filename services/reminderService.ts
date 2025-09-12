// Study reminders service for Gabu's Tutor
// Handles smart study reminders, notifications, and study scheduling

export interface StudyReminder {
  id: string;
  title: string;
  message: string;
  time: string; // HH:MM format
  days: number[]; // 0-6 (Sunday-Saturday)
  isActive: boolean;
  type: 'daily' | 'weekly' | 'custom';
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface StudyGoal {
  id: string;
  title: string;
  description: string;
  targetMinutes: number;
  currentMinutes: number;
  deadline: Date;
  isCompleted: boolean;
  subject: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ReminderSettings {
  enableNotifications: boolean;
  enableSmartReminders: boolean;
  preferredStudyTimes: string[];
  studyStreakGoal: number;
  weeklyGoalMinutes: number;
  reminderFrequency: 'gentle' | 'moderate' | 'frequent';
}

class ReminderService {
  private static instance: ReminderService;
  private reminders: StudyReminder[] = [];
  private goals: StudyGoal[] = [];
  private settings: ReminderSettings = {
    enableNotifications: true,
    enableSmartReminders: true,
    preferredStudyTimes: ['09:00', '15:00', '19:00'],
    studyStreakGoal: 7,
    weeklyGoalMinutes: 300, // 5 hours
    reminderFrequency: 'moderate'
  };

  private constructor() {
    this.loadData();
    this.setupNotificationPermission();
    this.scheduleReminders();
  }

  public static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  private async setupNotificationPermission(): Promise<void> {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  private loadData(): void {
    try {
      const savedReminders = localStorage.getItem('gabu-reminders');
      if (savedReminders) {
        this.reminders = JSON.parse(savedReminders);
      }

      const savedGoals = localStorage.getItem('gabu-goals');
      if (savedGoals) {
        this.goals = JSON.parse(savedGoals);
      }

      const savedSettings = localStorage.getItem('gabu-reminder-settings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Failed to load reminder data:', error);
    }
  }

  private saveData(): void {
    try {
      localStorage.setItem('gabu-reminders', JSON.stringify(this.reminders));
      localStorage.setItem('gabu-goals', JSON.stringify(this.goals));
      localStorage.setItem('gabu-reminder-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save reminder data:', error);
    }
  }

  // Reminder management
  public addReminder(reminder: Omit<StudyReminder, 'id'>): StudyReminder {
    const newReminder: StudyReminder = {
      ...reminder,
      id: Date.now().toString()
    };
    this.reminders.push(newReminder);
    this.saveData();
    this.scheduleReminders();
    return newReminder;
  }

  public updateReminder(id: string, updates: Partial<StudyReminder>): boolean {
    const index = this.reminders.findIndex(r => r.id === id);
    if (index !== -1) {
      this.reminders[index] = { ...this.reminders[index], ...updates };
      this.saveData();
      this.scheduleReminders();
      return true;
    }
    return false;
  }

  public deleteReminder(id: string): boolean {
    const index = this.reminders.findIndex(r => r.id === id);
    if (index !== -1) {
      this.reminders.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  public getReminders(): StudyReminder[] {
    return [...this.reminders];
  }

  // Goal management
  public addGoal(goal: Omit<StudyGoal, 'id' | 'currentMinutes' | 'isCompleted'>): StudyGoal {
    const newGoal: StudyGoal = {
      ...goal,
      id: Date.now().toString(),
      currentMinutes: 0,
      isCompleted: false
    };
    this.goals.push(newGoal);
    this.saveData();
    return newGoal;
  }

  public updateGoalProgress(id: string, minutes: number): boolean {
    const goal = this.goals.find(g => g.id === id);
    if (goal) {
      goal.currentMinutes += minutes;
      goal.isCompleted = goal.currentMinutes >= goal.targetMinutes;
      this.saveData();
      return true;
    }
    return false;
  }

  public getGoals(): StudyGoal[] {
    return [...this.goals];
  }

  // Settings management
  public updateSettings(updates: Partial<ReminderSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveData();
  }

  public getSettings(): ReminderSettings {
    return { ...this.settings };
  }

  // Smart reminder logic
  public generateSmartReminders(): StudyReminder[] {
    const smartReminders: StudyReminder[] = [];

    if (!this.settings.enableSmartReminders) return smartReminders;

    // Get recent study patterns
    const recentTopics = JSON.parse(localStorage.getItem('gabu-recent-topics') || '[]');
    const progress = JSON.parse(localStorage.getItem('gabu-progress') || '{}');

    // Suggest study times based on preferences
    this.settings.preferredStudyTimes.forEach(time => {
      smartReminders.push({
        id: `smart-${time}`,
        title: 'Study Time!',
        message: `It's time for your daily study session. Ready to learn something new?`,
        time,
        days: [1, 2, 3, 4, 5], // Weekdays
        isActive: true,
        type: 'daily'
      });
    });

    // Weekend review reminder
    smartReminders.push({
      id: 'weekend-review',
      title: 'Weekend Review',
      message: 'Time to review what you learned this week!',
      time: '10:00',
      days: [0, 6], // Weekend
      isActive: true,
      type: 'weekly'
    });

    // Streak maintenance reminder
    if (progress.currentStreak > 0) {
      smartReminders.push({
        id: 'streak-maintenance',
        title: 'Keep Your Streak!',
        message: `You're on a ${progress.currentStreak} day streak! Don't break it now.`,
        time: '18:00',
        days: [1, 2, 3, 4, 5, 6, 0], // Every day
        isActive: true,
        type: 'daily'
      });
    }

    return smartReminders;
  }

  // Schedule reminders
  private scheduleReminders(): void {
    // Clear existing timeouts
    this.clearScheduledReminders();

    const now = new Date();
    const today = now.getDay();

    this.reminders.forEach(reminder => {
      if (!reminder.isActive) return;

      // Check if reminder should trigger today
      if (!reminder.days.includes(today)) return;

      const [hours, minutes] = reminder.time.split(':').map(Number);
      const reminderTime = new Date();
      reminderTime.setHours(hours, minutes, 0, 0);

      // If time has passed today, schedule for next occurrence
      if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
      }

      const delay = reminderTime.getTime() - now.getTime();

      setTimeout(() => {
        this.showReminder(reminder);
      }, delay);
    });
  }

  private clearScheduledReminders(): void {
    // In a real implementation, you'd store timeout IDs and clear them
    // For simplicity, we'll just reschedule all reminders
  }

  private showReminder(reminder: StudyReminder): void {
    if (!this.settings.enableNotifications) return;

    // Show browser notification
    if (Notification.permission === 'granted') {
      new Notification(reminder.title, {
        body: reminder.message,
        icon: '/favicon.ico',
        tag: reminder.id,
        requireInteraction: true
      });
    }

    // Show in-app notification (could be implemented with a toast system)
    this.showInAppNotification(reminder);
  }

  private showInAppNotification(reminder: StudyReminder): void {
    // Create a simple in-app notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-purple-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-1">
          <h4 class="font-bold">${reminder.title}</h4>
          <p class="text-sm opacity-90">${reminder.message}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white/70 hover:text-white">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  // Check if user should be reminded based on study patterns
  public shouldRemindUser(): boolean {
    const progress = JSON.parse(localStorage.getItem('gabu-progress') || '{}');
    const lastStudyDate = new Date(progress.lastStudyDate || 0);
    const now = new Date();
    const hoursSinceLastStudy = (now.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60);

    // Remind if no study in 24 hours
    if (hoursSinceLastStudy > 24) return true;

    // Remind if streak is at risk
    if (progress.currentStreak > 0 && hoursSinceLastStudy > 20) return true;

    // Remind if weekly goal is behind
    const weeklyProgress = progress.weeklyProgress || 0;
    const weeklyGoal = this.settings.weeklyGoalMinutes;
    const daysLeftInWeek = 7 - now.getDay();
    const expectedProgress = (7 - daysLeftInWeek) / 7 * weeklyGoal;
    
    if (weeklyProgress < expectedProgress * 0.8) return true;

    return false;
  }

  // Get reminder suggestions based on user behavior
  public getReminderSuggestions(): string[] {
    const suggestions: string[] = [];
    const progress = JSON.parse(localStorage.getItem('gabu-progress') || '{}');

    if (progress.currentStreak === 0) {
      suggestions.push("Start a new study streak today!");
    } else if (progress.currentStreak < 3) {
      suggestions.push(`You're on a ${progress.currentStreak} day streak - keep it up!`);
    } else {
      suggestions.push(`Amazing! ${progress.currentStreak} day streak - you're on fire!`);
    }

    const weeklyProgress = progress.weeklyProgress || 0;
    const weeklyGoal = this.settings.weeklyGoalMinutes;
    const percentage = Math.round((weeklyProgress / weeklyGoal) * 100);

    if (percentage < 50) {
      suggestions.push(`You're ${percentage}% to your weekly goal. Let's catch up!`);
    } else if (percentage < 100) {
      suggestions.push(`Great progress! ${percentage}% to your weekly goal.`);
    } else {
      suggestions.push("You've reached your weekly goal! Time to set a new one?");
    }

    return suggestions;
  }
}

export const reminderService = ReminderService.getInstance();
