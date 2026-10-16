import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ nama = 'Portofolio', menu = [] }) => {
  const { token } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const [open, setOpen] = useState(false);
  const barRef = useRef(null);

  // Kunci stabil agar efek scroll tidak dibuat ulang tanpa perlu
  const kunci = menu.map((m) => m.id).join('|');

  // Scroll: gaya kaca, bilah kemajuan, dan bagian aktif
  useEffect(() => {
    const ids = kunci ? kunci.split('|') : [];
    let ticking = false;

    const hitung = () => {
      const y = window.scrollY;
      const tinggi = document.documentElement.scrollHeight - window.innerHeight;

      setScrolled(y > 30);

      // Bilah kemajuan diubah langsung lewat ref agar tidak merender ulang
      if (barRef.current) {
        const persen = tinggi > 0 ? Math.min(y / tinggi, 1) : 0;
        barRef.current.style.transform = `scaleX(${persen})`;
      }

      // Bagian aktif: bagian terakhir yang batas atasnya sudah lewat 140px
      let aktif = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) aktif = id;
      }
      // Di dasar halaman, bagian terakhir dianggap aktif
      if (ids.length && tinggi > 0 && y >= tinggi - 4) aktif = ids[ids.length - 1];
      setActive(aktif);

      // Menu ponsel tertutup otomatis saat layar melebar
      if (window.innerWidth > 760) setOpen(false);

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(hitung);
      }
    };

    hitung();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [kunci]);

  // Tombol Escape menutup menu ponsel
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const tutup = () => setOpen(false);
  const cta = token
    ? { to: '/dashboard', teks: 'Dashboard' }
    : { to: '/login', teks: 'Login Admin' };

  return (
    <>
      {open && <div className="topbar-overlay" onClick={tutup} />}

      <header className={`topbar ${scrolled ? 'scrolled' : ''} ${open ? 'open' : ''}`}>
        <div className="topbar-progress" ref={barRef} />

        <div className="topbar-shell">
          <a href="#atas" className="topbar-brand" onClick={tutup}>
            <span className="topbar-name">SEBASTIAN</span>
          </a>

          <nav className="topbar-links" aria-label="Navigasi utama">
            {menu.map((m) => (
              <a key={m.id} href={`#${m.id}`} className={active === m.id ? 'active' : ''}>
                {m.label}
              </a>
            ))}
          </nav>

          <div className="topbar-actions">
            <button
              type="button"
              className="theme-switch"
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label="Mode gelap"
              title={theme === 'dark' ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
              onClick={toggleTheme}
            >
              <span className="switch-knob" />
            </button>

            <Link to={cta.to} className="topbar-cta">{cta.teks}</Link>

            <button
              type="button"
              className="topbar-burger"
              aria-label={open ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Panel menu untuk layar ponsel */}
        <div className="topbar-panel">
          {menu.map((m) => (
            <a key={m.id} href={`#${m.id}`} className={active === m.id ? 'active' : ''} onClick={tutup}>
              {m.label}
            </a>
          ))}
          <Link to={cta.to} className="topbar-cta panel-cta" onClick={tutup}>{cta.teks}</Link>
        </div>
      </header>
    </>
  );
};

export default Navbar;