import React, { useState } from 'react';
import { IzinKeluar } from '../types';
import { getSantri, addIzinKeluar, generateId } from '../store';

interface Props {
  onSuccess: () => void;
}

const FormPengajuan: React.FC<Props> = ({ onSuccess }) => {
  const santriList = getSantri();
  const [formData, setFormData] = useState({
    santriId: '',
    tujuan: '',
    alasan: '',
    tanggalKeluar: '',
    waktuKeluar: '',
    estimasiKembali: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedSantri = santriList.find(s => s.id === formData.santriId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) return;

    const izin: IzinKeluar = {
      id: generateId(),
      santriId: selectedSantri.id,
      santriNama: selectedSantri.nama,
      kelas: selectedSantri.kelas,
      namaOrtu: selectedSantri.namaOrtu,
      noHp: selectedSantri.noHp,
      tujuan: formData.tujuan,
      alasan: formData.alasan,
      tanggalKeluar: formData.tanggalKeluar,
      waktuKeluar: formData.waktuKeluar,
      estimasiKembali: formData.estimasiKembali,
      status: 'pending',
      tanggalPengajuan: new Date().toISOString(),
    };

    addIzinKeluar(izin);
    setShowSuccess(true);
    setFormData({
      santriId: '',
      tujuan: '',
      alasan: '',
      tanggalKeluar: '',
      waktuKeluar: '',
      estimasiKembali: '',
    });
    setTimeout(() => {
      setShowSuccess(false);
      onSuccess();
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <i className="fas fa-file-alt text-emerald-600 text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Form Pengajuan Izin Keluar</h2>
            <p className="text-gray-500 text-sm">Orang Tua/Wali Santri</p>
          </div>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <i className="fas fa-check-circle text-green-500 text-xl"></i>
            <p className="text-green-700 font-medium">Pengajuan izin berhasil dikirim! Menunggu approval bagian keasramaan.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-user-graduate mr-2 text-emerald-500"></i>Pilih Santri
            </label>
            <select
              required
              value={formData.santriId}
              onChange={(e) => setFormData({ ...formData, santriId: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
            >
              <option value="">-- Pilih Santri --</option>
              {santriList.map(s => (
                <option key={s.id} value={s.id}>{s.nama} ({s.kelas})</option>
              ))}
            </select>
          </div>

          {selectedSantri && (
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <p className="text-sm text-emerald-700"><strong>Orang Tua:</strong> {selectedSantri.namaOrtu}</p>
              <p className="text-sm text-emerald-700"><strong>No. HP:</strong> {selectedSantri.noHp}</p>
              <p className="text-sm text-emerald-700"><strong>Kamar:</strong> {selectedSantri.kamar}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-map-marker-alt mr-2 text-emerald-500"></i>Tujuan
              </label>
              <input
                type="text"
                required
                value={formData.tujuan}
                onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                placeholder="Contoh: Rumah, Rumah Sakit, dll"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-calendar mr-2 text-emerald-500"></i>Tanggal Keluar
              </label>
              <input
                type="date"
                required
                value={formData.tanggalKeluar}
                onChange={(e) => setFormData({ ...formData, tanggalKeluar: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-clock mr-2 text-emerald-500"></i>Waktu Keluar
              </label>
              <input
                type="time"
                required
                value={formData.waktuKeluar}
                onChange={(e) => setFormData({ ...formData, waktuKeluar: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-undo mr-2 text-emerald-500"></i>Estimasi Kembali
              </label>
              <input
                type="datetime-local"
                required
                value={formData.estimasiKembali}
                onChange={(e) => setFormData({ ...formData, estimasiKembali: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-comment-alt mr-2 text-emerald-500"></i>Alasan / Keperluan
            </label>
            <textarea
              required
              rows={3}
              value={formData.alasan}
              onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
              placeholder="Jelaskan alasan keluar asrama..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <i className="fas fa-paper-plane"></i>
            Kirim Pengajuan Izin
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormPengajuan;
