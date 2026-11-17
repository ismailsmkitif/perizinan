export interface Santri {
  id: string;
  nama: string;
  kelas: string;
  kamar: string;
  namaOrtu: string;
  noHp: string;
}

export type StatusIzin = 'pending' | 'approved' | 'rejected' | 'kembali' | 'confirmed';

export interface IzinKeluar {
  id: string;
  santriId: string;
  santriNama: string;
  kelas: string;
  namaOrtu: string;
  noHp: string;
  tujuan: string;
  alasan: string;
  tanggalKeluar: string;
  waktuKeluar: string;
  estimasiKembali: string;
  status: StatusIzin;
  tanggalPengajuan: string;
  tanggalApprove?: string;
  approvedBy?: string;
  tanggalKembali?: string;
  waktuKembali?: string;
  tanggalKonfirmasi?: string;
  catatan?: string;
}

export type ActivePage = 'dashboard' | 'pengajuan' | 'kelola-santri' | 'approval' | 'kedatangan' | 'konfirmasi' | 'riwayat';
export type UserRole = 'ortu' | 'asrama';
