import React, { useState, useEffect } from 'react';
import { IzinKeluar } from '../types';
import { getIzinKeluar, updateIzinKeluar } from '../store';

interface Props {
  onDataChange: () => void;
}

const PanelApproval: React.FC<Props> = ({ onDataChange }) => {
  const [izinList, setIzinList] = useState<IzinKeluar[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    loadIzin();
  }, []);

  const loadIzin = () => {
    setIzinList(getIzinKeluar());
  };

  const handleApprove = (id: string) => {
    updateIzinKeluar(id, {
      status: 'approved',
      tanggalApprove: new Date().toISOString(),
      approvedBy: 'Petugas Asrama',
    });
    loadIzin();
    onDataChange();
  };

  const handleReject = (id: string) => {
    updateIzinKeluar(id, {
      status: 'rejected',
      tanggalApprove: new Date().toISOString(),
      approvedBy: 'Petugas Asrama',
      catatan: 'Ditolak oleh petugas asrama',
    });
    loadIzin();
    onDataChange();
  };

  const filteredList = filter === 'pending' 
    ? izinList.filter(i => i.status === 'pending')
    : izinList;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">⏳ Menunggu</span>;
      case 'approved': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">✅ Disetujui</span>;
      case 'rejected': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">❌ Ditolak</span>;
      case 'kembali': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">🏠 Sudah Kembali</span>;
      case 'confirmed': return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">✓ Dikonfirmasi</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <i className="fas fa-clipboard-check text-blue-600 text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Panel Approval Keasramaan</h2>
            <p className="text-gray-500 text-sm">Verifikasi & Persetujuan Izin Keluar</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            ⏳ Menunggu Approval
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            📋 Semua Pengajuan
          </button>
        </div>

        {filteredList.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-gray-300 text-5xl mb-4"></i>
            <p className="text-gray-400 text-lg">Tidak ada pengajuan yang perlu diproses</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map(izin => (
              <div key={izin.id} className="border-2 border-gray-100 rounded-xl p-5 hover:border-blue-200 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{izin.santriNama}</h3>
                    <p className="text-sm text-gray-500">{izin.kelas} • Ortu: {izin.namaOrtu}</p>
                  </div>
                  {getStatusBadge(izin.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Tujuan</p>
                    <p className="font-medium text-gray-700">{izin.tujuan}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Tanggal & Waktu Keluar</p>
                    <p className="font-medium text-gray-700">{izin.tanggalKeluar} {izin.waktuKeluar}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">Estimasi Kembali</p>
                    <p className="font-medium text-gray-700">{izin.estimasiKembali.replace('T', ' ')}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-gray-500 text-xs">Alasan</p>
                  <p className="text-gray-700">{izin.alasan}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-gray-500 text-xs">No. HP Orang Tua</p>
                  <p className="text-gray-700 font-medium">{izin.noHp}</p>
                </div>

                {izin.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(izin.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-check"></i> Setujui
                    </button>
                    <button
                      onClick={() => handleReject(izin.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-times"></i> Tolak
                    </button>
                  </div>
                )}

                {izin.status === 'approved' && izin.approvedBy && (
                  <div className="text-sm text-green-600 bg-green-50 rounded-lg p-3">
                    <i className="fas fa-info-circle mr-1"></i>
                    Disetujui oleh {izin.approvedBy} pada {new Date(izin.tanggalApprove!).toLocaleString('id-ID')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PanelApproval;
