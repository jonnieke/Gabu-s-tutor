import React, { useState, useCallback } from 'react';
import { generateEducationalDiagram, diagramTemplates, getSuggestedTopics } from '../services/illustrateService';
import { UserSettings } from '../types';
import { CloseIcon, DownloadIcon, CopyIcon, LightBulbIcon, SendIcon, HomeIcon } from './Icons';
import Loader from './Loader';

interface IllustrateViewProps {
  onClose: () => void;
  onHome: () => void;
  userSettings: UserSettings;
}

const IllustrateView: React.FC<IllustrateViewProps> = ({ onClose, onHome, userSettings }) => {
  const [topic, setTopic] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [diagramResult, setDiagramResult] = useState<any>(null);
  const [error, setError] = useState('');

  const suggestedTopics = getSuggestedTopics();

  // Generate quiz questions based on the label and topic
  const generateQuizQuestion = (label: string, topic: string, questionNumber: number): string => {
    const cleanLabel = label.replace(/\*\*/g, '').replace(/\*/g, '').trim();
    
    // Create different types of questions based on the content
    const questionTypes = [
      `What is the function of the ${cleanLabel.toLowerCase()} in this ${topic}?`,
      `Can you identify the ${cleanLabel.toLowerCase()} in the diagram?`,
      `What role does the ${cleanLabel.toLowerCase()} play in this ${topic}?`,
      `Where would you find the ${cleanLabel.toLowerCase()} in this ${topic}?`,
      `How does the ${cleanLabel.toLowerCase()} contribute to the ${topic}?`
    ];
    
    // Use question number to cycle through question types
    const questionIndex = (questionNumber - 1) % questionTypes.length;
    return questionTypes[questionIndex];
  };

  const handleGenerateDiagram = useCallback(async () => {
    if (!topic.trim() && !selectedTemplate) {
      setError('Please enter a topic or select a template');
      return;
    }

    setIsGenerating(true);
    setError('');
    setDiagramResult(null);

    try {
      const requestTopic = selectedTemplate || topic;
      const template = diagramTemplates[requestTopic as keyof typeof diagramTemplates];
      
      const result = await generateEducationalDiagram({
        topic: requestTopic,
        type: template?.type || 'concept',
        complexity: template?.complexity || 'intermediate',
        userSettings
      });

      setDiagramResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate diagram');
    } finally {
      setIsGenerating(false);
    }
  }, [topic, selectedTemplate, userSettings]);

  const handleCopyExplanation = () => {
    if (diagramResult?.explanation) {
      navigator.clipboard.writeText(diagramResult.explanation);
    }
  };

  const handleDownloadImage = () => {
    if (diagramResult?.imageUrl) {
      const a = document.createElement('a');
      a.href = diagramResult.imageUrl;
      a.download = `diagram-${topic || selectedTemplate}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
            <LightBulbIcon className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Generate Educational Diagram</h2>
              <p className="text-gray-600">Create visual diagrams using Google's Imagen 4 AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onHome}
              className="p-2 rounded-full hover:bg-purple-100 transition-colors"
              aria-label="Go Home"
            >
              <HomeIcon className="w-6 h-6 text-purple-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <CloseIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!diagramResult ? (
            <div className="space-y-6">
              {/* Topic Input with Generate Button */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What educational concept would you like to visualize?
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGenerateDiagram()}
                    placeholder="e.g., digestive system, water cycle, brain anatomy..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleGenerateDiagram}
                    disabled={isGenerating || (!topic.trim() && !selectedTemplate)}
                    className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                  >
                    <SendIcon className="w-5 h-5" />
                    {isGenerating ? 'Generating...' : 'Generate Diagram'}
                  </button>
                </div>
              </div>

              {/* Suggested Topics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Or choose from popular topics:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {suggestedTopics.map((suggestedTopic) => (
                    <button
                      key={suggestedTopic}
                      onClick={() => {
                        setSelectedTemplate(suggestedTopic);
                        setTopic('');
                      }}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedTemplate === suggestedTopic
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                      }`}
                    >
                      <div className="font-medium capitalize">{suggestedTopic}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {diagramTemplates[suggestedTopic as keyof typeof diagramTemplates]?.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>


              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </div>
          ) : (
            /* Results */
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-green-800 mb-2">Diagram Generated Successfully!</h3>
                <p className="text-green-700">Here's your educational diagram for: <strong>{selectedTemplate || topic}</strong></p>
              </div>

              {/* Generated Image */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Generated Diagram</h3>
                <div className="flex justify-center">
                  <img 
                    src={diagramResult.imageUrl} 
                    alt={`Educational diagram of ${selectedTemplate || topic}`}
                    className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200"
                    style={{ maxHeight: '400px', maxWidth: '600px' }}
                    loading="lazy"
                  />
                </div>
                <p className="text-gray-600 text-sm mt-3 text-center">
                  {diagramResult.description}
                </p>
              </div>

              {/* Quiz Section */}
              {diagramResult.labels && diagramResult.labels.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Quiz: Test Your Knowledge</h3>
                  <p className="text-gray-600 text-sm mb-4">Answer these questions about the diagram to check your understanding:</p>
                  <div className="space-y-4">
                    {diagramResult.labels.map((label: string, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium mb-2">
                              {generateQuizQuestion(label, selectedTemplate || topic, index + 1)}
                            </p>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-gray-600 text-sm">
                                <span className="font-medium">Answer:</span> {label.replace(/\*\*/g, '').replace(/\*/g, '')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleDownloadImage}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <DownloadIcon className="w-5 h-5" />
                  Download Image
                </button>
                <button
                  onClick={() => {
                    setDiagramResult(null);
                    setTopic('');
                    setSelectedTemplate('');
                    setError('');
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Generate Another Diagram
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IllustrateView;
