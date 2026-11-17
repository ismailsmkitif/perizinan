import React, { useEffect, useState } from 'react';
import { IzinKeluar } from '../types';
import { getIzinKeluar } from '../store';

interface Props {
  onDataChange: () => void;
}

const Dashboard: React.FC<Props> = ({ onDataChange }) => {
  const [izinList, setIzinList] = useState<IzinKeluar[]>([]);

  useEffect(() => {
    setIzinList(getIzinKeluar());
  }, [onDataChange]);

  const pending = izinList.filter(i => i.status === 'pending').length;
  const approved = izinList.filter(i => i.status === 'approved').length;
  const kembali = izinList.filter(i => i.status === 'kembali').length;
  const confirmed = izinList.filter(i => i.status === 'confirmed').length;
  const rejected = izinList.filter(i => i.status === 'rejected').length;
  const total = izinList.length;

  const recentIzin = [...izinList].sort((a, b) => 
    new Date(b.tanggalPengajuan).getTime() - new Date(a.tanggalPengajuan).getTime()
  ).slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">Menunggu</span>;
      case 'approved': return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">Disetujui</span>;
      case 'rejected': return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">Ditolak</span>;
      case 'kembali': return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Kembali</span>;
      case 'confirmed': return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">Dikonfirmasi</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-gray-400">
          <p className="text-gray-500 text-xs font-medium">Total</p>
          <p className="text-2xl font-bold text-gray-800">{total}</p>
          <i className="fas fa-list text-gray-400 text-lg mt-1"></i>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-400">
          <p className="text-gray-500 text-xs font-medium">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{pending}</p>
          <i className="fas fa-hourglass-half text-yellow-400 text-lg mt-1"></i>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-400">
          <p className="text-gray-500 text-xs font-medium">Disetujui</p>
          <p className="text-2xl font-bold text-green-600">{approved}</p>
          <i className="fas fa-check-circle text-green-400 text-lg mt-1"></i>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-400">
          <p className="text-gray-500 text-xs font-medium">Ditolak</p>
          <p className="text-2xl font-bold text-red-600">{rejected}</p>
          <i className="fas fa-times-circle text-red-400 text-lg mt-1"></i>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-400">
          <p className="text-gray-500 text-xs font-medium">Kembali</p>
          <p className="text-2xl font-bold text-blue-600">{kembali}</p>
          <i className="fas fa-door-open text-blue-400 text-lg mt-1"></i>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-400">
          <p className="text-gray-500 text-xs font-medium">Dikonfirmasi</p>
          <p className="text-2xl font-bold text-purple-600">{confirmed}</p>
          <i className="fas fa-check-double text-purple-400 text-lg mt-1"></i>
        </div>
      </div>

      {/* Flow Diagram */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-project-diagram text-emerald-500"></i>
          Alur Perizinan Keluar Santri
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
              <i className="fas fa-user text-emerald-600 text-xl"></i>
            </div>
            <p className="text-xs font-medium text-center text-gray-600">Orang Tua<br/>Ajukan Izin</p>
          </div>
          <i className="fas fa-arrow-right text-gray-300 hidden md:block"></i>
          <i className="fas fa-arrow-down text-gray-300 md:hidden"></i>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
              <i className="fas fa-hourglass-half text-yellow-600 text-xl"></i>
            </div>
            <p className="text-xs font-medium text-center text-gray-600">Menunggu<br/>Approval</p>
          </div>
          <i className="fas fa-arrow-right text-gray-300 hidden md:block"></i>
          <i className="fas fa-arrow-down text-gray-300 md:hidden"></i>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <i className="fas fa-user-shield text-blue-600 text-xl"></i>
            </div>
            <p className="text-xs font-medium text-center text-gray-600">Keasramaan<br/>Approve/Reject</p>
          </div>
          <i className="fas fa-arrow-right text-gray-300 hidden md:block"></i>
          <i className="fas fa-arrow-down text-gray-300 md:hidden"></i>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <i className="fas fa-door-open text-orange-600 text-xl"></i>
            </div>
            <p className="text-xs font-medium text-center text-gray-600">Santri<br/>Keluar</p>
          </div>
          <i className="fas fa-arrow-right text-gray-300 hidden md:block"></i>
          <i className="fas fa-arrow-down text-gray-300 md:hidden"></i>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <i className="fas fa-home text-green-600 text-xl"></i>
            </div>
            <p className="text-xs font-medium text-center text-gray-600">Santri<br/>Kembali</p>
          </div>
          <i className="fas fa-arrow-right text-gray-300 hidden md:block"></i>
          <i className="fas fa-arrow-down text-gray-300 md:hidden"></i>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <i className="fas fa-check-double text-purple-600 text-xl"></i>
            </div>
            <p className="text-xs font-medium text-center text-gray-600">Orang Tua<br/>Konfirmasi</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i className="fas fa-history text-emerald-500"></i>
          Aktivitas Terbaru
        </h3>
        {recentIzin.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-clipboard text-gray-300 text-4xl mb-3"></i>
            <p className="text-gray-400">Belum ada pengajuan izin</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-100">
                  <th className="text-left py-3 px-2 text-gray-500 font-semibold">Santri</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-semibold hidden md:table-cell">Tujuan</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-semibold hidden md:table-cell">Tanggal Keluar</th>
                  <th className="text-left py-3 px-2 text-gray-500 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentIzin.map(izin => (
                  <tr key={izin.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <p className="font-medium text-gray-800">{izin.santriNama}</p>
                      <p className="text-xs text-gray-400">{izin.kelas}</p>
                    </td>
                    <td className="py-3 px-2 text-gray-600 hidden md:table-cell">{izin.tujuan}</td>
                    <td className="py-3 px-2 text-gray-600 hidden md:table-cell">{izin.tanggalKeluar}</td>
                    <td className="py-3 px-2">{getStatusBadge(izin.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
