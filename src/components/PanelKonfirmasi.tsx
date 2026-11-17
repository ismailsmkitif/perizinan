import React, { useState, useEffect } from 'react';
import { IzinKeluar } from '../types';
import { getIzinKeluar, updateIzinKeluar } from '../store';

interface Props {
  onDataChange: () => void;
}

const PanelKonfirmasi: React.FC<Props> = ({ onDataChange }) => {
  const [izinList, setIzinList] = useState<IzinKeluar[]>([]);
  const [selectedIzin, setSelectedIzin] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadIzin();
  }, []);

  const loadIzin = () => {
    setIzinList(getIzinKeluar().filter(i => i.status === 'kembali'));
  };

  const handleKonfirmasi = () => {
    if (!selectedIzin) return;
    updateIzinKeluar(selectedIzin, {
      status: 'confirmed',
      tanggalKonfirmasi: new Date().toISOString(),
    });
    setShowSuccess(true);
    setSelectedIzin('');
    loadIzin();
    onDataChange();
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const selectedData = izinList.find(i => i.id === selectedIzin);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <i className="fas fa-check-double text-purple-600 text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Konfirmasi Orang Tua</h2>
            <p className="text-gray-500 text-sm">Konfirmasi bahwa santri telah kembali dengan selamat</p>
          </div>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center gap-3">
            <i className="fas fa-check-circle text-purple-500 text-xl"></i>
            <p className="text-purple-700 font-medium">Konfirmasi berhasil! Santri telah kembali dengan selamat.</p>
          </div>
        )}

        {izinList.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-home text-gray-300 text-5xl mb-4"></i>
            <p className="text-gray-400 text-lg">Tidak ada santri yang perlu dikonfirmasi</p>
            <p className="text-gray-300 text-sm mt-2">Semua santri sudah di konfirmasi kedatangannya</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-user-graduate mr-2 text-purple-500"></i>Pilih Santri yang Sudah Kembali
              </label>
              <select
                value={selectedIzin}
                onChange={(e) => setSelectedIzin(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
              >
                <option value="">-- Pilih Santri --</option>
                {izinList.map(i => (
                  <option key={i.id} value={i.id}>{i.santriNama} ({i.kelas}) - Kembali: {i.tanggalKembali} {i.waktuKembali}</option>
                ))}
              </select>
            </div>

            {selectedData && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 space-y-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Nama Santri</p>
                    <p className="font-bold text-gray-800">{selectedData.santriNama}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Kelas</p>
                    <p className="font-bold text-gray-800">{selectedData.kelas}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tanggal Keluar</p>
                    <p className="font-bold text-gray-800">{selectedData.tanggalKeluar}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Waktu Kembali</p>
                    <p className="font-bold text-gray-800">{selectedData.tanggalKembali} {selectedData.waktuKembali}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tujuan</p>
                    <p className="font-bold text-gray-800">{selectedData.tujuan}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Orang Tua</p>
                    <p className="font-bold text-gray-800">{selectedData.namaOrtu}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleKonfirmasi}
              disabled={!selectedIzin}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <i className="fas fa-check-circle"></i>
              Konfirmasi Santri Telah Kembali
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelKonfirmasi;
