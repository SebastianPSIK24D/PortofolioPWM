// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { LogoutApi } from '../api/backendApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 1. Ambil token dari localStorage saat pertama kali dimuat
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      return localStorage.getItem('token');
    }
    return null;
  });

  // 2. Ambil data user dari localStorage
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('user')) {
      try {
        return JSON.parse(localStorage.getItem('user'));
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // 3. Dipanggil saat login berhasil
  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  // 4. Dipanggil saat logout
  const logout = async () => {
    try {
      await LogoutApi(token);           // cabut token di server
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Apa pun hasilnya, bersihkan sesi di browser
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  // 5. Simpan token ke localStorage setiap kali berubah
  useEffect(() => {
    if (token) localStorage.setItem('token', token);
  }, [token]);

  // 6. Simpan data user ke localStorage setiap kali berubah
  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook agar mudah dipanggil di komponen lain
export const useAuth = () => useContext(AuthContext);