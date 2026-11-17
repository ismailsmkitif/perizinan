import React, { useState, useEffect } from 'react';
import { IzinKeluar } from '../types';
import { getIzinKeluar, updateIzinKeluar } from '../store';

interface Props {
  onDataChange: () => void;
}

const PanelKedatangan: React.FC<Props> = ({ onDataChange }) => {
  const [izinList, setIzinList] = useState<IzinKeluar[]>([]);

  useEffect(() => {
    loadIzin();
  }, []);

  const loadIzin = () => {
    setIzinList(getIzinKeluar().filter(i => i.status === 'approved'));
  };

  const handleKembali = (id: string) => {
    const now = new Date();
    updateIzinKeluar(id, {
      status: 'kembali',
      tanggalKembali: now.toISOString().split('T')[0],
      waktuKembali: now.toTimeString().slice(0, 5),
    });
    loadIzin();
    onDataChange();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <i className="fas fa-door-open text-orange-600 text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Pencatatan Kedatangan</h2>
            <p className="text-gray-500 text-sm">Catat santri yang kembali ke asrama</p>
          </div>
        </div>

        {izinList.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-check-double text-gray-300 text-5xl mb-4"></i>
            <p className="text-gray-400 text-lg">Tidak ada santri yang sedang izin keluar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {izinList.map(izin => (
              <div key={izin.id} className="border-2 border-orange-100 rounded-xl p-5 hover:border-orange-300 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{izin.santriNama}</h3>
                    <p className="text-sm text-gray-500">{izin.kelas} • Tujuan: {izin.tujuan}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">🚪 Sedang Izin</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Keluar pada</p>
                    <p className="font-medium text-gray-700">{izin.tanggalKeluar} {izin.waktuKeluar}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Estimasi Kembali</p>
                    <p className="font-medium text-gray-700">{izin.estimasiKembali.replace('T', ' ')}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Orang Tua</p>
                    <p className="font-medium text-gray-700">{izin.namaOrtu}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleKembali(izin.id)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-home"></i> Catat Santri Kembali
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelKedatangan;
