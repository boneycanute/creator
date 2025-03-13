"use client";

import React from "react";
import { motion } from "framer-motion";
import { useFormStore } from "@/lib/store";
import { Check } from "lucide-react";

interface MultipleChoiceInputProps {
  questionId: string;
  options: string[];
}

export const MultipleChoiceInput: React.FC<MultipleChoiceInputProps> = ({
  questionId,
  options,
}) => {
  const { setResponse, getCurrentResponse } = useFormStore();
  const currentResponse = getCurrentResponse();
  const selectedOption = currentResponse?.answer as string || "";

  const handleSelect = (option: string) => {
    setResponse(questionId, option);
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="w-full"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {options.map((option, index) => (
        <motion.div
          key={option}
          variants={item}
          className="mb-4"
          custom={index}
        >
          <motion.div
            onClick={() => handleSelect(option)}
            className={`w-full p-4 text-left flex items-center justify-between min-h-[56px] border-2 transition-all ${
              selectedOption === option
                ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                : "border-black dark:border-white text-black dark:text-white"
            }`}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-base md:text-lg">{option}</span>
            {selectedOption === option && (
              <Check className="h-5 w-5 ml-2" />
            )}
          </motion.div>
        </motion.div>
      ))}
      
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
  );
};
