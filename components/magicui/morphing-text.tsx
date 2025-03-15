"use client";

import React, { useCallback, useEffect, useRef, useLayoutEffect, useState } from "react";

import { cn } from "@/lib/utils";

const morphTime = 1.5;
const cooldownTime = 0.5;

const useMorphingText = (texts: string[]) => {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());

  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  const setStyles = useCallback(
    (fraction: number) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current];
      if (!current1 || !current2) return;

      current2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const invertedFraction = 1 - fraction;
      current1.style.filter = `blur(${Math.min(8 / invertedFraction - 8, 100)}px)`;
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;

      current1.textContent = texts[textIndexRef.current % texts.length];
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length];
    },
    [texts],
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;

    let fraction = morphRef.current / morphTime;

    if (fraction > 1) {
      cooldownRef.current = cooldownTime;
      fraction = 1;
    }

    setStyles(fraction);

    if (fraction === 1) {
      textIndexRef.current++;
    }
  }, [setStyles]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const [current1, current2] = [text1Ref.current, text2Ref.current];
    if (current1 && current2) {
      current2.style.filter = "none";
      current2.style.opacity = "100%";
      current1.style.filter = "none";
      current1.style.opacity = "0%";
    }
  }, []);

  useEffect(() => {
    // Reset the text index to 0 when component mounts
    textIndexRef.current = 0;
    
    // Initialize text elements with first text
    if (text1Ref.current && text2Ref.current) {
      text1Ref.current.textContent = texts[0];
      text2Ref.current.textContent = texts[1 % texts.length];
      
      // Make first text fully visible initially
      text1Ref.current.style.filter = "none";
      text1Ref.current.style.opacity = "100%";
      text2Ref.current.style.filter = "none";
      text2Ref.current.style.opacity = "0%";
    }
    
    // Small delay before starting animation to ensure proper initialization
    const startDelay = setTimeout(() => {
      let animationFrameId: number;

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const newTime = new Date();
        const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
        timeRef.current = newTime;

        cooldownRef.current -= dt;

        if (cooldownRef.current <= 0) doMorph();
        else doCooldown();
      };

      animate();
    }, 800); // Delay animation start to ensure proper rendering

    return () => {
      clearTimeout(startDelay);
    };
  }, [doMorph, doCooldown, texts]);

  return { text1Ref, text2Ref };
};

interface MorphingTextProps {
  className?: string;
  texts: string[];
}

const Texts: React.FC<Pick<MorphingTextProps, "texts">> = ({ texts }) => {
  const { text1Ref, text2Ref } = useMorphingText(texts);
  
  // Ensure immediate text setup on initial render
  // This helps prevent the wrong text from showing at the start
  useLayoutEffect(() => {
    if (text1Ref.current && text2Ref.current && texts.length > 0) {
      // Set initial texts
      text1Ref.current.textContent = texts[0];
      text2Ref.current.textContent = texts[1 % texts.length];
      
      // Make first text fully visible
      text1Ref.current.style.opacity = "100%";
      text1Ref.current.style.filter = "none";
      
      // Hide second text
      text2Ref.current.style.opacity = "0%";
      text2Ref.current.style.filter = "none";
    }
  }, [texts]);
  
  return (
    <>
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text1Ref}
      />
      <span
        className="absolute inset-x-0 top-0 m-auto inline-block w-full"
        ref={text2Ref}
      />
    </>
  );
};

const SvgFilters: React.FC = () => (
  <svg
    id="filters"
    className="fixed h-0 w-0"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <filter id="threshold">
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 255 -140"
        />
      </filter>
    </defs>
  </svg>
);

export const MorphingText: React.FC<MorphingTextProps> = ({
  texts,
  className,
}) => {
  // Start with an empty state, then fade in the first word
  const [animationState, setAnimationState] = useState<'empty' | 'fading-in' | 'morphing'>('empty');
  
  useEffect(() => {
    // First wait a moment with empty state
    const emptyTimer = setTimeout(() => {
      // Then start fading in the first word
      setAnimationState('fading-in');
      
      // After fade-in is complete, start the morphing animation
      const morphTimer = setTimeout(() => {
        setAnimationState('morphing');
      }, 1000); // Time for fade-in animation
      
      return () => clearTimeout(morphTimer);
    }, 300); // Short delay before starting fade-in
    
    return () => clearTimeout(emptyTimer);
  }, []);
  
  return (
    <div
      className={cn(
        "relative mx-auto h-16 w-full max-w-screen-md text-center font-sans text-[40pt] font-bold leading-none [filter:url(#threshold)_blur(0.6px)] md:h-24 lg:text-[6rem]",
        className,
      )}
    >
      {animationState === 'empty' ? (
        // Start with nothing visible
        <span className="absolute inset-x-0 top-0 m-auto inline-block w-full opacity-0">
          {texts[0]}
        </span>
      ) : animationState === 'fading-in' ? (
        // Fade in the first word with a nice animation
        <span 
          className="absolute inset-x-0 top-0 m-auto inline-block w-full transition-opacity duration-1000"
          style={{ 
            opacity: 1, 
            filter: 'blur(0px)',
            animation: 'fadeIn 1s ease-in-out forwards'
          }}
        >
          {texts[0]}
        </span>
      ) : (
        // Then start the morphing animation
        <Texts texts={texts} />
      )}
      <SvgFilters />
      
      {/* Add global styles for the animation */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          0% {
            opacity: 0;
            filter: blur(8px);
          }
          100% {
            opacity: 1;
            filter: blur(0px);
          }
        }
      `}} />
    </div>
  );
};
