// Hanya izinkan tautan http, https, dan mailto (menolak mis. javascript:)
export const linkAman = (url) => {
  const u = (url || '').trim();
  return /^(https?:\/\/|mailto:)/i.test(u) ? u : '#';
};

// Validasi isian tautan di formulir: mengembalikan pesan error atau null
export const cekTautan = (url) => {
  const u = (url || '').trim();
  if (!u) return 'Tautan wajib diisi';
  if (!/^(https?:\/\/|mailto:)/i.test(u)) {
    return 'Tautan harus diawali https://, http://, atau mailto:';
  }
  return null;
};