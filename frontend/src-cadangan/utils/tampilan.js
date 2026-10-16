// frontend/src/utils/tampilan.js
// Fungsi tampilan yang dipakai halaman publik

import { BASE_URL } from '../api/backendApi';

// Warna sampul (0-359) dihitung dari teks
export const hueDari = (teks = '') => {
  let h = 0;
  for (const ch of teks) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
};

// Ambil nama domain dari tautan (mis. github.com)
export const domain = (url) => {
  try {
    const host = new URL(url).hostname;
    return host ? host.replace(/^www\./, '') : url;
  } catch {
    return url;
  }
};

// Level keahlian → persentase bar dan warna
const LEVEL = {
  Beginner:     { pct: 25,  warna: '#f59e0b' },
  Intermediate: { pct: 50,  warna: '#3b82f6' },
  Advanced:     { pct: 75,  warna: '#14b8a6' },
  Expert:       { pct: 100, warna: '#8b5cf6' },
};
export const gayaLevel = (level) => {
  const l = LEVEL[level] || { pct: 50, warna: '#6c757d' };
  return { '--pct': `${l.pct}%`, '--lvl': l.warna };
};

// Ikon otomatis berdasarkan nama media
export const ikonMedia = (nama = '') => {
  const n = nama.toLowerCase().trim();
  if (n.includes('github')) return '🐙';
  if (n.includes('linkedin')) return '💼';
  if (n.includes('instagram')) return '📸';
  if (n.includes('facebook')) return '📘';
  if (n.includes('twitter') || n === 'x') return '🐦';
  if (n.includes('youtube')) return '▶️';
  if (n.includes('tiktok')) return '🎵';
  if (n.includes('whatsapp') || n === 'wa') return '💬';
  if (n.includes('telegram')) return '✈️';
  if (n.includes('mail')) return '✉️';
  if (n.includes('web') || n.includes('portfolio') || n.includes('blog')) return '🌐';
  return '🔗';
};

// Pecah teks multi-baris menjadi daftar poin (tanda -, *, atau bullet di awal dibuang)
export const pecahPoin = (teks = '') =>
  String(teks || '')
    .split(/\r?\n/)
    .map((s) => s.replace(/^\s*[-*\u2022]\s*/, '').trim())
    .filter(Boolean);

// Alamat gambar di server (null bila tidak ada)
export const gambarUrl = (nama) => {
  if (!nama) return null;
  if (String(nama).startsWith('http')) return nama;
  return `${BASE_URL}/uploads/${nama}`;
};

// Tampilkan ukuran berkas: 412 KB atau 1.8 MB
export const formatUkuran = (b = 0) =>
  b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;

// Kecilkan gambar di browser sebelum diunggah (lebar maksimal 1280 px, JPEG kualitas 85%)
export const kompresGambar = (file, maxLebar = 1280, kualitas = 0.85) =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      const skala = Math.min(1, maxLebar / img.width);
      const w = Math.round(img.width * skala);
      const h = Math.round(img.height * skala);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';          // latar putih untuk PNG transparan
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          // Jika tidak mengecil sama sekali, pakai berkas aslinya
          if (!blob || (blob.size >= file.size && skala === 1)) {
            resolve(file);
            return;
          }
          const nama = file.name.replace(/\.[^.]+$/, '') + '.jpg';
          resolve(new File([blob], nama, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        kualitas
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);   // gagal dibaca: biarkan server yang memvalidasi
    };

    img.src = url;
  });

export const PAKAI_IKON = true;