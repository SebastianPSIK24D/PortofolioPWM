// frontend/src/hooks/useCrud.js
import { useState, useEffect, useCallback } from 'react';
import { delay } from '../api/backendApi';

// Validasi rentang tahun (dipakai Pendidikan dan Pengalaman)
export const cekTahun = (f) => {
  const mulai = Number(f.tahun_mulai);
  const selesai = Number(f.tahun_selesai);
  if (!mulai || !selesai) return 'Tahun mulai dan tahun selesai wajib diisi';
  if (mulai < 1950 || selesai < 1950 || mulai > 2100 || selesai > 2100) {
    return 'Tahun harus berada di antara 1950 dan 2100';
  }
  if (selesai < mulai) return 'Tahun selesai tidak boleh lebih awal dari tahun mulai';
  return null;
};

/*
  Hook siklus CRUD:
  - token    : token login
  - api      : { get, add, update, remove } dari backendApi.js
  - listKey  : nama kunci array pada respons GET (mis. 'riwayat_pendidikan')
  - kosong   : isi awal formulir (nama kolom = nama field backend)
  - label    : nama data untuk pesan notifikasi
  - validate : (opsional) fungsi yang mengembalikan pesan error atau null
*/
const useCrud = ({ token, api, listKey, kosong, label, validate }) => {
  const [list, setList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [form, setForm] = useState(kosong);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hapusItem, setHapusItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const notif = (type, message) => setAlert({ show: true, type, message });
  const nama = label.toLowerCase();

  // 1. Ambil data dari server
  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoadingData(true);
    try {
      const [res] = await Promise.all([api.get(token), delay(200)]);
      if (res.data.status === 'success') setList(res.data[listKey] || []);
    } catch (err) {
      setAlert({ show: true, type: 'error', message: `Gagal mengambil data ${nama}` });
    } finally {
      setIsLoadingData(false);
    }
  }, [token, api, listKey, nama]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // 2. Buka modal tambah / edit
  const bukaTambah = () => {
    setIsEdit(false);
    setCurrentId(null);
    setForm(kosong);
    setIsOpen(true);
  };

  const bukaEdit = (item) => {
    const isi = {};
    Object.keys(kosong).forEach((k) => { isi[k] = item[k] ?? ''; });
    setIsEdit(true);
    setCurrentId(item.id);
    setForm(isi);
    setIsOpen(true);
  };

  const tutup = () => { if (!isSubmitting) setIsOpen(false); };

  // Pengubah isian: onChange={ubah('nama_field')}
  const ubah = (kunci) => (e) => setForm((f) => ({ ...f, [kunci]: e.target.value }));

  // 3. Simpan (POST untuk tambah, PUT untuk edit)
  const simpan = async (e) => {
    e.preventDefault();

    const pesanError = validate ? validate(form) : null;
    if (pesanError) {
      notif('error', pesanError);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { ...form, token };
      if (isEdit) {
        payload.id = currentId;
        await api.update(payload);
        notif('success', `${label} berhasil diperbarui!`);
      } else {
        await api.add(payload);
        notif('success', `${label} berhasil ditambahkan!`);
      }
      setIsOpen(false);
      fetchData();
    } catch (err) {
      const pesan = err.response?.data?.message || err.response?.data?.pesan || `Gagal menyimpan ${nama}`;
      notif('error', pesan);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Hapus (dengan dialog konfirmasi)
  const mintaHapus = (item) => setHapusItem(item);
  const batalHapus = () => { if (!isDeleting) setHapusItem(null); };

  const konfirmasiHapus = async () => {
    setIsDeleting(true);
    try {
      await api.remove(hapusItem.id, token);
      notif('success', `${label} berhasil dihapus!`);
      setHapusItem(null);
      fetchData();
    } catch (err) {
      notif('error', `Gagal menghapus ${nama}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    list, isLoadingData, fetchData,
    isOpen, isEdit, form, setForm, isSubmitting,
    bukaTambah, bukaEdit, tutup, ubah, simpan,
    hapusItem, isDeleting, mintaHapus, batalHapus, konfirmasiHapus,
    alert, setAlert,
  };
};

export default useCrud;