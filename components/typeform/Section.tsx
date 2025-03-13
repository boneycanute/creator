"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Question } from "@/lib/store";

interface SectionProps {
  question: Question;
  isActive: boolean;
  direction: number; // 1 for forward, -1 for backward
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({
  question,
  isActive,
  direction,
  children,
}) => {
  // State for typing animation
  const [displayText, setDisplayText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  // Animation variants for the section
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  // Typing animation effect
  useEffect(() => {
    if (isActive) {
      setDisplayText("");
      setIsTypingComplete(false);
      
      const text = question.text;
      let currentIndex = 0;
      
      // Fast typing animation (30ms per character)
      const typingInterval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.substring(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTypingComplete(true);
        }
      }, 30);
      
      return () => clearInterval(typingInterval);
    }
  }, [isActive, question.text]);

  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      {isActive && (
        <motion.div
          className="absolute w-full max-w-xl"
          key={question.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="flex flex-col w-full">
            <motion.h2
              className="text-2xl md:text-3xl font-bold mb-6 text-black dark:text-white text-left"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {displayText}
              {!isTypingComplete && (
                <span className="inline-block w-1 h-6 ml-1 bg-black dark:bg-white animate-blink"></span>
              )}
            </motion.h2>
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isTypingComplete ? 1 : 0, y: isTypingComplete ? 0 : 10 }}
              transition={{ delay: 0.1 }}
            >
              {children}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
