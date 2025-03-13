"use client";

import React, { useEffect, useCallback, useState } from "react";
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
  } = useAgentFormStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        goToNextQuestion();
      } else if (e.key === "Escape") {
        goToPreviousQuestion();
      }
    },
    [goToNextQuestion, goToPreviousQuestion]
  );

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle form submission
  const handleSubmit = async () => {
    if (currentQuestionIndex === questions.length - 1) {
      setIsSubmitting(true);
      const responses = getAllResponses();
      if (onSubmit) {
        await onSubmit(responses);
      }
      setIsSubmitting(false);
      console.log("Form submitted:", responses);
    } else {
      goToNextQuestion();
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

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      goToNextQuestion();
    } else {
      handleSubmit();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      goToPreviousQuestion();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black p-4">
      {/* Navigation Hint */}
      <AgentNavigationHint 
        currentIndex={currentQuestionIndex} 
        totalQuestions={questions.length}
        onNext={handleNextQuestion}
        onPrevious={handlePreviousQuestion}
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
                {getInputComponentForQuestion(question)}
              </AgentSection>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AgentFormClone;
