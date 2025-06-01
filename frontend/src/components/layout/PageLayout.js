import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import Navigation from './Navigation';

const PageLayout = ({ children }) => {
  const { colorScheme, isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen relative overflow-hidden`}
      style={{ background: 'linear-gradient(to right, #e11d48, #9333ea)' }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-rose-200/20 to-purple-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        {/* Animated grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-rose-200/5 via-purple-200/5 to-pink-200/5"
            animate={{
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Floating particles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-rose-200/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Side line */}
      <div className="fixed left-0 top-0 h-full w-1 bg-gradient-to-b from-rose-200 via-purple-200 to-pink-200"></div>

      {/* Navigation */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-20">
        <Navigation />
      </div>

      {/* Content */}
      <div className="relative z-10 pl-32">
        {children}
      </div>
    </div>
  );
};

export default PageLayout; 