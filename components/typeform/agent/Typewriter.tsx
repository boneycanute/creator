"use client";

import React, { useState, useEffect } from "react";

interface TypewriterProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  delay = 30,
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    setDisplayText("");
    setIsComplete(false);

    // Skip typing for static content or very long text
    if (text.length > 100) {
      setDisplayText(text);
      setIsComplete(true);
      if (onComplete) onComplete();
      return;
    }

    const typingInterval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsComplete(true);
        if (onComplete) onComplete();
      }
    }, delay);

    return () => clearInterval(typingInterval);
  }, [text, delay, onComplete]);

  return (
    <>
      {displayText}
      {!isComplete && (
        <span className="inline-block w-1 h-6 ml-1 bg-black dark:bg-white animate-blink"></span>
      )}
    </>
  );
};

export default Typewriter;
