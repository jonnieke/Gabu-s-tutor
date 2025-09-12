import React, { useState, useEffect } from 'react';
import { UsersIcon, ChartBarIcon, TargetIcon, CalendarIcon, PlusIcon, ShareIcon } from './Icons';
import { collaborationService, LearningReport, ParentTeacher, LearningGoal } from '../services/collaborationService';

interface CollaborativeDashboardProps {
  onClose: () => void;
}

const CollaborativeDashboard: React.FC<CollaborativeDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'goals' | 'collaborators'>('overview');
  const [parentsTeachers, setParentsTeachers] = useState<ParentTeacher[]>([]);
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([]);
  const [reports, setReports] = useState<LearningReport[]>([]);
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setParentsTeachers(collaborationService.getParentsTeachers());
    setLearningGoals(collaborationService.getLearningGoals());
    
    // Generate sample reports
    const dailyReport = collaborationService.generateLearningReport('daily');
    const weeklyReport = collaborationService.generateLearningReport('weekly');
    setReports([dailyReport, weeklyReport]);
  };

  const handleAddCollaborator = (collaboratorData: Omit<ParentTeacher, 'id' | 'lastAccess'>) => {
    const newCollaborator = collaborationService.addParentTeacher(collaboratorData);
    setParentsTeachers(prev => [...prev, newCollaborator]);
    setShowAddCollaborator(false);
  };

  const handleAddGoal = (goalData: Omit<LearningGoal, 'id' | 'progress' | 'isCompleted'>) => {
    const newGoal = collaborationService.addLearningGoal(goalData);
    setLearningGoals(prev => [...prev, newGoal]);
    setShowAddGoal(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'parent': return 'bg-blue-100 text-blue-700';
      case 'teacher': return 'bg-green-100 text-green-700';
      case 'tutor': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-800">Collaborative Dashboard</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'reports', label: 'Reports', icon: CalendarIcon },
            { id: 'goals', label: 'Goals', icon: TargetIcon },
            { id: 'collaborators', label: 'Collaborators', icon: UsersIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Study Time Today */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Study Time Today</p>
                      <p className="text-3xl font-bold">45 min</p>
                    </div>
                    <CalendarIcon className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                {/* Active Goals */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Active Goals</p>
                      <p className="text-3xl font-bold">{learningGoals.filter(g => !g.isCompleted).length}</p>
                    </div>
                    <TargetIcon className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                {/* Collaborators */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Collaborators</p>
                      <p className="text-3xl font-bold">{parentsTeachers.length}</p>
                    </div>
                    <UsersIcon className="w-8 h-8 text-purple-200" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Completed Math Practice</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">New bookmark created</p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Study session started</p>
                      <p className="text-xs text-gray-500">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Learning Reports</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <ShareIcon className="w-4 h-4" />
                  Share Report
                </button>
              </div>

              {reports.map((report, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {report.period.charAt(0).toUpperCase() + report.period.slice(1)} Report
                    </h4>
                    <span className="text-sm text-gray-500">
                      {report.startDate.toLocaleDateString()} - {report.endDate.toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{report.totalStudyTime}m</p>
                      <p className="text-sm text-gray-600">Study Time</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{report.sessionsCompleted}</p>
                      <p className="text-sm text-gray-600">Sessions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{report.bookmarksCreated}</p>
                      <p className="text-sm text-gray-600">Bookmarks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{Math.round(report.averageScore)}%</p>
                      <p className="text-sm text-gray-600">Avg Score</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2">Strengths</h5>
                      <ul className="space-y-1">
                        {report.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-green-700 flex items-center gap-2">
                            <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2">Areas for Improvement</h5>
                      <ul className="space-y-1">
                        {report.areasForImprovement.map((area, i) => (
                          <li key={i} className="text-sm text-orange-700 flex items-center gap-2">
                            <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="font-semibold text-gray-800 mb-2">Recommendations</h5>
                    <ul className="space-y-1">
                      {report.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                          <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Learning Goals</h3>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Goal
                </button>
              </div>

              {learningGoals.length === 0 ? (
                <div className="text-center py-12">
                  <TargetIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-500 mb-2">No goals yet</h4>
                  <p className="text-gray-400 mb-4">Set learning goals to track progress</p>
                  <button
                    onClick={() => setShowAddGoal(true)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create First Goal
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {learningGoals.map(goal => (
                    <div
                      key={goal.id}
                      className="bg-white rounded-xl border border-gray-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-800">{goal.title}</h4>
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
                            Due: {goal.targetDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(goal.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2">Milestones</h5>
                          <div className="space-y-2">
                            {goal.milestones.map(milestone => (
                              <div key={milestone.id} className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                  milestone.isCompleted 
                                    ? 'bg-green-500 border-green-500' 
                                    : 'border-gray-300'
                                }`}>
                                  {milestone.isCompleted && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </div>
                                <span className={`text-sm ${
                                  milestone.isCompleted ? 'text-green-700 line-through' : 'text-gray-700'
                                }`}>
                                  {milestone.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2">Subject</h5>
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                            {goal.subject}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'collaborators' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Collaborators</h3>
                <button
                  onClick={() => setShowAddCollaborator(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Collaborator
                </button>
              </div>

              {parentsTeachers.length === 0 ? (
                <div className="text-center py-12">
                  <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-500 mb-2">No collaborators yet</h4>
                  <p className="text-gray-400 mb-4">Add parents, teachers, or tutors to collaborate</p>
                  <button
                    onClick={() => setShowAddCollaborator(true)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Add First Collaborator
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {parentsTeachers.map(collaborator => (
                    <div
                      key={collaborator.id}
                      className="bg-white rounded-xl border border-gray-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-800">{collaborator.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(collaborator.role)}`}>
                              {collaborator.role}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              collaborator.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {collaborator.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{collaborator.relationship}</p>
                          <p className="text-gray-500 text-xs">{collaborator.email}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="font-semibold text-gray-800 text-sm">Permissions</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(collaborator.permissions).map(([permission, allowed]) => (
                            <div key={permission} className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                allowed ? 'bg-green-500' : 'bg-gray-300'
                              }`}></div>
                              <span className="text-xs text-gray-600 capitalize">
                                {permission.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Last access: {collaborator.lastAccess.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollaborativeDashboard;
