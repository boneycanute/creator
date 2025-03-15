"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Keyboard, AlertCircle, ArrowDown } from "lucide-react";
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
  const [enterMouseDown, setEnterMouseDown] = useState(false);
  const [escMouseDown, setEscMouseDown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showRequiredWarning, setShowRequiredWarning] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  
  const { questions, getCurrentResponse, resetStore } = useAgentFormStore();
  const currentQuestion = questions[currentIndex];

  const handleNext = () => {
    // Don't allow navigation for loading screens or if already navigating
    if (currentQuestion.type === 'loading' || isNavigating) {
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
    
    // Set navigating flag to prevent multiple rapid navigations
    setIsNavigating(true);
    
    // Add a small delay to allow animation to complete
    setTimeout(() => {
      onNext();
      // Reset navigating flag after a delay to prevent rapid navigation
      setTimeout(() => setIsNavigating(false), 300);
    }, 50);
  };

  const handlePrevious = () => {
    // Don't allow navigation if already navigating or on first question
    if (isNavigating || isFirstQuestion) {
      return;
    }
    
    // Set navigating flag to prevent multiple rapid navigations
    setIsNavigating(true);
    
    // Add a small delay to allow animation to complete
    setTimeout(() => {
      onPrevious();
      // Reset navigating flag after a delay to prevent rapid navigation
      setTimeout(() => setIsNavigating(false), 300);
    }, 50);
  };

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setMounted(true);
    
    // Check for mobile devices
    if (typeof window !== 'undefined') {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    }
  }, []);

  // Reset store data when on intro page
  useEffect(() => {
    if (isFirstQuestion && mounted) {
      resetStore();
    }
  }, [isFirstQuestion, mounted, resetStore]);

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
      }, isFirstQuestion ? 2000 : 3000); // Show keyboard hint faster for intro screen
      
      return () => clearTimeout(timer);
    }
  }, [mounted, isMobile, isFirstQuestion]);

  // Listen for global keyboard events
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't set state for text inputs to avoid conflicts
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable)
      ) {
        return;
      }
      
      if (e.key === "Enter" && !e.shiftKey) {
        setEnterPressed(true);
      } else if (e.key === "Escape") {
        setEscPressed(true);
      }
    };
    
    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      // Always reset pressed state on key up
      if (e.key === "Enter") {
        setEnterPressed(false);
      } else if (e.key === "Escape") {
        setEscPressed(false);
      }
      
      // Don't navigate for text inputs
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        (document.activeElement instanceof HTMLElement && document.activeElement.isContentEditable)
      ) {
        return;
      }
      
      if (e.key === "Enter") {
        handleNext();
      } else if (e.key === "Escape") {
        handlePrevious();
      }
    };

    // Only add keyboard listeners for non-loading screens
    if (currentQuestion.type !== 'loading' && mounted) {
      document.addEventListener("keydown", handleGlobalKeyDown);
      document.addEventListener("keyup", handleGlobalKeyUp);
    }
    
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
      document.removeEventListener("keyup", handleGlobalKeyUp);
    };
  }, [isFirstQuestion, currentQuestion.type, mounted, handleNext, handlePrevious]);

  // Hide navigation for completion and loading screens only
  if ((isLastQuestion && !isFirstQuestion) || currentQuestion.type === 'loading') {
    return null;
  }

  // Calculate progress percentage (excluding welcome and completion screens)
  const progressPercentage = Math.min(((currentIndex) / (totalQuestions - 2)) * 100, 100);

  if (!mounted) {
    return null; // Don't render during SSR
  }

  // Special intro screen keyboard hint
  if (isFirstQuestion) {
    return (
      <motion.div
        className="fixed bottom-12 left-0 right-0 flex justify-center items-center z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {showKeyboardHint && !isMobile && (
          <motion.div
            className="bg-transparent px-6 py-3 flex flex-col items-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="text-sm font-medium mb-3 text-black dark:text-white"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ 
                repeat: Infinity, 
                duration: 2.5, 
                ease: "easeInOut"
              }}
            >
              <span className="flex items-center">
                Press 
                <span className="mx-1">Enter</span> 
                to start
                <ArrowDown className="w-4 h-4 ml-1" />
              </span>
            </motion.div>
            <div className="flex items-center">
              <div className="relative">
                <div 
                  className="absolute inset-0 bg-gradient-to-b from-transparent to-[#ea76cb]" 
                  style={{ 
                    top: '2px',
                    borderRadius: '6px',
                    opacity: enterPressed || enterMouseDown ? 0 : 0.3,
                    transition: 'opacity 0.12s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
                <kbd 
                  className={`px-6 py-2 text-sm font-medium relative ${
                    enterPressed || enterMouseDown
                      ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 scale-95" 
                      : "bg-white text-black dark:bg-black dark:text-white"
                  }`}
                  style={{
                    borderRadius: '6px',
                    transform: enterPressed || enterMouseDown ? 'translateY(2px)' : 'translateY(0)',
                    transition: 'all 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: enterPressed || enterMouseDown ? 'none' : '0 2px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '60px',
                    cursor: 'pointer'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setEnterPressed(true);
                      e.preventDefault();
                    }
                  }}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                      setEnterPressed(false);
                      // Small delay to ensure visual feedback completes
                      setTimeout(() => handleNext(), 50);
                    }
                  }}
                  onMouseDown={() => setEnterMouseDown(true)}
                  onMouseUp={() => {
                    setEnterMouseDown(false);
                    // Small delay to ensure visual feedback completes
                    setTimeout(() => handleNext(), 50);
                  }}
                  onMouseLeave={() => setEnterMouseDown(false)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="flex items-center">
                    <span>Enter</span>
                  </span>
                </kbd>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
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
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-black dark:text-white font-medium">Previous</span>
                    <div className="relative">
                      <div 
                        className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800 dark:to-gray-200" 
                        style={{ 
                          top: '2px',
                          borderRadius: '6px',
                          opacity: escPressed ? 0 : 0.3,
                          transition: 'opacity 0.12s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      />
                      <kbd 
                        className={`px-6 py-2 text-sm font-medium relative ${
                          escPressed || escMouseDown
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 scale-95" 
                            : "bg-white text-black dark:bg-black dark:text-white"
                        }`}
                        style={{
                          borderRadius: '6px',
                          transform: (escPressed || escMouseDown) ? 'translateY(2px)' : 'translateY(0)',
                          transition: 'all 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: (escPressed || escMouseDown)
                            ? 'none' 
                            : '0 2px 0 rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(0, 0, 0, 0.1)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '60px',
                          cursor: 'pointer'
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setEscPressed(true);
                            e.preventDefault();
                          }
                        }}
                        onKeyUp={(e) => {
                          if (e.key === 'Escape') {
                            setEscPressed(false);
                            // Small delay to ensure visual feedback completes
                            setTimeout(() => handlePrevious(), 50);
                          }
                        }}
                        onMouseDown={() => setEscMouseDown(true)}
                        onMouseUp={() => {
                          setEscMouseDown(false);
                          // Small delay to ensure visual feedback completes
                          setTimeout(() => handlePrevious(), 50);
                        }}
                        onMouseLeave={() => setEscMouseDown(false)}
                        role="button"
                        tabIndex={0}
                      >
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="m15 18-6-6 6-6"/>
                          </svg>
                          <span>Esc</span>
                        </span>
                      </kbd>
                    </div>
                  </div>
                </>
              )}
              
              <Keyboard className="w-4 h-4 text-black dark:text-white" />
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div 
                    className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800 dark:to-gray-200" 
                    style={{ 
                      top: '2px',
                      borderRadius: '6px',
                      opacity: enterPressed ? 0 : 0.3,
                      transition: 'opacity 0.12s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                  <kbd 
                    className={`px-6 py-2 text-sm font-medium relative ${
                      enterPressed || enterMouseDown
                        ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 scale-95" 
                        : "bg-white text-black dark:bg-black dark:text-white"
                    }`}
                    style={{
                      borderRadius: '6px',
                      transform: (enterPressed || enterMouseDown) ? 'translateY(2px)' : 'translateY(0)',
                      transition: 'all 0.12s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: (enterPressed || enterMouseDown)
                        ? 'none' 
                        : '0 2px 0 rgba(234, 118, 203, 0.5), 0 0 0 1px rgba(234, 118, 203, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(234, 118, 203, 0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '80px',
                      cursor: 'pointer'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEnterPressed(true);
                        e.preventDefault();
                      }
                    }}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') {
                        setEnterPressed(false);
                        // Small delay to ensure visual feedback completes
                        setTimeout(() => handleNext(), 50);
                      }
                    }}
                    onMouseDown={() => setEnterMouseDown(true)}
                    onMouseUp={() => {
                      setEnterMouseDown(false);
                      // Small delay to ensure visual feedback completes
                      setTimeout(() => handleNext(), 50);
                    }}
                    onMouseLeave={() => setEnterMouseDown(false)}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="flex items-center">
                      <span>Enter</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </span>
                  </kbd>
                </div>
                <span className="text-sm text-black dark:text-white font-medium">Next</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default AgentNavigationHint;
