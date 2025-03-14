"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useAgentFormStore } from "@/lib/agent-store";
import { Bot, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
interface StaticContentProps {
  questionId: string;
  isWelcome?: boolean;
  isCompletion?: boolean;
}

export const StaticContent: React.FC<StaticContentProps> = React.memo(({
  questionId,
  isWelcome = false,
  isCompletion = false,
}) => {
  const [mounted, setMounted] = useState(false);
  const { goToNextQuestion, getAllResponses } = useAgentFormStore();

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    let isMounted = true;
    
    // Use requestAnimationFrame for smoother mounting
    requestAnimationFrame(() => {
      if (isMounted) {
        setMounted(true);
      }
    });
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Get a summary of all responses for the completion screen
  const getSummary = useCallback(() => {
    const responses = getAllResponses();
    const summary = {
      agentName: "",
      purpose: "",
      targetUsers: "",
      style: "",
      color: "",
      plan: "",
      files: [] as string[],
    };

    responses.forEach((response) => {
      switch (response.questionId) {
        case "agentName":
          summary.agentName = response.answer as string;
          break;
        case "agentPurpose":
          summary.purpose = response.answer as string;
          break;
        case "targetUsers":
          summary.targetUsers = response.answer as string;
          break;
        case "promptStyle":
          summary.style = response.answer as string;
          break;
        case "themeColor":
          summary.color = response.answer as string;
          break;
        case "pricingPlan":
          summary.plan = response.answer as string;
          break;
        case "knowledgeFiles":
          summary.files = response.answer as string[];
          break;
      }
    });
    
    return summary;
  }, [getAllResponses]);

  // Memoize the summary to prevent recalculation on each render
  const summary = useMemo(() => isCompletion ? getSummary() : null, [isCompletion, getSummary]);

  if (!mounted) {
    return <div className="h-64"></div>; // Placeholder during SSR
  }

  if (isWelcome) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="max-w-md">
          <h2 className="text-xl md:text-2xl font-light text-center mb-12 text-gray-800">
            Ready to <span className="text-[#ea76cb] font-normal">build that idea</span>
          </h2>
          
          <div className="flex justify-center">
            {/* Realistic Keyboard Enter Key */}
            <button
              onClick={goToNextQuestion}
              className="group relative bg-white border border-gray-300 rounded-md w-32 h-14
                         shadow transition-all duration-150
                         hover:shadow-md active:translate-y-[1px] active:shadow-inner
                         focus:outline-none focus:ring-2 focus:ring-[#ea76cb] focus:ring-opacity-40"
              aria-label="Press Enter to start"
            >
              {/* Top layer with gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 rounded-md"></div>
              
              {/* Content layer */}
              <div className="relative flex flex-col items-center justify-center h-full">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">enter</span>
                  <svg 
                    viewBox="0 0 24 24"
                    width="18" 
                    height="18" 
                    fill="none"
                    className="text-[#ea76cb]"
                  >
                    <path 
                      d="M20 5H8v4H4v10h12v-4h4V5zm-4 11H6V11h10v5zm2-5h-4V7h4v4z" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                
                {/* Subtle click instruction */}
                <span className="text-[10px] text-gray-400 mt-1">press to start</span>
              </div>
              
              {/* Key shadow effects */}
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#ea76cb] opacity-0 group-hover:opacity-100 group-active:opacity-80 transition-opacity"></div>
              
              {/* Side highlight */}
              <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-white opacity-80"></div>
              
              {/* Bottom shadow */}
              <div className="absolute inset-x-0 bottom-[-1px] h-[1px] bg-gray-400 opacity-20"></div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCompletion && summary) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center text-center max-w-xl mx-auto py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mb-8 p-4 bg-green-500 rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <Check className="h-16 w-16 text-white" />
        </motion.div>
        
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {summary.agentName} is Ready!
        </motion.h1>
        
        <motion.p
          className="text-lg text-black/70 dark:text-white/70 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          Your AI assistant has been created successfully. Here's a summary of what you've set up:
        </motion.p>
        
        <motion.div
          className="bg-black/5 dark:bg-white/10 rounded-lg p-6 mb-8 w-full text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h3 className="font-semibold text-black dark:text-white">Name</h3>
              <p className="text-black/70 dark:text-white/70">{summary.agentName}</p>
            </div>
            <div>
              <h3 className="font-semibold text-black dark:text-white">Purpose</h3>
              <p className="text-black/70 dark:text-white/70">{summary.purpose}</p>
            </div>
            <div>
              <h3 className="font-semibold text-black dark:text-white">Target Users</h3>
              <p className="text-black/70 dark:text-white/70">{summary.targetUsers}</p>
            </div>
            <div>
              <h3 className="font-semibold text-black dark:text-white">Conversational Style</h3>
              <p className="text-black/70 dark:text-white/70">{summary.style}</p>
            </div>
            {summary.color && (
              <div>
                <h3 className="font-semibold text-black dark:text-white">Theme Color</h3>
                <div className="flex items-center">
                  <div 
                    className="w-6 h-6 rounded-full mr-2" 
                    style={{ backgroundColor: summary.color }}
                  ></div>
                  <p className="text-black/70 dark:text-white/70">{summary.color}</p>
                </div>
              </div>
            )}
            {summary.plan && (
              <div>
                <h3 className="font-semibold text-black dark:text-white">Pricing Plan</h3>
                <p className="text-black/70 dark:text-white/70">{summary.plan}</p>
              </div>
            )}
            {summary.files && summary.files.length > 0 && (
              <div>
                <h3 className="font-semibold text-black dark:text-white">Knowledge Files</h3>
                <p className="text-black/70 dark:text-white/70">{summary.files.length} file(s) uploaded</p>
              </div>
            )}
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Button 
            onClick={() => window.location.href = "/dashboard"}
            className="px-8 py-6 text-lg"
            size="lg"
          >
            Go to Dashboard <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  // Default return for any other static content
  return (
    <div className="py-8">
      <p className="text-lg text-black/70 dark:text-white/70">
        {questionId}
      </p>
    </div>
  );
});

export default StaticContent;
