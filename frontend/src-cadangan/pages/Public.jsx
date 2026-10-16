// frontend/src/pages/Public.jsx
import { useState, useEffect } from 'react';
import { GetPublic, BASE_URL, delay } from '../api/backendApi';
import { linkAman } from '../utils/link';
import { hueDari, domain, gayaLevel, pecahPoin } from '../utils/tampilan';
import nofoto from '../assets/nofoto.jpg';
import Loading from '../components/Loading';
import Navbar from '../components/Navbar';
import CvSection from '../components/CvSection';
import Ikon from '../components/Ikon';
import SampulKarya from '../components/SampulKarya';

// Pembungkus bagian dengan judul dan animasi muncul
const Section = ({ id, title, subtitle, tone = 'plain', children }) => (
  <section className={`section band band-${tone}`} id={id}>
    <div className="container reveal">
      <div className="section-head">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </div>
  </section>
);

const Public = () => {

  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Ambil data publik
  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setLoading(true);
        const [response] = await Promise.all([GetPublic(), delay(250)]);
        if (response.data.status === 'success') {
          setPortfolioData(response.data.data);
        } else {
          setError('Gagal memuat data portofolio');
        }
      } catch (err) {
        console.error(err);
        setError('Tidak dapat terhubung ke server backend');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, []);

  // 2. Judul tab mengikuti nama pemilik
  useEffect(() => {
    const nama = portfolioData?.profil?.nama_lengkap;
    document.title = nama ? `Portofolio ${nama}` : 'Portofolio Pribadi';
  }, [portfolioData]);

  // 3. Animasi muncul saat bagian masuk layar
  useEffect(() => {
    if (loading || error) return;
    const els = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('show'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('show');
            observer.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, error, portfolioData]);

  if (loading) return <Loading type="fixed" title="Memuat Portofolio..." />;

  if (error) {
    return (
      <div className="container" style={{ maxWidth: 520, paddingTop: 80 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h2 style={{ margin: '8px 0' }}>Terjadi Kesalahan</h2>
          <p style={{ color: '#dc3545', marginBottom: 18 }}>{error}</p>
          <button className="button primary" onClick={() => window.location.reload()}>
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // 4. Data turunan
  const profil = portfolioData?.profil || {};
  const pendidikan = portfolioData?.riwayat_pendidikan || [];
  const pengalaman = portfolioData?.pengalaman || [];
  const keahlian = portfolioData?.keahlian || [];
  const kontak = portfolioData?.kontak_aktif || [];
  const karya = portfolioData?.karya_terbaik || [];

  const getFotoUrl = () => {
    if (!profil.foto) return nofoto;
    if (profil.foto.startsWith('http')) return profil.foto;
    return `${BASE_URL}/uploads/${profil.foto}`;
  };

  const nama = profil.nama_lengkap || 'Nama Lengkap';
  const adaRiwayat = pendidikan.length > 0 || pengalaman.length > 0;
  const kosongSemua = !adaRiwayat && !keahlian.length && !karya.length && !kontak.length;
  const adaCv = !kosongSemua;

  const menu = [
    { id: 'perjalanan', label: 'Perjalanan', ada: adaRiwayat },
    { id: 'keahlian', label: 'Keahlian', ada: keahlian.length > 0 },
    { id: 'karya', label: 'Karya', ada: karya.length > 0 },
    { id: 'cv', label: 'CV', ada: adaCv },
    { id: 'kontak', label: 'Kontak', ada: kontak.length > 0 },
  ].filter((m) => m.ada);

  const stats = [
    { n: pendidikan.length, label: 'Pendidikan' },
    { n: pengalaman.length, label: 'Pengalaman' },
    { n: keahlian.length, label: 'Keahlian' },
    { n: karya.length, label: 'Proyek' },
  ].filter((s) => s.n > 0);

  return (
    <div>
      {/* Navbar */}
      <Navbar nama={nama} menu={menu} />

      {/* ===== Hero ===== */}
      <section className="hero" id="atas">
        <div className="container hero-inner">
          <img
            className="hero-avatar"
            src={getFotoUrl()}
            alt={nama}
            onError={(e) => { e.target.onerror = null; e.target.src = nofoto; }}
          />
          <div className="hero-text">
            <h1 className="hero-name">{nama}</h1>
            {profil.jabatan_target && <p className="hero-role">{profil.jabatan_target}</p>}
            <p className="hero-sub">
              {profil.ringkasan || 'Selamat datang di portofolio pribadi saya. Silakan lihat perjalanan, keahlian, dan karya yang pernah saya buat.'}
            </p>

            <div className="chips">
              {profil.email && (
                <a className="chip" href={`mailto:${profil.email}`}>
                  <Ikon nama="email" ukuran={15} warna="#ffffff" />{profil.email}
                </a>
              )}
              {profil.nomor_hp && (
                <span className="chip">
                  <Ikon nama="phone" ukuran={15} warna="#ffffff" />{profil.nomor_hp}
                </span>
              )}
              {profil.lokasi && (
                <span className="chip">
                  <Ikon nama="location" ukuran={15} warna="#ffffff" />{profil.lokasi}
                </span>
              )}
            </div>

            <div className="hero-cta">
              {karya.length > 0 && <a className="btn-light" href="#karya">Lihat Karya</a>}
              {kontak.length > 0 && <a className="btn-ghost" href="#kontak">Hubungi Saya</a>}
            </div>
          </div>
        </div>
      </section>

      <main className="flow">
        {/* ===== Statistik ===== */}
        {stats.length > 0 && (
          <div className="stats reveal">
          </div>
        )}

        {kosongSemua && (
          <div className="card" style={{ textAlign: 'center', marginTop: 40 }}>
            <h3>Portofolio ini belum diisi</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>Silakan kembali lagi nanti.</p>
          </div>
        )}

        {/* ===== Perjalanan: pendidikan dan pengalaman ===== */}
        {adaRiwayat && (
          <Section id="perjalanan" tone="dots" title="Perjalanan Saya" subtitle="Pendidikan dan pengalaman yang membentuk saya">
            <div className="two-col">
              {pendidikan.length > 0 && (
                <div>
                  <h3 className="col-title">Pendidikan</h3>
                  <div className="timeline">
                    {pendidikan.map((item, idx) => (
                      <div className="timeline-item" key={idx}>
                        <span className="timeline-dot" />
                        <div className="item-card">
                          <div className="item-top">
                            <div>
                              <h4>{item.nama_institusi}</h4>
                              <p className="item-sub">{item.tingkat} • {item.jurusan}</p>
                            </div>
                            {pecahPoin(item.deskripsi).length > 0 && (
                              <ul className="poin">
                                {pecahPoin(item.deskripsi).map((p, i) => <li key={i}>{p}</li>)}
                              </ul>
                            )}
                            <span className="year-badge">{item.tahun_mulai} – {item.tahun_selesai}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pengalaman.length > 0 && (
                <div>
                  <h3 className="col-title">Pengalaman</h3>
                  <div className="timeline">
                    {pengalaman.map((item, idx) => (
                      <div className="timeline-item" key={idx}>
                        <span className="timeline-dot" />
                        <div className="item-card">
                          <div className="item-top">
                            <div>
                              <h4>{item.nama_perusahaan}</h4>
                              <p className="item-sub">{item.jabatan}</p>
                            </div>
                            <span className="year-badge">{item.tahun_mulai} – {item.tahun_selesai}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ===== Keahlian ===== */}
        {keahlian.length > 0 && (
          <Section id="keahlian" tone="soft" title="Keahlian" subtitle="Teknologi dan kemampuan yang saya kuasai">
            <div className="card-grid">
              {keahlian.map((item, idx) => (
                <div className="item-card" key={idx} style={gayaLevel(item.level)}>
                  <div className="skill-head">
                    <div className="skill-name">
                      <Ikon nama={item.nama_keahlian} ukuran={22} />
                      <h4>{item.nama_keahlian}</h4>
                    </div>
                    <span className="level-badge">{item.level}</span>
                  </div>
                  <div className="skill-bar"><span /></div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ===== Karya ===== */}
        {karya.length > 0 && (
          <Section id="karya" tone="tint" title="Karya Terbaik" subtitle="Proyek yang pernah saya kerjakan">
            <div className="card-grid">
              {karya.map((item, idx) => (
                <div className="item-card project-card" key={idx} style={{ '--hue': hueDari(item.nama_karya) }}>
                  <SampulKarya nama={item.nama_karya} gambar={item.gambar} />
                  <div className="project-body">
                    <h4>{item.nama_karya}</h4>
                    <p className="project-domain">{domain(item.url)}</p>
                    <p className="project-desc">{item.deskripsi}</p>
                    {item.url && (
                      <div className="item-actions">
                        <a className="button sm primary" href={linkAman(item.url)} target="_blank" rel="noreferrer">
                          Lihat Selengkapnya
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ===== CV ===== */}
        {adaCv && ( 
          <Section id="cv" tone="plain" title="Curriculum Vitae">
            <CvSection
              profil={profil}
              pendidikan={pendidikan}
              pengalaman={pengalaman}
              keahlian={keahlian}
              karya={karya}
              kontak={kontak}
            />
          </Section>
        )}

        {/* ===== Kontak ===== */}
        {kontak.length > 0 && (
          <Section id="kontak" tone="accent" title="Hubungi Saya" subtitle="Mari terhubung lewat platform berikut">
            <div className="contact-row">
              {kontak.map((item, idx) => (
                <a key={idx} className="contact-pill" href={linkAman(item.url)} target="_blank" rel="noreferrer">
                  <Ikon nama={item.nama_media} ukuran={20} />
                  {item.nama_media}
                </a>
              ))}
            </div>
          </Section>
        )}
      </main>

      {/* ===== Footer ===== */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} {nama}. Dibuat dengan React dan PHP.</p>
        <p style={{ marginTop: 8 }}><a href="#atas">Kembali ke atas</a></p>
      </footer>
    </div>
  );
};

export default Public;