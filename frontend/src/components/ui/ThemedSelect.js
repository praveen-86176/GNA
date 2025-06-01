import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ThemedSelect = ({ 
  label, 
  options, 
  error, 
  className = '', 
  ...props 
}) => {
  const { colorScheme } = useTheme();

  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium ${colorScheme.textPrimary}`}>
          {label}
        </label>
      )}
      <motion.div
        className={`relative ${error ? 'animate-shake' : ''}`}
        whileFocus={{ scale: 1.01 }}
      >
        <select
          className={`w-full px-4 py-3 rounded-xl border-2 ${colorScheme.inputBorder} ${colorScheme.inputBg} ${colorScheme.textPrimary} focus:outline-none focus:ring-2 ${colorScheme.inputFocusRing} transition-all duration-200 appearance-none ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className={`${colorScheme.textPrimary} ${colorScheme.inputBg}`}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg 
            className={`w-5 h-5 ${colorScheme.textPrimary}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-6 left-0 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};

export default ThemedSelect; 