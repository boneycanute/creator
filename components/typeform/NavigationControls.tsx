"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoveRight, MoveLeft, Send } from "lucide-react";
import { useFormStore } from "@/lib/store";

interface NavigationControlsProps {
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  isFirstQuestion,
  isLastQuestion,
  onNext,
  onPrevious,
}) => {
  const [isNextAnimating, setIsNextAnimating] = useState(false);
  const [isPrevAnimating, setIsPrevAnimating] = useState(false);
  
  const handleNext = () => {
    setIsNextAnimating(true);
    setTimeout(() => {
      onNext();
      setIsNextAnimating(false);
    }, 300);
  };
  
  const handlePrevious = () => {
    setIsPrevAnimating(true);
    setTimeout(() => {
      onPrevious();
      setIsPrevAnimating(false);
    }, 300);
  };

  return (
    <motion.div
      className="flex justify-between items-center w-full mt-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {!isFirstQuestion ? (
        <motion.div
          onClick={handlePrevious}
          className="flex items-center justify-center p-3 cursor-pointer text-black dark:text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={isPrevAnimating ? { 
            x: -20, 
            opacity: 0,
            transition: { duration: 0.3 }
          } : { 
            x: 0, 
            opacity: 1,
            transition: { duration: 0.3 }
          }}
        >
          <MoveLeft className="h-5 w-5" />
        </motion.div>
      ) : (
        <div></div> // Empty div to maintain layout
      )}

      <div></div> {/* Empty middle section */}

      <motion.div
        onClick={handleNext}
        className="flex items-center justify-center p-3 cursor-pointer text-black dark:text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isNextAnimating ? { 
          x: 20, 
          opacity: 0,
          transition: { duration: 0.3 }
        } : { 
          x: 0, 
          opacity: 1,
          transition: { duration: 0.3 }
        }}
      >
        {isLastQuestion ? (
          <Send className="h-5 w-5" />
        ) : (
          <MoveRight className="h-5 w-5" />
        )}
      </motion.div>
    </motion.div>
  );
};
