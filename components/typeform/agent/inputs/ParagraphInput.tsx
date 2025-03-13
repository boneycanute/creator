"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAgentFormStore } from "@/lib/agent-store";

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
  const { setResponse, getCurrentResponse } = useAgentFormStore();
  const currentResponse = getCurrentResponse();
  const currentValue = currentResponse?.answer as string || "";
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  // Focus the textarea when the component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    setCharCount(currentValue.length);
  }, [currentValue.length]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [currentValue]);

  const validateInput = (value: string): boolean => {
    if (!validation) return true;
    
    if (validation.required && !value.trim()) {
      setError("This field is required");
      return false;
    }
    
    if (validation.minLength && value.length < validation.minLength) {
      setError(`Minimum ${validation.minLength} characters required`);
      return false;
    }
    
    if (validation.maxLength && value.length > validation.maxLength) {
      setError(`Maximum ${validation.maxLength} characters allowed`);
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCharCount(value.length);
    validateInput(value);
    setResponse(questionId, value);
  };

  return (
    <div className="w-full relative">
      <motion.div
        className="relative w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <textarea
          ref={textareaRef}
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full p-4 border-b-2 ${
            error ? "border-red-500" : "border-black dark:border-white"
          } bg-transparent text-black dark:text-white text-lg focus:outline-none focus:border-black dark:focus:border-white transition-all resize-none overflow-hidden min-h-[120px]`}
          maxLength={validation?.maxLength}
          rows={3}
        />
        
        {validation?.maxLength && (
          <div className="absolute right-0 top-0 mt-4 mr-4 text-xs text-black/60 dark:text-white/60">
            {charCount}/{validation.maxLength}
          </div>
        )}
        
        {error && (
          <motion.p
            className="text-red-500 text-sm mt-1"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
        
        <motion.div
          className="mt-2 text-xs text-black/60 dark:text-white/60 flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.6 }}
        >
          <span>Press</span>{" "}
          <kbd className="mx-1 px-1.5 py-0.5 border border-black/60 dark:border-white/60 text-xs">
            Enter
          </kbd>{" "}
          <span>to continue or</span>{" "}
          <kbd className="mx-1 px-1.5 py-0.5 border border-black/60 dark:border-white/60 text-xs">
            Shift + Enter
          </kbd>{" "}
          <span>for a new line</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ParagraphInput;
