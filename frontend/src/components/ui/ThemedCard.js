import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ThemedCard = ({ children, className = '', ...props }) => {
  const { colorScheme } = useTheme();

  return (
    <motion.div
      className={`${colorScheme.cardBg} ${colorScheme.backdropBlur} shadow-2xl border-2 ${colorScheme.border} rounded-2xl hover:shadow-xl transition-all duration-300 relative overflow-hidden ${className}`}
      whileHover={{ scale: 1.01 }}
      {...props}
    >
      {/* Decorative border gradient */}
      <div className={`absolute inset-0 ${colorScheme.gradient} opacity-50`}></div>
      
      {/* Glowing border effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{
          boxShadow: [
            `0 0 20px ${colorScheme.text.replace('text-', '')}40`,
            `0 0 30px ${colorScheme.text.replace('text-', '')}60`,
            `0 0 20px ${colorScheme.text.replace('text-', '')}40`
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Content */}
      <div className="relative z-10 p-6">
        {children}
      </div>
    </motion.div>
  );
};

export default ThemedCard; 