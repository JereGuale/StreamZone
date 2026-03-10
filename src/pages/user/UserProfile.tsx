import React, { useState } from 'react';
import { fmt, getDaysRemaining, getServiceDays, tv } from '../../utils/helpers';
import { PurchaseCard } from '../../components/PurchaseCard';

interface UserProfileProps {
  isDark: boolean;
  user: any;
  purchases: any[];
  onToggleValidate: (id: string) => void;
  onDeletePurchase: (id: string) => void;
  onEditPurchase: (purchase: any) => void;
  onSetView: (view: string) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

export function UserProfile({ isDark, user, purchases, onToggleValidate, onDeletePurchase, onEditPurchase, onSetView, loading = false, onRefresh }: UserProfileProps) {
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const userActivePurchases = purchases.filter(p => p.phone === user.phone && p.validated);

  return (
    <section className={`min-h-screen transition-all duration-500 ${isDark ? 'bg-[#0B1120]' : 'bg-gray-50'} pb-20`}>
      {/* Top Security Bar */}
      <div className={`w-full py-2.5 px-4 border-b flex items-center justify-center gap-2 ${isDark ? 'bg-blue-500/5 border-blue-500/10 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'
        }`}>
        <span className="text-sm">🛡️</span>
        <span className="text-xs font-black uppercase tracking-widest text-green-500">Seguridad de cuenta garantizada</span>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-12">
        {/* Profile Header - Premium Centered */}
        <div className="relative mb-12">
          {isDark && (
            <div className="absolute -top-10 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] -z-10 pointer-events-none"></div>
          )}

          <div className={`relative p-8 rounded-[40px] border backdrop-blur-xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#0F172A]/80 border-white/5' : 'bg-white/90 border-gray-200'
            }`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                {/* Enhanced Avatar */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                  <div className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 ${isDark ? 'border-[#0B1120]' : 'border-white'
                    } bg-gradient-to-br from-blue-600 to-purple-700`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-[#0F172A] rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-[10px]">✓</span>
                  </div>
                </div>

                <div>
                  <h1 className={`text-3xl sm:text-4xl font-black mb-2 tracking-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>
                    {user.name} <span className="text-blue-500 text-2xl">👤</span>
                  </h1>
                  <p className={`text-base font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Bienvenido a tu zona de entretenimiento premium
                  </p>
                </div>
              </div>

              <button
                onClick={() => onSetView('home')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>←</span> Volver al inicio
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Nombre Completo', value: user.name, icon: '👤' },
            { label: 'WhatsApp / Usuario', value: user.phone, icon: '📱' },
            { label: 'Correo Electrónico', value: user.email || 'No proporcionado', icon: '📧' },
            { label: 'Miembro Activo desde', value: new Date().toLocaleDateString('es-ES'), icon: '📅' }
          ].map((item, i) => (
            <div key={i} className={`p-6 rounded-[32px] border transition-all duration-300 ${isDark ? 'bg-[#1e293b]/40 border-white/5' : 'bg-white border-gray-200'
              }`}>
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                  {item.icon}
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </div>
              <p className={`text-lg font-black truncate ${isDark ? 'text-white' : 'text-gray-950'}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Mis Compras Activas */}
        <div className={`relative overflow-hidden rounded-[40px] border backdrop-blur-xl shadow-2xl ${isDark ? 'bg-[#0F172A]/80 border-white/5' : 'bg-white/90 border-gray-200'
          }`}>
          <div className="relative p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${isDark ? 'bg-gradient-to-br from-green-500/20 to-blue-600/20 text-green-400' : 'bg-green-50 text-green-600'
                  }`}>
                  🛍️
                </div>
                <div>
                  <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>
                    Mis Compras Activas
                  </h2>
                  <p className={`text-sm font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Gestiona tus suscripciones vigentes
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRefresh ? onRefresh() : window.location.reload()}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
              >
                <span>🔄</span> Actualizar lista
              </button>
            </div>

            {userActivePurchases.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-gray-800/20 rounded-[32px]">
                <div className="text-5xl mb-6 opacity-30">📺</div>
                <h4 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Aún no tienes suscripciones</h4>
                <p className={`text-sm mb-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Explora nuestro catálogo y activa tu entretenimiento hoy mismo.</p>
                <button
                  onClick={() => onSetView('home')}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-all"
                >
                  🚀 Ver catálogo de servicios
                </button>
              </div>
            ) : loading ? (
              <div className="text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-950'}`}>Cargando tus servicios...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userActivePurchases
                  .filter((purchase) => getDaysRemaining(purchase.end) >= 0)
                  .map((purchase) => (
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
        </div>
      </div>
    </section>
  );
}