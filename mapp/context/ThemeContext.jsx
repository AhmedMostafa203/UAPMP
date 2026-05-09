import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);
  const toggleDark = () => setDark(!dark);

  const colors = dark ? {
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f1f5f9',
    subText: '#94a3b8',
    border: '#334155',
  } : {
    bg: '#f0f4ff',
    card: '#ffffff',
    text: '#1e1b4b',
    subText: '#64748b',
    border: '#f0f0f0',
  };

  return (
    <ThemeContext.Provider value={{ dark, toggleDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);