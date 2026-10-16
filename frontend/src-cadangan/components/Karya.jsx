// frontend/src/components/Karya.jsx
import { useState, useEffect, useRef } from 'react';
import { GetKarya, AddKarya, UpdateKarya, DeleteKarya } from '../api/backendApi';
import useCrud from '../hooks/useCrud';
import { linkAman, cekTautan } from '../utils/link';
import { hueDari, domain, gambarUrl, kompresGambar, formatUkuran } from '../utils/tampilan';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Loading from './Loading';
import ConfirmDialog from './ConfirmDialog';
import EmptyState from './EmptyState';
import SampulKarya from './SampulKarya';

const MAKS_DESKRIPSI = 500;
const FORMAT_GAMBAR = ['image/jpeg', 'image/png', 'image/webp'];
const MAKS_ASLI = 15 * 1024 * 1024;     // berkas asli yang dipilih (sebelum dikecilkan)
const MAKS_UNGGAH = 5 * 1024 * 1024;    // hasil akhir yang dikirim ke server

// Ubah isi form menjadi FormData (diperlukan untuk mengirim berkas)
const keFormData = (p) => {
  const fd = new FormData();
  fd.append('token', p.token);
  if (p.id) fd.append('id', p.id);
  fd.append('nama_karya', p.nama_karya.trim());
  fd.append('deskripsi', p.deskripsi.trim());
  fd.append('url', p.url.trim());
  if (p.hapus_gambar) fd.append('hapus_gambar', '1');
  if (p.gambar_baru instanceof File) fd.append('gambar', p.gambar_baru);
  return fd;
};

const CONFIG = {
  api: {
    get: GetKarya,
    add: (p) => AddKarya(keFormData(p)),
    update: (p) => UpdateKarya(keFormData(p)),
    remove: DeleteKarya,
  },
  listKey: 'karya_terbaik',
  // gambar = nama berkas yang tersimpan, gambar_baru = berkas yang baru dipilih
  kosong: { nama_karya: '', deskripsi: '', url: '', gambar: '', gambar_baru: null, hapus_gambar: false },
  label: 'Karya',
  validate: (f) => {
    if (!f.nama_karya.trim()) return 'Nama karya wajib diisi';
    if (!f.deskripsi.trim()) return 'Deskripsi wajib diisi';
    return cekTautan(f.url);
  },
};

