import React from 'react';
import { tv } from '../../utils/helpers';

interface AdminMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  setSubView: (v: 'dashboard' | 'purchases' | 'products') => void;
  openAdmins: () => void;
  onExportCSV: () => void;
  onLogout: () => void;
  onRegisterPurchase: () => void;
}

export function AdminMenuDrawer({ open, onClose, isDark, setSubView, openAdmins, onExportCSV, onLogout, onRegisterPurchase }: AdminMenuDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-start" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <aside className={`absolute left-0 top-0 h-full w-full sm:w-[380px] p-4 sm:p-8 shadow-2xl backdrop-blur-sm border-r-2 ${tv(isDark, 'bg-gradient-to-br from-white to-gray-50 border-gray-300', 'bg-gradient-to-br from-gray-900 to-black border-gray-600')}`} onClick={e => e.stopPropagation()}>
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <h4 className={`text-xl sm:text-2xl font-black ${tv(isDark, 'text-gray-900', 'text-white')}`}>🔧 MENÚ ADMINISTRADOR</h4>
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl font-bold transition-all hover:scale-110 ${tv(isDark, 'text-gray-600 hover:text-gray-800 hover:bg-gray-200 shadow-lg', 'text-gray-300 hover:text-white hover:bg-gray-700 shadow-lg')}`}
          >
            ×
          </button>
        </div>

        <nav className="space-y-4">
          <button
            onClick={() => { setSubView('dashboard'); onClose(); }}
            className={`w-full rounded-2xl p-5 text-left transition-all hover:scale-105 shadow-lg border-2 ${tv(isDark, 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 hover:from-blue-600 hover:to-blue-700', 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500 hover:from-blue-700 hover:to-blue-800')}`}
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">📊</div>
              <span className="font-bold text-lg">DASHBOARD</span>
            </div>
          </button>

          <button
            onClick={() => { setSubView('purchases'); onClose(); }}
            className={`w-full rounded-2xl p-5 text-left transition-all hover:scale-105 shadow-lg border-2 ${tv(isDark, 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-400 hover:from-purple-600 hover:to-purple-700', 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-500 hover:from-purple-700 hover:to-purple-800')}`}
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">🛒</div>
              <span className="font-bold text-lg">GESTIONAR COMPRAS</span>
            </div>
          </button>

          <button
            onClick={() => { onRegisterPurchase(); onClose(); }}
            className={`w-full rounded-2xl p-5 text-left transition-all hover:scale-105 shadow-lg border-2 ${tv(isDark, 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400 hover:from-green-600 hover:to-green-700', 'bg-gradient-to-r from-green-600 to-green-700 text-white border-green-500 hover:from-green-700 hover:to-green-800')}`}
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">➕</div>
              <span className="font-bold text-lg">REGISTRAR COMPRA</span>
            </div>
          </button>

          <button
            onClick={() => { openAdmins(); onClose(); }}
            className={`w-full rounded-2xl p-5 text-left transition-all hover:scale-105 shadow-lg border-2 ${tv(isDark, 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-400 hover:from-orange-600 hover:to-orange-700', 'bg-gradient-to-r from-orange-600 to-orange-700 text-white border-orange-500 hover:from-orange-700 hover:to-orange-800')}`}
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">👥</div>
              <span className="font-bold text-lg">ADMINISTRADORES</span>
            </div>
          </button>

          <button
            onClick={() => { setSubView('products'); onClose(); }}
            className={`w-full rounded-2xl p-5 text-left transition-all hover:scale-105 shadow-lg border-2 ${tv(isDark, 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 hover:from-cyan-600 hover:to-blue-700', 'bg-gradient-to-r from-cyan-600 to-blue-700 text-white border-cyan-500 hover:from-cyan-700 hover:to-blue-800')}`}
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">📦</div>
              <span className="font-bold text-lg">GESTIONAR PRODUCTOS</span>
            </div>
          </button>

          <button
            onClick={() => { onExportCSV(); onClose(); }}
            className={`w-full rounded-2xl p-5 text-left transition-all hover:scale-105 shadow-lg border-2 ${tv(isDark, 'bg-gradient-to-r from-teal-500 to-teal-600 text-white border-teal-400 hover:from-teal-600 hover:to-teal-700', 'bg-gradient-to-r from-teal-600 to-teal-700 text-white border-teal-500 hover:from-teal-700 hover:to-teal-800')}`}
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">📄</div>
              <span className="font-bold text-lg">EXPORTAR PDF</span>
            </div>
          </button>

          <div className={`border-2 my-6 ${tv(isDark, 'border-gray-300', 'border-gray-600')}`}></div>

          <button
            onClick={() => { onLogout(); onClose(); }}
            className={`w-full rounded-2xl p-5 text-left transition-all hover:scale-105 shadow-lg border-2 ${tv(isDark, 'bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400 hover:from-red-600 hover:to-red-700', 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500 hover:from-red-700 hover:to-red-800')}`}
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl">🚪</div>
              <span className="font-bold text-lg">CERRAR SESIÓN</span>
            </div>
          </button>
        </nav>

        <div className={`mt-8 p-5 rounded-2xl shadow-lg border-2 ${tv(isDark, 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300', 'bg-gradient-to-br from-yellow-900 to-amber-900 border-yellow-600')}`}>
          <p className={`text-sm font-medium ${tv(isDark, 'text-amber-800', 'text-amber-200')}`}>
            💡 <strong>TIP:</strong> Usa el dashboard para ver estadísticas y el menú de compras para gestionar pedidos.
          </p>
        </div>
      </aside>
    </div>
  );
}


