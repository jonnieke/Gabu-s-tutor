import React, { useState, useEffect } from 'react';
import { BellIcon, PlusIcon, ClockIcon, CalendarIcon, XMarkIcon, CheckCircleIcon } from './Icons';
import { reminderService, StudyReminder, StudyGoal, ReminderSettings } from '../services/reminderService';

interface RemindersViewProps {
  onClose: () => void;
}

const RemindersView: React.FC<RemindersViewProps> = ({ onClose }) => {
  const [reminders, setReminders] = useState<StudyReminder[]>([]);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [settings, setSettings] = useState<ReminderSettings>(reminderService.getSettings());
  const [activeTab, setActiveTab] = useState<'reminders' | 'goals' | 'settings'>('reminders');
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setReminders(reminderService.getReminders());
    setGoals(reminderService.getGoals());
    setSettings(reminderService.getSettings());
  };

  const handleAddReminder = (reminderData: Omit<StudyReminder, 'id'>) => {
    const newReminder = reminderService.addReminder(reminderData);
    setReminders(prev => [...prev, newReminder]);
    setShowAddReminder(false);
  };

  const handleAddGoal = (goalData: Omit<StudyGoal, 'id' | 'currentMinutes' | 'isCompleted'>) => {
    const newGoal = reminderService.addGoal(goalData);
    setGoals(prev => [...prev, newGoal]);
    setShowAddGoal(false);
  };

  const handleToggleReminder = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      reminderService.updateReminder(id, { isActive: !reminder.isActive });
      loadData();
    }
  };

  const handleDeleteReminder = (id: string) => {
    reminderService.deleteReminder(id);
    loadData();
  };

  const handleUpdateSettings = (updates: Partial<ReminderSettings>) => {
    reminderService.updateSettings(updates);
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const getDayNames = (days: number[]) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => dayNames[day]).join(', ');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <BellIcon className="w-8 h-8 text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-800">Study Reminders</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'reminders', label: 'Reminders', count: reminders.length },
            { id: 'goals', label: 'Goals', count: goals.length },
            { id: 'settings', label: 'Settings', count: 0 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'reminders' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Study Reminders</h3>
                <button
                  onClick={() => setShowAddReminder(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Reminder
                </button>
              </div>

              {reminders.length === 0 ? (
                <div className="text-center py-12">
                  <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-500 mb-2">No reminders yet</h4>
                  <p className="text-gray-400 mb-4">Set up study reminders to stay on track</p>
                  <button
                    onClick={() => setShowAddReminder(true)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                  >
                    Create First Reminder
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.map(reminder => (
                    <div
                      key={reminder.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        reminder.isActive
                          ? 'border-purple-200 bg-purple-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-800">{reminder.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              reminder.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {reminder.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{reminder.message}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {reminder.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-4 h-4" />
                              {getDayNames(reminder.days)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleReminder(reminder.id)}
                            className={`p-2 rounded-full transition-colors ${
                              reminder.isActive
                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReminder(reminder.id)}
                            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'goals' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Study Goals</h3>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Goal
                </button>
              </div>

              {goals.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-500 mb-2">No goals yet</h4>
                  <p className="text-gray-400 mb-4">Set study goals to track your progress</p>
                  <button
                    onClick={() => setShowAddGoal(true)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
                  >
                    Create First Goal
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.map(goal => {
                    const progress = (goal.currentMinutes / goal.targetMinutes) * 100;
                    return (
                      <div
                        key={goal.id}
                        className="p-4 rounded-xl border-2 border-purple-200 bg-purple-50"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-800">{goal.title}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(goal.priority)}`}>
                                {goal.priority}
                              </span>
                              {goal.isCompleted && (
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                  Completed
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{goal.description}</p>
                            <div className="text-sm text-gray-500">
                              Due: {goal.deadline.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{goal.currentMinutes} / {goal.targetMinutes} minutes</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Reminder Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">Enable Notifications</h4>
                    <p className="text-sm text-gray-600">Receive browser notifications for reminders</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableNotifications}
                      onChange={(e) => handleUpdateSettings({ enableNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">Smart Reminders</h4>
                    <p className="text-sm text-gray-600">AI-powered reminders based on your study patterns</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableSmartReminders}
                      onChange={(e) => handleUpdateSettings({ enableSmartReminders: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weekly Study Goal (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.weeklyGoalMinutes}
                    onChange={(e) => handleUpdateSettings({ weeklyGoalMinutes: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="60"
                    max="1440"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Frequency
                  </label>
                  <select
                    value={settings.reminderFrequency}
                    onChange={(e) => handleUpdateSettings({ reminderFrequency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="gentle">Gentle (1-2 per day)</option>
                    <option value="moderate">Moderate (2-3 per day)</option>
                    <option value="frequent">Frequent (3-5 per day)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemindersView;
