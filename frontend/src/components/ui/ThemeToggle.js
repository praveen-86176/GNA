import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ variant = 'floating' }) => {
  const { isDarkMode, toggleDarkMode, colorScheme } = useTheme();

  const renderIcon = () => {
    if (isDarkMode) {
      return (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    );
  };

  if (variant === 'floating') {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleDarkMode}
        className={`fixed bottom-8 right-8 p-4 rounded-full shadow-lg transition-all duration-200 z-50`}
        style={{ background: 'linear-gradient(to right, #e11d48, #9333ea)' }}
      >
        {renderIcon()}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={toggleDarkMode}
      className={`w-full p-3 rounded-xl flex items-center justify-center space-x-3 transition-all duration-200 ${colorScheme.sidebarHover}`}
    >
      {renderIcon()}
      <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
    </motion.button>
  );
};

export default ThemeToggle; 