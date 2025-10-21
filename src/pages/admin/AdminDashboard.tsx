import React, { useState } from 'react';
import { fmt, tv } from '../../utils/helpers';
import { PurchaseCard } from '../../components/PurchaseCard';
import { AdminDrawer } from '../../components/admin/AdminDrawer';
import { AdminMenuDrawer } from '../../components/admin/AdminMenuDrawer';
import { testDatabaseConnection, createTestPurchase, testConnection } from '../../lib/supabase';

interface AdminDashboardProps {
  isDark: boolean;
  purchases: any[];
  pendingPurchases?: any[];
  expiringServices?: any[];
  renewalStats?: any;
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
  const [adminView, setAdminView] = useState<'dashboard' | 'purchases'>('dashboard');
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [adminPurchaseView, setAdminPurchaseView] = useState<'pending' | 'active'>('pending');
  const [adminLoading, setAdminLoading] = useState(false);


  // Estadísticas
  const totalPurchases = purchases.length;
  const activePurchases = purchases.filter(p => p.validated);
  const totalRevenue = activePurchases.reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <section className="mx-auto max-w-6xl px-3 sm:px-4 pb-8 sm:pb-16">
      <div className="mb-3 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">🔧 Panel Administrador</h3>
            <p className={`text-xs sm:text-sm ${tv(isDark,'text-zinc-600','text-zinc-300')}`}>Gestiona compras, administradores y configuración</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button 
               onClick={() => setAdminMenuOpen(true)}
               className={`rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm hover:scale-105 transition-transform ${tv(isDark,'bg-zinc-200 text-zinc-800 hover:bg-zinc-300','bg-zinc-700 text-zinc-200 hover:bg-zinc-600')}`}
            >
               ☰ Menú
            </button>
            <button 
               onClick={refreshAllStats}
               disabled={loading}
               className={`rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm hover:scale-105 transition-transform disabled:opacity-50 ${tv(isDark,'bg-blue-600 text-white hover:bg-blue-700','bg-blue-500 text-white hover:bg-blue-600')}`}
            >
               {loading ? '⏳ Cargando...' : '🔄 Actualizar Todo'}
            </button>
            <button 
               onClick={() => onSetView('home')}
               className={`rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm hover:scale-105 transition-transform ${tv(isDark,'bg-zinc-100 text-zinc-700 hover:bg-zinc-200','bg-zinc-800 text-zinc-200 hover:bg-zinc-700')}`}
            >
               ← Inicio
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARD COMPLETO - Más compacto */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <div className={`rounded-xl p-3 sm:p-4 shadow-lg border ${tv(isDark,'bg-gradient-to-br from-white to-gray-50 border-gray-300 shadow-gray-200/50','bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 shadow-gray-900/50')}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-xs font-bold mb-1 ${tv(isDark,'text-gray-800','text-gray-200')}`}>TOTAL COMPRAS</div>
              <div className={`text-xl sm:text-2xl font-black ${tv(isDark,'text-gray-900','text-white')}`}>{totalPurchases}</div>
            </div>
            <div className={`text-2xl sm:text-3xl p-2 rounded-lg ${tv(isDark,'bg-blue-100 text-blue-600','bg-blue-900 text-blue-300')}`}>📊</div>
          </div>
        </div>
        <div className={`rounded-xl p-3 sm:p-4 shadow-lg border ${tv(isDark,'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-amber-200/50','bg-gradient-to-br from-amber-900 to-orange-900 border-amber-600 shadow-amber-900/50')}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-xs font-bold mb-1 ${tv(isDark,'text-amber-800','text-amber-200')}`}>PENDIENTES</div>
              <div className={`text-xl sm:text-2xl font-black ${tv(isDark,'text-amber-900','text-amber-100')}`}>{pendingPurchases.length}</div>
            </div>
            <div className={`text-2xl sm:text-3xl p-2 rounded-lg ${tv(isDark,'bg-amber-200 text-amber-700','bg-amber-800 text-amber-300')}`}>⏳</div>
          </div>
        </div>
        <div className={`rounded-xl p-3 sm:p-4 shadow-lg border ${tv(isDark,'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-green-200/50','bg-gradient-to-br from-green-900 to-emerald-900 border-green-600 shadow-green-900/50')}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-xs font-bold mb-1 ${tv(isDark,'text-green-800','text-green-200')}`}>VALIDADAS</div>
              <div className={`text-xl sm:text-2xl font-black ${tv(isDark,'text-green-900','text-green-100')}`}>{activePurchases.length}</div>
            </div>
            <div className={`text-2xl sm:text-3xl p-2 rounded-lg ${tv(isDark,'bg-green-200 text-green-700','bg-green-800 text-green-300')}`}>✅</div>
          </div>
        </div>
        <div className={`rounded-xl p-3 sm:p-4 shadow-lg border ${tv(isDark,'bg-gradient-to-br from-red-50 to-rose-50 border-red-300 shadow-red-200/50','bg-gradient-to-br from-red-900 to-rose-900 border-red-600 shadow-red-900/50')}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-xs font-bold mb-1 ${tv(isDark,'text-red-800','text-red-200')}`}>VENCEN HOY</div>
              <div className={`text-xl sm:text-2xl font-black ${tv(isDark,'text-red-900','text-red-100')}`}>{expiringServices.filter(s => s.days_remaining === 0).length}</div>
            </div>
            <div className={`text-2xl sm:text-3xl p-2 rounded-lg ${tv(isDark,'bg-red-200 text-red-700','bg-red-800 text-red-300')}`}>⚠️</div>
          </div>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN - Más compactos */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <button 
          onClick={()=>setAdminView('purchases')} 
          className={`rounded-xl p-3 sm:p-4 text-left transition-all hover:scale-105 shadow-lg border ${tv(isDark,'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-500 shadow-blue-600/30','bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-400 shadow-blue-600/30')}`}
        >
          <div className="text-xl sm:text-2xl mb-2">🛒</div>
          <div className="text-sm sm:text-base font-bold mb-1">GESTIONAR COMPRAS</div>
          <div className="text-xs opacity-90">Revisa, valida y notifica por WhatsApp</div>
        </button>
        
