import { GetPendidikan, AddPendidikan, UpdatePendidikan, DeletePendidikan } from '../api/backendApi';
import useCrud, { cekTahun } from '../hooks/useCrud';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Loading from './Loading';
import ConfirmDialog from './ConfirmDialog';
import EmptyState from './EmptyState';

const TINGKAT = ['SD', 'SMP', 'SMA', 'SMK', 'D3', 'D4', 'S1', 'S2', 'S3', 'Lainnya'];

const CONFIG = {
  api: { get: GetPendidikan, add: AddPendidikan, update: UpdatePendidikan, remove: DeletePendidikan },
  listKey: 'riwayat_pendidikan',
  kosong: { nama_institusi: '', tingkat: 'S1', jurusan: '', tahun_mulai: '', tahun_selesai: '' },
  label: 'Riwayat pendidikan',
  validate: cekTahun,
};

const Pendidikan = ({ token }) => {
  const c = useCrud({ token, ...CONFIG });

  const opsiTingkat = !c.form.tingkat || TINGKAT.includes(c.form.tingkat)
    ? TINGKAT
    : [c.form.tingkat, ...TINGKAT];

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Riwayat Pendidikan</h3>
          <p className="panel-subtitle">{c.list.length} data • urut dari tahun terbaru</p>
        </div>
        <Button type="button" primary={true} text="+ Tambah Pendidikan" onClick={c.bukaTambah} />
      </div>

      {c.isLoadingData ? (
        <Loading type="inline" title="Memuat pendidikan..." />
      ) : c.list.length === 0 ? (
        <EmptyState title="Belum ada riwayat pendidikan" text="Tambahkan sekolah atau kampus Anda.">
          <Button type="button" primary={true} text="+ Tambah Pendidikan" onClick={c.bukaTambah} />
        </EmptyState>
      ) : (
        <div className="timeline">
          {c.list.map((item) => (
            <div className="timeline-item" key={item.id}>
              <span className="timeline-dot" />
              <div className="item-card">
                <div className="item-top">
                  <div>
                    <h4>{item.nama_institusi}</h4>
                    <p className="item-sub">{item.tingkat} • {item.jurusan}</p>
                  </div>
                  <span className="year-badge">{item.tahun_mulai} – {item.tahun_selesai}</span>
                </div>
                <div className="item-actions">
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
        title={c.isEdit ? 'Edit Pendidikan' : 'Tambah Pendidikan'}
        isLoading={c.isSubmitting}
        loadingTitle="Menyimpan..."
      >
        <form onSubmit={c.simpan}>
          <div className="form-grid">
            <div className="field full">
              <label>Nama Institusi</label>
              <input type="text" required placeholder="Contoh: Universitas Syiah Kuala"
                value={c.form.nama_institusi} onChange={c.ubah('nama_institusi')} />
            </div>

            <div className="field">
              <label>Tingkat</label>
              <select value={c.form.tingkat} onChange={c.ubah('tingkat')}>
                {opsiTingkat.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Jurusan</label>
              <input type="text" required placeholder="Contoh: Informatika"
                value={c.form.jurusan} onChange={c.ubah('jurusan')} />
            </div>

            <div className="field">
              <label>Tahun Mulai</label>
              <input type="number" required min="1950" max="2100" placeholder="2022"
                value={c.form.tahun_mulai} onChange={c.ubah('tahun_mulai')} />
            </div>

            <div className="field">
              <label>Tahun Selesai</label>
              <input type="number" required min="1950" max="2100" placeholder="2026"
                value={c.form.tahun_selesai} onChange={c.ubah('tahun_selesai')} />
            </div>
          </div>
          <p className="field-hint" style={{ marginTop: 0, marginBottom: 14 }}>
            Jika masih berjalan, isi dengan tahun perkiraan selesai.
          </p>

          <div className="form-actions">
            <Button type="button" primary={false} text="Batal" onClick={c.tutup} disabled={c.isSubmitting} />
            <Button type="submit" primary={true} text={c.isEdit ? 'Simpan Perubahan' : 'Tambah Sekarang'} disabled={c.isSubmitting} />
          </div>
        </form>
      </Modal>

      {/* Dialog konfirmasi hapus */}
      <ConfirmDialog
        isOpen={!!c.hapusItem}
        message={<>Yakin ingin menghapus <strong>{c.hapusItem?.nama_institusi}</strong>? Tindakan ini tidak bisa dibatalkan.</>}
        onConfirm={c.konfirmasiHapus}
        onCancel={c.batalHapus}
        isLoading={c.isDeleting}
      />

      <Alert alert={c.alert} setAlert={c.setAlert} />
    </div>
  );
};

export default Pendidikan;