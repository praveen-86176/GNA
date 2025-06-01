import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ThemedInput = ({ 
  label, 
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
        <input
          className={`w-full px-4 py-3 rounded-xl border-2 ${colorScheme.inputBorder} ${colorScheme.inputBg} ${colorScheme.textPrimary} placeholder-gray-400 focus:outline-none focus:ring-2 ${colorScheme.inputFocusRing} transition-all duration-200 ${className}`}
          {...props}
        />
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

export default ThemedInput; 