        <button 
          onClick={onRegisterPurchase} 
          className={`rounded-xl p-3 sm:p-4 text-left transition-all hover:scale-105 shadow-lg border ${tv(isDark,'bg-gradient-to-br from-green-600 to-green-700 text-white border-green-500 shadow-green-600/30','bg-gradient-to-br from-green-600 to-green-700 text-white border-green-400 shadow-green-600/30')}`}
        >
          <div className="text-xl sm:text-2xl mb-2">➕</div>
          <div className="text-sm sm:text-base font-bold mb-1">REGISTRAR COMPRA</div>
          <div className="text-xs opacity-90">Crear compra manual para un usuario</div>
        </button>
        
        <button 
          onClick={()=>setAdminDrawerOpen(true)} 
          className={`rounded-xl p-3 sm:p-4 text-left transition-all hover:scale-105 shadow-lg border ${tv(isDark,'bg-gradient-to-br from-purple-600 to-purple-700 text-white border-purple-500 shadow-purple-600/30','bg-gradient-to-br from-purple-600 to-purple-700 text-white border-purple-400 shadow-purple-600/30')}`}
        >
          <div className="text-xl sm:text-2xl mb-2">👥</div>
          <div className="text-sm sm:text-base font-bold mb-1">ADMINISTRADORES</div>
          <div className="text-xs opacity-90">Agregar o quitar correos con acceso</div>
        </button>
        
        <button 
          onClick={onExportCSV} 
          className={`rounded-xl p-3 sm:p-4 text-left transition-all hover:scale-105 shadow-lg border ${tv(isDark,'bg-gradient-to-br from-orange-600 to-orange-700 text-white border-orange-500 shadow-orange-600/30','bg-gradient-to-br from-orange-600 to-orange-700 text-white border-orange-400 shadow-orange-600/30')}`}
        >
          <div className="text-xl sm:text-2xl mb-2">📊</div>
          <div className="text-sm sm:text-base font-bold mb-1">EXPORTAR DATOS</div>
          <div className="text-xs opacity-90">Descargar reporte en formato CSV</div>
        </button>
      </div>

