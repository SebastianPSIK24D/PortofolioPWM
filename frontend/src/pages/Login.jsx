import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaArrowLeft, FaMoon, FaSun, FaShieldHalved } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LoginApi, GetPublic } from '../api/backendApi';
import { gambarUrl, PAKAI_IKON } from '../utils/tampilan';
import Alert from '../components/Alert';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { token, user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tampilPw, setTampilPw] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [profil, setProfil] = useState(null);
  const [fotoGagal, setFotoGagal] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'success', message: '' });

  // Jika sudah login, langsung alihkan ke Dashboard
  useEffect(() => {
    document.title = 'Login Admin';
    if (token && user) navigate('/dashboard');
  }, [token, user, navigate]);

  // Ambil nama dan foto pemilik untuk panel kiri (gagal pun tidak masalah)
  useEffect(() => {
    let batal = false;
    GetPublic()
      .then((res) => {
        if (!batal && res.data.status === 'success') setProfil(res.data.data.profil || null);
      })
      .catch(() => {});
    return () => { batal = true; };
  }, []);

  const tampilkanError = (message) => {
    setAlert({ show: true, type: 'error', message });
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (username.trim() === '' || password.trim() === '') {
      tampilkanError('Username dan Password tidak boleh kosong');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await LoginApi(username, password);
      if (response.data.status === 'success') {
        login(response.data.token, response.data.user);
        navigate('/dashboard');
      } else {
        tampilkanError(response.data.message);
      }
    } catch (error) {
      tampilkanError(error.response?.data?.message || 'Login gagal, periksa koneksi backend');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Peringatan Caps Lock
  const cekCaps = (e) => {
    if (e.getModifierState) setCapsOn(e.getModifierState('CapsLock'));
  };

  const nama = profil?.nama_lengkap || 'Portofolio Pribadi';
  const fotoSrc = profil?.foto && !fotoGagal ? gambarUrl(profil.foto) : null;

  return (
    <div className="auth">
      <button type="button" className="auth-theme" onClick={toggleTheme}>
        {PAKAI_IKON && (theme === 'light' ? <FaMoon size={14} /> : <FaSun size={14} />)}
        <span>{theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}</span>
      </button>

      {/* Panel merek */}
      <aside className="auth-brand">
        <div className="auth-brand-inner">
          {fotoSrc ? (
            <img className="auth-avatar" src={fotoSrc} alt={nama} onError={() => setFotoGagal(true)} />
          ) : (
            <div className="auth-avatar mono">{nama.charAt(0).toUpperCase()}</div>
          )}
          <p className="auth-eyebrow">Panel Admin</p>
          <h1>{nama}</h1>
          <p className="auth-lead">
            Kelola seluruh isi portofolio Anda dari satu tempat, lalu lihat hasilnya langsung di halaman publik.
          </p>
          <ul className="auth-points">
            <li>Biodata dan foto profil</li>
            <li>Pendidikan, pengalaman, dan keahlian</li>
            <li>Karya lengkap dengan gambar sampul</li>
            <li>CV otomatis dari data yang Anda isi</li>
          </ul>
        </div>
      </aside>

      {/* Formulir Login */}
      <div className="auth-form-side">
        <div className="auth-enter">
          <div className={`auth-card ${shake ? 'shake' : ''}`}>
            <h2>Selamat datang kembali</h2>
            <p className="auth-sub">Masuk untuk mengelola portofolio Anda.</p>

            <form onSubmit={handleLogin}>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                autoComplete="username"
              />

              <label htmlFor="password">Password</label>
              <div className="pw-wrap">
                <input
                  id="password"
                  type={tampilPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={cekCaps}
                  onKeyDown={cekCaps}
                  onBlur={() => setCapsOn(false)}
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pw-toggle"
                  aria-label={tampilPw ? 'Sembunyikan password' : 'Tampilkan password'}
                  onClick={() => setTampilPw(!tampilPw)}
                >
                  {PAKAI_IKON
                    ? (tampilPw ? <FaEyeSlash size={16} /> : <FaEye size={16} />)
                    : (tampilPw ? 'Sembunyi' : 'Lihat')}
                </button>
              </div>
              {capsOn && <p className="auth-caps">Caps Lock sedang aktif</p>}

              <button type="submit" className="auth-submit" disabled={isSubmitting}>
                {isSubmitting && <span className="spinner-sm" />}
                {isSubmitting ? 'Memproses...' : 'Masuk ke Dashboard'}
              </button>
            </form>

            <div className="auth-back">
              <Link to="/">
                {PAKAI_IKON && <FaArrowLeft size={12} />}
                <span>Kembali ke Beranda Publik</span>
              </Link>
            </div>
          </div>

          <p className="auth-foot">© {new Date().getFullYear()} {nama}</p>
        </div>
      </div>

      <Alert alert={alert} setAlert={setAlert} />
    </div>
  );
};

export default Login;