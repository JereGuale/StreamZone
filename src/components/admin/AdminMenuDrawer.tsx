import React from 'react';
import { tv } from '../../utils/helpers';

interface AdminMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  setSubView: (v: 'dashboard' | 'purchases') => void;
  openAdmins: () => void;
  onExportCSV: () => void;
  onLogout: () => void;
  onRegisterPurchase: () => void;
}

export function AdminMenuDrawer({ open, onClose, isDark, setSubView, openAdmins, onExportCSV, onLogout, onRegisterPurchase }: AdminMenuDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-start" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50"/>
      <aside className={`absolute left-0 top-0 h-full w-full sm:w-[350px] p-3 sm:p-6 shadow-2xl ${tv(isDark,'bg-white','bg-zinc-900 text-zinc-100')}`} onClick={e=>e.stopPropagation()}>
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <h4 className="text-lg sm:text-xl font-bold">🔧 Menú Administrador</h4>
          <button 
            onClick={onClose} 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${tv(isDark,'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100','text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800')}`}
          >
            ×
          </button>
        </div>
        
        <nav className="space-y-3">
          <button 
            onClick={()=>{setSubView('dashboard'); onClose();}} 
            className={`w-full rounded-xl p-4 text-left transition-all hover:scale-105 ${tv(isDark,'hover:bg-zinc-100','hover:bg-zinc-800')}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📊</span>
              <span className="font-semibold">Dashboard</span>
            </div>
          </button>
          
          <button 
            onClick={()=>{setSubView('purchases'); onClose();}} 
            className={`w-full rounded-xl p-4 text-left transition-all hover:scale-105 ${tv(isDark,'hover:bg-zinc-100','hover:bg-zinc-800')}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🛒</span>
              <span className="font-semibold">Gestionar Compras</span>
            </div>
          </button>
          
          <button 
            onClick={()=>{onRegisterPurchase(); onClose();}} 
            className={`w-full rounded-xl p-4 text-left transition-all hover:scale-105 ${tv(isDark,'hover:bg-blue-50','hover:bg-blue-900/20')}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">➕</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">Registrar Compra</span>
            </div>
          </button>
          
          <button 
            onClick={()=>{openAdmins(); onClose();}} 
            className={`w-full rounded-xl p-4 text-left transition-all hover:scale-105 ${tv(isDark,'hover:bg-zinc-100','hover:bg-zinc-800')}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">👥</span>
              <span className="font-semibold">Administradores</span>
            </div>
          </button>
          
          <button 
            onClick={()=>{onExportCSV(); onClose();}} 
            className={`w-full rounded-xl p-4 text-left transition-all hover:scale-105 ${tv(isDark,'hover:bg-green-50','hover:bg-green-900/20')}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📊</span>
              <span className="font-semibold text-green-600 dark:text-green-400">Exportar CSV</span>
            </div>
          </button>
          
          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
          
          <button 
            onClick={()=>{onLogout(); onClose();}} 
            className={`w-full rounded-xl p-4 text-left transition-all hover:scale-105 ${tv(isDark,'hover:bg-red-50','hover:bg-red-900/20')}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🚪</span>
              <span className="font-semibold text-red-600 dark:text-red-400">Cerrar Sesión</span>
            </div>
          </button>
        </nav>
        
        <div className="mt-6 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            💡 <strong>Tip:</strong> Usa el dashboard para ver estadísticas y el menú de compras para gestionar pedidos.
          </p>
        </div>
      </aside>
    </div>
  );
}


