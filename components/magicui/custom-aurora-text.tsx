"use client";

import type { CSSProperties } from "react";
import React, { useEffect, useId, useRef } from "react";

interface CustomAuroraTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  speed?: number; // 1 is default speed, 2 is twice as fast, 0.5 is half speed
}

export function CustomAuroraText({
  children,
  className = "",
  colors = ["#ea76cb", "#8839ef"],
  speed = 1,
}: CustomAuroraTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = React.useState(0);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const [isReady, setIsReady] = React.useState(false);
  const [textStyle, setTextStyle] = React.useState<
    Partial<CSSStyleDeclaration>
  >({});
  const maskId = useId();

  // Updated effect to compute all text styles from parent
  useEffect(() => {
    if (containerRef.current) {
      const computedStyle = window.getComputedStyle(containerRef.current);

      // Extract text-related styles
      const relevantStyles = {
        fontSize: computedStyle.fontSize,
        fontFamily: computedStyle.fontFamily,
        fontWeight: computedStyle.fontWeight,
        fontStyle: computedStyle.fontStyle,
        letterSpacing: computedStyle.letterSpacing,
        lineHeight: computedStyle.lineHeight,
        textTransform: computedStyle.textTransform,
        fontVariant: computedStyle.fontVariant,
        fontStretch: computedStyle.fontStretch,
        fontFeatureSettings: computedStyle.fontFeatureSettings,
      };

      requestAnimationFrame(() => {
        setTextStyle(relevantStyles);
      });
    }
  }, [className]);

  // Updated effect to compute font size from both inline and class styles
  useEffect(() => {
    const updateFontSize = () => {
      if (containerRef.current) {
        const computedStyle = window.getComputedStyle(containerRef.current);
        const computedFontSize = parseFloat(computedStyle.fontSize);

        requestAnimationFrame(() => {
          setFontSize(computedFontSize);
        });
      }
    };

    updateFontSize();
    window.addEventListener("resize", updateFontSize);

    return () => window.removeEventListener("resize", updateFontSize);
  }, [className]);

  // Update effect to set ready state after dimensions are computed
  useEffect(() => {
    const updateDimensions = () => {
      if (textRef.current) {
        const bbox = textRef.current.getBBox();
        setDimensions({
          width: bbox.width,
          height: bbox.height,
        });
        setIsReady(true);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, [children, fontSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    let time = 0;
    const baseSpeed = 0.008; // Original speed as base unit

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      time += baseSpeed * speed;

      // Create a linear gradient that spans the entire width
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      
      // Calculate gradient position based on time
      const pos = (time * 0.5) % 2; // Oscillate between 0 and 2
      
      // Add color stops for a smooth transition between the two colors
      gradient.addColorStop(Math.max(0, pos - 1), colors[0]);
      gradient.addColorStop(Math.min(1, pos), colors[1]);
      
      // Fill the entire canvas with the gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      requestAnimationFrame(animate);
    }
    animate();
  }, [dimensions, colors, speed]);

  return (
    <span
      ref={containerRef}
      className={`relative inline-block align-middle ${className}`}
      style={{
        width: dimensions.width || "auto",
        height: dimensions.height || "auto",
      }}
    >
      {/* Hidden text for SEO */}
      <span className="sr-only">{children}</span>

      {/* Visual placeholder while canvas loads */}
      <span
        style={{
          opacity: isReady ? 0 : 1,
          transition: "opacity 0.2s ease-in",
          position: isReady ? "absolute" : "relative",
          display: "inline-block",
          whiteSpace: "nowrap",
        }}
        aria-hidden="true"
      >
        {children}
      </span>

      <div
        className="absolute inset-0"
        style={{
          opacity: isReady ? 1 : 0,
          transition: "opacity 0.2s ease-in",
        }}
        aria-hidden="true"
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          className="absolute inset-0"
        >
          <defs>
            <clipPath id={maskId}>
              <text
                ref={textRef}
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                style={textStyle as CSSProperties}
              >
                {children}
              </text>
            </clipPath>
          </defs>
        </svg>

        <canvas
          ref={canvasRef}
          style={{
            clipPath: `url(#${maskId})`,
            WebkitClipPath: `url(#${maskId})`,
          }}
          className="h-full w-full"
        />
      </div>
    </span>
  );
}
