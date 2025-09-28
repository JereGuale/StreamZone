import React, { useState } from 'react';
import { fmt, tv } from '../../utils/helpers';
import { PurchaseCard } from '../../components/PurchaseCard';
import { AdminDrawer } from '../../components/admin/AdminDrawer';
import { AdminMenuDrawer } from '../../components/admin/AdminMenuDrawer';

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

  // Debug: Log purchases
  console.log('🏢 AdminDashboard received purchases:', purchases);
  console.log('🔍 onToggleValidate function:', onToggleValidate);
  console.log('🗑️ onDeletePurchase function:', onDeletePurchase);

  // Estadísticas
  const totalPurchases = purchases.length;
  const activePurchases = purchases.filter(p => p.validated);
  const totalRevenue = activePurchases.reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <section className="mx-auto max-w-6xl px-3 sm:px-4 pb-8 sm:pb-16">
      <div className="mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold">🔧 Panel Administrador</h3>
            <p className={`text-sm sm:text-base ${tv(isDark,'text-zinc-600','text-zinc-300')}`}>Gestiona compras, administradores y configuración</p>
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
               disabled={adminLoading}
               className={`rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm hover:scale-105 transition-transform disabled:opacity-50 ${tv(isDark,'bg-blue-600 text-white hover:bg-blue-700','bg-blue-500 text-white hover:bg-blue-600')}`}
            >
               {adminLoading ? '⏳ Cargando...' : '🔄 Actualizar Todo'}
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

      {/* DASHBOARD COMPLETO - Optimizado para móviles */}
      <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <div className={`rounded-xl p-3 sm:p-6 shadow-lg border-2 ${tv(isDark,'bg-white border-zinc-300','bg-zinc-800 border-zinc-600')}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-xs sm:text-sm font-semibold mb-1 ${tv(isDark,'text-zinc-700','text-zinc-300')}`}>Total Compras</div>
              <div className={`text-xl sm:text-3xl font-bold ${tv(isDark,'text-zinc-900','text-white')}`}>{totalPurchases}</div>
            </div>
            <div className="text-xl sm:text-3xl">📊</div>
          </div>
        </div>
        <div className={`rounded-xl p-3 sm:p-6 shadow-lg border-2 ${tv(isDark,'bg-white border-zinc-300','bg-zinc-800 border-zinc-600')}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-xs sm:text-sm font-semibold mb-1 ${tv(isDark,'text-zinc-700','text-zinc-300')}`}>Pendientes</div>
              <div className="text-xl sm:text-3xl font-bold text-amber-700 dark:text-amber-400">{pendingPurchases.length}</div>
            </div>
            <div className="text-xl sm:text-3xl">⏳</div>
          </div>
        </div>
        <div className={`rounded-xl p-3 sm:p-6 shadow-lg border-2 ${tv(isDark,'bg-white border-zinc-300','bg-zinc-800 border-zinc-600')}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-xs sm:text-sm font-semibold mb-1 ${tv(isDark,'text-zinc-700','text-zinc-300')}`}>Validadas</div>
              <div className="text-xl sm:text-3xl font-bold text-green-700 dark:text-green-400">{activePurchases.length}</div>
            </div>
            <div className="text-xl sm:text-3xl">✅</div>
          </div>
        </div>
        <div className={`rounded-xl p-3 sm:p-6 shadow-lg border-2 ${tv(isDark,'bg-white border-zinc-300','bg-zinc-800 border-zinc-600')}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-xs sm:text-sm font-semibold mb-1 ${tv(isDark,'text-zinc-700','text-zinc-300')}`}>Vencen Hoy</div>
              <div className="text-xl sm:text-3xl font-bold text-red-700 dark:text-red-400">{expiringServices.filter(s => s.days_remaining === 0).length}</div>
            </div>
            <div className="text-xl sm:text-3xl">⚠️</div>
          </div>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN - Optimizados para móviles */}
      <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <button 
          onClick={()=>setAdminView('purchases')} 
          className={`rounded-xl p-4 sm:p-6 text-left transition-all hover:scale-105 ${tv(isDark,'bg-zinc-900 text-white shadow-lg','bg-white text-zinc-900 shadow-lg')}`}
        >
          <div className="text-xl sm:text-2xl mb-2">🛒</div>
          <div className="text-lg sm:text-xl font-bold mb-2">Gestionar Compras</div>
          <div className="text-xs sm:text-sm opacity-70">Revisa, valida y notifica por WhatsApp</div>
        </button>
        
        <button 
          onClick={onRegisterPurchase} 
          className={`rounded-xl p-4 sm:p-6 text-left transition-all hover:scale-105 ${tv(isDark,'bg-blue-600 text-white shadow-lg','bg-blue-600 text-white shadow-lg')}`}
        >
          <div className="text-xl sm:text-2xl mb-2">➕</div>
          <div className="text-lg sm:text-xl font-bold mb-2">Registrar Compra</div>
          <div className="text-xs sm:text-sm opacity-70">Crear compra manual para un usuario</div>
        </button>
        
        <button 
          onClick={()=>setAdminDrawerOpen(true)} 
          className={`rounded-xl p-4 sm:p-6 text-left transition-all hover:scale-105 ${tv(isDark,'bg-zinc-900 text-white shadow-lg','bg-white text-zinc-900 shadow-lg')}`}
        >
          <div className="text-xl sm:text-2xl mb-2">👥</div>
          <div className="text-lg sm:text-xl font-bold mb-2">Administradores</div>
          <div className="text-xs sm:text-sm opacity-70">Agregar o quitar correos con acceso</div>
        </button>
        
        <button 
          onClick={onExportCSV} 
          className={`rounded-xl p-4 sm:p-6 text-left transition-all hover:scale-105 ${tv(isDark,'bg-zinc-900 text-white shadow-lg','bg-white text-zinc-900 shadow-lg')}`}
        >
          <div className="text-xl sm:text-2xl mb-2">📊</div>
          <div className="text-lg sm:text-xl font-bold mb-2">Exportar Datos</div>
          <div className="text-xs sm:text-sm opacity-70">Descargar reporte en formato CSV</div>
        </button>
      </div>

      {/* GESTIÓN DE COMPRAS - Optimizada para móviles */}
      <div className={`rounded-xl p-3 sm:p-6 shadow-lg mb-4 sm:mb-6 border-2 ${tv(isDark,'bg-white border-zinc-300','bg-zinc-800 border-zinc-600')}`}>
        {/* Navegación por pestañas - Responsiva */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setAdminPurchaseView('pending')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all text-sm border-2 ${
                adminPurchaseView === 'pending' 
                  ? tv(isDark,'bg-amber-200 text-amber-900 border-amber-400','bg-amber-800 text-amber-100 border-amber-500')
                  : tv(isDark,'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-zinc-300','bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border-zinc-500')
              }`}
            >
              ⏳ Pendientes ({pendingPurchases.length})
            </button>
            <button
              onClick={() => setAdminPurchaseView('active')}
              className={`px-4 py-3 rounded-xl font-semibold transition-all text-sm border-2 ${
                adminPurchaseView === 'active' 
                  ? tv(isDark,'bg-green-200 text-green-900 border-green-400','bg-green-800 text-green-100 border-green-500')
                  : tv(isDark,'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-zinc-300','bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border-zinc-500')
              }`}
            >
              ✅ Activas ({activePurchases.length})
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
            
            {adminLoading ? (
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