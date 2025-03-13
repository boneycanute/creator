"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAgentFormStore } from "@/lib/agent-store";
import { Check } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface MultipleChoiceInputProps {
  questionId: string;
  options: string[];
  descriptions?: string[];
  layout?: "default" | "split" | "cards";
}

export const MultipleChoiceInput: React.FC<MultipleChoiceInputProps> = ({
  questionId,
  options,
  descriptions = [],
  layout = "default",
}) => {
  const { setResponse, getCurrentResponse, goToNextQuestion } = useAgentFormStore();
  const currentResponse = getCurrentResponse();
  const selectedOption = currentResponse?.answer as string || "";
  const [selectedDescription, setSelectedDescription] = useState<string>("");

  // Auto-advance on selection for default layout
  useEffect(() => {
    if (selectedOption && layout === "default") {
      const timer = setTimeout(() => {
        goToNextQuestion();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedOption, layout, goToNextQuestion]);

  // Update description when selection changes
  useEffect(() => {
    if (selectedOption && descriptions.length > 0) {
      const index = options.findIndex(option => option === selectedOption);
      if (index !== -1 && index < descriptions.length) {
        setSelectedDescription(descriptions[index]);
      }
    } else {
      setSelectedDescription("");
    }
  }, [selectedOption, options, descriptions]);

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

  // Render different layouts
  if (layout === "split") {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
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
        </motion.div>
        
        <motion.div
          className="w-full bg-gray-100 dark:bg-gray-900 rounded-lg p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedDescription ? 1 : 0.3 }}
        >
          {selectedDescription ? (
            <MarkdownRenderer>
              {selectedDescription}
            </MarkdownRenderer>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              Select an option to see details
            </p>
          )}
        </motion.div>
      </div>
    );
  }
  
  if (layout === "cards") {
    return (
      <motion.div
        className="w-full"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {options.map((option, index) => (
            <motion.div
              key={option}
              variants={item}
              custom={index}
              onClick={() => handleSelect(option)}
              className={`cursor-pointer rounded-lg border-2 transition-all overflow-hidden ${
                selectedOption === option
                  ? "border-black dark:border-white ring-2 ring-black dark:ring-white"
                  : "border-gray-200 dark:border-gray-800"
              }`}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`p-6 ${
                selectedOption === option
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-white dark:bg-black text-black dark:text-white"
              }`}>
                <h3 className="font-bold text-lg mb-2">{option}</h3>
                {descriptions[index] && (
                  <p className="text-sm opacity-80">{descriptions[index]}</p>
                )}
                
                {selectedOption === option && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-5 w-5" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          className="mt-6 text-xs text-black/60 dark:text-white/60 flex items-center justify-center"
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
  }

  // Default layout
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
          
          {selectedOption === option && descriptions[index] && (
            <motion.div
              className="mt-2 text-sm text-gray-600 dark:text-gray-300 pl-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              {descriptions[index]}
            </motion.div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MultipleChoiceInput;
