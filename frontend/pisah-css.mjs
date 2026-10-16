// frontend/pisah-css.mjs
// Memecah src/App.css menjadi beberapa berkas CSS per kebutuhan.
//
// Pemakaian (dari folder frontend/):
//   node pisah-css.mjs --cek   -> hanya menampilkan rencana, tidak mengubah apa pun
//   node pisah-css.mjs         -> menjalankan pemisahan
//
// Prinsip: setiap KELAS CSS dimiliki tepat satu berkas, dan urutan aturan
// di dalam tiap berkas sama dengan urutan aslinya, sehingga tampilan tidak berubah.

import fs from 'node:fs';
import path from 'node:path';

let postcss;
try {
  postcss = (await import('postcss')).default;
} catch {
  console.error('Paket "postcss" tidak ditemukan. Jalankan: npm install -D postcss');
  process.exit(1);
}

const CEK = process.argv.includes('--cek');
const SRC = path.resolve('src');
const SUMBER = path.join(SRC, 'App.css');

if (!fs.existsSync(SUMBER)) {
  console.error('src/App.css tidak ditemukan. Jalankan skrip ini dari folder frontend/.');
  process.exit(1);
}

// ---------------------------------------------------------------
// Peta kepemilikan: nama kelas pertama pada selector menentukan berkasnya
// ---------------------------------------------------------------
const TEMA = 'styles/tema.css';
const BASE = 'styles/base.css';
const ANIMASI = 'styles/animasi.css';
const FORM = 'styles/ui/form.css';
const CV_SECTION = 'components/CvSection.css';
const SISA = 'styles/_sisa.css';

const PETA = [
  [BASE,                               /^container$/],
  ['styles/ui/button.css',             /^button$/],
  [FORM,                               /^(field|form-grid|field-hint|char-count|check|form-actions)$/],
  ['styles/ui/card.css',               /^card$/],
  ['styles/ui/modal.css',              /^(modal-.+|confirm-text)$/],
  ['styles/ui/alert.css',              /^alert(-.+)?$/],
  ['styles/ui/loading.css',            /^loading(-.+)?$/],
  ['styles/ui/empty-state.css',        /^empty-.+$/],
  ['styles/ui/panel.css',              /^panel-.+$/],
  ['styles/ui/item-card.css',          /^(item-.+|year-badge|poin|timeline(-.+)?|card-grid)$/],
  ['styles/ui/skill.css',              /^(skill-.+|level-badge)$/],
  ['styles/ui/project.css',            /^project-.+$/],
  ['components/Ikon.css',              /^(ikon|ikon-mono)$/],
  ['components/Navbar.css',            /^nb(-.+)?$/],
  ['components/Biodata.css',           /^(profile-.+|avatar|avatar-editor|badge|info-.+)$/],
  ['components/Kontak.css',            /^contact-(top|icon|info|url)$/],
  ['components/Karya.css',             /^uploader(-.+)?$/],
  [CV_SECTION,                         /^(cv-(toolbar|tags|tag|paper|switch|swatches|option|hint|print-root)|swatch)$/],
  ['components/CvDokumen.css',         /^(cv-doc|cv-name|cv-contact|cv-block|cv-item|cv-title|cv-meta|cv-head|cv-head-text|cv-target|cv-photo)$/],
  ['components/CvDokumenDesain.css',   /^cvd(-.+)?$/],
  ['pages/Public.css',                 /^(hero(-.+)?|stats(-wrap)?|stat|section(-head)?|two-col|col-title|contact-row|contact-pill|footer|reveal|chips?|btn-light|btn-ghost|flow|band(-.+)?)$/],
  ['pages/Login.css',                  /^(auth(-.+)?|pw-wrap|pw-toggle|spinner-sm)$/],
  ['pages/Dashboard.css',              /^(ds(-.+)?|panel)$/],
];

