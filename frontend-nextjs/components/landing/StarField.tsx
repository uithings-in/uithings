import React from "react";

interface StarFieldProps {
  density?: "low" | "medium" | "high";
  showShootingStars?: boolean;
  className?: string;
}

export const starDots = [
  { width: 2.23, height: 2.23, left: "32.4%", top: "420px", bg: "#D1D8FF" },
  { width: 2.23, height: 2.23, left: "43.1%", top: "490px", bg: "#D1D8FF" },
  { width: 2.23, height: 2.23, left: "37.1%", top: "424px", bg: "#D1D8FF" },
  { width: 2.23, height: 2.23, left: "31.2%", top: "454px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "36.5%", top: "520px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "38.3%", top: "456px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "36.6%", top: "484px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "38.9%", top: "420px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "39.3%", top: "492px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "35.5%", top: "456px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "35.0%", top: "530px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "39.9%", top: "550px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "32.6%", top: "490px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "35.8%", top: "393px", bg: "#D1D8FF" },
  { width: 2.23, height: 2.23, left: "32.3%", top: "465px", bg: "#D1D8FF" },
  { width: 2.23, height: 2.23, left: "38.0%", top: "545px", bg: "#D1D8FF" },
  { width: 2.23, height: 2.23, left: "40.7%", top: "485px", bg: "#D1D8FF" },
  { width: 2.23, height: 2.23, left: "34.9%", top: "397px", bg: "#D1D8FF" },
  { width: 2.23, height: 2.23, left: "63.3%", top: "420px", bg: "#D1D8FF" },
  { width: 2.23, height: 2.23, left: "74.0%", top: "490px", bg: "#D1D8FF" },
  { width: 2.23, height: 2.23, left: "68.0%", top: "424px", bg: "#D1D8FF" },
  { width: 2.23, height: 2.23, left: "62.1%", top: "454px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "67.4%", top: "520px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "69.3%", top: "456px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "67.5%", top: "484px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "69.8%", top: "420px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "70.3%", top: "492px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "66.5%", top: "456px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "66.0%", top: "530px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "70.9%", top: "550px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "63.6%", top: "490px", bg: "#D1D8FF" },
  { width: 1.12, height: 1.12, left: "66.8%", top: "393px", bg: "#D1D8FF" },
  { width: 2.23, height: 2.23, left: "63.2%", top: "465px", bg: "#D1D8FF" },
  { width: 2.23, height: 2.23, left: "68.9%", top: "545px", bg: "#D1D8FF" },
  { width: 2.23, height: 2.23, left: "71.7%", top: "485px", bg: "#D1D8FF" },
  { width: 2.23, height: 2.23, left: "65.9%", top: "397px", bg: "#D1D8FF" },
  { width: 2.67, height: 2.67, left: "28.3%", top: "521px", bg: "rgba(209, 216, 255, 0.60)" },
  { width: 1.34, height: 1.34, left: "20.4%", top: "558px", bg: "rgba(209, 216, 255, 0.60)" },
  { width: 1.34, height: 1.34, left: "22.6%", top: "482px", bg: "rgba(209, 216, 255, 0.60)" },
  { width: 1.34, height: 1.34, left: "20.5%", top: "514px", bg: "rgba(209, 216, 255, 0.60)" },
  { width: 1.34, height: 1.34, left: "23.3%", top: "437px", bg: "rgba(209, 216, 255, 0.60)" },
  { width: 1.34, height: 1.34, left: "23.8%", top: "524px", bg: "rgba(209, 216, 255, 0.60)" },
  { width: 1.34, height: 1.34, left: "19.3%", top: "480px", bg: "rgba(209, 216, 255, 0.60)" },
  { width: 1.34, height: 1.34, left: "18.7%", top: "570px", bg: "rgba(209, 216, 255, 0.60)" },
  { width: 1.34, height: 1.34, left: "24.5%", top: "592px", bg: "rgba(209, 216, 255, 0.60)" },
  { width: 1.34, height: 1.34, left: "15.8%", top: "522px", bg: "rgba(209, 216, 255, 0.60)" },
  { width: 1.34, height: 1.34, left: "19.6%", top: "406px", bg: "rgba(209, 216, 255, 0.60)" },
  { width: 2.67, height: 2.67, left: "22.1%", top: "587px", bg: "rgba(209, 216, 255, 0.60)" },
  { width: 2.67, height: 2.67, left: "25.5%", top: "516px", bg: "rgba(209, 216, 255, 0.60)" },
  { width: 2.30, height: 2.30, left: "49.0%", top: "438px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 2.30, height: 2.30, left: "60.1%", top: "511px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 2.30, height: 2.30, left: "53.9%", top: "443px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 2.30, height: 2.30, left: "47.8%", top: "474px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 1.15, height: 1.15, left: "53.3%", top: "543px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 1.15, height: 1.15, left: "55.2%", top: "477px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 1.15, height: 1.15, left: "53.4%", top: "505px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 1.15, height: 1.15, left: "56.2%", top: "513px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 1.15, height: 1.15, left: "52.3%", top: "476px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 1.15, height: 1.15, left: "51.8%", top: "554px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 1.15, height: 1.15, left: "56.8%", top: "573px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 1.15, height: 1.15, left: "49.3%", top: "512px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 1.15, height: 1.15, left: "52.6%", top: "412px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 2.30, height: 2.30, left: "48.9%", top: "486px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 2.30, height: 2.30, left: "54.8%", top: "568px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 2.30, height: 2.30, left: "57.7%", top: "506px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 2.30, height: 2.30, left: "51.7%", top: "416px", bg: "rgba(209, 216, 255, 0.70)" },
  { width: 2.59, height: 2.59, left: "82.9%", top: "511px", bg: "rgba(209, 216, 255, 0.50)" },
  { width: 2.59, height: 2.59, left: "69.1%", top: "470px", bg: "rgba(209, 216, 255, 0.50)" },
  { width: 1.30, height: 1.30, left: "75.2%", top: "547px", bg: "rgba(209, 216, 255, 0.50)" },
  { width: 1.30, height: 1.30, left: "77.4%", top: "473px", bg: "rgba(209, 216, 255, 0.50)" },
  { width: 1.30, height: 1.30, left: "75.3%", top: "505px", bg: "rgba(209, 216, 255, 0.50)" },
  { width: 1.30, height: 1.30, left: "78.1%", top: "430px", bg: "rgba(209, 216, 255, 0.50)" },
  { width: 1.30, height: 1.30, left: "78.6%", top: "514px", bg: "rgba(209, 216, 255, 0.50)" },
  { width: 1.30, height: 1.30, left: "74.1%", top: "472px", bg: "rgba(209, 216, 255, 0.50)" },
  { width: 1.30, height: 1.30, left: "73.6%", top: "559px", bg: "rgba(209, 216, 255, 0.50)" },
  { width: 1.30, height: 1.30, left: "79.2%", top: "581px", bg: "rgba(209, 216, 255, 0.50)" },
  { width: 1.30, height: 1.30, left: "70.8%", top: "512px", bg: "rgba(209, 216, 255, 0.50)" },
  { width: 2.59, height: 2.59, left: "70.3%", top: "483px", bg: "rgba(209, 216, 255, 0.50)" },
  { width: 2.59, height: 2.59, left: "76.9%", top: "575px", bg: "rgba(209, 216, 255, 0.50)" },
  { width: 2.59, height: 2.59, left: "80.2%", top: "506px", bg: "rgba(209, 216, 255, 0.50)" },
];

export default function StarField({
  showShootingStars = true,
  className = "",
}: StarFieldProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Static Stars from Figma Code */}
      {starDots.map((star, idx) => (
        <div
          key={idx}
          className="absolute rounded-full"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.width}px`,
            height: `${star.height}px`,
            backgroundColor: star.bg,
            boxShadow: star.width > 2 ? "0 0 6px 1px rgba(209,216,255,0.7)" : "none",
          }}
        />
      ))}

      {/* Shooting Stars with Flares matching Figma Code */}
      {showShootingStars && (
        <>
          {/* Left Shooting Star Line */}
          <div
            className="absolute hidden sm:block opacity-90"
            style={{
              width: 170,
              height: 0,
              left: "24.6%",
              top: 360,
              transform: "rotate(61deg)",
              transformOrigin: "top left",
              outline: "1px white solid",
              outlineOffset: "-0.50px",
            }}
          />
          {/* Left Shooting Star Glowing Flare Head */}
          <div
            className="absolute hidden sm:block"
            style={{ left: "30.1%", top: 505 }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                background: "#525BE0",
                boxShadow: "0 0 20px 10px #525BE0",
                borderRadius: 9999,
                filter: "blur(5px)",
              }}
            />
            <div
              style={{
                width: 7,
                height: 7,
                position: "absolute",
                top: 1.5,
                left: 1.5,
                background: "#7D84E8",
                boxShadow: "0 0 10px #7D84E8",
                borderRadius: 9999,
                filter: "blur(2px)",
              }}
            />
            <div
              style={{
                width: 3,
                height: 3,
                position: "absolute",
                top: 3.5,
                left: 3.5,
                background: "#F7F7FD",
                borderRadius: 9999,
              }}
            />
          </div>

          {/* Right Shooting Star Line */}
          <div
            className="absolute hidden sm:block opacity-90"
            style={{
              width: 197,
              height: 0,
              left: "79.2%",
              top: 340,
              transform: "rotate(107deg)",
              transformOrigin: "top left",
              outline: "1px white solid",
              outlineOffset: "-0.50px",
            }}
          />
          {/* Right Shooting Star Glowing Flare Head */}
          <div
            className="absolute hidden sm:block"
            style={{ left: "75.2%", top: 525 }}
          >
            <div
              style={{
                width: 12,
                height: 8,
                transform: "rotate(45deg)",
                background: "#525BE0",
                boxShadow: "0 0 20px 10px #525BE0",
                borderRadius: 9999,
                filter: "blur(5px)",
              }}
            />
            <div
              style={{
                width: 10,
                height: 4,
                position: "absolute",
                top: 2,
                left: 1,
                transform: "rotate(45deg)",
                background: "#7D84E8",
                boxShadow: "0 0 10px #7D84E8",
                borderRadius: 9999,
                filter: "blur(2px)",
              }}
            />
            <div
              style={{
                width: 4,
                height: 2,
                position: "absolute",
                top: 3,
                left: 4,
                transform: "rotate(45deg)",
                background: "#F7F7FD",
                borderRadius: 9999,
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
