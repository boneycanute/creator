"use client";

import React, { useState, useEffect, useRef, CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentQuestion } from "@/lib/agent-store";
import { Typewriter } from "@/components/typeform/agent/Typewriter";

interface AgentSectionProps {
  question: AgentQuestion;
  isActive: boolean;
  direction: number;
  children: React.ReactNode;
  useWideContainer?: boolean;
}

export const AgentSection: React.FC<AgentSectionProps> = ({
  question,
  isActive,
  direction,
  children,
  useWideContainer,
}) => {
  const [mounted, setMounted] = useState(false);
  const [showChildren, setShowChildren] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // Ref for storing whether a section was ever active
  const wasActiveRef = useRef(false);
  const initialRenderRef = useRef(true);

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset animation state when section changes active state
  useEffect(() => {
    if (isActive) {
      setAnimationComplete(false);
    }
  }, [isActive]);

  // Handle showing children and tracking active state
  useEffect(() => {
    if (isActive) {
      wasActiveRef.current = true;

      // For text/paragraph inputs, show immediately to allow direct typing
      if (question.type === "text" || question.type === "paragraph") {
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

  // Animation variants - more controlled approach
  const variants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30, duration: 0.5 },
        opacity: { duration: 0.3 },
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30, duration: 0.5 },
        opacity: { duration: 0.3 },
      },
    }),
  };

  if (!mounted) {
    return <div className="h-64">Loading...</div>; // Placeholder during SSR
  }

  // After initial render, mark it complete
  if (initialRenderRef.current) {
    initialRenderRef.current = false;
  }

  // Check if this is the welcome/intro section
  const isWelcomeSection = question.id === "welcome";

  // Determine if this is a text input section that should have focus immediately
  const isTextInputSection =
    question.type === "text" || question.type === "paragraph";

  // Fixed styles for consistent positioning
  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: "100%",
  };

  // For welcome section, render without animations to ensure immediate display
  if (isWelcomeSection && isActive) {
    return (
      <div className="absolute w-full h-full z-10" style={containerStyle}>
        <div className={`w-full px-4 max-w-2xl`}>
          {/* No typing animation for welcome section */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white">
              {question.text}
            </h2>
            {question.descriptions && question.descriptions.length > 0 && (
              <p className="text-lg text-black/70 dark:text-white/70">
                {question.descriptions[0]}
              </p>
            )}
          </div>

          {/* Immediately show children without animation */}
          <div className="opacity-100 w-full">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {isActive && (
        <motion.div
          key={question.id}
          className="absolute w-full h-full z-10"
          custom={direction}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          onAnimationComplete={() => {
            setAnimationComplete(true);
          }}
          style={containerStyle}
        >
          <div
            className={`w-full px-4 ${
              useWideContainer ? "max-w-8/12" : "max-w-6/12"
            }`}
          >
            {/* Question Text with Typing Animation */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white">
                {question.type === "static" ? (
                  question.text
                ) : (
                  <Typewriter text={question.text} delay={30} />
                )}
              </h2>
              {question.descriptions && question.descriptions.length > 0 && (
                <p className="text-lg text-black/70 dark:text-white/70">
                  {question.descriptions[0]}
                </p>
              )}
            </div>

            {/* Input Component - Render immediately for text inputs */}
            {isTextInputSection ? (
              // For text inputs, don't animate in - show immediately
              <div className="opacity-100 w-full">{children}</div>
            ) : (
              // For other inputs, animate in after typing completes
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: showChildren ? 1 : 0,
                  y: showChildren ? 0 : 20,
                }}
                transition={{ duration: 0.5 }}
              >
                {children}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AgentSection;
