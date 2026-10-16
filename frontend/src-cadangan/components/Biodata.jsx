// frontend/src/components/Biodata.jsx
import { useState, useEffect, useRef } from 'react';
import { GetUser, UpdateUser, BASE_URL, delay } from '../api/backendApi';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';
import Button from './Button';
import Alert from './Alert';
import Loading from './Loading';
import nofoto from '../assets/nofoto.jpg';

// Aturan foto: sama dengan yang diterapkan backend
const FORMAT_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const MAKS_FOTO = 5 * 1024 * 1024; // 5 MB

// Membentuk alamat foto profil
const fotoUrl = (foto) => {
  if (!foto) return nofoto;
  if (foto.startsWith('http')) return foto;
  return `${BASE_URL}/uploads/${foto}`;
};

const tanggal = (nilai) => {
  if (!nilai) return '-';
  const d = new Date(nilai.replace(' ', 'T'));
  if (isNaN(d)) return '-';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Satu kotak informasi
const InfoItem = ({ label, value }) => (
  <div className="info-item">
      <div className="info-label">{label}</div>
      <div className="info-value">{value || '-'}</div>
  </div>
);

const Biodata = ({ token }) => {
  const { login } = useAuth();
  const fileRef = useRef(null);

  const [profil, setProfil] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    nama_lengkap: '', username: '', email: '', nomor_hp: '', password: '', foto: null,
    jabatan_target: '', lokasi: '', ringkasan: '',
  });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const notif = (type, message) => setAlert({ show: true, type, message });

  // 1. Ambil data profil
  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [res] = await Promise.all([GetUser(token), delay(200)]);
      if (res.data.status === 'success') setProfil(res.data.user);
    } catch (err) {
      notif('error', 'Gagal mengambil data profil');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  // 2. Buka dan tutup modal edit
  const bukaEdit = () => {
    setForm({
      nama_lengkap: profil.nama_lengkap || '',
      username: profil.username || '',
      email: profil.email || '',
      nomor_hp: profil.nomor_hp || '',
      jabatan_target: profil.jabatan_target || '',
      lokasi: profil.lokasi || '',
      ringkasan: profil.ringkasan || '',
      password: '',
      foto: null,
    });
    setPreview(null);
    setShowPassword(false);
    setIsOpen(true);
  };

  const tutup = () => {
    if (isSubmitting) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setIsOpen(false);
  };

  // 3. Pilih foto: validasi lalu tampilkan pratinjau
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!FORMAT_FOTO.includes(file.type)) {
      notif('error', 'Format foto harus JPG, PNG, atau WEBP');
      e.target.value = '';
      return;
    }
    if (file.size > MAKS_FOTO) {
      notif('error', 'Ukuran foto maksimal 5 MB');
      e.target.value = '';
      return;
    }

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setForm({ ...form, foto: file });
  };

  // 4. Simpan perubahan (POST + FormData)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password && form.password.length < 6) {
      notif('error', 'Password baru minimal 6 karakter');
      return;
    }

    setIsSubmitting(true);

    const data = new FormData();
    data.append('token', token);
    data.append('nama_lengkap', form.nama_lengkap.trim());
    data.append('username', form.username.trim());
    data.append('email', form.email.trim());
    data.append('nomor_hp', form.nomor_hp.trim());
    data.append('jabatan_target', form.jabatan_target.trim());
    data.append('lokasi', form.lokasi.trim());
    data.append('ringkasan', form.ringkasan.trim());
    if (form.password) data.append('password', form.password);
    if (form.foto) data.append('foto', form.foto);

    try {
      const res = await UpdateUser(data);
      if (res.data.status === 'success') {
        notif('success', 'Biodata berhasil diperbarui!');
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setIsOpen(false);

        // Ambil data terbaru, lalu segarkan juga sapaan di header dashboard
        const baru = await GetUser(token);
        const u = baru.data.user;
        setProfil(u);
        login(token, { id: u.id, username: u.username, nama_lengkap: u.nama_lengkap, foto: u.foto });
      }
    } catch (err) {
      const pesan = err.response?.data?.message || err.response?.data?.pesan || 'Gagal memperbarui profil';
      notif('error', pesan);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) return <Loading type="inline" title="Memuat profil..." />;

  if (!profil) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <p>Data profil tidak dapat dimuat.</p>
        <div style={{ marginTop: 14 }}>
          <Button type="button" primary={true} text="Coba Lagi" onClick={fetchData} />
        </div>
        <Alert alert={alert} setAlert={setAlert} />
      </div>
    );
  }

  return (
    <div>
      <div className="panel-header">
        <div>
          <h3 className="panel-title">Biodata Saya</h3>
          <p className="panel-subtitle">Informasi akun yang tampil di halaman publik.</p>
        </div>
      </div>

      {/* ===== Kartu profil ===== */}
      <div className="profile-hero">
        <div className="profile-banner" />
        <div className="profile-body">
          <img
            className="avatar"
            src={fotoUrl(profil.foto)}
            alt={profil.nama_lengkap}
            onError={(e) => { e.target.onerror = null; e.target.src = nofoto; }}
          />
          <div className="profile-meta">
            <h3>{profil.nama_lengkap}</h3>
            <p>@{profil.username}</p>
            <span className="badge">Administrator</span>
          </div>
          <div className="profile-actions">
            <Button type="button" primary={true} text="Edit Profil" onClick={bukaEdit} />
          </div>
        </div>
      </div>

      {/* ===== Kotak informasi ===== */}
      <div className="info-grid">
        <InfoItem label="Email" value={profil.email} />
        <InfoItem label="Nomor HP" value={profil.nomor_hp} />
        <InfoItem label="Username" value={profil.username} />
        <InfoItem label="Bergabung sejak" value={tanggal(profil.created_at)} />
        <InfoItem label="Target Posisi" value={profil.jabatan_target} />
        <InfoItem label="Lokasi" value={profil.lokasi} />
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h4>Ringkasan Profil</h4>
        <p style={{ marginTop: 8, lineHeight: 1.6, color: profil.ringkasan ? 'inherit' : 'var(--text-secondary)', textAlign: 'justify' }}>
          {profil.ringkasan || 'Belum diisi. Klik Edit Profil untuk menambahkan ringkasan yang akan tampil di CV.'}
        </p>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={tutup}
        title="Edit Biodata"
        isLoading={isSubmitting}
        loadingTitle="Menyimpan perubahan..."
      >
        <form onSubmit={handleSubmit}>
          <div className="avatar-editor">
            <img
              className="avatar"
              src={preview || fotoUrl(profil.foto)}
              alt="Pratinjau foto"
              onError={(e) => { e.target.onerror = null; e.target.src = nofoto; }}
            />
            <div>
              <Button type="button" primary={false} text="Pilih Foto" onClick={() => fileRef.current.click()} />
              <p className="field-hint">JPG, PNG, atau WEBP. Maksimal 5 MB.</p>
              {form.foto && <p className="field-hint">✔ {form.foto.name}</p>}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFile}
                hidden
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="field full">
              <label>Nama Lengkap</label>
              <input type="text" required value={form.nama_lengkap}
                onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })} />
            </div>

            <div className="field">
              <label>Username</label>
              <input type="text" required value={form.username} autoComplete="username"
                onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>

            <div className="field">
              <label>Nomor HP</label>
              <input type="tel" required value={form.nomor_hp}
                onChange={(e) => setForm({ ...form, nomor_hp: e.target.value })} />
            </div>

            <div className="field full">
              <label>Email</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>

            <div className="field">
              <label>Target Posisi</label>
              <input type="text" maxLength="255" placeholder="Contoh: Web Developer"
                value={form.jabatan_target}
                onChange={(e) => setForm({ ...form, jabatan_target: e.target.value })} />
            </div>

            <div className="field">
              <label>Lokasi</label>
              <input type="text" maxLength="255" placeholder="Contoh: Banda Aceh, Indonesia"
                value={form.lokasi}
                onChange={(e) => setForm({ ...form, lokasi: e.target.value })} />
            </div>

            <div className="field full">
              <label>Ringkasan Profil</label>
              <textarea rows="4" maxLength="1000"
                placeholder="2 sampai 4 kalimat tentang diri, keahlian utama, dan tujuan karier Anda."
                value={form.ringkasan}
                onChange={(e) => setForm({ ...form, ringkasan: e.target.value })} />
              <p className="char-count">{form.ringkasan.length}/1000</p>
            </div>

            <div className="field full">
              <label>Password Baru (opsional)</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                autoComplete="new-password"
                placeholder="Kosongkan jika tidak ingin mengganti"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <label className="check">
                <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
                Tampilkan password
              </label>
            </div>
          </div>

          <div className="form-actions">
            <Button type="button" primary={false} text="Batal" onClick={tutup} disabled={isSubmitting} />
            <Button type="submit" primary={true} text="Simpan Perubahan" disabled={isSubmitting} />
          </div>
        </form>
      </Modal>

      <Alert alert={alert} setAlert={setAlert} />
    </div>
  );
};

export default Biodata;