import React from 'react';
import { motion } from 'framer-motion';
import ThemePreferences from '../../components/ui/ThemePreferences';

const SettingsPage = () => {
  return (
    <div 
      className="p-6 min-h-screen"
      style={{ background: 'linear-gradient(to bottom right, #e11d48, #9333ea)' }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ThemePreferences />
        </motion.div>

        {/* Other Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Account Settings</h2>
          {/* Add more settings here */}
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage; 