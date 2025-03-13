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
  const formRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation - simplified to fix issues
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only process Enter and Escape keys
      if (e.key !== "Enter" && e.key !== "Escape") {
        return;
      }
      
      // Skip keyboard navigation when an input is focused
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLButtonElement ||
        (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable)
      ) {
        return;
      }

      // Only handle Enter/Escape when no input is focused
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        
        // Check if current question is required and has a response
        const currentQuestion = questions[currentQuestionIndex];
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
        
        goToNextQuestion();
      } else if (e.key === "Escape") {
        goToPreviousQuestion();
      }
    },
    [goToNextQuestion, goToPreviousQuestion, questions, currentQuestionIndex, getCurrentResponse]
  );

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    // Use a single effect for all initialization
    const initializeComponent = () => {
      setMounted(true);
      
      // Add a small delay before showing animations
      setTimeout(() => {
        setInitialLoadComplete(true);
      }, 500);
    };
    
    // Call initialization function
    initializeComponent();
    
    return () => {
      // Cleanup function
    };
  }, []);

  // Add keyboard event listeners in a separate effect
  useEffect(() => {
    if (!mounted) return;
    
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mounted, handleKeyDown]);

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
      
      <div className="flex flex-col items-center justify-center w-full h-full max-w-4xl mx-auto px-4 py-8">
        <div className="relative w-full flex-1 flex items-center justify-center">
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
  );
};

export default AgentFormClone;
