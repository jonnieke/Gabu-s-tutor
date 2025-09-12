import React, { useState, useEffect } from 'react';
import { BrainIcon, TargetIcon, ChartBarIcon, LightBulbIcon, PlusIcon, PlayIcon } from './Icons';
import { adaptiveLearningService, LearningPath, LearningRecommendation, LearningProfile } from '../services/adaptiveLearningService';

interface AdaptiveLearningDashboardProps {
  onClose: () => void;
}

const AdaptiveLearningDashboard: React.FC<AdaptiveLearningDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'paths' | 'recommendations' | 'profile'>('overview');
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [learningProfile, setLearningProfile] = useState<LearningProfile | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLearningPaths(adaptiveLearningService.getLearningPaths());
    setRecommendations(adaptiveLearningService.getRecommendations());
    setLearningProfile(adaptiveLearningService.getLearningProfile());
    setAnalytics(adaptiveLearningService.getLearningAnalytics());
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getLearningStyleColor = (style: string) => {
    switch (style) {
      case 'visual': return 'bg-blue-100 text-blue-700';
      case 'auditory': return 'bg-green-100 text-green-700';
      case 'kinesthetic': return 'bg-purple-100 text-purple-700';
      case 'reading': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <BrainIcon className="w-8 h-8 text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-800">Adaptive Learning</h2>
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
            { id: 'paths', label: 'Learning Paths', icon: TargetIcon },
            { id: 'recommendations', label: 'Recommendations', icon: LightBulbIcon },
            { id: 'profile', label: 'Profile', icon: BrainIcon }
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total Study Time */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Study Time</p>
                      <p className="text-3xl font-bold">{analytics?.totalTimeSpent || 0}m</p>
                    </div>
                    <ChartBarIcon className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                {/* Average Score */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Average Score</p>
                      <p className="text-3xl font-bold">{Math.round(analytics?.averageScore || 0)}%</p>
                    </div>
                    <TargetIcon className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                {/* Completed Paths */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Completed Paths</p>
                      <p className="text-3xl font-bold">{analytics?.completedPaths || 0}</p>
                    </div>
                    <BrainIcon className="w-8 h-8 text-purple-200" />
                  </div>
                </div>

                {/* Learning Streak */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Learning Streak</p>
                      <p className="text-3xl font-bold">{analytics?.currentStreak || 0} days</p>
                    </div>
                    <LightBulbIcon className="w-8 h-8 text-orange-200" />
                  </div>
                </div>
              </div>

              {/* Learning Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Favorite Subjects</h3>
                  <div className="space-y-3">
                    {analytics?.favoriteSubjects?.map((subject: string, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-700">{subject}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${100 - (index * 20)}%` }}
                          />
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-sm">No data available yet</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Velocity</h3>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">
                      {Math.round(analytics?.learningVelocity || 0)}
                    </p>
                    <p className="text-sm text-gray-600">Points per hour</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'paths' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Learning Paths</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <PlusIcon className="w-4 h-4" />
                  Create Path
                </button>
              </div>

              {learningPaths.length === 0 ? (
                <div className="text-center py-12">
                  <TargetIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-500 mb-2">No learning paths yet</h4>
                  <p className="text-gray-400 mb-4">Create personalized learning paths</p>
                  <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Create First Path
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {learningPaths.map(path => (
                    <div
                      key={path.id}
                      className="bg-white rounded-xl border border-gray-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-800">{path.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(path.difficulty)}`}>
                              {path.difficulty}
                            </span>
                            {path.isCompleted && (
                              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{path.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{path.estimatedDuration} min</span>
                            <span>{path.modules.length} modules</span>
                            <span>{path.subject}</span>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                          <PlayIcon className="w-4 h-4" />
                          Start
                        </button>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(path.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${path.progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2">Learning Objectives</h5>
                          <ul className="space-y-1">
                            {path.learningObjectives.map((objective, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                                <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                                {objective}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2">Modules</h5>
                          <div className="space-y-2">
                            {path.modules.map(module => (
                              <div key={module.id} className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                  module.isCompleted 
                                    ? 'bg-green-500 border-green-500' 
                                    : 'border-gray-300'
                                }`}>
                                  {module.isCompleted && (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                  )}
                                </div>
                                <span className={`text-sm ${
                                  module.isCompleted ? 'text-green-700 line-through' : 'text-gray-700'
                                }`}>
                                  {module.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">AI Recommendations</h3>
                <button 
                  onClick={() => {
                    adaptiveLearningService.generateRecommendations();
                    loadData();
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <LightBulbIcon className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {recommendations.length === 0 ? (
                <div className="text-center py-12">
                  <LightBulbIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-500 mb-2">No recommendations yet</h4>
                  <p className="text-gray-400 mb-4">Complete some activities to get personalized recommendations</p>
                  <button 
                    onClick={() => {
                      adaptiveLearningService.generateRecommendations();
                      loadData();
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Generate Recommendations
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map(recommendation => (
                    <div
                      key={recommendation.id}
                      className="bg-white rounded-xl border border-gray-200 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-800">{recommendation.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(recommendation.priority)}`}>
                              {recommendation.priority}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(recommendation.difficulty)}`}>
                              {recommendation.difficulty}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{recommendation.description}</p>
                          <p className="text-gray-500 text-xs mb-3">
                            <strong>Why:</strong> {recommendation.reason}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{recommendation.estimatedTime} min</span>
                            <span>{recommendation.subject}</span>
                            <span>Confidence: {recommendation.confidence}%</span>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                          <PlayIcon className="w-4 h-4" />
                          Start
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Learning Profile</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <PlusIcon className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>

              {!learningProfile ? (
                <div className="text-center py-12">
                  <BrainIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-500 mb-2">No profile yet</h4>
                  <p className="text-gray-400 mb-4">Create your learning profile for personalized recommendations</p>
                  <button 
                    onClick={() => {
                      adaptiveLearningService.initializeLearningProfile('user-1');
                      loadData();
                    }}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create Profile
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Learning Style</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Style</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getLearningStyleColor(learningProfile.learningStyle)}`}>
                          {learningProfile.learningStyle}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">Preferred Pace</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                          {learningProfile.preferredPace}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Current Levels</h4>
                    <div className="space-y-3">
                      {Object.entries(learningProfile.currentLevel).map(([subject, level]) => (
                        <div key={subject} className="flex items-center justify-between">
                          <span className="text-gray-700">{subject}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(level as string)}`}>
                            {level}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Strengths</h4>
                    <div className="space-y-2">
                      {learningProfile.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span className="text-sm text-gray-700">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Areas for Improvement</h4>
                    <div className="space-y-2">
                      {learningProfile.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                          <span className="text-sm text-gray-700">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdaptiveLearningDashboard;
