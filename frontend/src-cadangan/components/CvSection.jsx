// frontend/src/components/CvSection.jsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BASE_URL } from '../api/backendApi';
import CvDokumen from './CvDokumen';

const CvSection = (props) => {
  const { profil = {} } = props;
  const nama = profil.nama_lengkap || 'Portofolio';

  const [sertakanFoto, setSertakanFoto] = useState(false);
  const [fotoAda, setFotoAda] = useState(false);

  const urlFoto = profil.foto
    ? (profil.foto.startsWith('http') ? profil.foto : `${BASE_URL}/uploads/${profil.foto}`)
    : null;

  useEffect(() => {
    if (!urlFoto) { setFotoAda(false); return; }
    let batal = false;
    const img = new Image();
    img.onload = () => { if (!batal) setFotoAda(true); };
    img.onerror = () => { if (!batal) setFotoAda(false); };
    img.src = urlFoto;
    return () => { batal = true; };
  }, [urlFoto]);

  const fotoUrl = sertakanFoto && fotoAda ? urlFoto : null;

  const unduh = () => {
    const judulLama = document.title;
    document.title = `CV - ${nama}`;

    const pulihkan = () => {
      document.title = judulLama;
      window.removeEventListener('afterprint', pulihkan);
    };
    window.addEventListener('afterprint', pulihkan);

    window.print();
  };

  return (
    <>
      <div className="btn-center-wrapper">
        <button type="button" className="button primary" onClick={unduh}>
          Unduh CV (PDF)
        </button>
      </div>

      <div className="cv-paper">
        <CvDokumen {...props} fotoUrl={fotoUrl} />
      </div>

      {/* Salinan khusus cetak, hanya muncul saat mencetak atau Save as PDF */}
      {createPortal(
        <div className="cv-print-root">
          <CvDokumen {...props} fotoUrl={fotoUrl} />
        </div>,
        document.body
      )}
    </>
  );
};

export default CvSection;