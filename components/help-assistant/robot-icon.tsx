"use client";

import * as React from "react";

interface RobotIconProps {
  className?: string;
  isHovered?: boolean;
  isThinking?: boolean;
  isOpen?: boolean;
  size?: number;
}

/**
 * Modern Interactive Animated Robot Icon with eye blinks, antenna pulse, and 3D head tilt reactions on hover.
 */
export function RobotIcon({
  className = "",
  isHovered = false,
  isThinking = false,
  isOpen = false,
  size = 36,
}: RobotIconProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center transition-all duration-300 transform ${
        isHovered ? "scale-110 -translate-y-0.5" : "scale-100"
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="botHeadGrad" x1="8" y1="12" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1B3B5F" />
            <stop offset="1" stopColor="#0F243A" />
          </linearGradient>

          <linearGradient id="botVisorGrad" x1="12" y1="18" x2="36" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0B192C" />
            <stop offset="1" stopColor="#16324F" />
          </linearGradient>

          <linearGradient id="tealGlow" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#2E9E96" />
            <stop offset="1" stopColor="#167C80" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="eyeGlowFilter" x="-4" y="-4" width="20" height="20" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="antennaGlow" x="-6" y="-6" width="24" height="24" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Antenna Stem */}
        <line
          x1="24"
          y1="12"
          x2="24"
          y2="6"
          stroke="#4EA8DE"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="transition-colors duration-300"
        />

        {/* Antenna Orb / Radar Ring */}
        <circle
          cx="24"
          cy="4"
          r={isHovered || isThinking ? "4" : "3"}
          fill={isHovered ? "#2E9E96" : "#4EA8DE"}
          filter="url(#antennaGlow)"
          className={`transition-all duration-300 ${
            isHovered || isThinking ? "animate-pulse fill-teal" : ""
          }`}
        />
        {(isHovered || isThinking) && (
          <circle
            cx="24"
            cy="4"
            r="7"
            stroke="#2E9E96"
            strokeWidth="1"
            opacity="0.6"
            className="animate-ping origin-center"
          />
        )}

        {/* Headphones / Side Ears */}
        <rect
          x="5"
          y="20"
          width="4"
          height="12"
          rx="2"
          fill={isHovered ? "#2E9E96" : "#167C80"}
          className="transition-colors duration-300"
        />
        <rect
          x="39"
          y="20"
          width="4"
          height="12"
          rx="2"
          fill={isHovered ? "#2E9E96" : "#167C80"}
          className="transition-colors duration-300"
        />

        {/* Main Robot Head */}
        <rect
          x="8"
          y="11"
          width="32"
          height="28"
          rx="10"
          fill="url(#botHeadGrad)"
          stroke={isHovered ? "#2E9E96" : "#2E4765"}
          strokeWidth="2"
          className={`transition-all duration-300 ${
            isHovered ? "rotate-2 translate-y-[-1px]" : ""
          } origin-bottom`}
        />

        {/* Visor Screen */}
        <rect
          x="12"
          y="17"
          width="24"
          height="15"
          rx="6"
          fill="url(#botVisorGrad)"
          stroke="#167C80"
          strokeWidth="1.2"
        />

        {/* Robot Eyes (Interactive Expressions) */}
        {isOpen ? (
          /* Winking / Happy Expression when chat open */
          <g>
            {/* Left Eye ^ */}
            <path
              d="M17 23 L20 20 L23 23"
              stroke="#2E9E96"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Right Eye ^ */}
            <path
              d="M25 23 L28 20 L31 23"
              stroke="#2E9E96"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ) : isHovered ? (
          /* Excited Glowing Eyes when hovered */
          <g className="animate-pulse">
            <circle cx="19" cy="23" r="3.5" fill="#2E9E96" filter="url(#eyeGlowFilter)" />
            <circle cx="19" cy="22" r="1" fill="#FFFFFF" />

            <circle cx="29" cy="23" r="3.5" fill="#2E9E96" filter="url(#eyeGlowFilter)" />
            <circle cx="29" cy="22" r="1" fill="#FFFFFF" />
          </g>
        ) : isThinking ? (
          /* Scanning Eye Motion when thinking */
          <g>
            <rect x="16" y="22" width="16" height="3" rx="1.5" fill="#2E9E96" opacity="0.4" />
            <circle cx="24" cy="23.5" r="2.5" fill="#2E9E96" className="animate-ping" />
          </g>
        ) : (
          /* Normal State Eyes with Vibrant Cyan Glow */
          <g className="animate-pulse">
            <circle cx="19" cy="23" r="3.2" fill="#00F5D4" filter="url(#eyeGlowFilter)" />
            <circle cx="19.8" cy="22" r="1" fill="#FFFFFF" />

            <circle cx="29" cy="23" r="3.2" fill="#00F5D4" filter="url(#eyeGlowFilter)" />
            <circle cx="29.8" cy="22" r="1" fill="#FFFFFF" />
          </g>
        )}

        {/* Digital Mouth / Equalizer Line */}
        <path
          d={
            isHovered
              ? "M19 28 Q24 31 29 28" // Happy Smile on Hover
              : isThinking
              ? "M20 28 H28" // Straight Scanning Mouth
              : "M20 28 Q24 30 28 28" // Slight Smile
          }
          stroke={isHovered ? "#2E9E96" : "#4EA8DE"}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-300"
        />

        {/* Cute Cheek Blush Highlights when Hovered */}
        {isHovered && (
          <>
            <circle cx="15" cy="27" r="1.5" fill="#2E9E96" opacity="0.6" />
            <circle cx="33" cy="27" r="1.5" fill="#2E9E96" opacity="0.6" />
          </>
        )}
      </svg>
    </div>
  );
}
