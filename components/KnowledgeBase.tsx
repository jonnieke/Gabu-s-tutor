import React, { useState, useEffect } from 'react';
import { XMarkIcon, LightBulbIcon, CpuChipIcon, HeartIcon, BeakerIcon, PaintBrushIcon, GlobeAltIcon, RocketLaunchIcon, BookOpenIcon, ArrowLeftIcon, ArrowRightIcon, RobotIcon, NeuralNetworkIcon, DataFlowIcon, AlgorithmIcon, MachineLearningIcon, QuantumComputingIcon, BlockchainIcon } from './Icons';

interface KnowledgeCard {
  id: string;
  title: string;
  category: string;
  image: string;
  shortDescription: string;
  fullDescription: string;
  icon: React.ReactNode;
  source: string;
  date: string;
  tags: string[];
}

interface KnowledgeBaseProps {
  isOpen: boolean;
  onClose: () => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ isOpen, onClose }) => {
  const [selectedCard, setSelectedCard] = useState<KnowledgeCard | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const knowledgeCards: KnowledgeCard[] = [
    {
      id: 'ai-medicine-1',
      title: 'AI in Medical Diagnosis',
      category: 'Medicine',
      image: '/api/placeholder/300/200',
      shortDescription: 'AI can now detect diseases from medical images with 95% accuracy',
      fullDescription: 'Artificial Intelligence is revolutionizing medical diagnosis by analyzing medical images, X-rays, MRIs, and CT scans with remarkable accuracy. AI systems can now detect early signs of cancer, heart disease, and neurological conditions faster and more accurately than traditional methods. This technology helps doctors make better decisions and saves countless lives through early detection.',
      icon: <RobotIcon className="w-6 h-6 text-red-500" />,
      source: 'Nature Medicine',
      date: '2024-12-15',
      tags: ['AI', 'Medicine', 'Diagnosis', 'Healthcare']
    },
    {
      id: 'ai-agriculture-1',
      title: 'Smart Farming with AI',
      category: 'Agriculture',
      image: '/api/placeholder/300/200',
      shortDescription: 'AI-powered drones monitor crops and predict harvest yields',
      fullDescription: 'Modern agriculture is being transformed by AI technologies. Smart drones equipped with AI can monitor crop health, detect diseases, and predict harvest yields. AI systems analyze soil conditions, weather patterns, and plant growth to optimize irrigation, fertilization, and pest control. This leads to higher crop yields, reduced waste, and more sustainable farming practices.',
      icon: <DataFlowIcon className="w-6 h-6 text-green-500" />,
      source: 'Agricultural Technology Review',
      date: '2024-12-10',
      tags: ['AI', 'Agriculture', 'Sustainability', 'Farming']
    },
    {
      id: 'ai-creativity-1',
      title: 'AI in Creative Arts',
      category: 'Creativity',
      image: '/api/placeholder/300/200',
      shortDescription: 'AI creates original music, art, and literature alongside human artists',
      fullDescription: 'AI is becoming a powerful creative partner, generating original music, paintings, poetry, and even novels. Artists are collaborating with AI to explore new creative possibilities, while AI tools help aspiring creators learn and improve their skills. This partnership between human creativity and artificial intelligence is opening up entirely new forms of artistic expression.',
      icon: <AlgorithmIcon className="w-6 h-6 text-purple-500" />,
      source: 'Creative AI Journal',
      date: '2024-12-08',
      tags: ['AI', 'Creativity', 'Art', 'Music', 'Literature']
    },
    {
      id: 'ai-climate-1',
      title: 'AI Fighting Climate Change',
      category: 'Climate',
      image: '/api/placeholder/300/200',
      shortDescription: 'AI optimizes renewable energy and predicts climate patterns',
      fullDescription: 'Artificial Intelligence is playing a crucial role in combating climate change. AI systems optimize renewable energy grids, predict weather patterns, and help design more efficient buildings. Machine learning algorithms analyze satellite data to monitor deforestation, track carbon emissions, and develop climate models. AI is also helping cities become more sustainable through smart traffic management and energy optimization.',
      icon: <NeuralNetworkIcon className="w-6 h-6 text-blue-500" />,
      source: 'Climate AI Research',
      date: '2024-12-05',
      tags: ['AI', 'Climate', 'Renewable Energy', 'Sustainability']
    },
    {
      id: 'ai-careers-1',
      title: 'AI Reshaping Careers',
      category: 'Career',
      image: '/api/placeholder/300/200',
      shortDescription: 'New AI-related jobs are emerging faster than traditional ones',
      fullDescription: 'The job market is being transformed by AI, creating new career opportunities in AI engineering, data science, and machine learning. While some traditional jobs are being automated, AI is also creating entirely new roles like AI ethics specialists, prompt engineers, and human-AI collaboration experts. The key to success is learning to work alongside AI rather than competing against it.',
      icon: <MachineLearningIcon className="w-6 h-6 text-orange-500" />,
      source: 'Future of Work Institute',
      date: '2024-12-12',
      tags: ['AI', 'Career', 'Jobs', 'Future of Work']
    },
    {
      id: 'ai-daily-life-1',
      title: 'AI in Daily Life',
      category: 'Daily Life',
      image: '/api/placeholder/300/200',
      shortDescription: 'AI assistants help us manage our schedules and make decisions',
      fullDescription: 'AI has seamlessly integrated into our daily lives through smart assistants, recommendation systems, and automated services. From personalized news feeds and music recommendations to smart home devices and navigation systems, AI makes our lives more convenient and efficient. These technologies learn from our preferences to provide increasingly personalized experiences.',
      icon: <CpuChipIcon className="w-6 h-6 text-yellow-500" />,
      source: 'AI in Society Report',
      date: '2024-12-14',
      tags: ['AI', 'Daily Life', 'Smart Assistants', 'Automation']
    },
    {
      id: 'ai-education-1',
      title: 'AI in Education',
      category: 'Education',
      image: '/api/placeholder/300/200',
      shortDescription: 'Personalized learning experiences tailored to each student',
      fullDescription: 'AI is revolutionizing education by providing personalized learning experiences. Intelligent tutoring systems adapt to each student\'s learning style and pace, while AI-powered assessment tools provide instant feedback. Virtual reality and AI create immersive learning environments, making complex subjects more engaging and accessible to students worldwide.',
      icon: <QuantumComputingIcon className="w-6 h-6 text-indigo-500" />,
      source: 'Educational Technology Today',
      date: '2024-12-18',
      tags: ['AI', 'Education', 'Personalized Learning', 'EdTech']
    },
    {
      id: 'ai-research-1',
      title: 'AI Accelerating Scientific Research',
      category: 'Research',
      image: '/api/placeholder/300/200',
      shortDescription: 'AI discovers new materials and accelerates drug development',
      fullDescription: 'AI is dramatically accelerating scientific research across all fields. Machine learning algorithms analyze vast amounts of data to discover new materials, predict protein structures, and accelerate drug development. AI systems can process and analyze research papers faster than humans, helping scientists stay up-to-date with the latest discoveries and identify promising research directions.',
      icon: <BlockchainIcon className="w-6 h-6 text-cyan-500" />,
      source: 'Science AI Journal',
      date: '2024-12-16',
      tags: ['AI', 'Research', 'Science', 'Discovery']
    }
  ];

  // Auto-scroll functionality
  useEffect(() => {
    if (!isOpen || !isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % knowledgeCards.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isOpen, isAutoPlaying, knowledgeCards.length]);

  const nextCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % knowledgeCards.length);
    setIsAutoPlaying(false);
  };

  const prevCard = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + knowledgeCards.length) % knowledgeCards.length);
    setIsAutoPlaying(false);
  };

  const goToCard = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Medicine': 'bg-red-100 text-red-800',
      'Agriculture': 'bg-green-100 text-green-800',
      'Creativity': 'bg-purple-100 text-purple-800',
      'Climate': 'bg-blue-100 text-blue-800',
      'Career': 'bg-orange-100 text-orange-800',
      'Daily Life': 'bg-yellow-100 text-yellow-800',
      'Education': 'bg-indigo-100 text-indigo-800',
      'Research': 'bg-cyan-100 text-cyan-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CpuChipIcon className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Knowledge Base</h2>
                <p className="text-purple-100">Discover how AI is reshaping our world</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Scrolling Banner */}
        <div className="bg-gray-50 p-6 flex-1 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Latest AI Insights</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Auto-updating every 5 seconds</span>
            </div>
          </div>

          {/* Carousel Display */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4">
            <div className="relative">
              {/* Navigation Arrows */}
              <button
                onClick={prevCard}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200"
              >
                <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
              </button>
              
              <button
                onClick={nextCard}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200"
              >
                <ArrowRightIcon className="w-6 h-6 text-gray-700" />
              </button>

              {/* Card Image Placeholder */}
              <div className="h-32 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                    {knowledgeCards[currentIndex].icon}
                  </div>
                  <div className="text-gray-600 font-medium">AI Technology</div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(knowledgeCards[currentIndex].category)}`}>
                    {knowledgeCards[currentIndex].category}
                  </span>
                  <span className="text-xs text-gray-500">{knowledgeCards[currentIndex].date}</span>
                </div>

                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  {knowledgeCards[currentIndex].title}
                </h4>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {knowledgeCards[currentIndex].shortDescription}
                </p>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedCard(knowledgeCards[currentIndex])}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Learn More
                  </button>
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isAutoPlaying 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isAutoPlaying ? 'Pause' : 'Play'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center space-x-2 mb-4">
            {knowledgeCards.map((_, index) => (
              <button
                key={index}
                onClick={() => goToCard(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex ? 'bg-purple-600 scale-110' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Card Counter */}
          <div className="text-center text-sm text-gray-600 mb-4">
            <span className="font-medium">{currentIndex + 1}</span> of <span className="font-medium">{knowledgeCards.length}</span>
            {isAutoPlaying && (
              <span className="ml-2 text-green-600">• Auto-playing</span>
            )}
          </div>
        </div>

        {/* Grid of All Cards */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Explore All Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {knowledgeCards.map((card, index) => (
              <div
                key={card.id}
                onClick={() => {
                  goToCard(index);
                  setSelectedCard(card);
                }}
                className={`bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer ${
                  index === currentIndex ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  {card.icon}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(card.category)}`}>
                    {card.category}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm">{card.title}</h4>
                <p className="text-gray-600 text-xs line-clamp-2">{card.shortDescription}</p>
                {index === currentIndex && (
                  <div className="mt-2 text-xs text-purple-600 font-medium">Currently viewing</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detail Modal */}
        {selectedCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {selectedCard.icon}
                    <div>
                      <h3 className="text-xl font-bold">{selectedCard.title}</h3>
                      <p className="text-purple-100">{selectedCard.source} • {selectedCard.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedCard.category)}`}>
                    {selectedCard.category}
                  </span>
                </div>

                <p className="text-gray-700 leading-relaxed mb-6">
                  {selectedCard.fullDescription}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedCard.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Did You Know?</h4>
                  <p className="text-blue-800 text-sm">
                    This is just one example of how AI is transforming {selectedCard.category.toLowerCase()}. 
                    The future holds even more exciting possibilities as AI continues to evolve and improve!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
