"use client";

import React, { useEffect, useCallback, useState, useRef } from "react";
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

import { toast } from "sonner";
import { KeyboardMultipleChoiceInput } from "./agent/inputs/KeyboardMultipleChoice";

interface AgentFormCloneProps {
  onSubmit?: (responses: any) => void;
}

export const AgentFormClone: React.FC<AgentFormCloneProps> = ({ onSubmit }) => {
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

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    // Use a single effect for all initialization
    const initializeComponent = () => {
      setMounted(true);

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
      const completionIndex = questions.findIndex((q) => q.id === "completion");
      if (completionIndex !== -1) {
        setCurrentQuestionIndex(completionIndex);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        "There was an error submitting your responses. Please try again."
      );
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
            layout={
              question.id === "promptStyle"
                ? "split"
                : question.id === "pricingPlan"
                ? "cards"
                : "default"
            }
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
        return <LoadingScreen questionId={question.id} />;
      case "keyboardMultipleChoice":
        return (
          <KeyboardMultipleChoiceInput
            questionId={question.id}
            title={question.text}
            options={question.options || []}
            descriptions={question.descriptions || []}
          />
        );
      default:
        return null;
    }
  };

  // Memoize the input component to prevent unnecessary rerenders
  const memoizedInputComponent = useCallback(
    (question: AgentQuestion) => {
      return getInputComponentForQuestion(question);
    },
    [getInputComponentForQuestion]
  );

  // Don't render anything during SSR to prevent hydration errors
  if (!mounted) {
    return null;
  }


  // Show a simple blank screen during initial load to prevent flashing animations
  if (!initialLoadComplete) {
    return <div className="w-full h-screen bg-white dark:bg-gray-950"></div>;
  }

  return (
    <div
      ref={formRef}
      className="relative w-full h-screen bg-white dark:bg-gray-950 overflow-hidden"
    >
      {/* Navigation Hint - Now the single source of truth for keyboard navigation */}
      <AgentNavigationHint
        currentIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        onNext={goToNextQuestion}
        onPrevious={goToPreviousQuestion}
        isFirstQuestion={currentQuestionIndex === 0}
        isLastQuestion={currentQuestionIndex === questions.length - 1}
      />

      <div className="w-full h-full flex justify-center items-center px-4">
        <div className="w-full">
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
                  useWideContainer={question.type === "keyboardMultipleChoice"}
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
