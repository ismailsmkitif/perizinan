import React, { useState, useCallback } from 'react';
import { ActivePage, UserRole } from './types';
import Dashboard from './components/Dashboard';
import FormPengajuan from './components/FormPengajuan';
import PanelApproval from './components/PanelApproval';
import PanelKedatangan from './components/PanelKedatangan';
import PanelKonfirmasi from './components/PanelKonfirmasi';
import Riwayat from './components/Riwayat';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [role, setRole] = useState<UserRole>('ortu');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDataChange = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  const menuItems = [
    { id: 'dashboard' as ActivePage, label: 'Dashboard', icon: 'fas fa-tachometer-alt', roles: ['ortu', 'asrama'] as UserRole[] },
    { id: 'pengajuan' as ActivePage, label: 'Ajukan Izin', icon: 'fas fa-file-alt', roles: ['ortu'] as UserRole[] },
    { id: 'approval' as ActivePage, label: 'Approval', icon: 'fas fa-clipboard-check', roles: ['asrama'] as UserRole[] },
    { id: 'kedatangan' as ActivePage, label: 'Catat Kembali', icon: 'fas fa-door-open', roles: ['asrama'] as UserRole[] },
    { id: 'konfirmasi' as ActivePage, label: 'Konfirmasi Ortu', icon: 'fas fa-check-double', roles: ['ortu'] as UserRole[] },
    { id: 'riwayat' as ActivePage, label: 'Riwayat', icon: 'fas fa-history', roles: ['ortu', 'asrama'] as UserRole[] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onDataChange={handleDataChange} />;
      case 'pengajuan': return <FormPengajuan onSuccess={handleDataChange} />;
      case 'approval': return <PanelApproval onDataChange={handleDataChange} />;
      case 'kedatangan': return <PanelKedatangan onDataChange={handleDataChange} />;
      case 'konfirmasi': return <PanelKonfirmasi onDataChange={handleDataChange} />;
      case 'riwayat': return <Riwayat />;
      default: return <Dashboard onDataChange={handleDataChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-emerald-800 to-emerald-900 text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <i className="fas fa-mosque text-white text-xl"></i>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">SIPERIZI</h1>
              <p className="text-emerald-200 text-xs">SMK IT Ihsanul Fikri</p>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="mb-6">
            <p className="text-emerald-200 text-xs font-medium mb-2 uppercase tracking-wider">Login Sebagai</p>
            <div className="flex bg-emerald-700/50 rounded-lg p-1">
              <button
                onClick={() => { setRole('ortu'); setActivePage('dashboard'); }}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${role === 'ortu' ? 'bg-white text-emerald-800 shadow' : 'text-emerald-200 hover:text-white'}`}
              >
                <i className="fas fa-user mr-1"></i> Ortu
              </button>
              <button
                onClick={() => { setRole('asrama'); setActivePage('dashboard'); }}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${role === 'asrama' ? 'bg-white text-emerald-800 shadow' : 'text-emerald-200 hover:text-white'}`}
              >
                <i className="fas fa-user-shield mr-1"></i> Asrama
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {filteredMenu.map(item => (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  activePage === item.id 
                    ? 'bg-white/20 text-white font-semibold' 
                    : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <i className={`${item.icon} w-5 text-center`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-emerald-700">
          <div className="text-center">
            <p className="text-emerald-200 text-xs">© 2024 SMK IT Ihsanul Fikri</p>
            <p className="text-emerald-300 text-xs mt-1">Sistem Perizinan Santri</p>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-800 p-2"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  {filteredMenu.find(m => m.id === activePage)?.label || 'Dashboard'}
                </h2>
                <p className="text-xs text-gray-400">
                  {role === 'ortu' ? '👤 Portal Orang Tua/Wali' : '🛡️ Portal Bagian Keasramaan'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${role === 'ortu' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">
                  {role === 'ortu' ? 'Orang Tua' : 'Petugas Asrama'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8" key={refreshKey}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
