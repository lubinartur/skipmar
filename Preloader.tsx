import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Preloader: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Hide after 2 seconds
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 500); // Wait for exit animation
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-[#0a1d37] flex items-center justify-center overflow-hidden"
        >
          {/* Animated waves background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[40%]"
              initial={{ y: 0 }}
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg
                className="w-full h-full"
                viewBox="0 0 1200 400"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0,200 Q300,150 600,200 T1200,200 L1200,400 L0,400 Z"
                  fill="rgba(56,189,248,0.15)"
                />
                <motion.path
                  d="M0,250 Q300,200 600,250 T1200,250 L1200,400 L0,400 Z"
                  fill="rgba(56,189,248,0.1)"
                  initial={{ d: "M0,250 Q300,200 600,250 T1200,250 L1200,400 L0,400 Z" }}
                  animate={{
                    d: [
                      "M0,250 Q300,200 600,250 T1200,250 L1200,400 L0,400 Z",
                      "M0,230 Q300,180 600,230 T1200,230 L1200,400 L0,400 Z",
                      "M0,250 Q300,200 600,250 T1200,250 L1200,400 L0,400 Z"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
              </svg>
            </motion.div>
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Anchor icon with animation */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Anchor */}
              <motion.svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#38bdf8]"
              >
                {/* Anchor ring */}
                <motion.circle
                  cx="40"
                  cy="20"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
                {/* Anchor shank */}
                <motion.line
                  x1="40"
                  y1="28"
                  x2="40"
                  y2="60"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />
                {/* Anchor fluke left */}
                <motion.path
                  d="M40 60 L20 75 L15 70 Z"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
                {/* Anchor fluke right */}
                <motion.path
                  d="M40 60 L60 75 L65 70 Z"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
                {/* Anchor stock (crossbar) */}
                <motion.line
                  x1="30"
                  y1="45"
                  x2="50"
                  y2="45"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.svg>

              {/* Subtle glow effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-[#38bdf8] blur-xl opacity-30"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>

            {/* Logo text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
                SKIP<span className="text-[#38bdf8]">MAR</span>
              </h1>
              <motion.p
                className="text-[10px] font-black tracking-[0.5em] uppercase text-white/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                MARITIME EXCELLENCE
              </motion.p>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex gap-2 mt-4"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#38bdf8]"
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </div>

          {/* Subtle noise overlay */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              mixBlendMode: 'overlay'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

