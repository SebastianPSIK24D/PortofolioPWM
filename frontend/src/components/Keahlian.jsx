import { GetKeahlian, AddKeahlian, UpdateKeahlian, DeleteKeahlian } from '../api/backendApi';
import useCrud from '../hooks/useCrud';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Loading from './Loading';
import ConfirmDialog from './ConfirmDialog';
import EmptyState from './EmptyState';
import Ikon from './Ikon'

const LEVEL = {
  Beginner:     { pct: 25,  warna: '#f59e0b' },
  Intermediate: { pct: 50,  warna: '#3b82f6' },
  Advanced:     { pct: 75,  warna: '#14b8a6' },
  Expert:       { pct: 100, warna: '#8b5cf6' },
};
const DAFTAR_LEVEL = Object.keys(LEVEL);
const gayaLevel = (level) => {
  const l = LEVEL[level] || { pct: 50, warna: '#6c757d' };
  return { '--pct': `${l.pct}%`, '--lvl': l.warna };
};

const CONFIG = {
  api: { get: GetKeahlian, add: AddKeahlian, update: UpdateKeahlian, remove: DeleteKeahlian },
  listKey: 'keahlian',
  kosong: { nama_keahlian: '', level: 'Beginner' },
  label: 'Keahlian',
  validate: (f) => (f.nama_keahlian.trim() ? null : 'Nama keahlian wajib diisi'),
};

const Keahlian = ({ token }) => {
  const c = useCrud({ token, ...CONFIG });
  const opsiLevel = !c.form.level || DAFTAR_LEVEL.includes(c.form.level)
    ? DAFTAR_LEVEL
    : [c.form.level, ...DAFTAR_LEVEL];

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Keahlian</h3>
          <p className="panel-subtitle">{c.list.length} keahlian tercatat</p>
        </div>
        <Button type="button" primary={true} text="+ Tambah Keahlian" onClick={c.bukaTambah} />
      </div>

      {c.isLoadingData ? (
        <Loading type="inline" title="Memuat keahlian..." />
      ) : c.list.length === 0 ? (
        <EmptyState title="Belum ada keahlian" text="Tambahkan bahasa pemrograman, tools, atau kemampuan Anda.">
          <Button type="button" primary={true} text="+ Tambah Keahlian" onClick={c.bukaTambah} />
        </EmptyState>
      ) : (
        <div className="card-grid">
          {c.list.map((item) => (
            <div className="item-card" key={item.id} style={gayaLevel(item.level)}>
              <div className="skill-head">
                <div className="skill-name">
                  <Ikon nama={item.nama_keahlian} ukuran={22} />
                  <h4>{item.nama_keahlian}</h4>
                </div>
                <span className="level-badge">{item.level}</span>
              </div>
              <div className="skill-bar"><span /></div>
              <div className="item-actions">
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
        title={c.isEdit ? 'Edit Keahlian' : 'Tambah Keahlian'}
        isLoading={c.isSubmitting}
        loadingTitle="Menyimpan..."
      >
        <form onSubmit={c.simpan}>
          <label>Nama Keahlian</label>
          <input type="text" required maxLength="100" placeholder="Contoh: React.js"
            value={c.form.nama_keahlian} onChange={c.ubah('nama_keahlian')} />

          <label>Level</label>
          <select value={c.form.level} onChange={c.ubah('level')}>
            {opsiLevel.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>

          {/* Pratinjau bar level */}
          <div className="skill-bar" style={{ ...gayaLevel(c.form.level), marginBottom: 18 }}>
            <span key={c.form.level} />
          </div>

          <div className="form-actions">
            <Button type="button" primary={false} text="Batal" onClick={c.tutup} disabled={c.isSubmitting} />
            <Button type="submit" primary={true} text={c.isEdit ? 'Simpan Perubahan' : 'Tambah Sekarang'} disabled={c.isSubmitting} />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!c.hapusItem}
        message={<>Yakin ingin menghapus keahlian <strong>{c.hapusItem?.nama_keahlian}</strong>?</>}
        onConfirm={c.konfirmasiHapus}
        onCancel={c.batalHapus}
        isLoading={c.isDeleting}
      />

      <Alert alert={c.alert} setAlert={c.setAlert} />
    </div>
  );
};

export default Keahlian;