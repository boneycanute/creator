"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MoveRight, MoveLeft, Send } from "lucide-react";
import { useFormStore } from "@/lib/store";

interface NavigationHintProps {
  currentIndex: number;
  totalQuestions: number;
  onNext: () => void;
  onPrevious: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
}

export const NavigationHint: React.FC<NavigationHintProps> = ({
  currentIndex,
  totalQuestions,
  onNext,
  onPrevious,
  isFirstQuestion,
  isLastQuestion,
}) => {
  const [enterPressed, setEnterPressed] = useState(false);
  const [escPressed, setEscPressed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        setEnterPressed(true);
        handleNext();
      } else if (e.key === "Escape") {
        setEscPressed(true);
        if (!isFirstQuestion) {
          handlePrevious();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        setTimeout(() => setEnterPressed(false), 150);
      } else if (e.key === "Escape") {
        setTimeout(() => setEscPressed(false), 150);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isFirstQuestion]);

  const handleNext = () => {
    setEnterPressed(true);
    setTimeout(() => {
      onNext();
      setEnterPressed(false);
    }, 150);
  };
  
  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setEscPressed(true);
      setTimeout(() => {
        onPrevious();
        setEscPressed(false);
      }, 150);
    }
  };

  // Calculate progress percentage
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <>
      {/* Top progress bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div 
          className="h-full bg-black dark:bg-white"
          initial={{ width: `${(currentIndex / totalQuestions) * 100}%` }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Navigation hints */}
      <motion.div
        className="fixed bottom-8 left-0 right-0 flex items-center justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-center gap-16 text-sm text-black dark:text-white">
          {isMobile ? (
            // Mobile view - show buttons with text
            <div className="flex items-center justify-between gap-4">
              <motion.div
                className={`flex items-center cursor-pointer ${isFirstQuestion ? 'opacity-70' : 'opacity-100'}`}
                onClick={handlePrevious}
              >
                <motion.div
                  className={`key-container ${escPressed ? 'key-pressed' : ''} ${isFirstQuestion ? 'opacity-30' : 'opacity-100'}`}
                  animate={
                    escPressed 
                      ? { y: 2, boxShadow: "0 1px 0 0 rgba(0,0,0,0.2)", backgroundColor: "#000", color: "#fff" } 
                      : { y: 0, boxShadow: "0 4px 0 0 rgba(0,0,0,0.2)", backgroundColor: "#fff", color: "#000" }
                  }
                  transition={{ duration: 0.1 }}
                >
                  <span className="key-text">Previous</span>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="flex items-center cursor-pointer"
                onClick={handleNext}
              >
                <motion.div
                  className={`key-container ${enterPressed ? 'key-pressed' : ''}`}
                  animate={
                    enterPressed 
                      ? { y: 2, boxShadow: "0 1px 0 0 rgba(0,0,0,0.2)", backgroundColor: "#000", color: "#fff" } 
                      : { y: 0, boxShadow: "0 4px 0 0 rgba(0,0,0,0.2)", backgroundColor: "#fff", color: "#000" }
                  }
                  transition={{ duration: 0.1 }}
                >
                  <span className="key-text">{isLastQuestion ? "Submit" : "Next"}</span>
                </motion.div>
              </motion.div>
            </div>
          ) : (
            // Desktop view - show keyboard shortcuts
            <>
              <motion.div 
                className={`flex items-center cursor-pointer ${isFirstQuestion ? 'opacity-70' : 'opacity-100'}`}
                onClick={handlePrevious}
              >
                <motion.div
                  className={`key-container ${escPressed ? 'key-pressed' : ''} ${isFirstQuestion ? 'opacity-30' : 'opacity-100'}`}
                  animate={
                    escPressed 
                      ? { y: 2, boxShadow: "0 1px 0 0 rgba(0,0,0,0.2)", backgroundColor: "#000", color: "#fff" } 
                      : { y: 0, boxShadow: "0 4px 0 0 rgba(0,0,0,0.2)", backgroundColor: "#fff", color: "#000" }
                  }
                  transition={{ duration: 0.1 }}
                >
                  <kbd className="key-cap">Esc</kbd>
                </motion.div>
                <span className="ml-3">Previous</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center cursor-pointer"
                onClick={handleNext}
              >
                <motion.div
                  className={`key-container ${enterPressed ? 'key-pressed' : ''}`}
                  animate={
                    enterPressed 
                      ? { y: 2, boxShadow: "0 1px 0 0 rgba(0,0,0,0.2)", backgroundColor: "#000", color: "#fff" } 
                      : { y: 0, boxShadow: "0 4px 0 0 rgba(0,0,0,0.2)", backgroundColor: "#fff", color: "#000" }
                  }
                  transition={{ duration: 0.1 }}
                >
                  <kbd className="key-cap">Enter</kbd>
                </motion.div>
                <span className="ml-3">{isLastQuestion ? "Submit" : "Next"}</span>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
};
