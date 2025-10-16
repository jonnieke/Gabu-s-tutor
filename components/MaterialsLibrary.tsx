import React, { useState } from 'react';
import { BookIcon, ImageIcon, QuizIcon, PlayIcon, DownloadIcon, StarIcon, ClockIcon } from './Icons';

interface StudyMaterial {
  id: string;
  title: string;
  description: string;
  type: 'worksheet' | 'video' | 'quiz' | 'diagram' | 'audio';
  subject: string;
  grade: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  isFavorite: boolean;
  tags: string[];
}

const MaterialsLibrary: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sample study materials - in a real app, this would come from an API
  const materials: StudyMaterial[] = [
    {
      id: '1',
      title: 'Math: Multiplication Tables',
      description: 'Practice worksheets for times tables 1-12 with fun exercises',
      type: 'worksheet',
      subject: 'Math',
      grade: '3-5',
      difficulty: 'beginner',
      duration: '15 min',
      isFavorite: false,
      tags: ['multiplication', 'tables', 'practice']
    },
    {
      id: '2',
      title: 'Science: Water Cycle Explained',
      description: 'Animated video explaining the water cycle with simple examples',
      type: 'video',
      subject: 'Science',
      grade: '4-6',
      difficulty: 'intermediate',
      duration: '8 min',
      isFavorite: true,
      tags: ['water cycle', 'weather', 'nature']
    },
    {
      id: '3',
      title: 'English: Parts of Speech Quiz',
      description: 'Interactive quiz to test knowledge of nouns, verbs, adjectives',
      type: 'quiz',
      subject: 'English',
      grade: '2-4',
      difficulty: 'beginner',
      duration: '10 min',
      isFavorite: false,
      tags: ['grammar', 'parts of speech', 'quiz']
    },
    {
      id: '4',
      title: 'Biology: Human Digestive System',
      description: 'Detailed diagram showing how food travels through the body',
      type: 'diagram',
      subject: 'Science',
      grade: '5-7',
      difficulty: 'intermediate',
      duration: '12 min',
      isFavorite: true,
      tags: ['digestive system', 'human body', 'biology']
    },
    {
      id: '5',
      title: 'History: Ancient Egypt Audio Guide',
      description: 'Audio narration about pharaohs, pyramids, and daily life',
      type: 'audio',
      subject: 'History',
      grade: '4-6',
      difficulty: 'intermediate',
      duration: '20 min',
      isFavorite: false,
      tags: ['ancient egypt', 'history', 'audio']
    },
    {
      id: '6',
      title: 'Math: Fractions Made Easy',
      description: 'Step-by-step worksheets for understanding fractions',
      type: 'worksheet',
      subject: 'Math',
      grade: '3-5',
      difficulty: 'intermediate',
      duration: '25 min',
      isFavorite: false,
      tags: ['fractions', 'math', 'worksheets']
    }
  ];

  const subjects = ['all', 'Math', 'Science', 'English', 'History', 'Geography'];
  const grades = ['all', 'K-2', '3-5', '6-8', '9-12'];

  const filteredMaterials = materials.filter(material => {
    const matchesSubject = selectedSubject === 'all' || material.subject === selectedSubject;
    const matchesGrade = selectedGrade === 'all' || material.grade === selectedGrade;
    const matchesSearch = searchQuery === '' || 
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSubject && matchesGrade && matchesSearch;
  });

  const getTypeIcon = (type: StudyMaterial['type']) => {
    switch (type) {
      case 'worksheet':
        return <BookIcon className="w-6 h-6" />;
      case 'video':
        return <PlayIcon className="w-6 h-6" />;
      case 'quiz':
        return <QuizIcon className="w-6 h-6" />;
      case 'diagram':
        return <ImageIcon className="w-6 h-6" />;
      case 'audio':
        return <PlayIcon className="w-6 h-6" />;
      default:
        return <BookIcon className="w-6 h-6" />;
    }
  };

  const getTypeColor = (type: StudyMaterial['type']) => {
    switch (type) {
      case 'worksheet':
        return 'bg-blue-100 text-blue-600';
      case 'video':
        return 'bg-red-100 text-red-600';
      case 'quiz':
        return 'bg-purple-100 text-purple-600';
      case 'diagram':
        return 'bg-green-100 text-green-600';
      case 'audio':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getDifficultyColor = (difficulty: StudyMaterial['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="mobile-padding h-full mobile-scroll overflow-y-auto pb-20 sm:pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <BookIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Study Materials</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Explore curated learning materials, worksheets, and interactive content for all subjects.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 mobile-text border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mobile-focus"
              />
            </div>

            {/* Subject Filter */}
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-3 mobile-text border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mobile-focus"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Filter */}
            <div>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="w-full px-4 py-3 mobile-text border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mobile-focus"
              >
                {grades.map(grade => (
                  <option key={grade} value={grade}>
                    {grade === 'all' ? 'All Grades' : `Grade ${grade}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* Material Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${getTypeColor(material.type)}`}>
                    {getTypeIcon(material.type)}
                  </div>
                  <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                    <StarIcon className={`w-6 h-6 ${material.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
                  </button>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {material.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {material.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.difficulty)}`}>
                    {material.difficulty}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {material.subject}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Grade {material.grade}
                  </span>
                </div>

                {/* Duration */}
                {material.duration && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <ClockIcon className="w-4 h-4" />
                    <span>{material.duration}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 pb-6">
                <div className="flex gap-3">
                  <button className="mobile-button flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white font-medium rounded-full hover:bg-purple-700 transition-colors">
                    <PlayIcon className="w-4 h-4" />
                    Start
                  </button>
                  <button className="touch-target px-4 py-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                    <DownloadIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <BookIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No materials found</h3>
            <p className="text-gray-400">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsLibrary;
