import React from "react";

/**
 * AuthCard - Animated card flip for login/signup
 * @param {boolean} flipped - If true, show back (signup); else, show front (login)
 * @param {React.ReactNode} front - Content for the front (login)
 * @param {React.ReactNode} back - Content for the back (signup)
 */
export default function AuthCard({ flipped, front, back }): React.JSX.Element {
  return (
    <div className="w-full max-w-md mx-auto perspective-1000">
      <div
        className={`relative preserve-3d transition-transform duration-500 ${flipped ? "rotate-y-180" : ""}`}
        style={{ minHeight: 420 }}
      >
        {/* Front (Login) */}
        <div className="absolute w-full h-full backface-hidden">
          {front}
        </div>
        {/* Back (Signup) */}
        <div className="absolute w-full h-full rotate-y-180 backface-hidden">
          {back}
        </div>
      </div>
    </div>
  );
} 