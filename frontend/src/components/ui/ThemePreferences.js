import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const ThemePreferences = () => {
  const { colorScheme, setColorScheme, isDarkMode, toggleDarkMode } = useTheme();

  const colorSchemes = [
    {
      name: 'Rose',
      colors: {
        primary: 'from-rose-500 to-pink-500',
        secondary: 'from-rose-400 to-pink-400',
        accent: 'from-rose-300 to-pink-300'
      }
    },
    {
      name: 'Purple',
      colors: {
        primary: 'from-purple-500 to-indigo-500',
        secondary: 'from-purple-400 to-indigo-400',
        accent: 'from-purple-300 to-indigo-300'
      }
    },
    {
      name: 'Blue',
      colors: {
        primary: 'from-blue-500 to-cyan-500',
        secondary: 'from-blue-400 to-cyan-400',
        accent: 'from-blue-300 to-cyan-300'
      }
    },
    {
      name: 'Green',
      colors: {
        primary: 'from-green-500 to-emerald-500',
        secondary: 'from-green-400 to-emerald-400',
        accent: 'from-green-300 to-emerald-300'
      }
    }
  ];

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Theme Preferences</h2>
      
      {/* Color Scheme Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Color Scheme</h3>
        <div className="grid grid-cols-2 gap-3">
          {colorSchemes.map((scheme) => (
            <motion.button
              key={scheme.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setColorScheme(scheme.colors)}
              className={`p-3 rounded-lg border-2 ${
                colorScheme.primary === scheme.colors.primary
                  ? 'border-rose-500 dark:border-rose-400'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className={`h-8 rounded-md bg-gradient-to-r ${scheme.colors.primary}`} />
              <span className="text-sm font-medium mt-2 block text-gray-700 dark:text-gray-300">
                {scheme.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div>
          <h3 className="text-sm font-medium text-gray-800 dark:text-white">Dark Mode</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Switch between light and dark theme
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleDarkMode}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isDarkMode ? 'bg-rose-500' : 'bg-gray-200'
          }`}
        >
          <motion.span
            animate={{
              x: isDarkMode ? 24 : 0,
              backgroundColor: isDarkMode ? '#fff' : '#fff'
            }}
            className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
          />
        </motion.button>
      </div>
    </div>
  );
};

export default ThemePreferences; 