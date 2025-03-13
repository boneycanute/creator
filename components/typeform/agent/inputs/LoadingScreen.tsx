"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAgentFormStore } from "@/lib/agent-store";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  questionId: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  questionId,
}) => {
  const { goToNextQuestion, getAgentName } = useAgentFormStore();
  const agentName = getAgentName();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingSteps = [
    `Configuring knowledge base for ${agentName}...`,
    `Setting up personality...`,
    `Training ${agentName} on your requirements...`,
    `Optimizing response patterns...`,
    `Finalizing your agent...`,
  ];

  // Simulate loading process
  useEffect(() => {
    const totalDuration = 5000; // 5 seconds total
    const stepDuration = totalDuration / loadingSteps.length;
    const progressInterval = 30; // Update progress every 30ms
    const progressStep = (progressInterval / stepDuration) * 100;
    
    let currentProgress = 0;
    
    const interval = setInterval(() => {
      currentProgress += progressStep;
      setProgress(Math.min(currentProgress, 100));
      
      if (currentProgress >= 100) {
        const nextStep = currentStep + 1;
        if (nextStep < loadingSteps.length) {
          setCurrentStep(nextStep);
          currentProgress = 0;
        } else {
          clearInterval(interval);
          // Move to the next question after a short delay
          setTimeout(() => {
            goToNextQuestion();
          }, 500);
        }
      }
    }, progressInterval);
    
    return () => clearInterval(interval);
  }, [currentStep, loadingSteps.length, goToNextQuestion]);

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        className="flex flex-col items-center justify-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ 
            rotate: 360,
            transition: { 
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }
          }}
          className="mb-8"
        >
          <Loader2 className="h-16 w-16 text-black dark:text-white" />
        </motion.div>
        
        <motion.h2
          className="text-2xl font-bold mb-8 text-center text-black dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Creating your AI agent...
        </motion.h2>
        
        <motion.div
          className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="bg-black dark:bg-white h-2 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>
        
        <div className="h-8">
          {loadingSteps.map((step, index) => (
            <motion.p
              key={index}
              className="text-md text-black/80 dark:text-white/80 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: currentStep === index ? 1 : 0,
                y: currentStep === index ? 0 : 10
              }}
              transition={{ duration: 0.3 }}
            >
              {step}
            </motion.p>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
