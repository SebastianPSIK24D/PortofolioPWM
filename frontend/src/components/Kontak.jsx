import { GetKontak, AddKontak, UpdateKontak, DeleteKontak } from '../api/backendApi';
import useCrud from '../hooks/useCrud';
import { linkAman, cekTautan } from '../utils/link';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Loading from './Loading';
import ConfirmDialog from './ConfirmDialog';
import EmptyState from './EmptyState';
import Ikon from './Ikon';  
import './Kontak.css';

const SARAN_MEDIA = ['GitHub', 'LinkedIn', 'Instagram', 'Facebook', 'Twitter / X', 'YouTube', 'TikTok', 'WhatsApp', 'Telegram', 'Email', 'Website'];

const CONFIG = {
  api: { get: GetKontak, add: AddKontak, update: UpdateKontak, remove: DeleteKontak },
  listKey: 'kontak_aktif',
  kosong: { nama_media: '', url: '' },
  label: 'Kontak',
  validate: (f) => (f.nama_media.trim() ? cekTautan(f.url) : 'Nama media wajib diisi'),
};

const Kontak = ({ token }) => {
  const c = useCrud({ token, ...CONFIG });

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Kontak dan Media Sosial</h3>
          <p className="panel-subtitle">{c.list.length} tautan • tampil sebagai tombol di halaman publik</p>
        </div>
        <Button type="button" primary={true} text="+ Tambah Kontak" onClick={c.bukaTambah} />
      </div>

      {c.isLoadingData ? (
        <Loading type="inline" title="Memuat kontak..." />
      ) : c.list.length === 0 ? (
        <EmptyState title="Belum ada kontak" text="Tambahkan GitHub, LinkedIn, email, atau media sosial lain.">
          <Button type="button" primary={true} text="+ Tambah Kontak" onClick={c.bukaTambah} />
        </EmptyState>
      ) : (
        <div className="card-grid">
          {c.list.map((item) => (
            <div className="item-card" key={item.id}>
              <div className="contact-top">
                <div className="contact-icon">
                  <Ikon nama={item.nama_media} ukuran={26} />
                </div>
                <div className="contact-info">
                  <h4>{item.nama_media}</h4>
                  <a className="contact-url" href={linkAman(item.url)} target="_blank" rel="noreferrer" title={item.url}>
                    {item.url}
                  </a>
                </div>
              </div>
              <div className="item-actions">
                <a className="button sm" href={linkAman(item.url)} target="_blank" rel="noreferrer">Buka ↗</a>
                <button className="button sm" onClick={() => c.bukaEdit(item)}>Edit</button>
                <button className="button sm danger" onClick={() => c.mintaHapus(item)}>Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={c.isOpen}
        onClose={c.tutup}
        title={c.isEdit ? 'Edit Kontak' : 'Tambah Kontak'}
        isLoading={c.isSubmitting}
        loadingTitle="Menyimpan..."
      >
        <form onSubmit={c.simpan}>
          <label>Nama Media</label>
          <input type="text" required list="saran-media" maxLength="100" placeholder="Ketik atau pilih: GitHub, LinkedIn, ..."
            value={c.form.nama_media} onChange={c.ubah('nama_media')} />
          <datalist id="saran-media">
            {SARAN_MEDIA.map((m) => <option key={m} value={m} />)}
          </datalist>

          <label>Tautan</label>
          <input type="text" required maxLength="255" placeholder="https://github.com/username"
            value={c.form.url} onChange={c.ubah('url')} />
          <p className="field-hint" style={{ marginTop: -6, marginBottom: 16 }}>
            Awali dengan https:// atau http://. Untuk email, tulis mailto:alamat@email.com
          </p>

          <div className="form-actions">
            <Button type="button" primary={false} text="Batal" onClick={c.tutup} disabled={c.isSubmitting} />
            <Button type="submit" primary={true} text={c.isEdit ? 'Simpan Perubahan' : 'Tambah Sekarang'} disabled={c.isSubmitting} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!c.hapusItem}
        message={<>Yakin ingin menghapus kontak <strong>{c.hapusItem?.nama_media}</strong>?</>}
        onConfirm={c.konfirmasiHapus}
        onCancel={c.batalHapus}
        isLoading={c.isDeleting}
      />

      <Alert alert={c.alert} setAlert={c.setAlert} />
    </div>
  );
};

export default Kontak;