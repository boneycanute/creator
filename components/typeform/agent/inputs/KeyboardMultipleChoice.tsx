"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAgentFormStore } from "@/lib/agent-store";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface KeyboardMultipleChoiceInputProps {
  questionId: string;
  title?: string;
  options: string[];
  descriptions?: string[];
}

export const KeyboardMultipleChoiceInput: React.FC<
  KeyboardMultipleChoiceInputProps
> = ({
  questionId,
  title = "Select an option",
  options,
  descriptions = [],
}) => {
  // If useAgentFormStore is not available during testing, use local state
  const agentStore =
    typeof useAgentFormStore === "function" ? useAgentFormStore() : null;
  const [localSelectedOption, setLocalSelectedOption] = useState<string>("");

  // Use either store or local state depending on what's available
  const selectedOption = agentStore
    ? (agentStore.getCurrentResponse()?.answer as string) || ""
    : localSelectedOption;

  const [selectedDescription, setSelectedDescription] = useState<string>("");

  // Handle option selection
  const handleSelect = (option: string) => {
    if (agentStore) {
      agentStore.setResponse(questionId, option);
    } else {
      setLocalSelectedOption(option);
    }
  };

  // Update description when selection changes
  useEffect(() => {
    if (selectedOption && descriptions.length > 0) {
      const index = options.findIndex((option) => option === selectedOption);
      if (index !== -1 && index < descriptions.length) {
        setSelectedDescription(descriptions[index]);
      }
    } else {
      setSelectedDescription("");
    }
  }, [selectedOption, options, descriptions]);

  // Keyboard keys for options (QWERTY)
  const keyboardKeys = ["Q", "W", "E", "R", "T", "Y"];

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

  // Ensure we only show as many keyboard keys as we have options
  const visibleOptions = options.slice(
    0,
    Math.min(options.length, keyboardKeys.length)
  );

  // Console log for debugging
  console.log("Rendering KeyboardMultipleChoiceInput:", {
    questionId,
    options: visibleOptions,
    selectedOption,
  });

  return (
    <div className="flex flex-col w-full h-full">
      <div className="w-full grid grid-cols-1 md:grid-cols-[30%_70%] gap-8 flex-grow">
        <motion.div
          className="w-full flex flex-col space-y-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {visibleOptions.map((option, index) => (
            <motion.div key={option} variants={item} className="relative">
              <motion.div
                onClick={() => handleSelect(option)}
                className={`w-full p-4 text-left flex items-center justify-between min-h-[56px] border-2 transition-all ${
                  selectedOption === option
                    ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black rounded-2xl"
                    : "border-black dark:border-white text-black dark:text-white rounded-2xl"
                }`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-base md:text-lg pr-10">{option}</span>

                {/* Keyboard key representation */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-8 h-8 flex items-center justify-center text-black dark:text-white rounded border-2 border-gray-400 bg-gray-100 dark:bg-gray-800 shadow-sm font-mono text-sm">
                    {keyboardKeys[index]}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="w-full  rounded-lg p-6 h-full min-h-[400px] flex flex-col border-2 border-black dark:border-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedDescription ? 1 : 0.9 }}
        >
          <div className="flex-grow overflow-auto">
            {selectedDescription ? (
              typeof MarkdownRenderer === "function" ? (
                <MarkdownRenderer>{selectedDescription}</MarkdownRenderer>
              ) : (
                <div>{selectedDescription}</div>
              )
            ) : (
              <p className="text-black dark:text-white">
                Select an option to see details
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default KeyboardMultipleChoiceInput;
