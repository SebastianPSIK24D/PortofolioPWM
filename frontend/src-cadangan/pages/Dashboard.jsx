// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import {
  FaUser, FaGraduationCap, FaBriefcase, FaBolt, FaLink, FaTrophy,
  FaGlobe, FaRightFromBracket, FaMoon, FaSun, FaBars, FaXmark,
} from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GetUser, GetPublic } from '../api/backendApi';
import { gambarUrl, PAKAI_IKON } from '../utils/tampilan';

import Biodata from '../components/Biodata';
import Pendidikan from '../components/Pendidikan';
import Pengalaman from '../components/Pengalaman';
import Keahlian from '../components/Keahlian';
import Kontak from '../components/Kontak';
import Karya from '../components/Karya';
import ConfirmDialog from '../components/ConfirmDialog';

// data = nama kunci pada respons /public (untuk menghitung jumlah data)
const MENU = [
  { id: 'biodata',    label: 'Biodata',    Icon: FaUser,          Komponen: Biodata,    data: null },
  { id: 'pendidikan', label: 'Pendidikan', Icon: FaGraduationCap, Komponen: Pendidikan, data: 'riwayat_pendidikan' },
  { id: 'pengalaman', label: 'Pengalaman', Icon: FaBriefcase,     Komponen: Pengalaman, data: 'pengalaman' },
  { id: 'keahlian',   label: 'Keahlian',   Icon: FaBolt,          Komponen: Keahlian,   data: 'keahlian' },
  { id: 'kontak',     label: 'Kontak',     Icon: FaLink,          Komponen: Kontak,     data: 'kontak_aktif' },
  { id: 'karya',      label: 'Karya',      Icon: FaTrophy,        Komponen: Karya,      data: 'karya_terbaik' },
];

// Sapaan sesuai jam
const sapaan = () => {
  const jam = new Date().getHours();
  if (jam < 4) return 'Selamat malam';
  if (jam < 11) return 'Selamat pagi';
  if (jam < 15) return 'Selamat siang';
  if (jam < 19) return 'Selamat sore';
  return 'Selamat malam';
};

