import React, { useState, useEffect, useRef } from 'react';
import { Santri } from '../types';
import { getSantri, addSantri, updateSantri, deleteSantri, importSantri, resetSantri, generateId } from '../store';

type ViewMode = 'list' | 'add' | 'edit' | 'import';

const KelolaSantri: React.FC = () => {
  const [santriList, setSantriList] = useState<Santri[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState('all');
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [importResult, setImportResult] = useState<{ success: number; duplicate: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSantri();
  }, []);

  const loadSantri = () => {
    setSantriList(getSantri());
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const kelasList = Array.from(new Set(santriList.map(s => s.kelas))).sort();

  const filteredList = santriList.filter(s => {
    const matchSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.kamar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.namaOrtu.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKelas = filterKelas === 'all' || s.kelas === filterKelas;
    return matchSearch && matchKelas;
  });

  // Form state
  const [formData, setFormData] = useState({
    nama: '',
    kelas: '',
    kamar: '',
    namaOrtu: '',
    noHp: '',
  });

  const resetForm = () => {
    setFormData({ nama: '', kelas: '', kamar: '', namaOrtu: '', noHp: '' });
    setEditingSantri(null);
  };

  const handleAddSantri = (e: React.FormEvent) => {
    e.preventDefault();
    const santri: Santri = {
      id: generateId(),
      ...formData,
    };
    addSantri(santri);
    loadSantri();
    resetForm();
    setViewMode('list');
    showNotification('success', `Santri "${formData.nama}" berhasil ditambahkan!`);
  };

  const handleEditSantri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSantri) return;
    updateSantri(editingSantri.id, formData);
    loadSantri();
    resetForm();
    setViewMode('list');
    showNotification('success', `Data santri "${formData.nama}" berhasil diperbarui!`);
  };

  const handleDeleteSantri = (santri: Santri) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data santri "${santri.nama}"?`)) {
      deleteSantri(santri.id);
      loadSantri();
      showNotification('info', `Data santri "${santri.nama}" berhasil dihapus.`);
    }
  };

  const startEdit = (santri: Santri) => {
    setEditingSantri(santri);
    setFormData({
      nama: santri.nama,
      kelas: santri.kelas,
      kamar: santri.kamar,
      namaOrtu: santri.namaOrtu,
      noHp: santri.noHp,
    });
    setViewMode('edit');
  };

  // CSV Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          showNotification('error', 'File CSV kosong atau tidak valid!');
          return;
        }

        // Parse header
        const header = lines[0].split(',').map(h => h.trim().toLowerCase());
        const namaIdx = header.findIndex(h => h === 'nama' || h === 'nama santri');
        const kelasIdx = header.findIndex(h => h === 'kelas');
        const kamarIdx = header.findIndex(h => h === 'kamar');
        const ortuIdx = header.findIndex(h => h === 'nama ortu' || h === 'nama ortu' || h === 'ortu' || h === 'wali');
        const hpIdx = header.findIndex(h => h === 'no hp' || h === 'nohp' || h === 'hp' || h === 'telepon' || h === 'no hp ortu');

        if (namaIdx === -1 || kelasIdx === -1) {
          showNotification('error', 'Format CSV tidak valid! Pastikan ada kolom "nama" dan "kelas".');
          return;
        }

        const santriData: Santri[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          if (cols.length < 2) continue;

          santriData.push({
            id: '',
            nama: cols[namaIdx]?.trim() || '',
            kelas: cols[kelasIdx]?.trim() || '',
            kamar: kamarIdx !== -1 ? cols[kamarIdx]?.trim() || '' : '',
            namaOrtu: ortuIdx !== -1 ? cols[ortuIdx]?.trim() || '' : '',
            noHp: hpIdx !== -1 ? cols[hpIdx]?.trim() || '' : '',
          });
        }

        if (santriData.length === 0) {
          showNotification('error', 'Tidak ada data valid yang ditemukan di file CSV!');
          return;
        }

        const result = importSantri(santriData);
        setImportResult(result);
        loadSantri();
        showNotification('success', `Import berhasil! ${result.success} santri ditambahkan, ${result.duplicate} duplikat dilewati.`);
      } catch (err) {
        showNotification('error', 'Gagal memproses file CSV! Pastikan format file benar.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const downloadTemplate = () => {
    const template = 'nama,kelas,kamar,nama ortu,no hp\nAhmad Fauzi,X-TKJ,Al-Farabi 1,Bapak Suryanto,081234567890\nMuhammad Rizki,XI-RPL,Al-Khawarizmi 2,Bapak Hendra,081234567891';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_data_santri.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset data santri ke data default? Data yang sudah ditambahkan akan hilang!')) {
      resetSantri();
      loadSantri();
      showNotification('info', 'Data santri berhasil direset ke data default.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
        }`}>
          <i className={`fas ${
            notification.type === 'success' ? 'fa-check-circle' :
            notification.type === 'error' ? 'fa-exclamation-circle' :
            'fa-info-circle'
          }`}></i>
          <p className="font-medium">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <i className="fas fa-users-cog text-teal-600 text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Kelola Data Santri</h2>
              <p className="text-gray-500 text-sm">Upload, tambah, edit, dan hapus data santri</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setViewMode('list'); resetForm(); }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${viewMode === 'list' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <i className="fas fa-list mr-1"></i> Daftar
            </button>
            <button
              onClick={() => { setViewMode('add'); resetForm(); }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${viewMode === 'add' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <i className="fas fa-plus mr-1"></i> Tambah
            </button>
            <button
              onClick={() => { setViewMode('import'); setImportResult(null); }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${viewMode === 'import' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <i className="fas fa-file-upload mr-1"></i> Import CSV
            </button>
          </div>
        </div>

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
                <p className="text-teal-600 text-xs font-medium">Total Santri</p>
                <p className="text-2xl font-bold text-teal-800">{santriList.length}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-blue-600 text-xs font-medium">Jumlah Kelas</p>
                <p className="text-2xl font-bold text-blue-800">{kelasList.length}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <p className="text-purple-600 text-xs font-medium">Jumlah Kamar</p>
                <p className="text-2xl font-bold text-purple-800">{new Set(santriList.map(s => s.kamar)).size}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                <p className="text-orange-600 text-xs font-medium">Tampil</p>
                <p className="text-2xl font-bold text-orange-800">{filteredList.length}</p>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Cari nama, kamar, atau orang tua..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
                />
              </div>
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
              >
                <option value="all">Semua Kelas</option>
                {kelasList.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
              <button
                onClick={handleResetData}
                className="px-4 py-3 bg-red-50 text-red-600 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-all font-medium text-sm"
              >
                <i className="fas fa-undo mr-1"></i> Reset Data
              </button>
            </div>

            {/* Table */}
            {filteredList.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-users text-gray-300 text-5xl mb-4"></i>
                <p className="text-gray-400 text-lg">Tidak ada data santri</p>
                <p className="text-gray-300 text-sm mt-1">Tambahkan atau import data santri terlebih dahulu</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">No</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600">Nama Santri</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 hidden md:table-cell">Kelas</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 hidden lg:table-cell">Kamar</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 hidden md:table-cell">Orang Tua</th>
                      <th className="text-left py-3 px-3 font-semibold text-gray-600 hidden lg:table-cell">No. HP</th>
                      <th className="text-center py-3 px-3 font-semibold text-gray-600">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((santri, idx) => (
                      <tr key={santri.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-3 text-gray-500">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <p className="font-medium text-gray-800">{santri.nama}</p>
                          <p className="text-xs text-gray-400 md:hidden">{santri.kelas}</p>
                        </td>
                        <td className="py-3 px-3 text-gray-600 hidden md:table-cell">
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium">{santri.kelas}</span>
                        </td>
                        <td className="py-3 px-3 text-gray-600 hidden lg:table-cell">{santri.kamar}</td>
                        <td className="py-3 px-3 text-gray-600 hidden md:table-cell">{santri.namaOrtu}</td>
                        <td className="py-3 px-3 text-gray-600 hidden lg:table-cell">{santri.noHp}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEdit(santri)}
                              className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center justify-center"
                              title="Edit"
                            >
                              <i className="fas fa-edit text-xs"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteSantri(santri)}
                              className="w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center"
                              title="Hapus"
                            >
                              <i className="fas fa-trash text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ADD VIEW */}
        {viewMode === 'add' && (
          <div className="max-w-xl mx-auto">
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-user-plus text-emerald-600"></i>
                Tambah Santri Baru
              </h3>
              <form onSubmit={handleAddSantri} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Santri *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Masukkan nama lengkap santri"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kelas *</label>
                    <input
                      type="text"
                      required
                      value={formData.kelas}
                      onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                      placeholder="Contoh: X-TKJ"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kamar *</label>
                    <input
                      type="text"
                      required
                      value={formData.kamar}
                      onChange={(e) => setFormData({ ...formData, kamar: e.target.value })}
                      placeholder="Contoh: Al-Farabi 1"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Orang Tua/Wali *</label>
                  <input
                    type="text"
                    required
                    value={formData.namaOrtu}
                    onChange={(e) => setFormData({ ...formData, namaOrtu: e.target.value })}
                    placeholder="Masukkan nama orang tua/wali"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">No. HP Orang Tua *</label>
                  <input
                    type="tel"
                    required
                    value={formData.noHp}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-save"></i> Simpan Data
                  </button>
                  <button
                    type="button"
                    onClick={() => { setViewMode('list'); resetForm(); }}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-all"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT VIEW */}
        {viewMode === 'edit' && editingSantri && (
          <div className="max-w-xl mx-auto">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-user-edit text-blue-600"></i>
                Edit Data Santri
              </h3>
              <form onSubmit={handleEditSantri} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Santri *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kelas *</label>
                    <input
                      type="text"
                      required
                      value={formData.kelas}
                      onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Kamar *</label>
                    <input
                      type="text"
                      required
                      value={formData.kamar}
                      onChange={(e) => setFormData({ ...formData, kamar: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Orang Tua/Wali *</label>
                  <input
                    type="text"
                    required
                    value={formData.namaOrtu}
                    onChange={(e) => setFormData({ ...formData, namaOrtu: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">No. HP Orang Tua *</label>
                  <input
                    type="tel"
                    required
                    value={formData.noHp}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-save"></i> Update Data
                  </button>
                  <button
                    type="button"
                    onClick={() => { setViewMode('list'); resetForm(); }}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-all"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* IMPORT VIEW */}
        {viewMode === 'import' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-file-csv text-indigo-600"></i>
                Import Data Santri dari CSV
              </h3>

              {/* Instructions */}
              <div className="bg-white rounded-lg p-4 mb-6 border border-indigo-100">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <i className="fas fa-info-circle text-indigo-500"></i>
                  Petunjuk Import
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>File harus berformat <strong>CSV</strong> (Comma Separated Values)</li>
                  <li>Kolom wajib: <strong>nama</strong> dan <strong>kelas</strong></li>
                  <li>Kolom opsional: <strong>kamar</strong>, <strong>nama ortu</strong>, <strong>no hp</strong></li>
                  <li>Data duplikat (nama + kelas sama) akan otomatis dilewati</li>
                  <li>Baris pertama sebagai header</li>
                </ul>
              </div>

              {/* Template Download */}
              <div className="bg-white rounded-lg p-4 mb-6 border border-indigo-100">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <i className="fas fa-download text-indigo-500"></i>
                  Download Template
                </h4>
                <p className="text-sm text-gray-600 mb-3">Download template CSV untuk memudahkan pengisian data:</p>
                <button
                  onClick={downloadTemplate}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2 text-sm"
                >
                  <i className="fas fa-file-download"></i> Download Template CSV
                </button>
              </div>

              {/* File Format Example */}
              <div className="bg-gray-800 rounded-lg p-4 mb-6">
                <p className="text-gray-400 text-xs mb-2 font-medium">Format CSV:</p>
                <pre className="text-green-400 text-xs overflow-x-auto">
{`nama,kelas,kamar,nama ortu,no hp
Ahmad Fauzi,X-TKJ,Al-Farabi 1,Bapak Suryanto,081234567890
Muhammad Rizki,XI-RPL,Al-Khawarizmi 2,Bapak Hendra,081234567891`}
                </pre>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center bg-white hover:border-indigo-500 transition-all">
                <i className="fas fa-cloud-upload-alt text-indigo-400 text-4xl mb-3"></i>
                <p className="text-gray-600 font-medium mb-2">Upload File CSV</p>
                <p className="text-gray-400 text-sm mb-4">Klik tombol di bawah atau drag & drop file CSV</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-all"
                >
                  <i className="fas fa-file-upload mr-2"></i> Pilih File CSV
                </label>
              </div>

              {/* Import Result */}
              {importResult && (
                <div className="mt-6 bg-white rounded-lg p-4 border border-indigo-100">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <i className="fas fa-chart-bar text-indigo-500"></i>
                    Hasil Import
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-3xl font-bold text-green-600">{importResult.success}</p>
                      <p className="text-sm text-green-700 font-medium">Berhasil Ditambah</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <p className="text-3xl font-bold text-yellow-600">{importResult.duplicate}</p>
                      <p className="text-sm text-yellow-700 font-medium">Duplikat Dilewati</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setViewMode('list')}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-all"
                >
                  <i className="fas fa-arrow-left mr-2"></i> Kembali ke Daftar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KelolaSantri;