      {/* GESTIÓN DE COMPRAS - Más compacta */}
      <div className={`rounded-xl p-4 sm:p-6 shadow-lg mb-4 sm:mb-6 border backdrop-blur-sm ${tv(isDark,'bg-gradient-to-br from-white to-gray-50 border-gray-300 shadow-gray-200/50','bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 shadow-gray-900/50')}`}>
        {/* Navegación por pestañas - Más compacta */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setAdminPurchaseView('pending')}
              className={`px-4 py-2 rounded-xl font-bold transition-all text-xs border shadow-md ${
                adminPurchaseView === 'pending' 
                  ? tv(isDark,'bg-gradient-to-r from-amber-400 to-orange-500 text-amber-900 border-amber-500 shadow-amber-400/30','bg-gradient-to-r from-amber-600 to-orange-600 text-amber-100 border-amber-500 shadow-amber-600/30')
                  : tv(isDark,'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border-gray-300 shadow-gray-200/30','bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300 hover:from-gray-600 hover:to-gray-500 border-gray-500 shadow-gray-700/30')
              }`}
            >
              ⏳ PENDIENTES ({pendingPurchases.length})
            </button>
            <button
              onClick={() => setAdminPurchaseView('active')}
              className={`px-4 py-2 rounded-xl font-bold transition-all text-xs border shadow-md ${
                adminPurchaseView === 'active' 
                  ? tv(isDark,'bg-gradient-to-r from-green-400 to-emerald-500 text-green-900 border-green-500 shadow-green-400/30','bg-gradient-to-r from-green-600 to-emerald-600 text-green-100 border-green-500 shadow-green-600/30')
                  : tv(isDark,'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 border-gray-300 shadow-gray-200/30','bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300 hover:from-gray-600 hover:to-gray-500 border-gray-500 shadow-gray-700/30')
              }`}
            >
              ✅ ACTIVAS ({activePurchases.length})
            </button>
          </div>
        </div>

        {/* CONTENIDO DE PESTAÑAS */}
        {adminPurchaseView === 'pending' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h4 className={`text-lg sm:text-xl font-bold ${tv(isDark,'text-zinc-900','text-white')}`}>⏳ Compras Pendientes</h4>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${tv(isDark,'bg-amber-200 text-amber-900 border-amber-400','bg-amber-800 text-amber-100 border-amber-500')}`}>
                {pendingPurchases.length} pendientes
              </span>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-2xl mb-2">⏳</div>
                <p className={`text-sm font-medium ${tv(isDark,'text-zinc-700','text-zinc-300')}`}>Cargando compras...</p>
              </div>
            ) : pendingPurchases.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎉</div>
                <h5 className={`text-lg font-bold mb-2 ${tv(isDark,'text-zinc-900','text-white')}`}>¡No hay compras pendientes!</h5>
                <p className={`text-sm font-medium ${tv(isDark,'text-zinc-700','text-zinc-300')}`}>Todas las compras han sido procesadas</p>
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
              <h4 className={`text-lg sm:text-xl font-bold ${tv(isDark,'text-zinc-900','text-white')}`}>✅ Compras Activas</h4>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${tv(isDark,'bg-green-200 text-green-900 border-green-400','bg-green-800 text-green-100 border-green-500')}`}>
                {activePurchases.length} activas
              </span>
            </div>
            
            {activePurchases.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📊</div>
                <h5 className={`text-lg font-bold mb-2 ${tv(isDark,'text-zinc-900','text-white')}`}>No hay compras activas</h5>
                <p className={`text-sm font-medium ${tv(isDark,'text-zinc-700','text-zinc-300')}`}>Las compras activas aparecerán aquí</p>
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

      {/* Drawers */}
      <AdminDrawer 
        open={adminDrawerOpen} 
        onClose={()=>setAdminDrawerOpen(false)} 
        isDark={isDark} 
        adminUsers={adminUsers} 
        setAdminUsers={setAdminUsers} 
      />
      
      <AdminMenuDrawer 
        open={adminMenuOpen} 
        onClose={()=>setAdminMenuOpen(false)} 
        isDark={isDark} 
        setSubView={() => {}} 
        openAdmins={()=>setAdminDrawerOpen(true)} 
        onExportCSV={onExportCSV} 
        onLogout={onLogout} 
        onRegisterPurchase={onRegisterPurchase} 
      />
    </section>
  );
}


