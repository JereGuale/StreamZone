import React, { useState } from 'react';
import { fmt, tv } from '../../utils/helpers';
import { PurchaseCard } from '../../components/PurchaseCard';
import { AdminDrawer } from '../../components/admin/AdminDrawer';
import { AdminMenuDrawer } from '../../components/admin/AdminMenuDrawer';
import { AdminProductsManager } from '../../components/admin/AdminProductsManager';
import { DatabaseService } from '../../lib/supabase';
import { testDatabaseConnection, createTestPurchase, testConnection } from '../../lib/supabase';

interface AdminDashboardProps {
  isDark: boolean;
  purchases: any[];
  pendingPurchases?: any[];
  expiringServices?: any[];
  renewalStats?: any;
  services?: DatabaseService[];
  combos?: DatabaseService[];
  loading?: boolean;
  error?: string | null;
  adminUsers: any[];
  setAdminUsers: (users: any[]) => void;
  onToggleValidate: (id: string) => void;
  onDeletePurchase: (id: string) => void;
  onEditPurchase: (purchase: any) => void;
  onReminderPurchase?: (purchase: any) => void;
  onRegisterPurchase: () => void;
  onExportCSV: () => void;
  refreshAllStats?: () => void;
  onGoToHome?: () => void;
  onSetAdminUserRegisterFormPurchaseOpen?: (open: boolean) => void;
  onSetDrawerOpen?: (open: boolean) => void;
  onLogout: () => void;
  onSetView: (view: string) => void;
}

