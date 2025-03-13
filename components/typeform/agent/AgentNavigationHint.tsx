"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Keyboard, AlertCircle } from "lucide-react";
import { useAgentFormStore } from "@/lib/agent-store";
import { useTheme } from "@/components/theme-provider";
import { toast } from "sonner";

interface AgentNavigationHintProps {
  currentIndex: number;
  totalQuestions: number;
  onNext: () => void;
  onPrevious: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
}

export const AgentNavigationHint: React.FC<AgentNavigationHintProps> = ({
  currentIndex,
  totalQuestions,
  onNext,
  onPrevious,
  isFirstQuestion,
  isLastQuestion,
}) => {
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const [enterPressed, setEnterPressed] = useState(false);
  const [escPressed, setEscPressed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showRequiredWarning, setShowRequiredWarning] = useState(false);
  
  const { questions, getCurrentResponse } = useAgentFormStore();
  const currentQuestion = questions[currentIndex];

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if the device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    if (mounted) {
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, [mounted]);

  // Show keyboard hint after a delay
  useEffect(() => {
    if (mounted && !isMobile) {
      const timer = setTimeout(() => {
        setShowKeyboardHint(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [mounted, isMobile]);

  // Handle keyboard events for visual feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        setEnterPressed(true);
        
        // Check if current question is required and has no response
        const currentResponse = getCurrentResponse();
        if (currentQuestion.required && 
            (!currentResponse || 
             !currentResponse.answer || 
             (Array.isArray(currentResponse.answer) && currentResponse.answer.length === 0))) {
          // Removed toast notification to prevent duplicates with AgentFormClone
          // The validation toast is already shown in AgentFormClone.tsx
        }
      } else if (e.key === "Escape") {
        setEscPressed(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        setEnterPressed(false);
      } else if (e.key === "Escape") {
        setEscPressed(false);
      }
    };

    // Only add keyboard listeners for non-loading screens
    if (currentQuestion.type !== 'loading' && mounted) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
    }
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isFirstQuestion, currentQuestion.type, mounted, currentQuestion.required, getCurrentResponse]);

  const handleNext = () => {
    // Don't allow navigation for loading screens
    if (currentQuestion.type === 'loading') {
      return;
    }
    
    // Check if current question is required and has no response
    const currentResponse = getCurrentResponse();
    if (currentQuestion.required && 
        (!currentResponse || 
         !currentResponse.answer || 
         (Array.isArray(currentResponse.answer) && currentResponse.answer.length === 0))) {
      // Removed toast notification to prevent duplicates with AgentFormClone
      // The validation toast is already shown in AgentFormClone.tsx
      return;
    }
    
    onNext();
  };

  // Hide navigation for welcome, completion, and loading screens
  if (isFirstQuestion || isLastQuestion || currentQuestion.type === 'loading') {
    return null;
  }

  // Calculate progress percentage (excluding welcome and completion screens)
  const progressPercentage = Math.min(((currentIndex) / (totalQuestions - 2)) * 100, 100);

  if (!mounted) {
    return null; // Don't render during SSR
  }

  return (
    <>
      {/* Top progress bar and navigation */}
      <div className="fixed top-0 left-0 right-0 overflow-x-hidden z-50" style={{ width: '100vw', maxWidth: '100%' }}>
        <div className="w-full h-1 bg-white">
          <motion.div
            className="h-full bg-black"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="flex items-center justify-end p-4">
        </div>
      </div>

      {/* Bottom keyboard hints */}
      {showKeyboardHint && !isMobile && (
        <motion.div
          className="fixed bottom-8 left-0 right-0 flex justify-center items-center z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-transparent px-6 py-3 flex items-center">
            <div className="flex items-center space-x-8">
              {!isFirstQuestion && (
                <>
                  <span className="text-sm text-black dark:text-white">Previous</span>
                  <div className="relative">
                    <div 
                      className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800 dark:to-gray-200" 
                      style={{ 
                        top: '2px',
                        borderRadius: '4px',
                        opacity: escPressed ? 0 : 0.3,
                        transition: 'opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />
                    <kbd 
                      className={`px-4 py-2 text-sm font-medium relative ${
                        escPressed 
                          ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 scale-95" 
                          : "bg-white text-black dark:bg-black dark:text-white"
                      }`}
                      style={{
                        borderRadius: '4px',
                        transform: escPressed ? 'translateY(2px)' : 'translateY(0)',
                        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: escPressed ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      Esc
                    </kbd>
                  </div>
                </>
              )}
              
              <Keyboard className="w-4 h-4 text-black dark:text-white" />
              
              <div className="relative">
                <div 
                  className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800 dark:to-gray-200" 
                  style={{ 
                    top: '2px',
                    borderRadius: '4px',
                    opacity: enterPressed ? 0 : 0.3,
                    transition: 'opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
                <kbd 
                  className={`px-4 py-2 text-sm font-medium relative ${
                    enterPressed 
                      ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 scale-95" 
                      : "bg-white text-black dark:bg-black dark:text-white"
                  }`}
                  style={{
                    borderRadius: '4px',
                    transform: enterPressed ? 'translateY(2px)' : 'translateY(0)',
                    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: enterPressed ? 'none' : '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  Enter
                </kbd>
              </div>
              
              <span className="text-sm text-black dark:text-white">Next</span>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default AgentNavigationHint;
