import React, { createContext, useContext, useEffect } from 'react';
import type { AIExecutive } from '@/types';

interface ThemeContextType {
  isDark: boolean;
  executives: Record<string, AIExecutive>;
}

import { getExecutiveMap } from '@/config/executives';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const executivesData: Record<string, AIExecutive> = getExecutiveMap();

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // OS is dark mode only
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    
    // Add visual theme variables/classes to document body
    document.body.className = 'bg-black text-zinc-100 font-sans selection:bg-white/10 selection:text-white';
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark: true, executives: executivesData }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
