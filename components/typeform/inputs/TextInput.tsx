"use client";

import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useFormStore } from "@/lib/store";

interface TextInputProps {
  questionId: string;
  placeholder?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  questionId,
  placeholder,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setResponse, getCurrentResponse } = useFormStore();
  const currentResponse = getCurrentResponse();
  const currentValue = currentResponse?.answer as string || "";

  // Focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResponse(questionId, e.target.value);
  };

  return (
    <div className="w-full relative">
      <motion.div
        className="relative w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <input
          ref={inputRef}
          type="text"
          value={currentValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full p-4 border-b-2 border-black dark:border-white bg-transparent text-black dark:text-white text-lg focus:outline-none focus:border-black dark:focus:border-white transition-all"
        />
        
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
          <span>to continue</span>
        </motion.div>
      </motion.div>
    </div>
  );
};
