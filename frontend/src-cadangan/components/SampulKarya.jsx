// frontend/src/components/SampulKarya.jsx
import { useState } from 'react';
import { gambarUrl } from '../utils/tampilan';

// Warna sampul huruf diambil dari variabel --hue milik kartu induknya
const SampulKarya = ({ nama = '', gambar }) => {
  const [gagal, setGagal] = useState(false);

  if (gambar && !gagal) {
    return (
      <img
        className="project-img"
        src={gambarUrl(gambar)}
        alt={nama}
        loading="lazy"
        onError={() => setGagal(true)}
      />
    );
  }

  return (
    <div className="project-cover">
      {(nama || '?').trim().charAt(0).toUpperCase()}
    </div>
  );
};

export default SampulKarya;