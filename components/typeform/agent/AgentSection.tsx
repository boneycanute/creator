"use client";

import React, { useState, useEffect } from "react";
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

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show children after typing animation completes
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setShowChildren(true);
      }, 1000); // Adjust timing based on your typing animation duration
      return () => clearTimeout(timer);
    } else {
      setShowChildren(false);
    }
  }, [isActive]);

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
              <Typewriter text={question.text} delay={30} />
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

        {/* Input Component */}
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
      </div>
    </motion.div>
  );
};

export default AgentSection;
