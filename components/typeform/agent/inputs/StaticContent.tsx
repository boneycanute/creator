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
      <motion.div
        className="flex flex-col items-center justify-center text-center max-w-xl mx-auto py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >      
        
        <motion.h1
          className="text-4xl font-bold mb-4 text-black dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Build That Idea Wizard
        </motion.h1>
    
        <motion.p
          className="text-lg text-black/70 dark:text-white/70 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          I'll be helping you to create your custom AI assistant in minutes with our guided setup
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Button 
            onClick={goToNextQuestion}
            className="px-8 py-6 text-lg"
            size="lg"
          >
            Let's Get Started <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </motion.div>
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