// Foto profil, atau huruf pertama nama bila foto tidak ada
const Avatar = ({ foto, nama, kelas }) => {
  const [gagal, setGagal] = useState(false);
  useEffect(() => { setGagal(false); }, [foto]);

  const src = gambarUrl(foto);
  if (src && !gagal) {
    return <img className={kelas} src={src} alt={nama} onError={() => setGagal(true)} />;
  }
  return <span className={`${kelas} ds-mono`}>{(nama || '?').trim().charAt(0).toUpperCase()}</span>;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { token, user, login, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Tab terakhir diingat selama sesi browser
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const t = sessionStorage.getItem('dashTab');
      return MENU.some((m) => m.id === t) ? t : 'biodata';
    } catch (e) {
      return 'biodata';
    }
  });
  const [menuBuka, setMenuBuka] = useState(false);
  const [jumlah, setJumlah] = useState({});
  const [konfirmasiKeluar, setKonfirmasiKeluar] = useState(false);
  const [keluarProses, setKeluarProses] = useState(false);

  useEffect(() => {
    document.title = 'Dashboard - Editor Portofolio';
  }, []);

  // Periksa sesi dan ambil foto profil. Token tidak berlaku (401): otomatis ke halaman login.
  useEffect(() => {
    if (!token) return;
    let batal = false;

    GetUser(token)
      .then((res) => {
        if (batal || res.data.status !== 'success') return;
        const u = res.data.user;
        login(token, { id: u.id, username: u.username, nama_lengkap: u.nama_lengkap, foto: u.foto });
      })
      .catch(async (err) => {
        if (!batal && err.response?.status === 401) {
          await logout();
          navigate('/login');
        }
      });

    return () => { batal = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Simpan tab aktif
  useEffect(() => {
    try { sessionStorage.setItem('dashTab', activeTab); } catch (e) { /* abaikan */ }
  }, [activeTab]);

  // Jumlah data untuk kartu statistik (disegarkan setiap pindah tab)
  useEffect(() => {
    let batal = false;
    GetPublic()
      .then((res) => {
        if (batal || res.data.status !== 'success') return;
        const d = res.data.data;
        const hasil = {};
        MENU.forEach((m) => { if (m.data) hasil[m.id] = (d[m.data] || []).length; });
        setJumlah(hasil);
      })
      .catch(() => {});
    return () => { batal = true; };
  }, [activeTab]);

  // Escape menutup laci menu di ponsel
  useEffect(() => {
    if (!menuBuka) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuBuka(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuBuka]);

  // Proteksi rute (setelah semua hook)
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const aktif = MENU.find((m) => m.id === activeTab) || MENU[0];
  const Aktif = aktif.Komponen;
  const nama = user?.nama_lengkap || user?.username || 'Admin';
  const namaDepan = nama.trim().split(/\s+/)[0];

  const pilih = (id) => {
    setActiveTab(id);
    setMenuBuka(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const keluar = async () => {
    if (keluarProses) return;
    setKeluarProses(true);
    await logout();
    navigate('/login');
  };

  return (
    <div className="ds">
      {menuBuka && <div className="ds-overlay" onClick={() => setMenuBuka(false)} />}

      {/* ===== Sidebar ===== */}
      <aside className={`ds-side ${menuBuka ? 'open' : ''}`}>
        <div className="ds-brand">
          <Avatar foto={user?.foto} nama={nama} kelas="ds-avatar" />
          <div className="ds-brand-text">
            <strong title={nama}>{nama}</strong>
            <span>Panel Admin</span>
          </div>
        </div>

        <p className="ds-label">Kelola</p>
        <nav className="ds-nav" aria-label="Menu dashboard">
          {MENU.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={activeTab === id ? 'active' : ''}
              aria-current={activeTab === id ? 'page' : undefined}
              onClick={() => pilih(id)}
            >
              {PAKAI_IKON && <Icon size={16} />}
              <span>{label}</span>
              {jumlah[id] !== undefined && <em className="ds-count">{jumlah[id]}</em>}
            </button>
          ))}
        </nav>

        <div className="ds-foot">
          <Link to="/" className="ds-btn">
            {PAKAI_IKON && <FaGlobe size={15} />}
            <span>Lihat Web Publik</span>
          </Link>
          <button type="button" className="ds-btn" onClick={toggleTheme}>
            {PAKAI_IKON && (theme === 'light' ? <FaMoon size={15} /> : <FaSun size={15} />)}
            <span>{theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}</span>
          </button>
          <button type="button" className="ds-btn ds-out" onClick={() => setKonfirmasiKeluar(true)}>
            {PAKAI_IKON && <FaRightFromBracket size={15} />}
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* ===== Area utama ===== */}
      <div className="ds-main">
        <header className="ds-top">
          <div className="ds-top-left">
            <button
              type="button"
              className="ds-burger"
              aria-label={menuBuka ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={menuBuka}
              onClick={() => setMenuBuka(!menuBuka)}
            >
              {PAKAI_IKON ? (menuBuka ? <FaXmark size={18} /> : <FaBars size={18} />) : <span>Menu</span>}
            </button>
            <div>
              <p className="ds-crumb">Dashboard</p>
              <h1 className="ds-title">{aktif.label}</h1>
            </div>
          </div>

          <div className="ds-user">
            <div className="ds-user-text">
              <span>{sapaan()},</span>
              <strong>{namaDepan}</strong>
            </div>
            <Avatar foto={user?.foto} nama={nama} kelas="ds-avatar sm" />
          </div>
        </header>

        <div className="ds-content">
          {/* Kartu statistik: klik untuk pindah tab */}
          <div className="ds-stats">
            {MENU.filter((m) => m.data).map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`ds-stat ${activeTab === id ? 'on' : ''}`}
                onClick={() => pilih(id)}
              >
                <b>{jumlah[id] ?? '–'}</b>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* key memicu animasi tiap ganti tab */}
          <div className="panel" key={activeTab}>
            <Aktif token={token} />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={konfirmasiKeluar}
        title="Keluar dari dashboard?"
        message="Sesi Anda akan diakhiri, dan Anda perlu login lagi untuk mengelola portofolio."
        confirmText="Ya, Keluar"
        onConfirm={keluar}
        onCancel={() => setKonfirmasiKeluar(false)}
      />
    </div>
  );
};

export default Dashboard;