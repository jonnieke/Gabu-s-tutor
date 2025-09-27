import React, { useState, useCallback } from 'react';
import { generateEducationalDiagram, diagramTemplates, getSuggestedTopics } from '../services/illustrateService';
import { UserSettings } from '../types';
import { CloseIcon, DownloadIcon, CopyIcon, LightBulbIcon, SendIcon, HomeIcon } from './Icons';
import Loader from './Loader';
import { getAI } from '../services/geminiService';

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
  const [quizData, setQuizData] = useState<Array<{question: string, answer: string, explanation: string}> | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const suggestedTopics = getSuggestedTopics();

  // Generate AI-powered quiz questions and answers
  const generateEducationalQuiz = async (labels: string[], topic: string, description: string, userSettings: UserSettings): Promise<Array<{question: string, answer: string, explanation: string}>> => {
    try {
      const result = await getAI().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [{
            text: `Create an engaging educational quiz based on this diagram information:

TOPIC: ${topic}
DESCRIPTION: ${description}
LABELS/COMPONENTS: ${labels.join(', ')}

Create 5 educational quiz questions that are:
1. SPECIFIC to the diagram content and components
2. EDUCATIONAL and help students learn
3. APPROPRIATE for ${userSettings.grade || 'elementary'} grade level
4. ENGAGING and not too easy or too hard

For each question, provide:
- A clear, specific question about the diagram
- A detailed, educational answer
- A brief explanation of why this is important

Format your response EXACTLY like this:

QUESTION 1:
[Your specific question here]

ANSWER 1:
[Detailed educational answer here]

EXPLANATION 1:
[Why this is important to know]

QUESTION 2:
[Your specific question here]

ANSWER 2:
[Detailed educational answer here]

EXPLANATION 2:
[Why this is important to know]

[Continue for all 5 questions]

Make sure each question is directly related to the diagram components and helps students understand the topic better.`
          }]
        },
        config: {
          systemInstruction: "You are an expert educational quiz creator. Create engaging, specific questions that help students learn from visual diagrams. Focus on understanding, not just memorization."
        }
      });

      const text = typeof (result as any).text === 'function' ? (result as any).text() : (result as any).text;
      const responseText = typeof text === 'string' ? text : String(text ?? '');
      
      return parseQuizResponse(responseText);
    } catch (error) {
      console.error('Error generating educational quiz:', error);
      // Fallback to basic questions
      return generateFallbackQuiz(labels, topic);
    }
  };

  // Parse the AI-generated quiz response
  const parseQuizResponse = (responseText: string): Array<{question: string, answer: string, explanation: string}> => {
    const quizItems: Array<{question: string, answer: string, explanation: string}> = [];
    
    // Split by QUESTION pattern
    const questionBlocks = responseText.split(/QUESTION \d+:/i);
    
    for (let i = 1; i < questionBlocks.length; i++) {
      const block = questionBlocks[i];
      
      // Extract question
      const questionMatch = block.match(/^(.*?)(?=ANSWER \d+:|$)/is);
      const question = questionMatch ? questionMatch[1].trim() : '';
      
      // Extract answer
      const answerMatch = block.match(/ANSWER \d+:(.*?)(?=EXPLANATION \d+:|$)/is);
      const answer = answerMatch ? answerMatch[1].trim() : '';
      
      // Extract explanation
      const explanationMatch = block.match(/EXPLANATION \d+:(.*?)$/is);
      const explanation = explanationMatch ? explanationMatch[1].trim() : '';
      
      if (question && answer) {
        quizItems.push({
          question: question.replace(/^Q\d+[:\-\s]*/i, '').trim(),
          answer: answer.replace(/^A\d+[:\-\s]*/i, '').trim(),
          explanation: explanation.replace(/^E\d+[:\-\s]*/i, '').trim()
        });
      }
    }
    
    return quizItems.length > 0 ? quizItems : generateFallbackQuiz([], 'general topic');
  };

  // Fallback quiz generation
  const generateFallbackQuiz = (labels: string[], topic: string): Array<{question: string, answer: string, explanation: string}> => {
    return labels.slice(0, 5).map((label, index) => {
      const cleanLabel = label.replace(/\*\*/g, '').replace(/\*/g, '').trim();
      return {
        question: `What is the role of the ${cleanLabel.toLowerCase()} in this ${topic}?`,
        answer: `The ${cleanLabel.toLowerCase()} is an important component that helps the ${topic} function properly.`,
        explanation: `Understanding the ${cleanLabel.toLowerCase()} helps you learn how different parts work together in the ${topic}.`
      };
    });
  };

  const handleGenerateDiagram = useCallback(async () => {
    if (!topic.trim() && !selectedTemplate) {
      setError('Please enter a topic or select a template');
      return;
    }

    setIsGenerating(true);
    setError('');
    setDiagramResult(null);
    setQuizData(null);

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

      // Generate educational quiz after diagram is created
      if (result.labels && result.labels.length > 0) {
        setIsGeneratingQuiz(true);
        try {
          const quiz = await generateEducationalQuiz(
            result.labels,
            requestTopic,
            result.description,
            userSettings
          );
          setQuizData(quiz);
        } catch (quizError) {
          console.error('Quiz generation failed:', quizError);
          // Don't show error for quiz generation failure, just use fallback
          setQuizData(generateFallbackQuiz(result.labels, requestTopic));
        } finally {
          setIsGeneratingQuiz(false);
        }
      }
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
              {(quizData || isGeneratingQuiz) && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Quiz: Test Your Knowledge</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {isGeneratingQuiz ? 'Generating educational quiz questions...' : 'Answer these questions about the diagram to check your understanding:'}
                  </p>
                  
                  {isGeneratingQuiz ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader />
                      <span className="ml-3 text-gray-600">Creating personalized quiz questions...</span>
                    </div>
                  ) : quizData ? (
                    <div className="space-y-4">
                      {quizData.map((quizItem, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-3">
                            <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-gray-800 font-medium mb-3 text-base">
                                {quizItem.question}
                              </p>
                              
                              {/* Answer Section - Initially Hidden */}
                              <details className="group">
                                <summary className="cursor-pointer text-green-600 hover:text-green-700 font-medium text-sm mb-2 flex items-center gap-2">
                                  <span>Show Answer</span>
                                  <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </summary>
                                
                                <div className="bg-green-50 rounded-lg p-4 mt-2 border border-green-200">
                                  <div className="mb-3">
                                    <p className="text-green-800 font-medium text-sm mb-2">Answer:</p>
                                    <p className="text-green-700 text-sm leading-relaxed">
                                      {quizItem.answer}
                                    </p>
                                  </div>
                                  
                                  {quizItem.explanation && (
                                    <div className="border-t border-green-200 pt-3">
                                      <p className="text-green-800 font-medium text-sm mb-2">Why this matters:</p>
                                      <p className="text-green-600 text-sm leading-relaxed">
                                        {quizItem.explanation}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </details>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
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
                    setQuizData(null);
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
