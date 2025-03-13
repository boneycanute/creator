"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useAgentFormStore } from "@/lib/agent-store";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadingScreenProps {
  questionId: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = React.memo(({
  questionId,
}) => {
  const { goToNextQuestion, getAgentName } = useAgentFormStore();
  const agentName = getAgentName();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Memoize the loading steps to prevent unnecessary recalculations
  const loadingSteps = useMemo(() => [
    `Configuring knowledge base for ${agentName}...`,
    `Setting up personality...`,
    `Training ${agentName} on your requirements...`,
    `Optimizing response patterns...`,
    `Finalizing your agent...`,
  ], [agentName]);

  // Set visibility after a short delay to ensure component is fully mounted
  useEffect(() => {
    let isMounted = true;
    
    const timer = setTimeout(() => {
      if (isMounted) {
        setIsVisible(true);
      }
    }, 100);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Simulate loading process - only start when component is visible
  useEffect(() => {
    if (!isVisible) return;
    
    let isMounted = true;
    const totalDuration = 5000; // 5 seconds total
    const stepDuration = totalDuration / loadingSteps.length;
    const progressInterval = 30; // Update progress every 30ms
    const progressStep = (progressInterval / stepDuration) * 100;
    
    let currentProgress = 0;
    
    const interval = setInterval(() => {
      if (!isMounted) return;
      
      currentProgress += progressStep;
      setProgress(Math.min(currentProgress, 100));
      
      if (currentProgress >= 100) {
        const nextStep = currentStep + 1;
        if (nextStep < loadingSteps.length) {
          setCurrentStep(nextStep);
          currentProgress = 0;
        } else {
          clearInterval(interval);
          setProgress(100);
        }
      }
    }, progressInterval);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentStep, loadingSteps.length, isVisible]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative w-16 h-16 mb-6">
          <motion.div
            className="absolute inset-0 border-4 border-blue-200 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          <motion.div
            className="absolute inset-0 border-4 border-blue-500 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              clipPath: `inset(0 ${100 - progress}% 0 0)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        </div>
        
        <h3 className="text-xl font-medium mb-2 text-black dark:text-white">
          {loadingSteps[currentStep]}
        </h3>
        
        <p className="text-black/60 dark:text-white/60">
          {Math.round(progress)}% complete
        </p>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8">
        <motion.div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${progress}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
      
      {progress === 100 && (
        <div className="flex justify-center mt-6">
          <Button 
            onClick={goToNextQuestion}
            className="px-6 py-2"
            variant="default"
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
});

export default LoadingScreen;
