// frontend/src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

// Tema awal: pilihan tersimpan, kalau belum ada ikuti pengaturan sistem
const bacaTemaAwal = () => {
  if (typeof window === 'undefined') return 'light';
  try {
    const simpan = localStorage.getItem('theme');
    if (simpan === 'light' || simpan === 'dark') return simpan;
  } catch (e) { /* abaikan */ }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(bacaTemaAwal);

  // Hanya pilihan yang dibuat pengguna yang disimpan
  const toggleTheme = () => {
    const baru = theme === 'light' ? 'dark' : 'light';
    setTheme(baru);
    try { localStorage.setItem('theme', baru); } catch (e) { /* abaikan */ }
  };

  // Pasang atribut data-theme pada elemen <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);