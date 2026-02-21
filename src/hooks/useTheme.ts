import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<string>(() => {
    try {
      return localStorage.getItem('sz_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });
  
  const isDark = theme === 'dark';
  
  // Detectar modo del sistema
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  useEffect(() => {
    try {
      localStorage.setItem('sz_theme', theme);
    } catch {}
  }, [theme]);
  
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
  
  return {
    theme,
    setTheme,
    isDark,
    systemPrefersDark,
    toggleTheme
  };
};














