import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Public from './pages/Public';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Logout from './pages/Logout';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Halaman beranda publik */}
            <Route path="/" element={<Public />} />

            {/* Halaman masuk admin */}
            <Route path="/login" element={<Login />} />

            {/* Panel kontrol admin */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Proses logout */}
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;