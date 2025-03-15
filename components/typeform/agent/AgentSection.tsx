"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AgentQuestion } from "@/lib/agent-store";
import { Typewriter } from "@/components/typeform/agent/Typewriter";

interface AgentSectionProps {
  question: AgentQuestion;
  isActive: boolean;
  direction: number;
  children: React.ReactNode;
}

export const AgentSection: React.FC<AgentSectionProps> = ({
  question,
  isActive,
  direction,
  children,
}) => {
  const [mounted, setMounted] = useState(false);
  const [showChildren, setShowChildren] = useState(false);
  
  // Ref for storing whether a section was ever active
  // We'll use this to prevent re-triggering animations on re-renders
  const wasActiveRef = React.useRef(false);

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle showing children and tracking active state
  useEffect(() => {
    if (isActive) {
      wasActiveRef.current = true;
      
      // For text/paragraph inputs, show immediately to allow direct typing
      if (question.type === 'text' || question.type === 'paragraph') {
        setShowChildren(true);
      } else {
        // For other input types, wait for typing animation to complete
        const timer = setTimeout(() => {
          setShowChildren(true);
        }, 1000); // Adjust timing based on your typing animation duration
        return () => clearTimeout(timer);
      }
    } else {
      // Only reset shown state if we're navigating away
      setShowChildren(false);
    }
  }, [isActive, question.type]);

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  if (!mounted) {
    return <div className="h-64"></div>; // Placeholder during SSR
  }

  // Determine if this is a text input section that should have focus immediately
  const isTextInputSection = question.type === 'text' || question.type === 'paragraph';

  return (
    <motion.div
      className={`absolute w-full ${isActive ? "z-10" : "z-0"}`}
      custom={direction}
      variants={variants}
      initial="enter"
      animate={isActive ? "center" : "exit"}
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      <div className="w-full max-w-2xl mx-auto">
        {/* Question Text with Typing Animation */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white">
            {isActive ? (
              // Skip typewriter for static content questions (intro page)
              question.type === "static" ? (
                question.text
              ) : (
                <Typewriter text={question.text} delay={30} />
              )
            ) : (
              question.text
            )}
          </h2>
          {question.descriptions && question.descriptions.length > 0 && (
            <p className="text-lg text-black/70 dark:text-white/70">
              {question.descriptions[0]}
            </p>
          )}
        </div>

        {/* Input Component - Render immediately for text inputs */}
        {(isTextInputSection && isActive) ? (
          // For text inputs, don't animate in - show immediately
          <div className="opacity-100">
            {children}
          </div>
        ) : (
          // For other inputs, animate in after typing completes
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: showChildren ? 1 : 0,
              y: showChildren ? 0 : 20
            }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AgentSection;