export function AdminDashboard({
  isDark,
  purchases,
  pendingPurchases = [],
  expiringServices = [],
  renewalStats,
  services = [],
  combos = [],
  loading = false,
  error = null,
  adminUsers,
  setAdminUsers,
  onToggleValidate,
  onDeletePurchase,
  onEditPurchase,
  onReminderPurchase,
  onRegisterPurchase,
  onExportCSV,
  refreshAllStats,
  onGoToHome,
  onSetAdminUserRegisterFormPurchaseOpen,
  onSetDrawerOpen,
  onLogout,
  onSetView
}: AdminDashboardProps) {
  const [adminView, setAdminView] = useState<'dashboard' | 'purchases' | 'products'>('dashboard');
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [adminPurchaseView, setAdminPurchaseView] = useState<'pending' | 'active'>('pending');
  const [adminLoading, setAdminLoading] = useState(false);


  // Estadísticas
  const totalPurchases = purchases.length;
  const activePurchases = purchases.filter(p => p.validated);
  const totalRevenue = activePurchases.reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <section className={`mx-auto max-w-7xl px-4 sm:px-6 pb-16 min-h-screen ${tv(isDark, 'bg-gray-50', 'bg-[#0a0a0a]')}`}>
      <div className="mb-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${tv(isDark, 'bg-white shadow-md border border-gray-100', 'bg-zinc-900 border border-zinc-800')}`}>
              <span className="text-3xl">🔧</span>
            </div>
            <div>
              <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                Panel Administrador
              </h3>
              <p className={`text-sm mt-1 font-medium ${tv(isDark, 'text-gray-500', 'text-zinc-500')}`}>
                Gestiona compras, administradores y configuración
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setAdminMenuOpen(true)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm transition-all hover:scale-105 ${tv(isDark, 'bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50', 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/20')}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Menú
            </button>
            <button
              onClick={refreshAllStats}
              disabled={loading}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm transition-all hover:scale-105 shadow-lg shadow-blue-600/20 ${tv(isDark, 'bg-blue-600 text-white hover:bg-blue-700', 'bg-blue-600 text-white hover:bg-blue-500')}`}
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Cargando...' : 'Actualizar Todo'}
            </button>
            <button
              onClick={() => onSetView('home')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 font-bold text-sm transition-all hover:scale-105 ${tv(isDark, 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200', 'bg-emerald-500 text-white hover:bg-emerald-400')}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Inicio
            </button>
          </div>
        </div>
      </div>

      {/* MÉTRICAS PRINCIPALES - Estilo Referencia */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* TOTAL COMPRAS */}
        <div className={`relative overflow-hidden rounded-2xl p-6 border transition-all ${tv(isDark, 'bg-white border-gray-100 shadow-sm', 'bg-zinc-900/50 border-white/5 shadow-xl')}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-[10px] sm:text-xs font-black tracking-widest uppercase opacity-60 ${tv(isDark, 'text-gray-900', 'text-white')}`}>
              TOTAL COMPRAS
            </span>
            <div className={`p-2 rounded-lg ${tv(isDark, 'bg-blue-50 text-blue-600', 'bg-blue-500/10 text-blue-400 border border-blue-500/20')}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className={`text-4xl sm:text-5xl font-black ${tv(isDark, 'text-gray-900', 'text-white')}`}>
            {totalPurchases}
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
        </div>

        {/* PENDIENTES */}
        <div className={`relative overflow-hidden rounded-2xl p-6 border transition-all ${tv(isDark, 'bg-white border-gray-100 shadow-sm', 'bg-zinc-900/50 border-white/5 shadow-xl')}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-[10px] sm:text-xs font-black tracking-widest uppercase opacity-60 ${tv(isDark, 'text-gray-900', 'text-white')}`}>
              PENDIENTES
            </span>
            <div className={`p-2 rounded-lg ${tv(isDark, 'bg-amber-50 text-amber-600', 'bg-amber-500/10 text-amber-400 border border-amber-500/20')}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className={`text-4xl sm:text-5xl font-black ${tv(isDark, 'text-gray-900', 'text-white')}`}>
            {pendingPurchases.length}
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* VALIDADAS */}
        <div className={`relative overflow-hidden rounded-2xl p-6 border transition-all ${tv(isDark, 'bg-white border-gray-100 shadow-sm', 'bg-zinc-900/50 border-white/5 shadow-xl')}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-[10px] sm:text-xs font-black tracking-widest uppercase opacity-60 ${tv(isDark, 'text-gray-900', 'text-white')}`}>
              VALIDADAS
            </span>
            <div className={`p-2 rounded-lg ${tv(isDark, 'bg-emerald-50 text-emerald-600', 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20')}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className={`text-4xl sm:text-5xl font-black ${tv(isDark, 'text-gray-900', 'text-white')}`}>
            {activePurchases.length}
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* VENCEN HOY */}
        <div className={`relative overflow-hidden rounded-2xl p-6 border transition-all ${tv(isDark, 'bg-white border-gray-100 shadow-sm', 'bg-zinc-900/50 border-white/5 shadow-xl')}`}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-[10px] sm:text-xs font-black tracking-widest uppercase opacity-60 ${tv(isDark, 'text-gray-900', 'text-white')}`}>
              VENCEN HOY
            </span>
            <div className={`p-2 rounded-lg ${tv(isDark, 'bg-rose-50 text-rose-600', 'bg-rose-500/10 text-rose-400 border border-rose-500/20')}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className={`text-4xl sm:text-5xl font-black ${tv(isDark, 'text-gray-900', 'text-white')}`}>
            {expiringServices.filter(s => s.days_remaining === 0).length}
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/5 rounded-full blur-3xl"></div>
        </div>
      </div>


      {/* BOTONES DE ACCIÓN - Estilo Referencia con Bordes de Color */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <button
          onClick={() => setAdminView('purchases')}
          className={`group relative flex flex-col items-center p-6 rounded-2xl border transition-all hover:scale-[1.03] text-center overflow-hidden ${tv(isDark, 'bg-white border-gray-100 shadow-sm hover:border-blue-200', 'bg-zinc-900/50 border-white/5 shadow-xl hover:border-blue-500/20')}`}
        >
          {/* Top colored border highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>

          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h4 className={`text-sm sm:text-base font-black tracking-tight mb-2 ${tv(isDark, 'text-gray-900', 'text-white')}`}>GESTIONAR COMPRAS</h4>
          <p className={`text-[10px] sm:text-xs font-medium px-2 leading-relaxed opacity-60 ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>
            Revisa, valida y notifica por WhatsApp
          </p>
        </button>

        <button
          onClick={onRegisterPurchase}
          className={`group relative flex flex-col items-center p-6 rounded-2xl border transition-all hover:scale-[1.03] text-center overflow-hidden ${tv(isDark, 'bg-white border-gray-100 shadow-sm hover:border-emerald-200', 'bg-zinc-900/50 border-white/5 shadow-xl hover:border-emerald-500/20')}`}
        >
          {/* Top colored border highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>

          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h4 className={`text-sm sm:text-base font-black tracking-tight mb-2 ${tv(isDark, 'text-gray-900', 'text-white')}`}>REGISTRAR COMPRA</h4>
          <p className={`text-[10px] sm:text-xs font-medium px-2 leading-relaxed opacity-60 ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>
            Crear compra manual para un usuario
          </p>
        </button>

        <button
          onClick={() => setAdminDrawerOpen(true)}
          className={`group relative flex flex-col items-center p-6 rounded-2xl border transition-all hover:scale-[1.03] text-center overflow-hidden ${tv(isDark, 'bg-white border-gray-100 shadow-sm hover:border-purple-200', 'bg-zinc-900/50 border-white/5 shadow-xl hover:border-purple-500/20')}`}
        >
          {/* Top colored border highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500"></div>

          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h4 className={`text-sm sm:text-base font-black tracking-tight mb-2 ${tv(isDark, 'text-gray-900', 'text-white')}`}>ADMINISTRADORES</h4>
          <p className={`text-[10px] sm:text-xs font-medium px-2 leading-relaxed opacity-60 ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>
            Agregar o quitar correos con acceso
          </p>
        </button>

        <button
          onClick={onExportCSV}
          className={`group relative flex flex-col items-center p-6 rounded-2xl border transition-all hover:scale-[1.03] text-center overflow-hidden ${tv(isDark, 'bg-white border-gray-100 shadow-sm hover:border-amber-200', 'bg-zinc-900/50 border-white/5 shadow-xl hover:border-amber-500/20')}`}
        >
          {/* Top colored border highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>

          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <h4 className={`text-sm sm:text-base font-black tracking-tight mb-2 ${tv(isDark, 'text-gray-900', 'text-white')}`}>EXPORTAR DATOS</h4>
          <p className={`text-[10px] sm:text-xs font-medium px-2 leading-relaxed opacity-60 ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>
            Descargar reporte en formato CSV
          </p>
        </button>
      </div>



      {adminView === 'products' ? (
        <AdminProductsManager
          isDark={isDark}
          services={services}
          combos={combos}
          onRefresh={refreshAllStats || (() => { })}
          onBack={() => setAdminView('dashboard')}
        />
      ) : (
        <>
          {/* GESTIÓN DE COMPRAS - Más compacta */}
          <div className={`rounded-xl p-4 sm:p-6 shadow-lg mb-4 sm:mb-6 border backdrop-blur-sm ${tv(isDark, 'bg-gradient-to-br from-white to-gray-50 border-gray-300 shadow-gray-200/50', 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 shadow-gray-900/50')}`}>
            {/* Navegación por pestañas - Estilo Referencia (Pill-style) */}
            <div className={`inline-flex p-1 rounded-2xl mb-8 ${tv(isDark, 'bg-gray-200/50', 'bg-zinc-900/50 border border-white/5')}`}>
              <button
                onClick={() => setAdminPurchaseView('pending')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${adminPurchaseView === 'pending'
                  ? 'bg-amber-600/20 text-amber-500 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                <span>⌛</span>
                PENDIENTES ({pendingPurchases.length})
              </button>
              <button
                onClick={() => setAdminPurchaseView('active')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${adminPurchaseView === 'active'
                  ? 'bg-emerald-600/20 text-emerald-500 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                <span>🎬</span>
                ACTIVAS ({activePurchases.length})
              </button>
            </div>

            {/* CONTENIDO DE PESTAÑAS */}
            {adminPurchaseView === 'pending' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl animate-pulse">⏳</span>
                    <h4 className={`text-xl font-black tracking-tight ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                      Compras Pendientes
                    </h4>
                  </div>
                  <span className="px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-black uppercase tracking-wider">
                    {pendingPurchases.length} pendientes
                  </span>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-2xl mb-2">⏳</div>
                    <p className={`text-sm font-medium ${tv(isDark, 'text-zinc-700', 'text-zinc-300')}`}>Cargando compras...</p>
                  </div>
                ) : pendingPurchases.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🎉</div>
                    <h5 className={`text-lg font-bold mb-2 ${tv(isDark, 'text-zinc-900', 'text-white')}`}>¡No hay compras pendientes!</h5>
                    <p className={`text-sm font-medium ${tv(isDark, 'text-zinc-700', 'text-zinc-300')}`}>Todas las compras han sido procesadas</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {pendingPurchases.map((purchase) => (
                      <PurchaseCard
                        key={purchase.id}
                        item={purchase}
                        isDark={isDark}
                        onToggleValidate={() => onToggleValidate(purchase.id)}
                        onDelete={() => onDeletePurchase(purchase.id)}
                        onEdit={() => onEditPurchase(purchase)}
                        onReminder={() => onReminderPurchase?.(purchase)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {adminPurchaseView === 'active' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <h4 className={`text-lg sm:text-xl font-bold ${tv(isDark, 'text-zinc-900', 'text-white')}`}>✅ Compras Activas</h4>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${tv(isDark, 'bg-green-200 text-green-900 border-green-400', 'bg-green-800 text-green-100 border-green-500')}`}>
                    {activePurchases.length} activas
                  </span>
                </div>

                {activePurchases.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📊</div>
                    <h5 className={`text-lg font-bold mb-2 ${tv(isDark, 'text-zinc-900', 'text-white')}`}>No hay compras activas</h5>
                    <p className={`text-sm font-medium ${tv(isDark, 'text-zinc-700', 'text-zinc-300')}`}>Las compras activas aparecerán aquí</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {activePurchases.map((purchase) => (
                      <PurchaseCard
                        key={purchase.id}
                        item={purchase}
                        isDark={isDark}
                        onToggleValidate={() => onToggleValidate(purchase.id)}
                        onDelete={() => onDeletePurchase(purchase.id)}
                        onEdit={() => onEditPurchase(purchase)}
                        onReminder={() => onReminderPurchase?.(purchase)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Drawers */}
      <AdminDrawer
        open={adminDrawerOpen}
        onClose={() => setAdminDrawerOpen(false)}
        isDark={isDark}
        adminUsers={adminUsers}
        setAdminUsers={setAdminUsers}
      />

      <AdminMenuDrawer
        open={adminMenuOpen}
        onClose={() => setAdminMenuOpen(false)}
        isDark={isDark}
        setSubView={() => { }}
        openAdmins={() => setAdminDrawerOpen(true)}
        onExportCSV={onExportCSV}
        onLogout={onLogout}
        onRegisterPurchase={onRegisterPurchase}
      />
    </section>
  );
}


