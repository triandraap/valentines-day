"use client";

import { motion } from "framer-motion";

function getStarsConfig() {
  return Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 3,
  }));
}

const STARS_CONFIG = getStarsConfig();

export default function MoonBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-linear-to-b from-[#0a0e27] via-[#1a1132] to-[#2d1b3d]">
      
      {/* Moon */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2">
        <div className="relative w-40 h-40 rounded-full bg-white shadow-[0_0_80px_30px_rgba(255,255,255,0.3)]">
          <div className="absolute inset-0 rounded-full bg-linear-to-br from-white via-gray-100 to-gray-300 opacity-90" />
        </div>
      </div>

      {/* Stars */}
      {STARS_CONFIG.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
          }}
        />
      ))}
    </div>
  );
}