"use client";

import React, { useEffect, useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentFormStore, AgentQuestion } from "@/lib/agent-store";
import { AgentSection } from "@/components/typeform/agent/AgentSection";
import { TextInput } from "@/components/typeform/agent/inputs/TextInput";
import { ParagraphInput } from "@/components/typeform/agent/inputs/ParagraphInput";
import { MultipleChoiceInput } from "@/components/typeform/agent/inputs/MultipleChoiceInput";
import { ColorSelectionInput } from "@/components/typeform/agent/inputs/ColorSelectionInput";
import { FileUploadInput } from "@/components/typeform/agent/inputs/FileUploadInput";
import { StaticContent } from "@/components/typeform/agent/inputs/StaticContent";
import { LoadingScreen } from "@/components/typeform/agent/inputs/LoadingScreen";
import { AgentNavigationHint } from "@/components/typeform/agent/AgentNavigationHint";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";
import { toast } from "sonner";

interface AgentFormCloneProps {
  onSubmit?: (responses: any) => void;
}

export const AgentFormClone: React.FC<AgentFormCloneProps> = ({
  onSubmit,
}) => {
  const {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    goToNextQuestion,
    goToPreviousQuestion,
    getAllResponses,
    getAgentName,
    getCurrentResponse,
  } = useAgentFormStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Global keyboard navigation - works regardless of focus
  useEffect(() => {
    if (!mounted) return;
    
    // Track key presses for visual feedback
    const keyDownHandler = (e: KeyboardEvent) => {
      // Don't interfere with text inputs handling their own Enter key events
      if (
        (document.activeElement instanceof HTMLInputElement && e.target === document.activeElement) ||
        (document.activeElement instanceof HTMLTextAreaElement && e.target === document.activeElement) ||
        (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable && e.target === document.activeElement)
      ) {
        return; // Let the input's own handler work
      }
      
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // Prevent default Enter behavior
      } else if (e.key === "Escape") {
        e.preventDefault(); // Prevent default Escape behavior
      }
    };
    
    // Handle navigation on key release only
    const keyUpHandler = (e: KeyboardEvent) => {
      // Skip if we're already navigating
      if (isNavigating) return;
      
      const currentQuestion = questions[currentQuestionIndex];
      
      // Handle Enter key for forward navigation
      if (e.key === "Enter" && !e.shiftKey) {
        // Don't interfere with text inputs handling their own Enter key events
        if (
          (document.activeElement instanceof HTMLInputElement && e.target === document.activeElement) ||
          (document.activeElement instanceof HTMLTextAreaElement && e.target === document.activeElement) ||
          (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable && e.target === document.activeElement)
        ) {
          return; // Let the input's own handler work
        }
        
        // Check if current question is required and has a response
        const currentResponse = getCurrentResponse();
        if (currentQuestion.required && 
            (!currentResponse || 
             !currentResponse.answer || 
             (Array.isArray(currentResponse.answer) && currentResponse.answer.length === 0))) {
          // Don't proceed if required field is empty
          toast.error("This field is required", {
            position: "top-center",
            duration: 3000,
          });
          return;
        }
        
        // Set navigating flag to prevent multiple rapid navigations
        setIsNavigating(true);
        
        // Add a small delay to allow animation to complete
        setTimeout(() => {
          goToNextQuestion();
          // Reset navigating flag after a delay
          setTimeout(() => setIsNavigating(false), 300);
        }, 50);
      }
      
      // Handle Escape key for backward navigation - always works
      else if (e.key === "Escape") {
        // Set navigating flag to prevent multiple rapid navigations
        setIsNavigating(true);
        
        // Add a small delay to allow animation to complete
        setTimeout(() => {
          goToPreviousQuestion();
          // Reset navigating flag after a delay
          setTimeout(() => setIsNavigating(false), 300);
        }, 50);
      }
    };
    
    // Use document level event listeners to ensure they work without focus
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
    
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);
    };
  }, [goToNextQuestion, goToPreviousQuestion, questions, currentQuestionIndex, getCurrentResponse, mounted, isNavigating]);

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    // Use a single effect for all initialization
    const initializeComponent = () => {
      setMounted(true);
      setIsNavigating(false); // Ensure navigation state is reset on mount
      
      // Delay setting initialLoadComplete to allow for animations
      setTimeout(() => {
        setInitialLoadComplete(true);
      }, 500);
    };
    
    initializeComponent();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const responses = getAllResponses();
      if (onSubmit) {
        onSubmit(responses);
      }
      
      // Navigate to the completion screen
      const completionIndex = questions.findIndex(q => q.id === 'completion');
      if (completionIndex !== -1) {
        setCurrentQuestionIndex(completionIndex);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("There was an error submitting your responses. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Process question text to replace [agentName] with the actual agent name
  const processQuestionText = (text: string): string => {
    const agentName = getAgentName();
    if (agentName) {
      return text.replace(/\[agentName\]/g, agentName);
    }
    return text;
  };

  // Render the appropriate input component based on question type
  const getInputComponentForQuestion = (question: AgentQuestion) => {
    const processedQuestion = {
      ...question,
      text: processQuestionText(question.text),
    };

    switch (question.type) {
      case "text":
        return (
          <TextInput
            questionId={question.id}
            placeholder={question.placeholder}
            validation={question.validation}
          />
        );
      case "paragraph":
        return (
          <ParagraphInput
            questionId={question.id}
            placeholder={question.placeholder}
            validation={question.validation}
          />
        );
      case "multipleChoice":
        return (
          <MultipleChoiceInput
            questionId={question.id}
            options={question.options || []}
            descriptions={question.descriptions || []}
            layout={question.id === "promptStyle" ? "split" : question.id === "pricingPlan" ? "cards" : "default"}
          />
        );
      case "colorSelection":
        return (
          <ColorSelectionInput
            questionId={question.id}
            options={question.options || []}
          />
        );
      case "fileUpload":
        return (
          <FileUploadInput
            questionId={question.id}
            placeholder={question.placeholder}
          />
        );
      case "static":
        return (
          <StaticContent
            questionId={question.id}
            isWelcome={question.id === "welcome"}
            isCompletion={question.id === "completion"}
          />
        );
      case "loading":
        return (
          <LoadingScreen
            questionId={question.id}
          />
        );
      default:
        return null;
    }
  };

  // Memoize the input component to prevent unnecessary rerenders
  const memoizedInputComponent = useCallback((question: AgentQuestion) => {
    return getInputComponentForQuestion(question);
  }, [getInputComponentForQuestion]);

  // Toggle between light and dark mode
  const { setTheme, theme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Don't render anything during SSR to prevent hydration errors
  if (!mounted) {
    return null;
  }

  // Show a simple blank screen during initial load to prevent flashing animations
  if (!initialLoadComplete) {
    return (
      <div className="w-full h-screen bg-white dark:bg-gray-950"></div>
    );
  }

  return (
    <div 
      ref={formRef}
      className="relative w-full h-screen bg-white dark:bg-gray-950 overflow-hidden"
    >
      <motion.div 
        className="absolute top-4 right-4 z-50"
        style={{ position: 'fixed' }}
        initial={{ opacity: 0, x: 0, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full w-10 h-10"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </motion.div>
      
      {/* Navigation Hint */}
      <AgentNavigationHint 
        currentIndex={currentQuestionIndex} 
        totalQuestions={questions.length}
        onNext={goToNextQuestion}
        onPrevious={goToPreviousQuestion}
        isFirstQuestion={currentQuestionIndex === 0}
        isLastQuestion={currentQuestionIndex === questions.length - 1}
      />
      
      <div className="w-full h-full flex justify-center items-center px-4">
        <div className="w-full max-w-2xl">
          <div className="flex flex-col items-center justify-center w-full h-full">
            {questions.map((question, index) => {
              const processedQuestion = {
                ...question,
                text: processQuestionText(question.text),
              };
              
              return (
                <AgentSection
                  key={question.id}
                  question={processedQuestion}
                  isActive={currentQuestionIndex === index}
                  direction={index >= currentQuestionIndex ? 1 : -1}
                >
                  {memoizedInputComponent(question)}
                </AgentSection>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentFormClone;
