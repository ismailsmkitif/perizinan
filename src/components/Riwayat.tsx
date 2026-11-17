import React, { useEffect, useState } from 'react';
import { IzinKeluar } from '../types';
import { getIzinKeluar } from '../store';

const Riwayat: React.FC = () => {
  const [izinList, setIzinList] = useState<IzinKeluar[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setIzinList(getIzinKeluar());
  }, []);

  const filteredList = izinList
    .filter(i => {
      const matchSearch = i.santriNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.tujuan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || i.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">⏳ Menunggu</span>;
      case 'approved': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">✅ Disetujui</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">❌ Ditolak</span>;
      case 'kembali': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">🏠 Kembali</span>;
      case 'confirmed': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">✓ Dikonfirmasi</span>;
      default: return null;
    }
  };

  const getTimeline = (izin: IzinKeluar) => {
    const steps = [];
    steps.push({ label: 'Pengajuan', date: izin.tanggalPengajuan, icon: 'fa-file-alt', color: 'emerald' });
    if (izin.tanggalApprove) {
      steps.push({ 
        label: izin.status === 'rejected' ? 'Ditolak' : 'Disetujui', 
        date: izin.tanggalApprove, 
        icon: izin.status === 'rejected' ? 'fa-times-circle' : 'fa-check-circle', 
        color: izin.status === 'rejected' ? 'red' : 'green' 
      });
    }
    if (izin.tanggalKembali) {
      steps.push({ label: 'Kembali ke Asrama', date: `${izin.tanggalKembali} ${izin.waktuKembali}`, icon: 'fa-door-open', color: 'blue' });
    }
    if (izin.tanggalKonfirmasi) {
      steps.push({ label: 'Konfirmasi Ortu', date: izin.tanggalKonfirmasi, icon: 'fa-check-double', color: 'purple' });
    }
    return steps;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <i className="fas fa-history text-indigo-600 text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Riwayat Perizinan</h2>
            <p className="text-gray-500 text-sm">Seluruh riwayat pengajuan izin keluar santri</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Cari nama santri, kelas, atau tujuan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
            <option value="kembali">Kembali</option>
            <option value="confirmed">Dikonfirmasi</option>
          </select>
        </div>

        {filteredList.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-search text-gray-300 text-5xl mb-4"></i>
            <p className="text-gray-400 text-lg">Tidak ada data ditemukan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map(izin => (
              <div key={izin.id} className="border-2 border-gray-100 rounded-xl p-5 hover:border-indigo-200 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{izin.santriNama}</h3>
                    <p className="text-sm text-gray-500">{izin.kelas} • Ortu: {izin.namaOrtu} • {izin.noHp}</p>
                  </div>
                  {getStatusBadge(izin.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400 text-xs">Tujuan</p>
                    <p className="font-medium text-gray-700">{izin.tujuan}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400 text-xs">Keluar</p>
                    <p className="font-medium text-gray-700">{izin.tanggalKeluar} {izin.waktuKeluar}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400 text-xs">Est. Kembali</p>
                    <p className="font-medium text-gray-700">{izin.estimasiKembali.replace('T', ' ')}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400 text-xs">Aktual Kembali</p>
                    <p className="font-medium text-gray-700">{izin.tanggalKembali ? `${izin.tanggalKembali} ${izin.waktuKembali}` : '-'}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex items-center gap-1 flex-wrap">
                  {getTimeline(izin).map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-${step.color}-50`}>
                        <i className={`fas ${step.icon} text-${step.color}-500 text-xs`}></i>
                        <span className={`text-xs text-${step.color}-700 font-medium`}>{step.label}</span>
                      </div>
                      {idx < getTimeline(izin).length - 1 && (
                        <i className="fas fa-chevron-right text-gray-300 text-xs"></i>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Riwayat;
