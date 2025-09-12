import React, { useState } from 'react';
import { Quiz } from '../types';
import { GabuIcon, CheckCircleIcon, XCircleIcon, HomeIcon } from './Icons';

interface QuizViewProps {
    quiz: Quiz;
    onComplete: (score: number, total: number) => void;
    onHome: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ quiz, onComplete, onHome }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(new Array(quiz.questions.length).fill(null));
    const [showResults, setShowResults] = useState(false);

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedAnswer = selectedAnswers[currentQuestionIndex];

    const handleAnswerSelect = (optionIndex: number) => {
        if (selectedAnswer !== null) return; // Prevent changing answer
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestionIndex] = optionIndex;
        setSelectedAnswers(newAnswers);
    };
    
    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setShowResults(true);
        }
    };
    
    const calculateScore = () => {
        return selectedAnswers.reduce((score, answer, index) => {
            if (answer === quiz.questions[index].correctAnswerIndex) {
                return score + 1;
            }
            return score;
        }, 0);
    };

    if (showResults) {
        const score = calculateScore();
        return (
            <div className="p-8 w-full h-full flex flex-col items-center justify-center text-center">
                <GabuIcon className="w-24 h-24 text-purple-500 mb-4"/>
                <h2 className="text-3xl font-extrabold text-gray-800">Quiz Complete!</h2>
                <p className="text-xl text-gray-600 mt-2 mb-6">
                    You scored
                    <span className="font-bold text-purple-600 text-2xl mx-2">{score}</span>
                    out of
                    <span className="font-bold text-purple-600 text-2xl mx-2">{quiz.questions.length}</span>
                </p>
                <div className="w-full max-w-md bg-gray-100 rounded-lg p-4 text-left space-y-3 overflow-y-auto max-h-60">
                    {quiz.questions.map((q, index) => (
                        <div key={index} className="text-sm">
                            <p className="font-bold">{index + 1}. {q.question}</p>
                            <p className={selectedAnswers[index] === q.correctAnswerIndex ? 'text-green-600' : 'text-red-600'}>
                                Your answer: {q.options[selectedAnswers[index]!]}
                                {selectedAnswers[index] !== q.correctAnswerIndex && ` | Correct: ${q.options[q.correctAnswerIndex]}`}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                        onClick={() => onComplete(score, quiz.questions.length)}
                        className="px-8 py-4 bg-orange-500 text-white font-bold rounded-full shadow-lg hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        Back to Chat
                    </button>
                    <button
                        onClick={onHome}
                        className="px-8 py-4 bg-purple-500 text-white font-bold rounded-full shadow-lg hover:bg-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        <HomeIcon className="w-5 h-5 inline mr-2" />
                        Go Home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-8 w-full h-full flex flex-col">
            <div className="flex-grow flex flex-col items-center">
                {/* Progress Bar */}
                <div className="w-full max-w-lg mb-4">
                    <p className="text-sm font-bold text-gray-500 text-center mb-1">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl w-full max-w-lg text-center mt-4">
                    <h3 className="text-xl font-bold text-gray-800">{currentQuestion.question}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 w-full max-w-lg">
                    {currentQuestion.options.map((option, index) => {
                         const isSelected = selectedAnswer === index;
                         const isCorrect = currentQuestion.correctAnswerIndex === index;
                         const answered = selectedAnswer !== null;

                         let buttonClass = 'p-4 border-2 rounded-xl text-left text-lg font-semibold transition-all duration-200 flex items-center justify-between gap-3';
                         let icon = null;

                         if (answered) {
                             if (isCorrect) {
                                 buttonClass += ' bg-green-500 border-green-600 text-white';
                                 icon = <CheckCircleIcon className="w-6 h-6 flex-shrink-0"/>;
                             } else if (isSelected) {
                                 buttonClass += ' bg-red-500 border-red-600 text-white';
                                  icon = <XCircleIcon className="w-6 h-6 flex-shrink-0"/>;
                             } else {
                                buttonClass += ' border-gray-300 opacity-50 cursor-not-allowed';
                             }
                         } else {
                            buttonClass += ' border-gray-300 hover:bg-purple-100 hover:border-purple-400';
                         }

                        return (
                            <button key={index} onClick={() => handleAnswerSelect(index)} disabled={answered} className={buttonClass}>
                                <span>{option}</span>
                                {icon}
                            </button>
                        )
                    })}
                </div>
                
                {selectedAnswer !== null && (
                    <div className="mt-4 p-4 bg-yellow-100/70 rounded-lg w-full max-w-lg animate-fade-in text-sm text-yellow-900">
                        <p><span className="font-bold">Explanation:</span> {currentQuestion.explanation}</p>
                    </div>
                )}
            </div>

            <div className="text-center mt-6">
                 <button
                    onClick={handleNext}
                    disabled={selectedAnswer === null}
                    className="px-10 py-4 bg-purple-600 text-white font-bold rounded-full shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transform active:scale-95 transition-all duration-200 disabled:bg-gray-300 disabled:shadow-none"
                  >
                    {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Show Results'}
                </button>
            </div>
        </div>
    );
};

export default QuizView;