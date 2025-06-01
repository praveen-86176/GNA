import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// Define default color schemes if they are not already
export const defaultColorSchemes = {
  light: {
    from: 'from-rose-100',
    to: 'to-purple-100',
    hoverFrom: 'hover:from-rose-200',
    hoverTo: 'hover:to-purple-200',
    border: 'border-rose-200',
    focus: 'focus:ring-rose-400',
    text: 'text-rose-700',
    bg: 'bg-rose-50',
    shadow: 'shadow-rose-100/50',
    gradient: 'bg-gradient-to-r from-rose-200/30 to-purple-200/30',
    cardBg: 'bg-white/95',
    backdropBlur: 'backdrop-blur-sm',
    buttonGradient: 'bg-gradient-to-r from-rose-400 to-purple-500',
    buttonHoverGradient: 'hover:from-rose-500 hover:to-purple-600',
    inputBorder: 'border-rose-200',
    inputFocus: 'focus:border-rose-400 focus:ring-rose-400',
    tableHeader: 'bg-rose-50',
    tableRow: 'hover:bg-rose-50/50',
    badge: 'bg-rose-100 text-rose-700',
    link: 'text-rose-600 hover:text-rose-700',
    success: 'text-emerald-600',
    error: 'text-rose-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
    sidebarBg: 'bg-gradient-to-b from-rose-50 to-purple-50',
    sidebarBorder: 'border-r-2 border-rose-200',
    sidebarHover: 'hover:bg-rose-100/50',
    sidebarActive: 'bg-rose-100 text-rose-700',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    bgPrimary: 'bg-white',
    bgSecondary: 'bg-gray-50'
  },
  dark: {
    from: 'from-rose-900',
    to: 'to-purple-900',
    hoverFrom: 'hover:from-rose-800',
    hoverTo: 'hover:to-purple-800',
    border: 'border-rose-800',
    focus: 'focus:ring-rose-500',
    text: 'text-rose-300',
    bg: 'bg-gray-900',
    shadow: 'shadow-rose-900/50',
    gradient: 'bg-gradient-to-r from-rose-900/30 to-purple-900/30',
    cardBg: 'bg-gray-800/95',
    backdropBlur: 'backdrop-blur-sm',
    buttonGradient: 'bg-gradient-to-r from-rose-600 to-purple-600',
    buttonHoverGradient: 'hover:from-rose-500 hover:to-purple-500',
    inputBorder: 'border-rose-800',
    inputFocus: 'focus:border-rose-500 focus:ring-rose-500',
    tableHeader: 'bg-gray-800',
    tableRow: 'hover:hover:bg-gray-700/50',
    badge: 'bg-rose-900 text-rose-300',
    link: 'text-rose-400 hover:text-rose-300',
    success: 'text-emerald-400',
    error: 'text-rose-400',
    warning: 'text-amber-400',
    info: 'text-blue-400',
    sidebarBg: 'bg-gradient-to-b from-gray-900 to-gray-800',
    sidebarBorder: 'border-r-2 border-rose-800',
    sidebarHover: 'hover:bg-gray-800/50',
    sidebarActive: 'bg-gray-800 text-rose-300',
    textPrimary: 'text-gray-100',
    textSecondary: 'text-gray-400',
    bgPrimary: 'bg-gray-900',
    bgSecondary: 'bg-gray-800'
  }
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem('themeMode');
    if (savedTheme) {
      return savedTheme;
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'system';
    } else {
      return 'light';
    }
  });

  const [colorScheme, setColorScheme] = useState(() => {
    const savedScheme = localStorage.getItem('colorScheme');
    return savedScheme ? JSON.parse(savedScheme) : {
      primary: 'from-rose-500 to-pink-500',
      secondary: 'from-rose-400 to-pink-400',
      accent: 'from-rose-300 to-pink-300'
    };
  });

  // Determine the actual applied dark mode state
  const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const isSystemPreference = themeMode === 'system';

  // Effect to apply the 'dark' class to the document element
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, themeMode]);

  // Effect to listen for system theme changes if system preference is active
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (themeMode === 'system') {
        // Update isDarkMode based on system preference immediately
        if (mediaQuery.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // Initial check in case component mounts after system preference is set
    handleChange();

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]); // Re-run effect if themeMode changes

  useEffect(() => {
    localStorage.setItem('colorScheme', JSON.stringify(colorScheme));
  }, [colorScheme]);

  // Function to directly set the theme mode (light, dark, or system)
  const setTheme = (mode) => {
    setThemeMode(mode);
  };

  const toggleDarkMode = () => {
    setThemeMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = {
    isDarkMode,
    isSystemPreference,
    setTheme, // Now included
    toggleDarkMode,
    colorScheme,
    setColorScheme,
    // Provide theme-specific color classes
    colors: isDarkMode ? defaultColorSchemes.dark : defaultColorSchemes.light,
    // Legacy/specific classes for backward compatibility or specific use cases
    buttonGradient: `bg-gradient-to-r ${colorScheme.primary}`,
    buttonHoverGradient: 'hover:from-rose-600 hover:to-pink-600',
    sidebarBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    sidebarBorder: isDarkMode ? 'border-r border-gray-700' : 'border-r border-gray-200',
    sidebarActive: isDarkMode ? 'bg-gray-700 text-white' : 'bg-rose-50 text-rose-600',
    sidebarHover: isDarkMode ? 'hover:bg-gray-700 hover:text-white' : 'hover:bg-rose-50 hover:text-rose-600'
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext; 