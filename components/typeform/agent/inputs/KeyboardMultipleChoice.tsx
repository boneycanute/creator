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
> = ({ questionId, options: defaultOptions, descriptions = [] }) => {
  // Replace with the framework options
  const options = [
    "CARE Framework",
    "APE Framework",
    "CREATE Framework",
    "RACE Framework",
    "SPEAR Framework",
    "RPG Framework"
  ];

  // Use either store or local state depending on what's available
  const agentStore = useAgentFormStore();
  const [localSelectedOption, setLocalSelectedOption] = useState<string>("");
  const selectedOption = agentStore
    ? (agentStore.getCurrentResponse()?.answer as string) || ""
    : localSelectedOption;

  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle option selection
  const handleSelect = async (option: string) => {
    // Update the selection in store
    if (agentStore) {
      agentStore.setResponse(questionId, option);
    } else {
      setLocalSelectedOption(option);
    }
    
    // Show loading state
    setIsLoading(true);
    setGeneratedContent("");
    
    try {
      // Fetch the required response data
      const responses = agentStore.getAllResponses();
      const agentName = agentStore.getAgentName();
      
      // Find the responses for agent purpose and target users
      const agentPurposeResponse = responses.find(r => r.questionId === "agentPurpose");
      const targetUsersResponse = responses.find(r => r.questionId === "targetUsers");
      
      const agentPurpose = agentPurposeResponse?.answer as string || "";
      const targetUsers = targetUsersResponse?.answer as string || "";
      
      // Make API call to generate content
      const response = await fetch("/api/getPrompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          framework: option,
          agentName,
          agentPurpose,
          targetUsers,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate content");
      }
      
      const data = await response.text();
      setGeneratedContent(data);
    } catch (error) {
      console.error("Error generating prompt:", error);
      setGeneratedContent("**Error:** Failed to generate content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  // Add keyboard event listeners for letter keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process if not in an input element
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        (document.activeElement instanceof HTMLElement &&
          document.activeElement.isContentEditable)
      ) {
        return;
      }

      // Get the pressed key and convert to uppercase
      const key = e.key.toUpperCase();

      // Check if the key is one of our option keys
      const keyIndex = keyboardKeys.indexOf(key);
      if (keyIndex >= 0 && keyIndex < visibleOptions.length) {
        // Select the corresponding option
        handleSelect(visibleOptions[keyIndex]);
        e.preventDefault();
      }
    };

    // Add and remove the event listener
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visibleOptions, keyboardKeys]);

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
          className="w-full rounded-lg p-6 h-full min-h-[400px] flex flex-col border-2 border-black dark:border-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex-grow overflow-auto">
            {!selectedOption && (
              <p className="text-black dark:text-white">
                Select a framework to see your system message
              </p>
            )}
            
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-pulse text-black dark:text-white mb-4">
                  Generating system message...
                </div>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            )}
            
            {generatedContent && !isLoading && (
              <MarkdownRenderer>{generatedContent}</MarkdownRenderer>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default KeyboardMultipleChoiceInput;