const KETERANGAN = {
  [TEMA]: 'Variabel warna tema terang dan gelap',
  [BASE]: 'Reset, elemen dasar, dan kontainer',
  [ANIMASI]: 'Semua @keyframes',
  'styles/ui/button.css': 'Tombol',
  [FORM]: 'Kolom isian dan formulir',
  'styles/ui/card.css': 'Kartu dasar',
  'styles/ui/modal.css': 'Jendela modal dan dialog konfirmasi',
  'styles/ui/alert.css': 'Notifikasi toast',
  'styles/ui/loading.css': 'Indikator loading',
  'styles/ui/empty-state.css': 'Tampilan data kosong',
  'styles/ui/panel.css': 'Kepala panel dashboard',
  'styles/ui/item-card.css': 'Kartu data, timeline, dan grid (dipakai dashboard dan halaman publik)',
  'styles/ui/skill.css': 'Kartu keahlian (dipakai dashboard dan halaman publik)',
  'styles/ui/project.css': 'Kartu karya (dipakai dashboard dan halaman publik)',
  'components/Ikon.css': 'Komponen Ikon',
  'components/Navbar.css': 'Komponen Navbar',
  'components/Biodata.css': 'Panel Biodata',
  'components/Kontak.css': 'Panel Kontak',
  'components/Karya.css': 'Panel Karya (area unggah gambar)',
  [CV_SECTION]: 'Bagian CV: pemilih template, kertas, dan aturan cetak',
  'components/CvDokumen.css': 'CV template ATS',
  'components/CvDokumenDesain.css': 'CV template Desain',
  'pages/Public.css': 'Halaman publik',
  'pages/Login.css': 'Halaman login',
  'pages/Dashboard.css': 'Halaman dashboard',
  [SISA]: 'Aturan yang tidak dikenali. Periksa, lalu hapus yang sudah tidak dipakai.',
};

// Urutan impor berkas global (di index.css). Berkas komponen dan halaman
// diimpor langsung oleh komponennya masing-masing.
const URUTAN_GLOBAL = [
  TEMA, BASE, ANIMASI,
  'styles/ui/button.css', FORM, 'styles/ui/card.css', 'styles/ui/modal.css',
  'styles/ui/alert.css', 'styles/ui/loading.css', 'styles/ui/empty-state.css',
  'styles/ui/panel.css', 'styles/ui/item-card.css', 'styles/ui/skill.css', 'styles/ui/project.css',
];

