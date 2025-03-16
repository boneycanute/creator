"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useAgentFormStore } from "@/lib/agent-store";
import TextareaAutosize from "react-textarea-autosize";

interface ParagraphInputProps {
  questionId: string;
  placeholder?: string;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
  };
}

export const ParagraphInput: React.FC<ParagraphInputProps> = ({
  questionId,
  placeholder,
  validation,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setResponse, getCurrentResponse, goToNextQuestion } =
    useAgentFormStore();
  const currentResponse = getCurrentResponse();
  const [inputValue, setInputValue] = useState(
    (currentResponse?.answer as string) || ""
  );
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Function to dispatch custom events for input focus state
  const notifyInputFocused = () => {
    window.dispatchEvent(new Event("inputFocused"));
  };

  const notifyInputBlurred = () => {
    window.dispatchEvent(new Event("inputBlurred"));
  };

  // Focus the textarea when the component mounts - use multiple strategies for reliable focus
  useEffect(() => {
    // Strategy 1: Immediate focus
    if (textareaRef.current) {
      textareaRef.current.focus();
      notifyInputFocused();
    }

    // Strategy 2: Focus with a small delay
    const timer1 = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        notifyInputFocused();
      }
    }, 50);

    // Strategy 3: Focus with a slightly longer delay as backup
    const timer2 = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();

        // If the textarea doesn't have focus by now, force focus via click simulation
        if (document.activeElement !== textareaRef.current) {
          textareaRef.current.click();
          textareaRef.current.focus();
          notifyInputFocused();
        }
      }
    }, 200);

    // Strategy 4: One final attempt after animation is definitely complete
    const timer3 = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        notifyInputFocused();
      }
    }, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      notifyInputBlurred();
    };
  }, []);

  // Update character count when input value changes
  useEffect(() => {
    setCharCount(inputValue.length);
  }, [inputValue.length]);

  // Update the store with debouncing to prevent excessive re-renders
  const debouncedSetResponse = useCallback(
    (value: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        setResponse(questionId, value);
      }, 300); // 300ms debounce
    },
    [questionId, setResponse]
  );

  // Cleanup the timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      notifyInputBlurred();
    };
  }, []);

  const validateInput = (value: string, showError = true): boolean => {
    if (!validation) return true;

    if (validation.required && !value.trim()) {
      if (showError && hasAttemptedSubmit) {
        setError("This field is required");
      }
      return false;
    }

    if (validation.minLength && value.length < validation.minLength) {
      if (showError && hasAttemptedSubmit) {
        setError(`Minimum ${validation.minLength} characters required`);
      }
      return false;
    }

    if (validation.maxLength && value.length > validation.maxLength) {
      if (showError && hasAttemptedSubmit) {
        setError(`Maximum ${validation.maxLength} characters allowed`);
      }
      return false;
    }

    setError(null);
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setCharCount(value.length);

    // Only show validation errors if user has already attempted to submit
    validateInput(value, hasAttemptedSubmit);
    debouncedSetResponse(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Only handle Enter without Shift (since Shift+Enter is for new line in textarea)
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !e.ctrlKey &&
      !e.altKey &&
      !e.metaKey
    ) {
      // Mark that user has attempted to submit
      setHasAttemptedSubmit(true);

      // Immediately update the store when Enter is pressed
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Update the response in the store
      setResponse(questionId, inputValue);

      // Manually trigger the navigation only if validation passes
      if (validateInput(inputValue, true)) {
        // Use setTimeout to ensure the state update happens first
        setTimeout(() => {
          goToNextQuestion();
          notifyInputBlurred(); // Let the navigation system know we're done with this input
        }, 0);
      }

      // We'll handle the navigation here ourselves
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className="w-full relative">
      <motion.div
        className="relative w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <TextareaAutosize
          ref={textareaRef}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={notifyInputFocused}
          onBlur={notifyInputBlurred}
          placeholder={
            placeholder
              ? `${placeholder} (just start typing)`
              : "Start typing..."
          }
          className={`w-full p-4 border-b-2 ${
            error ? "border-red-500" : "border-black dark:border-white"
          } bg-transparent text-black dark:text-white text-lg focus:outline-none focus:border-black dark:focus:border-white transition-all resize-none min-h-[100px]`}
          maxLength={validation?.maxLength}
          minRows={3}
        />

        {validation?.maxLength && (
          <div className="absolute right-0 top-0 mt-4 mr-4 text-xs text-black/60 dark:text-white/60">
            {charCount}/{validation.maxLength}
          </div>
        )}

        {error && hasAttemptedSubmit && (
          <motion.p
            className="text-red-500 text-sm mt-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default ParagraphInput;
