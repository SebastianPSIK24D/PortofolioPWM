// frontend/src/components/Ikon.jsx
import {
  FaGithub, FaGitlab, FaWhatsapp, FaLinkedin, FaInstagram, FaFacebook, FaXTwitter,
  FaYoutube, FaTiktok, FaTelegram, FaDiscord, FaBehance, FaDribbble, FaMedium,
  FaStackOverflow, FaEnvelope, FaGlobe, FaPhone, FaLocationDot,
  FaReact, FaVuejs, FaAngular, FaNodeJs, FaLaravel, FaPhp, FaPython, FaJava,
  FaHtml5, FaCss3Alt, FaJs, FaSass, FaBootstrap, FaWind, FaGitAlt, FaDocker,
  FaFigma, FaNpm, FaWordpress, FaAndroid, FaLinux, FaAws, FaDatabase,
} from 'react-icons/fa6';
import { hueDari } from '../utils/tampilan';

/*
  Daftar ikon. Urutan PENTING: yang lebih spesifik harus di atas yang umum
  (mis. 'javascript' sebelum 'java', 'github' sebelum 'git').
  kunci : kata yang dicocokkan dengan nama (huruf kecil, tanpa spasi dan tanda baca)
  warna : warna ikon. 'var(--text-primary)' dipakai untuk merek hitam
          supaya tetap terlihat di mode gelap.
*/
const DAFTAR = [
  // ----- Kontak dan media sosial -----
  { kunci: ['github'], Icon: FaGithub, warna: 'var(--text-primary)' },
  { kunci: ['gitlab'], Icon: FaGitlab, warna: '#FC6D26' },
  { kunci: ['whatsapp', 'wa'], Icon: FaWhatsapp, warna: '#25D366' },
  { kunci: ['linkedin'], Icon: FaLinkedin, warna: '#0A66C2' },
  { kunci: ['instagram', 'ig'], Icon: FaInstagram, warna: '#E4405F' },
  { kunci: ['facebook', 'fb'], Icon: FaFacebook, warna: '#1877F2' },
  { kunci: ['twitter', 'x'], Icon: FaXTwitter, warna: 'var(--text-primary)' },
  { kunci: ['youtube'], Icon: FaYoutube, warna: '#FF0000' },
  { kunci: ['tiktok'], Icon: FaTiktok, warna: 'var(--text-primary)' },
  { kunci: ['telegram'], Icon: FaTelegram, warna: '#26A5E4' },
  { kunci: ['discord'], Icon: FaDiscord, warna: '#5865F2' },
  { kunci: ['behance'], Icon: FaBehance, warna: '#1769FF' },
  { kunci: ['dribbble'], Icon: FaDribbble, warna: '#EA4C89' },
  { kunci: ['medium'], Icon: FaMedium, warna: 'var(--text-primary)' },
  { kunci: ['stackoverflow'], Icon: FaStackOverflow, warna: '#F48024' },
  { kunci: ['email', 'mail', 'gmail'], Icon: FaEnvelope, warna: '#EA4335' },
  { kunci: ['phone', 'telepon', 'telp', 'hp'], Icon: FaPhone, warna: '#16A34A' },
  { kunci: ['location', 'lokasi', 'alamat'], Icon: FaLocationDot, warna: '#DC2626' },
  { kunci: ['website', 'portfolio', 'blog', 'web', 'situs'], Icon: FaGlobe, warna: 'var(--accent-primary)' },

  // ----- Teknologi dan keahlian -----
  { kunci: ['react'], Icon: FaReact, warna: '#149ECA' },
  { kunci: ['vuejs', 'vue'], Icon: FaVuejs, warna: '#42B883' },
  { kunci: ['angular'], Icon: FaAngular, warna: '#DD0031' },
  { kunci: ['tailwind'], Icon: FaWind, warna: '#06B6D4' },
  { kunci: ['bootstrap'], Icon: FaBootstrap, warna: '#7952B3' },
  { kunci: ['sass', 'scss'], Icon: FaSass, warna: '#CC6699' },
  { kunci: ['laravel'], Icon: FaLaravel, warna: '#FF2D20' },
  { kunci: ['nodejs', 'node'], Icon: FaNodeJs, warna: '#5FA04E' },
  { kunci: ['javascript', 'js'], Icon: FaJs, warna: '#E8B900' },
  { kunci: ['python'], Icon: FaPython, warna: '#3776AB' },
  { kunci: ['java'], Icon: FaJava, warna: '#E76F00' },
  { kunci: ['php'], Icon: FaPhp, warna: '#777BB4' },
  { kunci: ['html'], Icon: FaHtml5, warna: '#E34F26' },
  { kunci: ['css'], Icon: FaCss3Alt, warna: '#1572B8' },
  { kunci: ['mysql', 'postgres', 'mongo', 'database', 'basisdata', 'sql'], Icon: FaDatabase, warna: 'var(--accent-primary)' },
  { kunci: ['docker'], Icon: FaDocker, warna: '#2496ED' },
  { kunci: ['git'], Icon: FaGitAlt, warna: '#F05032' },
  { kunci: ['figma'], Icon: FaFigma, warna: '#F24E1E' },
  { kunci: ['npm'], Icon: FaNpm, warna: '#CB3837' },
  { kunci: ['wordpress'], Icon: FaWordpress, warna: '#21759B' },
  { kunci: ['android'], Icon: FaAndroid, warna: '#3DDC84' },
  { kunci: ['linux'], Icon: FaLinux, warna: 'var(--text-primary)' },
  { kunci: ['aws'], Icon: FaAws, warna: '#FF9900' },
];

// Buang spasi dan tanda baca: "Node.js" -> "nodejs", "Twitter / X" -> "twitterx"
const rapikan = (s = '') => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

// Kata pendek harus lebih ketat agar tidak salah cocok:
// 1-2 huruf = harus sama persis, 3 huruf = awalan, 4+ huruf = terkandung
const cocok = (nama, kunci) => {
  if (kunci.length <= 2) return nama === kunci;
  if (kunci.length === 3) return nama.startsWith(kunci);
  return nama.includes(kunci);
};

const cari = (nama) => {
  const n = rapikan(nama);
  if (!n) return null;
  return DAFTAR.find((d) => d.kunci.some((k) => cocok(n, k))) || null;
};

/*
  <Ikon nama="GitHub" />                       ikon sesuai nama
  <Ikon nama="React" ukuran={22} />            atur ukuran (piksel)
  <Ikon nama="email" warna="#ffffff" />        paksa warna tertentu
*/
const Ikon = ({ nama = '', ukuran = 24, warna }) => {
  const item = cari(nama);

  if (item) {
    const { Icon } = item;
    return (
      <span className="ikon" style={{ color: warna || item.warna }} aria-hidden="true">
        <Icon size={ukuran} />
      </span>
    );
  }

  // Cadangan: monogram berwarna (huruf pertama nama)
  const huruf = (nama || '?').trim().charAt(0).toUpperCase();
  const gaya = {
    width: ukuran + 6,
    height: ukuran + 6,
    fontSize: Math.round(ukuran * 0.55),
    ...(warna ? { background: warna } : { '--hue': hueDari(nama) }),
  };
  return (
    <span className="ikon-mono" style={gaya} aria-hidden="true">
      {huruf}
    </span>
  );
};

export default Ikon;