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

  const NavButton = ({ onClick, icon, label, color, description }: { onClick: () => void, icon: string, label: string, color: string, description?: string }) => (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border mb-3 relative overflow-hidden active:scale-95 ${tv(isDark,
        'bg-white/80 border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5',
        'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-black/40'
      )}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3 ${color}`}>
        {icon}
      </div>
      <div className="text-left flex-1">
        <div className={`font-black text-sm tracking-tight ${tv(isDark, 'text-gray-900', 'text-white')}`}>
          {label}
        </div>
        {description && (
          <div className={`text-[10px] font-bold opacity-40 uppercase tracking-widest ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>
            {description}
          </div>
        )}
      </div>
      <div className={`opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 ${tv(isDark, 'text-gray-400', 'text-white/20')}`}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <h5 className={`text-[10px] font-black tracking-[0.2em] uppercase mb-3 ml-1 opacity-50 ${tv(isDark, 'text-gray-900', 'text-white')}`}>
      {title}
    </h5>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-start overflow-hidden">
      {/* Backdrop with extreme blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-500"
        onClick={onClose}
      />

      <aside
        className={`relative h-[96dvh] w-[92%] sm:w-[380px] m-2 sm:m-4 rounded-[32px] shadow-2xl overflow-hidden border transition-transform duration-500 ease-out animate-in slide-in-from-left forced-colors:opacity-100 ${tv(isDark,
          'bg-white/90 border-white shadow-blue-900/10',
          'bg-zinc-900/80 border-white/10 shadow-black'
        )}`}
        style={{ backdropFilter: 'blur(24px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]" />

        <div className="relative h-full flex flex-col p-6">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg border border-white/20 text-white font-black text-xs">
                SZ
              </div>
              <div className="leading-tight">
                <h4 className={`text-xl font-black italic tracking-tighter ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                  Stream<span className="text-blue-500">Zone</span>
                </h4>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest text-blue-500">Panel Control</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-all hover:rotate-90 active:scale-90 ${tv(isDark, 'bg-gray-100 text-gray-900 hover:bg-gray-200', 'bg-white/5 text-white hover:bg-white/10')}`}
            >
              ×
            </button>
          </div>

          {/* Navigation Scroll Area */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <nav>
              <SectionTitle title="Principal" />
              <NavButton
                onClick={() => { setSubView('dashboard'); onClose(); }}
                icon="📊"
                label="DASHBOARD"
                description="Resumen global y métricas"
                color="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
              />
              <NavButton
                onClick={() => { setSubView('products'); onClose(); }}
                icon="📦"
                label="CATÁLOGO"
                description="Servicios y Combos"
                color="bg-gradient-to-br from-teal-500 to-emerald-600 text-white"
              />

              <div className="h-4" />
              <SectionTitle title="Operaciones" />
              <NavButton
                onClick={() => { setSubView('purchases'); onClose(); }}
                icon="🛒"
                label="GESTIONAR VENTAS"
                description="Pedidos y Activaciones"
                color="bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
              />
              <NavButton
                onClick={() => { onRegisterPurchase(); onClose(); }}
                icon="➕"
                label="NUEVA VENTA"
                description="Registro Manual"
                color="bg-gradient-to-br from-green-500 to-emerald-600 text-white"
              />

              <div className="h-4" />
              <SectionTitle title="Sistema y Reportes" />
              <NavButton
                onClick={() => { openAdmins(); onClose(); }}
                icon="👥"
                label="ADMINISTRADORES"
                description="Cuentas de Acceso"
                color="bg-gradient-to-br from-orange-500 to-amber-600 text-white"
              />
              <NavButton
                onClick={() => { onExportCSV(); onClose(); }}
                icon="📄"
                label="EXPORTAR PDF"
                description="Reporte de Ventas"
                color="bg-gradient-to-br from-pink-500 to-rose-600 text-white"
              />
            </nav>
          </div>

          {/* Bottom Section */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <button
              onClick={() => { onLogout(); onClose(); }}
              className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-sm tracking-widest transition-all active:scale-95 ${tv(isDark,
                'bg-red-50 text-red-600 hover:bg-red-100',
                'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
              )}`}
            >
              <span>🚪</span>
              CERRAR SESIÓN
            </button>
            <div className={`mt-4 text-center text-[10px] font-bold opacity-30 ${tv(isDark, 'text-gray-900', 'text-white')}`}>
              StreamZone Admin v2.1 • 2026
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
