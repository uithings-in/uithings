import React from "react";

interface StarFieldProps {
  density?: "low" | "medium" | "high";
  showShootingStars?: boolean;
  className?: string;
}

export default function StarField({
  showShootingStars = true,
  className = "",
}: StarFieldProps) {
  // Static predefined star positions for deterministic hydration without SSR mismatches
  const stars = [
    { top: "8%", left: "12%", size: 1.5, opacity: 0.6 },
    { top: "14%", left: "28%", size: 2, opacity: 0.8 },
    { top: "22%", left: "7%", size: 1, opacity: 0.5 },
    { top: "18%", left: "78%", size: 2, opacity: 0.75 },
    { top: "10%", left: "88%", size: 1.5, opacity: 0.6 },
    { top: "32%", left: "19%", size: 2, opacity: 0.9 },
    { top: "28%", left: "64%", size: 1, opacity: 0.4 },
    { top: "36%", left: "85%", size: 2, opacity: 0.8 },
    { top: "45%", left: "15%", size: 1.5, opacity: 0.5 },
    { top: "52%", left: "92%", size: 2, opacity: 0.7 },
    { top: "58%", left: "6%", size: 1, opacity: 0.4 },
    { top: "65%", left: "24%", size: 2, opacity: 0.85 },
    { top: "72%", left: "81%", size: 1.5, opacity: 0.6 },
    { top: "80%", left: "38%", size: 1, opacity: 0.5 },
    { top: "86%", left: "70%", size: 2, opacity: 0.9 },
    { top: "92%", left: "18%", size: 1.5, opacity: 0.6 },
    { top: "12%", left: "48%", size: 2, opacity: 0.7 },
    { top: "42%", left: "42%", size: 1, opacity: 0.5 },
    { top: "68%", left: "54%", size: 1.5, opacity: 0.65 },
    { top: "85%", left: "90%", size: 2, opacity: 0.8 },
  ];

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Static Stars */}
      {stars.map((star, idx) => (
        <div
          key={idx}
          className="absolute rounded-full bg-white transition-opacity"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            boxShadow: star.size > 1.5 ? "0 0 6px 1px rgba(255,255,255,0.7)" : "none",
          }}
        />
      ))}

      {/* Shooting Stars / Diagonal Streaks matching reference image */}
      {showShootingStars && (
        <>
          {/* Top Left Streak */}
          <div
            className="absolute -top-10 left-[18%] w-36 h-[1.5px] rotate-[-38deg] origin-left"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(124,92,255,0.6) 30%, transparent 100%)",
              boxShadow: "0 0 8px rgba(124,92,255,0.8)",
            }}
          />
          {/* Top Right Streak */}
          <div
            className="absolute top-16 right-[14%] w-48 h-[1.5px] rotate-[-42deg] origin-left"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(108,92,231,0.7) 35%, transparent 100%)",
              boxShadow: "0 0 10px rgba(108,92,231,0.9)",
            }}
          />
          {/* Mid Left Streak */}
          <div
            className="absolute top-[52%] left-[8%] w-40 h-[1.5px] rotate-[-35deg] origin-left"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.85) 0%, rgba(75,61,245,0.5) 40%, transparent 100%)",
              boxShadow: "0 0 8px rgba(75,61,245,0.7)",
            }}
          />
          {/* Lower Right Streak */}
          <div
            className="absolute bottom-[28%] right-[22%] w-32 h-[1px] rotate-[-40deg] origin-left"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(124,92,255,0.5) 35%, transparent 100%)",
              boxShadow: "0 0 6px rgba(124,92,255,0.6)",
            }}
          />
        </>
      )}
    </div>
  );
}
