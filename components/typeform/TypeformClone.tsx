"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFormStore, Question } from "@/lib/store";
import { Section } from "./Section";
import { TextInput } from "./inputs/TextInput";
import { MultipleChoiceInput } from "./inputs/MultipleChoiceInput";
import { NavigationHint } from "./NavigationHint";

interface TypeformCloneProps {
  onSubmit?: (responses: any) => void;
}

export const TypeformClone: React.FC<TypeformCloneProps> = ({
  onSubmit,
}) => {
  const {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    goToNextQuestion,
    goToPreviousQuestion,
    getAllResponses,
  } = useFormStore();

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
  const handleSubmit = () => {
    if (currentQuestionIndex === questions.length - 1) {
      const responses = getAllResponses();
      if (onSubmit) {
        onSubmit(responses);
      }
      // You could redirect or show a thank you message here
      console.log("Form submitted:", responses);
    } else {
      goToNextQuestion();
    }
  };

  // Render the appropriate input component based on question type
  const getInputComponentForQuestion = (question: Question) => {
    switch (question.type) {
      case "text":
      case "email":
      case "number":
        return (
          <TextInput
            questionId={question.id}
            placeholder={question.placeholder}
          />
        );
      case "multipleChoice":
        return (
          <MultipleChoiceInput
            questionId={question.id}
            options={question.options || []}
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
      {/* Navigation Hint moved outside the animation scope */}
      <NavigationHint 
        currentIndex={currentQuestionIndex} 
        totalQuestions={questions.length}
        onNext={handleNextQuestion}
        onPrevious={handlePreviousQuestion}
        isFirstQuestion={currentQuestionIndex === 0}
        isLastQuestion={currentQuestionIndex === questions.length - 1}
      />
      
      <div className="flex flex-col items-center justify-center w-full h-full max-w-3xl mx-auto px-4 py-8">
        <div className="relative w-full flex-1 flex items-center justify-center">
          {questions.map((question, index) => (
            <Section
              key={question.id}
              question={question}
              isActive={currentQuestionIndex === index}
              direction={index >= currentQuestionIndex ? 1 : -1}
            >
              {getInputComponentForQuestion(question)}
            </Section>
          ))}
        </div>
      </div>
    </div>
  );
};