const Karya = ({ token }) => {
  const c = useCrud({ token, ...CONFIG });
  const fileRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [memproses, setMemproses] = useState(false);
  const [drag, setDrag] = useState(false);

  // Pratinjau untuk berkas yang baru dipilih (dibersihkan otomatis)
  useEffect(() => {
    if (!(c.form.gambar_baru instanceof File)) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(c.form.gambar_baru);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [c.form.gambar_baru]);

  const adaLama = !!c.form.gambar && !c.form.hapus_gambar;
  const tampil = preview || (adaLama ? gambarUrl(c.form.gambar) : null);

  const notifError = (message) => c.setAlert({ show: true, type: 'error', message });

  // Pilih berkas: validasi, kecilkan, lalu simpan di form
  const pilihFile = async (file) => {
    if (!file) return;
    if (!FORMAT_GAMBAR.includes(file.type)) {
      notifError('Format gambar harus JPG, PNG, atau WEBP');
      return;
    }
    if (file.size > MAKS_ASLI) {
      notifError('Ukuran gambar maksimal 15 MB');
      return;
    }

    setMemproses(true);
    const hasil = await kompresGambar(file);
    setMemproses(false);

    if (hasil.size > MAKS_UNGGAH) {
      notifError('Gambar masih terlalu besar setelah dikecilkan. Pilih gambar lain.');
      return;
    }
    c.setForm((f) => ({ ...f, gambar_baru: hasil, hapus_gambar: false }));
  };

  // Hapus gambar: berkas baru dibuang, dan gambar tersimpan ditandai untuk dihapus
  const hapusGambar = () =>
    c.setForm((f) => ({ ...f, gambar_baru: null, hapus_gambar: !!f.gambar }));

  const bukaDialog = () => fileRef.current && fileRef.current.click();

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Karya Terbaik</h3>
          <p className="panel-subtitle">{c.list.length} proyek • tampil sebagai galeri di halaman publik</p>
        </div>
        <Button type="button" primary={true} text="+ Tambah Karya" onClick={c.bukaTambah} />
      </div>

      {c.isLoadingData ? (
        <Loading type="inline" title="Memuat karya..." />
      ) : c.list.length === 0 ? (
        <EmptyState title="Belum ada karya" text="Tambahkan proyek terbaik yang ingin Anda pamerkan.">
          <Button type="button" primary={true} text="+ Tambah Karya" onClick={c.bukaTambah} />
        </EmptyState>
      ) : (
        <div className="card-grid">
          {c.list.map((item) => (
            <div className="item-card project-card" key={item.id} style={{ '--hue': hueDari(item.nama_karya) }}>
              <SampulKarya nama={item.nama_karya} gambar={item.gambar} />
              <div className="project-body">
                <h4>{item.nama_karya}</h4>
                <p className="project-domain">{domain(item.url)}</p>
                <p className="project-desc">{item.deskripsi}</p>
                <div className="item-actions">
                  <a className="button sm" href={linkAman(item.url)} target="_blank" rel="noreferrer">Lihat</a>
                  <button className="button sm" onClick={() => c.bukaEdit(item)}>Edit</button>
                  <button className="button sm danger" onClick={() => c.mintaHapus(item)}>Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={c.isOpen}
        onClose={c.tutup}
        title={c.isEdit ? 'Edit Karya' : 'Tambah Karya'}
        isLoading={c.isSubmitting}
        loadingTitle="Menyimpan..."
      >
        <form onSubmit={c.simpan}>
          <label>Gambar Sampul (opsional)</label>
          <div className="uploader">
            <div
              className={`uploader-box ${tampil ? 'has-img' : ''} ${drag ? 'drag' : ''}`}
              role={tampil ? undefined : 'button'}
              tabIndex={tampil ? undefined : 0}
              onClick={() => { if (!tampil && !memproses) bukaDialog(); }}
              onKeyDown={(e) => { if (!tampil && e.key === 'Enter') bukaDialog(); }}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); pilihFile(e.dataTransfer.files[0]); }}
            >
              {memproses ? (
                <span>Memproses gambar...</span>
              ) : tampil ? (
                <img src={tampil} alt="Pratinjau gambar karya" />
              ) : (
                <>
                  <strong>Seret gambar ke sini</strong>
                  <span>atau klik untuk memilih berkas</span>
                  <small>JPG, PNG, atau WEBP • otomatis dikecilkan</small>
                </>
              )}
            </div>

            <div className="uploader-actions">
              <Button type="button" primary={false} text={tampil ? 'Ganti Gambar' : 'Pilih Gambar'} onClick={bukaDialog} disabled={memproses} />
              {tampil && (
                <Button type="button" primary={false} className="danger" text="Hapus Gambar" onClick={hapusGambar} disabled={memproses} />
              )}
            </div>

            {c.form.gambar_baru instanceof File && (
              <p className="field-hint">
                Dipilih: {c.form.gambar_baru.name} ({formatUkuran(c.form.gambar_baru.size)})
              </p>
            )}
            {c.form.hapus_gambar && !tampil && (
              <p className="field-hint">Gambar akan dihapus saat Anda menyimpan.</p>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => { pilihFile(e.target.files[0]); e.target.value = ''; }}
            />
          </div>

          <label>Nama Karya</label>
          <input type="text" required maxLength="150" placeholder="Contoh: Aplikasi Kasir Sederhana"
            value={c.form.nama_karya} onChange={c.ubah('nama_karya')} />

          <label>Tautan Proyek</label>
          <input type="text" required maxLength="255" placeholder="https://github.com/username/proyek"
            value={c.form.url} onChange={c.ubah('url')} />

          <label>Deskripsi</label>
          <textarea required rows="4" maxLength={MAKS_DESKRIPSI} placeholder="Ceritakan singkat tentang proyek ini..."
            value={c.form.deskripsi} onChange={c.ubah('deskripsi')} />
          <p className="char-count">{c.form.deskripsi.length}/{MAKS_DESKRIPSI}</p>

          <div className="form-actions">
            <Button type="button" primary={false} text="Batal" onClick={c.tutup} disabled={c.isSubmitting} />
            <Button type="submit" primary={true} text={c.isEdit ? 'Simpan Perubahan' : 'Tambah Sekarang'} disabled={c.isSubmitting || memproses} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!c.hapusItem}
        message={<>Yakin ingin menghapus karya <strong>{c.hapusItem?.nama_karya}</strong>? Gambarnya ikut terhapus dan tindakan ini tidak bisa dibatalkan.</>}
        onConfirm={c.konfirmasiHapus}
        onCancel={c.batalHapus}
        isLoading={c.isDeleting}
      />

      <Alert alert={c.alert} setAlert={c.setAlert} />
    </div>
  );
};

export default Karya;