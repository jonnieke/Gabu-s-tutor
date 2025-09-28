import React, { useState, useEffect, useRef } from 'react';
import { Tutorial, TutorialStep } from '../types';
import { tutorialService } from '../services/tutorialService';
import { CloseIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon, SkipIcon, GabuIcon } from './Icons';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorialId?: string;
  onTutorialComplete?: (tutorialId: string) => void;
  onTutorialSkip?: (tutorialId: string) => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  tutorialId,
  onTutorialComplete,
  onTutorialSkip
}) => {
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState<TutorialStep | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && tutorialId) {
      const tutorialData = tutorialService.getTutorialById(tutorialId);
      if (tutorialData) {
        setTutorial(tutorialData);
        setStepIndex(0);
        setCurrentStep(tutorialData.steps[0]);
        tutorialService.startTutorial(tutorialId);
      }
    }
  }, [isOpen, tutorialId]);

  useEffect(() => {
    if (currentStep && isOpen) {
      highlightTargetElement();
    }
    return () => {
      clearHighlight();
    };
  }, [currentStep, isOpen]);

  const highlightTargetElement = () => {
    if (!currentStep?.targetElement) return;

    const element = document.querySelector(currentStep.targetElement) as HTMLElement;
    if (element) {
      setHighlightedElement(element);
      element.style.position = 'relative';
      element.style.zIndex = '1000';
      element.style.borderRadius = '8px';
      element.style.transition = 'all 0.3s ease';
      
      // Add tutorial highlight animation
      element.classList.add('animate-tutorial-highlight');
    }
  };

  const clearHighlight = () => {
    if (highlightedElement) {
      highlightedElement.style.position = '';
      highlightedElement.style.zIndex = '';
      highlightedElement.style.borderRadius = '';
      highlightedElement.style.transition = '';
      highlightedElement.classList.remove('animate-tutorial-highlight');
      setHighlightedElement(null);
    }
  };

  const handleNext = () => {
    if (!tutorial) return;

    setIsAnimating(true);
    clearHighlight();

    setTimeout(() => {
      const nextIndex = stepIndex + 1;
      if (nextIndex >= tutorial.steps.length) {
        // Tutorial completed
        tutorialService.completeTutorial(tutorial.id);
        onTutorialComplete?.(tutorial.id);
        handleClose();
      } else {
        setStepIndex(nextIndex);
        setCurrentStep(tutorial.steps[nextIndex]);
        tutorialService.nextStep();
      }
      setIsAnimating(false);
    }, 300);
  };

  const handlePrevious = () => {
    if (!tutorial || stepIndex <= 0) return;

    setIsAnimating(true);
    clearHighlight();

    setTimeout(() => {
      const prevIndex = stepIndex - 1;
      setStepIndex(prevIndex);
      setCurrentStep(tutorial.steps[prevIndex]);
      tutorialService.previousStep();
      setIsAnimating(false);
    }, 300);
  };

  const handleSkip = () => {
    if (!tutorial) return;
    
    clearHighlight();
    tutorialService.skipTutorial(tutorial.id);
    onTutorialSkip?.(tutorial.id);
    handleClose();
  };

  const handleClose = () => {
    clearHighlight();
    onClose();
  };

  const handleActionClick = () => {
    if (!currentStep?.actionTarget) return;

    const targetElement = document.querySelector(currentStep.actionTarget) as HTMLElement;
    if (targetElement) {
      targetElement.click();
    }
  };

  if (!isOpen || !tutorial || !currentStep) return null;

  const progress = ((stepIndex + 1) / tutorial.steps.length) * 100;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === tutorial.steps.length - 1;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === overlayRef.current && handleClose()}
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 animate-tutorial-slide ${
          isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close tutorial"
          >
            <CloseIcon className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <GabuIcon className="w-8 h-8 text-purple-600 animate-tutorial-bounce" />
            <div>
              <h2 className="text-xl font-bold text-gray-800 animate-fade-in">{tutorial.title}</h2>
              <p className="text-sm text-gray-600 animate-fade-in">Step {stepIndex + 1} of {tutorial.steps.length}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 animate-fade-in">{currentStep.title}</h3>
            <p className="text-gray-600 leading-relaxed mb-4 animate-fade-in">{currentStep.description}</p>
            
            {/* Tips */}
            {currentStep.tips && currentStep.tips.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4 animate-fade-in">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Tips:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {currentStep.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Button */}
            {currentStep.action === 'click' && currentStep.actionTarget && (
              <button
                onClick={handleActionClick}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-full hover:from-purple-700 hover:to-pink-700 transform active:scale-95 transition-all duration-200 shadow-lg mb-4 animate-tutorial-pulse"
              >
                Click to Continue
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Previous</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <SkipIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Skip</span>
              </button>
              
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:from-purple-700 hover:to-pink-700 transform active:scale-95 transition-all duration-200 shadow-lg"
              >
                <span className="text-sm">
                  {isLastStep ? 'Complete' : 'Next'}
                </span>
                {isLastStep ? (
                  <CheckIcon className="w-4 h-4" />
                ) : (
                  <ArrowRightIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