// ---------------------------------------------------------------
// Menentukan pemilik sebuah selector
// ---------------------------------------------------------------
const polos = (s) => s.replace(/\s+/g, '').replace(/['"]/g, '');

function pemilik(selector, cetak) {
  const s = selector.trim();
  const p = polos(s);

  if (p === ':root') return TEMA;
  if (p === '[data-theme=dark]') return TEMA;

  const m = s.match(/\.([A-Za-z_][\w-]*)/);
  if (m) {
    for (const [berkas, re] of PETA) if (re.test(m[1])) return berkas;
    return SISA;
  }

  // Aturan cetak untuk html, body, dan #root dikelompokkan bersama CV
  if (cetak && /^(html|body|#root)$/.test(s)) return CV_SECTION;

  if (/^(input|select|textarea|label)\b/.test(s)) return FORM;
  if (/^(html|body|\*|::selection|:focus-visible)/.test(s)) return BASE;
  return SISA;
}

// ---------------------------------------------------------------
// Membaca dan membagi
// ---------------------------------------------------------------
const teks = fs.readFileSync(SUMBER, 'utf8').replace(/^\uFEFF/, '');
let akar;
try {
  akar = postcss.parse(teks);
} catch (e) {
  console.error(`App.css memiliki kesalahan penulisan pada baris ${e.line}: ${e.reason}`);
  console.error('Perbaiki dulu bagian itu (biasanya kurung kurawal kurang atau lebih), lalu jalankan ulang.');
  process.exit(1);
}
const hitungDecl = (node) => {
  let n = 0;
  node.walkDecls(() => n++);
  return n;
};
const asli = hitungDecl(akar);   // seluruh deklarasi di App.css
let dikunjungi = 0;              // deklarasi yang sudah diproses skrip
let diharapkan = 0;              // deklarasi yang seharusnya ada di berkas baru

const hasil = new Map();          // berkas -> daftar node
const tema = new Map();           // selector -> Map(properti -> nilai)
const keyframes = new Map();      // nama -> node
const atMap = new Map();          // kunci pembungkus @media -> node
let jumlahAt = 0;

const tambah = (berkas, node) => {
  if (!hasil.has(berkas)) hasil.set(berkas, []);
  hasil.get(berkas).push(node);
};

function gabungTema(sels, rule) {
  for (const sel of sels) {
    const kunci = polos(sel) === ':root' ? ':root' : '[data-theme="dark"]';
    if (!tema.has(kunci)) tema.set(kunci, new Map());
    rule.each((d) => {
      if (d.type === 'decl') {
        tema.get(kunci).set(d.prop, d.value + (d.important ? ' !important' : ''));
      }
    });
  }
}

function tulisRule(rule, ctx) {
  const n = hitungDecl(rule);
  dikunjungi += n;
  const kelompok = new Map();
  for (const sel of rule.selectors) {
    const p = pemilik(sel, ctx && /print/.test(ctx.at.params));
    if (!kelompok.has(p)) kelompok.set(p, []);
    kelompok.get(p).push(sel);
  }

  for (const [p, sels] of kelompok) {
    if (p === TEMA && !ctx) { gabungTema(sels, rule); continue; }

    diharapkan += n;
    const salinan = rule.clone();
    salinan.selectors = sels;

    if (!ctx) {
      tambah(p, salinan);
    } else {
      const kunci = `${ctx.id}|${p}`;
      let at = atMap.get(kunci);
      if (!at) {
        at = postcss.atRule({ name: ctx.at.name, params: ctx.at.params });
        atMap.set(kunci, at);
        tambah(p, at);
      }
      at.append(salinan);
    }
  }
}

akar.each((node) => {
  if (node.type === 'comment') return;

  if (node.type === 'rule') {
    tulisRule(node, null);
    return;
  }

  if (node.type === 'atrule') {
    const nama = node.name.toLowerCase();
    if (nama === 'keyframes') {
      dikunjungi += hitungDecl(node);
      keyframes.set(node.params, node.clone());   // nama ganda: yang terakhir yang dipakai
    } else if (nama === 'media' || nama === 'supports') {
      const id = jumlahAt++;
      node.each((anak) => {
        if (anak.type === 'rule') {
          tulisRule(anak, { at: node, id });
        } else if (anak.type === 'atrule') {
          const n = hitungDecl(anak);
          dikunjungi += n;
          diharapkan += n;
          const pembungkus = postcss.atRule({ name: node.name, params: node.params });
          pembungkus.append(anak.clone());
          tambah(SISA, pembungkus);
        }
      });
    } else if (nama === 'page') {
      const n = hitungDecl(node);
      dikunjungi += n;
      diharapkan += n;
      tambah(CV_SECTION, node.clone());
    } else {
      const n = hitungDecl(node);
      dikunjungi += n;
      diharapkan += n;
      tambah(SISA, node.clone());
    }
  }
});

// ---------------------------------------------------------------
// Merangkai isi berkas
// ---------------------------------------------------------------
const rapikan = (node) => {
  const s = node.clone();
  s.raws.before = '\n\n';
  return s.toString().trim();
};

function isiBerkas(berkas) {
  let badan = '';

  if (berkas === TEMA) {
    for (const [sel, props] of tema) {
      badan += `${sel} {\n${[...props].map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}\n\n`;
    }
  } else if (berkas === ANIMASI) {
    badan = [...keyframes.values()].map(rapikan).join('\n\n') + '\n';
  } else {
    badan = (hasil.get(berkas) || []).map(rapikan).join('\n\n') + '\n';
  }

  const hasilAkhir = `/* ${KETERANGAN[berkas] || berkas} */\n\n${badan.trim()}\n`;
  // Samakan akhir baris dan rapikan baris kosong berlebih
  return hasilAkhir.replace(/\r\n/g, '\n').replace(/\{\n\n+/g, '{\n').replace(/\n{3,}/g, '\n\n');
}

const semuaBerkas = new Set([...hasil.keys()]);
if (tema.size) semuaBerkas.add(TEMA);
if (keyframes.size) semuaBerkas.add(ANIMASI);

const hitungRule = (berkas) => {
  if (berkas === TEMA) return [...tema.values()].reduce((a, m) => a + m.size, 0) + ' variabel';
  if (berkas === ANIMASI) return keyframes.size + ' animasi';
  let n = 0;
  const hitung = (nodes) => nodes.forEach((x) => (x.type === 'rule' ? n++ : x.nodes && hitung(x.nodes)));
  hitung(hasil.get(berkas) || []);
  return n + ' aturan';
};

// Pemeriksa: tidak boleh ada deklarasi CSS yang hilang
diharapkan += [...tema.values()].reduce((a, m) => a + m.size, 0);
keyframes.forEach((k) => { diharapkan += hitungDecl(k); });

let hasilDecl = 0;
for (const b of semuaBerkas) postcss.parse(isiBerkas(b)).walkDecls(() => hasilDecl++);

const semuaDiproses = dikunjungi === asli;
const semuaTertulis = hasilDecl === diharapkan;
const utuh = semuaDiproses && semuaTertulis;

// ---------------------------------------------------------------
// Laporan
// ---------------------------------------------------------------
console.log(`\nBerkas hasil pemisahan${CEK ? ' (mode --cek, belum ada yang ditulis)' : ''}:\n`);
[...semuaBerkas].sort().forEach((b) => {
  console.log(`  src/${b.padEnd(36)} ${hitungRule(b)}`);
});

if (hasil.has(SISA)) {
  const sel = new Set();
  const kumpul = (nodes) =>
    nodes.forEach((x) => {
      if (x.type === 'rule') x.selectors.forEach((s) => sel.add(s.trim()));
      else if (x.nodes) kumpul(x.nodes);
    });
  kumpul(hasil.get(SISA));
  console.log(`\nAturan yang masuk ke styles/_sisa.css (${sel.size} selector), biasanya CSS lama yang sudah tidak dipakai:`);
  [...sel].slice(0, 40).forEach((s) => console.log('  ' + s));
  if (sel.size > 40) console.log(`  ... dan ${sel.size - 40} lainnya`);
}

console.log(`\nPemeriksaan 1: ${dikunjungi} dari ${asli} deklarasi di App.css sudah diproses ${semuaDiproses ? '(OK)' : '(TIDAK COCOK)'}`);
console.log(`Pemeriksaan 2: ${hasilDecl} deklarasi tertulis, ${diharapkan} diharapkan ${semuaTertulis ? '(OK)' : '(TIDAK COCOK)'}`);
console.log(utuh ? 'Hasil: OK, tidak ada deklarasi yang hilang.' : 'PERINGATAN: ada yang tidak cocok. Jangan lanjut, kirim hasil ini ke saya.');

if (!utuh && !CEK) {
  console.error('\nPemisahan dibatalkan agar tidak ada yang rusak. Tidak ada berkas yang diubah.\n');
  process.exit(1);
}

if (CEK) {
  console.log('\nTidak ada yang diubah. Jalankan tanpa --cek untuk memulai pemisahan.\n');
  process.exit(0);
}

// ---------------------------------------------------------------
// Menulis berkas
// ---------------------------------------------------------------
const cadangan = path.resolve('src-cadangan');
if (!fs.existsSync(cadangan)) fs.cpSync(SRC, cadangan, { recursive: true });

const tulis = (berkas) => {
  const tujuan = path.join(SRC, berkas);
  fs.mkdirSync(path.dirname(tujuan), { recursive: true });
  fs.writeFileSync(tujuan, isiBerkas(berkas), 'utf8');
};

[...semuaBerkas].forEach(tulis);

// ---------------------------------------------------------------
// Memasang impor
// ---------------------------------------------------------------
const cadanganImpor = [];   // berkas komponen yang jsx-nya tidak ditemukan

// Sisipkan baris impor setelah impor terakhir
function sisipImpor(isi, baris) {
  if (isi.includes(baris)) return isi;
  const lines = isi.split('\n');
  let akhir = -1;
  let dalam = false;
  lines.forEach((l, i) => {
    if (/^import\s/.test(l)) dalam = true;
    if (dalam && (/\bfrom\s+['"][^'"]+['"];?\s*$/.test(l) || /^import\s+['"][^'"]+['"];?\s*$/.test(l))) {
      akhir = i;
      dalam = false;
    }
  });
  lines.splice(akhir + 1, 0, baris);
  return lines.join('\n');
}

for (const b of semuaBerkas) {
  if (b === SISA) continue;
  const m = b.match(/^(components|pages)\/([A-Za-z0-9]+)\.css$/);
  if (!m) continue;

  const jsx = path.join(SRC, m[1], `${m[2]}.jsx`);
  if (fs.existsSync(jsx)) {
    const isi = fs.readFileSync(jsx, 'utf8');
    fs.writeFileSync(jsx, sisipImpor(isi, `import './${m[2]}.css';`), 'utf8');
  } else {
    cadanganImpor.push(b);
  }
}

// index.css: berkas global (dan cadangan bila jsx-nya tidak ada)
const daftarIndex = [
  ...URUTAN_GLOBAL.filter((b) => semuaBerkas.has(b)),
  ...cadanganImpor,
];
const jalurImpor = (b) => (b.startsWith('styles/') ? './' + b.slice('styles/'.length) : '../' + b);
const index =
  '/* Titik masuk semua CSS global. Urutan impor di sini menentukan prioritas. */\n\n' +
  daftarIndex.map((b) => `@import '${jalurImpor(b)}';`).join('\n') + '\n';
fs.mkdirSync(path.join(SRC, 'styles'), { recursive: true });
fs.writeFileSync(path.join(SRC, 'styles', 'index.css'), index, 'utf8');

// main.jsx: muat CSS global lebih dulu, lalu sisa CSS paling akhir
const mainJsx = path.join(SRC, 'main.jsx');
if (fs.existsSync(mainJsx)) {
  let isi = fs.readFileSync(mainJsx, 'utf8');
  if (!isi.includes("./styles/index.css")) isi = `import './styles/index.css';\n` + isi;
  if (semuaBerkas.has(SISA)) isi = sisipImpor(isi, `import './styles/_sisa.css';`);
  fs.writeFileSync(mainJsx, isi, 'utf8');
}

// App.jsx: hapus impor App.css lama
const appJsx = path.join(SRC, 'App.jsx');
if (fs.existsSync(appJsx)) {
  const isi = fs.readFileSync(appJsx, 'utf8').replace(/^[ \t]*import\s+['"]\.\/App\.css['"];?[ \t]*\r?\n/m, '');
  fs.writeFileSync(appJsx, isi, 'utf8');
}

// App.css lama diganti nama menjadi cadangan
fs.renameSync(SUMBER, path.join(SRC, 'App.css.bak'));

console.log('\nSelesai.');
console.log('  Cadangan seluruh src/ : src-cadangan/');
console.log('  CSS lama              : src/App.css.bak');
console.log('  Jalankan "npm run dev" dan periksa tampilan.\n');