"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAgentFormStore } from "@/lib/agent-store";
import { Check } from "lucide-react";

interface ColorSelectionInputProps {
  questionId: string;
  options: string[]; // Array of color hex codes
}

export const ColorSelectionInput: React.FC<ColorSelectionInputProps> = ({
  questionId,
  options,
}) => {
  const { setResponse, getCurrentResponse } = useAgentFormStore();
  const currentResponse = getCurrentResponse();
  const selectedColor = currentResponse?.answer as string || "";

  const handleSelect = (color: string) => {
    setResponse(questionId, color);
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <div className="w-full">
      <motion.div
        className="w-full"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
          {options.map((color) => (
            <motion.div
              key={color}
              variants={item}
              className="flex flex-col items-center"
            >
              <motion.div
                onClick={() => handleSelect(color)}
                className={`w-16 h-16 rounded-full cursor-pointer flex items-center justify-center transition-all ${
                  selectedColor === color
                    ? "ring-4 ring-black dark:ring-white"
                    : ""
                }`}
                style={{ backgroundColor: color }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {selectedColor === color && (
                  <Check 
                    className="h-6 w-6" 
                    color={isLightColor(color) ? "#000000" : "#ffffff"} 
                  />
                )}
              </motion.div>
              <div className="mt-2 text-xs text-center text-black/70 dark:text-white/70">
                {color}
              </div>
            </motion.div>
          ))}
        </div>

        {selectedColor && (
          <motion.div
            className="w-full p-6 rounded-lg mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ backgroundColor: selectedColor }}
          >
            <p 
              className="text-center font-medium text-lg"
              style={{ color: isLightColor(selectedColor) ? "#000000" : "#ffffff" }}
            >
              Preview Text
            </p>
          </motion.div>
        )}
        
        <motion.div
          className="mt-2 text-xs text-black/60 dark:text-white/60 flex items-center justify-center"
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

// Helper function to determine if a color is light or dark
function isLightColor(color: string): boolean {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if light, false if dark
  return luminance > 0.5;
}

export default ColorSelectionInput;
