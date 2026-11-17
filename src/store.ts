import { Santri, IzinKeluar } from './types';

const SANTRI_KEY = 'siperizi_santri';
const IZIN_KEY = 'siperizi_izin';

const defaultSantri: Santri[] = [
  { id: '1', nama: 'Ahmad Fauzi', kelas: 'X-TKJ', kamar: 'Al-Farabi 1', namaOrtu: 'Bapak Suryanto', noHp: '081234567890' },
  { id: '2', nama: 'Muhammad Rizki', kelas: 'XI-RPL', kamar: 'Al-Khawarizmi 2', namaOrtu: 'Bapak Hendra', noHp: '081234567891' },
  { id: '3', nama: 'Abdullah Hakim', kelas: 'X-TKRO', kamar: 'Al-Farabi 3', namaOrtu: 'Bapak Mahmud', noHp: '081234567892' },
  { id: '4', nama: 'Umar Faruq', kelas: 'XII-MM', kamar: 'Al-Khawarizmi 1', namaOrtu: 'Bapak Saiful', noHp: '081234567893' },
  { id: '5', nama: 'Bilal Ibrahim', kelas: 'XI-TKJ', kamar: 'Al-Farabi 2', namaOrtu: 'Bapak Rahmat', noHp: '081234567894' },
];

export function getSantri(): Santri[] {
  const data = localStorage.getItem(SANTRI_KEY);
  if (!data) {
    localStorage.setItem(SANTRI_KEY, JSON.stringify(defaultSantri));
    return defaultSantri;
  }
  return JSON.parse(data);
}

export function getIzinKeluar(): IzinKeluar[] {
  const data = localStorage.getItem(IZIN_KEY);
  if (!data) return [];
  return JSON.parse(data);
}

export function saveIzinKeluar(izin: IzinKeluar[]): void {
  localStorage.setItem(IZIN_KEY, JSON.stringify(izin));
}

export function addIzinKeluar(izin: IzinKeluar): void {
  const data = getIzinKeluar();
  data.push(izin);
  saveIzinKeluar(data);
}

export function updateIzinKeluar(id: string, updates: Partial<IzinKeluar>): void {
  const data = getIzinKeluar();
  const index = data.findIndex(i => i.id === id);
  if (index !== -1) {
    data[index] = { ...data[index], ...updates };
    saveIzinKeluar(data);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
