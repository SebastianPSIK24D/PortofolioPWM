import './CvDokumen.css';

const LABEL = {
  ringkasan: 'PROFESSIONAL SUMMARY',
  pengalaman: 'WORK EXPERIENCE',
  pendidikan: 'EDUCATION',
  keahlian: 'SKILLS',
  proyek: 'PROJECTS',
  tautan: 'LINKS',
};

const teksTautan = (url = '') => url.replace(/^mailto:/i, '');

const CvDokumen = ({ profil = {}, pendidikan = [], pengalaman = [], keahlian = [], karya = [], kontak = [] }) => {
  const kontakUtama = [profil.email, profil.nomor_hp].filter(Boolean);
  const daftarKeahlian = keahlian
    .map((k) => (k.level ? `${k.nama_keahlian} (${k.level})` : k.nama_keahlian))
    .join(', ');

  return (
    <article className="cv-doc">
      <h1 className="cv-name">{profil.nama_lengkap}</h1>
      {kontakUtama.length > 0 && <p className="cv-contact">{kontakUtama.join(' | ')}</p>}

      {profil.ringkasan && (
        <section className="cv-block">
          <h2>{LABEL.ringkasan}</h2>
          <p>{profil.ringkasan}</p>
        </section>
      )}

      {pengalaman.length > 0 && (
        <section className="cv-block">
          <h2>{LABEL.pengalaman}</h2>
          {pengalaman.map((p, i) => (
            <div className="cv-item" key={i}>
              <p className="cv-title">{p.jabatan}</p>
              <p className="cv-meta">{p.nama_perusahaan} | {p.tahun_mulai} - {p.tahun_selesai}</p>
            </div>
          ))}
        </section>
      )}

      {pendidikan.length > 0 && (
        <section className="cv-block">
          <h2>{LABEL.pendidikan}</h2>
          {pendidikan.map((p, i) => (
            <div className="cv-item" key={i}>
              <p className="cv-title">{p.nama_institusi}</p>
              <p className="cv-meta">{p.tingkat} {p.jurusan} | {p.tahun_mulai} - {p.tahun_selesai}</p>
            </div>
          ))}
        </section>
      )}

      {keahlian.length > 0 && (
        <section className="cv-block">
          <h2>{LABEL.keahlian}</h2>
          <p>{daftarKeahlian}</p>
        </section>
      )}

      {karya.length > 0 && (
        <section className="cv-block">
          <h2>{LABEL.proyek}</h2>
          {karya.map((k, i) => (
            <div className="cv-item" key={i}>
              <p className="cv-title">{k.nama_karya}</p>
              {k.url && <p className="cv-meta">{teksTautan(k.url)}</p>}
              {k.deskripsi && <p>{k.deskripsi}</p>}
            </div>
          ))}
        </section>
      )}

      {kontak.length > 0 && (
        <section className="cv-block">
          <h2>{LABEL.tautan}</h2>
          {kontak.map((k, i) => (
            <p key={i}>{k.nama_media}: {teksTautan(k.url)}</p>
          ))}
        </section>
      )}
    </article>
  );
};

export default CvDokumen;