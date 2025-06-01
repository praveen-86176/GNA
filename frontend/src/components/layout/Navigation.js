import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const Navigation = () => {
  const navigate = useNavigate();
  const { colorScheme } = useTheme();

  const handleRoleSelect = (role) => {
    if (role === 'manager') {
      navigate('/manager/dashboard');
    } else if (role === 'partner') {
      navigate('/partner/dashboard');
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleRoleSelect('manager')}
        className={`w-full p-4 rounded-xl ${colorScheme.sidebarBg} ${colorScheme.sidebarBorder} ${colorScheme.sidebarHover} transition-all duration-200`}
      >
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="font-medium">Restaurant Manager</span>
        </div>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleRoleSelect('partner')}
        className={`w-full p-4 rounded-xl ${colorScheme.sidebarBg} ${colorScheme.sidebarBorder} ${colorScheme.sidebarHover} transition-all duration-200`}
      >
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="font-medium">Delivery Partner</span>
        </div>
      </motion.button>
    </div>
  );
};

export default Navigation; 