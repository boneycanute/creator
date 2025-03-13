"use client";

import React from "react";
import { motion } from "framer-motion";
import { useAgentFormStore } from "@/lib/agent-store";
import { Button } from "@/components/ui/button";
import { Sparkles, Bot, Check } from "lucide-react";

interface StaticContentProps {
  questionId: string;
  isWelcome?: boolean;
  isCompletion?: boolean;
}

export const StaticContent: React.FC<StaticContentProps> = ({
  questionId,
  isWelcome = false,
  isCompletion = false,
}) => {
  const { goToNextQuestion, getAllResponses, getAgentName } = useAgentFormStore();
  const agentName = getAgentName();
  const responses = getAllResponses();

  // Get summary of selected options for completion screen
  const getSummary = () => {
    const summary: Record<string, any> = {};
    
    responses.forEach(response => {
      switch (response.questionId) {
        case 'agentName':
          summary.name = response.answer;
          break;
        case 'agentPurpose':
          summary.purpose = response.answer;
          break;
        case 'targetUsers':
          summary.users = response.answer;
          break;
        case 'promptStyle':
          summary.style = response.answer;
          break;
        case 'pricingPlan':
          summary.plan = response.answer;
          break;
        case 'knowledgeBase':
          summary.customKnowledge = response.answer === "Yes, upload documents for specialized knowledge";
          break;
        case 'fileUpload':
          if (response.answer) {
            const files = response.answer as any[];
            summary.files = files.length;
          }
          break;
      }
    });
    
    return summary;
  };

  const summary = isCompletion ? getSummary() : null;

  if (isWelcome) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center text-center max-w-xl mx-auto py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4 text-black dark:text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Hi I'm KEN-E
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
          {agentName} is ready!
        </motion.h1>
        
        <motion.p
          className="text-lg text-black/70 dark:text-white/70 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          Your custom AI assistant has been successfully created
        </motion.p>
        
        <motion.div
          className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg w-full mb-8 text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h3 className="font-medium text-lg mb-4 text-black dark:text-white">Summary</h3>
          
          <ul className="space-y-2">
            <li className="flex items-start">
              <span className="font-medium mr-2">Name:</span> {summary.name}
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">Purpose:</span> {summary.purpose}
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">Target Users:</span> {summary.users}
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">Style:</span> {summary.style}
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">Plan:</span> {summary.plan}
            </li>
            <li className="flex items-start">
              <span className="font-medium mr-2">Custom Knowledge:</span> {summary.customKnowledge ? `Yes (${summary.files || 0} files)` : "No"}
            </li>
          </ul>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Button 
            className="px-8 py-6 text-lg"
            size="lg"
          >
            Start Conversation <Bot className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  // Default static content
  return (
    <div className="text-center p-8">
      <p className="text-lg">Content for {questionId}</p>
    </div>
  );
};

export default StaticContent;
