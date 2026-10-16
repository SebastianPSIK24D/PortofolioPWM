import { GetPengalaman, AddPengalaman, UpdatePengalaman, DeletePengalaman } from '../api/backendApi';
import useCrud, { cekTahun } from '../hooks/useCrud';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Loading from './Loading';
import ConfirmDialog from './ConfirmDialog';
import EmptyState from './EmptyState';
import { pecahPoin } from '../utils/tampilan';

const CONFIG = {
  api: { get: GetPengalaman, add: AddPengalaman, update: UpdatePengalaman, remove: DeletePengalaman },
  listKey: 'pengalaman',
  kosong: { nama_perusahaan: '', jabatan: '', deskripsi: '', tahun_mulai: '', tahun_selesai: '' },
  label: 'Pengalaman',
  validate: cekTahun,
};

const Pengalaman = ({ token }) => {
  const c = useCrud({ token, ...CONFIG });

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Pengalaman</h3>
          <p className="panel-subtitle">{c.list.length} data • kerja, magang, atau organisasi</p>
        </div>
        <Button type="button" primary={true} text="+ Tambah Pengalaman" onClick={c.bukaTambah} />
      </div>

      {c.isLoadingData ? (
        <Loading type="inline" title="Memuat pengalaman..." />
      ) : c.list.length === 0 ? (
        <EmptyState title="Belum ada pengalaman" text="Tambahkan pengalaman kerja, magang, atau organisasi Anda.">
          <Button type="button" primary={true} text="+ Tambah Pengalaman" onClick={c.bukaTambah} />
        </EmptyState>
      ) : (
        <div className="timeline">
          {c.list.map((item) => (
            <div className="timeline-item" key={item.id}>
              <span className="timeline-dot" />
              <div className="item-card">
                <div className="item-top">
                  <div>
                    <h4>{item.nama_perusahaan}</h4>
                    <p className="item-sub">{item.jabatan}</p>
                  </div>
                  <span className="year-badge">{item.tahun_mulai} – {item.tahun_selesai}</span>
                </div>
                {pecahPoin(item.deskripsi).length > 0 && (
                  <ul className="poin">
                    {pecahPoin(item.deskripsi).map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                )}
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
        title={c.isEdit ? 'Edit Pengalaman' : 'Tambah Pengalaman'}
        isLoading={c.isSubmitting}
        loadingTitle="Menyimpan..."
      >
        <form onSubmit={c.simpan}>
          <div className="form-grid">
            <div className="field full">
              <label>Perusahaan / Organisasi</label>
              <input type="text" required placeholder="Contoh: PT Teknologi Nusantara"
                value={c.form.nama_perusahaan} onChange={c.ubah('nama_perusahaan')} />
            </div>

            <div className="field full">
              <label>Jabatan</label>
              <input type="text" required placeholder="Contoh: Web Developer Intern"
                value={c.form.jabatan} onChange={c.ubah('jabatan')} />
            </div>

            <div className="field">
              <label>Tahun Mulai</label>
              <input type="number" required min="1950" max="2100" placeholder="2023"
                value={c.form.tahun_mulai} onChange={c.ubah('tahun_mulai')} />
            </div>

            <div className="field">
              <label>Tahun Selesai</label>
              <input type="number" required min="1950" max="2100" placeholder="2024"
                value={c.form.tahun_selesai} onChange={c.ubah('tahun_selesai')} />
            </div>

            <div className="field full">
              <label>Poin Pencapaian (satu baris = satu poin)</label>
              <textarea rows="5" maxLength="2000"
                placeholder={'Membangun REST API dengan PHP dan MySQL\nMeningkatkan kecepatan muat halaman 40%\nMemimpin tim beranggotakan 3 orang'}
                value={c.form.deskripsi} onChange={c.ubah('deskripsi')} />
              <p className="field-hint">Awali dengan kata kerja, dan sertakan angka bila ada. Satu pencapaian per baris.</p>
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" primary={false} text="Batal" onClick={c.tutup} disabled={c.isSubmitting} />
            <Button type="submit" primary={true} text={c.isEdit ? 'Simpan Perubahan' : 'Tambah Sekarang'} disabled={c.isSubmitting} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!c.hapusItem}
        message={<>Yakin ingin menghapus <strong>{c.hapusItem?.nama_perusahaan}</strong>? Tindakan ini tidak bisa dibatalkan.</>}
        onConfirm={c.konfirmasiHapus}
        onCancel={c.batalHapus}
        isLoading={c.isDeleting}
      />

      <Alert alert={c.alert} setAlert={c.setAlert} />
    </div>
  );
};

export default Pengalaman;