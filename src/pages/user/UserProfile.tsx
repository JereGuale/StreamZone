import React, { useState } from 'react';
import { fmt, tv, getServiceStatus, getDaysRemaining, getServiceDays } from '../../utils/helpers';

interface UserProfileProps {
  isDark: boolean;
  user: any;
  purchases: any[];
  onToggleValidate: (id: string) => void;
  onDeletePurchase: (id: string) => void;
  onEditPurchase: (purchase: any) => void;
  onSetView: (view: string) => void;
  loading?: boolean;
}

export function UserProfile({ isDark, user, purchases, onToggleValidate, onDeletePurchase, onEditPurchase, onSetView, loading = false }: UserProfileProps) {
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const userActivePurchases = purchases.filter(p => p.phone === user.phone && p.validated);

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 pb-8 sm:pb-16">
      {/* Barra superior con mensaje de seguridad */}
      <div className={`w-full py-2 px-4 rounded-t-2xl ${tv(isDark, 'bg-gray-800', 'bg-gray-900')} mb-0`}>
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="text-green-400 text-sm">🛡️</div>
            <span className="text-xs font-semibold text-green-300">
              Seguridad Garantizada
            </span>
          </div>
        </div>
      </div>
      
      {/* Header con gradiente y efectos */}
      <div className="relative mb-8 sm:mb-12">
        <div className={`absolute inset-0 rounded-3xl ${tv(isDark, 'bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10', 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20')} blur-xl`}></div>
        <div className={`relative p-6 sm:p-8 rounded-3xl backdrop-blur-sm border ${tv(isDark, 'bg-white/80 border-white/20', 'bg-zinc-900/80 border-zinc-700/50')} shadow-2xl`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Avatar con gradiente */}
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold ${tv(isDark, 'bg-gradient-to-br from-blue-500 to-purple-600 text-white', 'bg-gradient-to-br from-blue-400 to-purple-500 text-white')} shadow-lg`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                  👤 Mi Perfil
                </h3>
                <p className={`text-sm sm:text-lg ${tv(isDark,'text-zinc-600','text-zinc-300')} font-medium`}>
                  Gestiona tu cuenta y compras activas
                </p>
              </div>
            </div>
            
            
            <button 
              onClick={() => onSetView('home')}
              className={`group relative overflow-hidden rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 ${tv(isDark,'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl','bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg hover:shadow-xl')}`}
            >
              <span className="relative z-10 flex items-center gap-2">
                ← Inicio
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Información del perfil con diseño mejorado */}
        <div className={`relative overflow-hidden rounded-3xl border ${tv(isDark,'bg-white/90 border-white/20','bg-zinc-900/90 border-zinc-700/50')} shadow-2xl backdrop-blur-sm`}>
          <div className={`absolute inset-0 ${tv(isDark, 'bg-gradient-to-br from-blue-50/50 to-purple-50/50', 'bg-gradient-to-br from-blue-900/20 to-purple-900/20')}`}></div>
          <div className="relative p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tv(isDark, 'bg-gradient-to-br from-blue-500 to-purple-600', 'bg-gradient-to-br from-blue-400 to-purple-500')} shadow-lg`}>
                <span className="text-white text-lg">👤</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Información Personal
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`p-4 rounded-2xl ${tv(isDark, 'bg-white/60 border border-white/30', 'bg-zinc-800/60 border border-zinc-700/30')} backdrop-blur-sm`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">👤</span>
                  <label className={`text-sm font-semibold ${tv(isDark, 'text-zinc-700', 'text-zinc-300')}`}>Nombre</label>
                </div>
                <p className={`font-bold text-lg ${tv(isDark, 'text-zinc-900', 'text-zinc-100')}`}>{user.name}</p>
              </div>
              <div className={`p-4 rounded-2xl ${tv(isDark, 'bg-white/60 border border-white/30', 'bg-zinc-800/60 border border-zinc-700/30')} backdrop-blur-sm`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📱</span>
                  <label className={`text-sm font-semibold ${tv(isDark, 'text-zinc-700', 'text-zinc-300')}`}>WhatsApp</label>
                </div>
                <p className={`font-bold text-lg ${tv(isDark, 'text-zinc-900', 'text-zinc-100')}`}>{user.phone}</p>
              </div>
              <div className={`p-4 rounded-2xl ${tv(isDark, 'bg-white/60 border border-white/30', 'bg-zinc-800/60 border border-zinc-700/30')} backdrop-blur-sm`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📧</span>
                  <label className={`text-sm font-semibold ${tv(isDark, 'text-zinc-700', 'text-zinc-300')}`}>Email</label>
                </div>
                <p className={`font-bold text-lg ${tv(isDark, 'text-zinc-900', 'text-zinc-100')}`}>{user.email || 'No proporcionado'}</p>
              </div>
              <div className={`p-4 rounded-2xl ${tv(isDark, 'bg-white/60 border border-white/30', 'bg-zinc-800/60 border border-zinc-700/30')} backdrop-blur-sm`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📅</span>
                  <label className={`text-sm font-semibold ${tv(isDark, 'text-zinc-700', 'text-zinc-300')}`}>Miembro desde</label>
                </div>
                <p className={`font-bold text-lg ${tv(isDark, 'text-zinc-900', 'text-zinc-100')}`}>{new Date().toLocaleDateString('es-ES')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mis Compras Activas con diseño mejorado */}
        <div className={`relative overflow-hidden rounded-3xl border ${tv(isDark,'bg-white/90 border-white/20','bg-zinc-900/90 border-zinc-700/50')} shadow-2xl backdrop-blur-sm`}>
          <div className={`absolute inset-0 ${tv(isDark, 'bg-gradient-to-br from-green-50/50 to-blue-50/50', 'bg-gradient-to-br from-green-900/20 to-blue-900/20')}`}></div>
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tv(isDark, 'bg-gradient-to-br from-green-500 to-blue-600', 'bg-gradient-to-br from-green-400 to-blue-500')} shadow-lg`}>
                  <span className="text-white text-lg">🛍️</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Mis Compras Activas
                </h3>
              </div>
              <button 
                onClick={() => window.location.reload()}
                className={`group relative overflow-hidden rounded-2xl px-4 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105 ${tv(isDark,'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl','bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg hover:shadow-xl')}`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  🔄 Actualizar
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {userActivePurchases.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${tv(isDark, 'bg-gradient-to-br from-blue-100 to-purple-100', 'bg-gradient-to-br from-blue-900/30 to-purple-900/30')} shadow-lg`}>
                  <span className="text-4xl">📺</span>
                </div>
                <h4 className={`text-xl font-bold mb-2 ${tv(isDark,'text-zinc-800','text-zinc-200')}`}>No tienes compras activas</h4>
                <p className={`text-sm mb-6 ${tv(isDark,'text-zinc-600','text-zinc-400')}`}>Explora nuestro catálogo y encuentra el servicio perfecto para ti</p>
                <button 
                  onClick={() => onSetView('home')}
                  className={`group relative overflow-hidden rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 ${tv(isDark,'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl','bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg hover:shadow-xl')}`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    🛍️ Ver Catálogo
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            ) : loading ? (
              <div className={`text-center py-12 ${tv(isDark, 'text-gray-500', 'text-gray-400')}`}>
                <div className="text-6xl mb-4 animate-spin">⏳</div>
                <h3 className="text-xl font-bold mb-2">Cargando tus suscripciones...</h3>
                <p className="text-sm">Por favor espera un momento</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {userActivePurchases
                  .filter((purchase) => getDaysRemaining(purchase.end) >= 0)
                  .map((purchase) => {
                    const serviceStatus = getServiceStatus(purchase.end);
                    const daysRemaining = getDaysRemaining(purchase.end);
                    const serviceDays = getServiceDays(purchase.start, purchase.end);
                    
                    return (
                      <div key={purchase.id} className={`group relative overflow-hidden rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${tv(isDark, 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-blue-300', 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500')}`}>
                        {/* Header elegante con gradiente */}
                        <div className={`relative p-5 ${tv(isDark, 'bg-gradient-to-r from-blue-50 to-purple-50', 'bg-gradient-to-r from-blue-900/30 to-purple-900/30')}`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${tv(isDark, 'bg-gradient-to-br from-blue-500 to-purple-600 text-white', 'bg-gradient-to-br from-blue-600 to-purple-700 text-white')}`}>
                              {purchase.service === 'Netflix' ? '🎬' :
                               purchase.service === 'Disney+' ? '🏰' :
                               purchase.service === 'Max' ? '🎭' :
                               purchase.service === 'Prime Video' ? '📺' :
                               purchase.service === 'Spotify' ? '🎧' : '📱'}
                            </div>
                            <div>
                              <h4 className={`font-bold text-lg ${tv(isDark, 'text-gray-900', 'text-white')}`}>{purchase.service}</h4>
                              <p className={`text-sm ${tv(isDark, 'text-gray-600', 'text-gray-300')}`}>
                                {purchase.months} meses • Activo
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Tiempo restante elegante */}
                        <div className={`p-5 text-center ${tv(isDark, 'bg-white', 'bg-gray-800')}`}>
                          <div className="text-center">
                            <p className="text-4xl font-black text-red-600">
                              {daysRemaining}
                            </p>
                            <p className="text-lg font-bold text-red-600">
                              días restantes
                            </p>
                          </div>
                          <p className={`text-sm font-medium mt-2 ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>
                            {daysRemaining <= 7 ? 'Vence muy pronto' : daysRemaining <= 30 ? 'Vence en menos de un mes' : 'Tiempo suficiente'}
                          </p>
                        </div>
                        
                        {/* Fechas elegantes */}
                        <div className={`px-5 py-4 ${tv(isDark, 'bg-gray-50', 'bg-gray-700')}`}>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${tv(isDark, 'bg-blue-100', 'bg-blue-900/30')}`}>
                                <span className="text-blue-600 text-lg">📅</span>
                              </div>
                              <p className={`text-xs font-medium ${tv(isDark, 'text-gray-500', 'text-gray-400')}`}>Inicio</p>
                              <p className={`text-sm font-bold ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                                {new Date(purchase.start).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: '2-digit'})}
                              </p>
                            </div>
                            <div className="text-center">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${tv(isDark, 'bg-orange-100', 'bg-orange-900/30')}`}>
                                <span className="text-orange-600 text-lg">⏰</span>
                              </div>
                              <p className={`text-xs font-medium ${tv(isDark, 'text-gray-500', 'text-gray-400')}`}>Vence</p>
                              <p className={`text-sm font-bold ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                                {new Date(purchase.end).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: '2-digit'})}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Credenciales elegantes */}
                        {purchase.service_email && purchase.service_password && (
                          <div className={`p-5 ${tv(isDark,'bg-gradient-to-r from-blue-50 to-indigo-50','bg-gradient-to-r from-blue-900/20 to-indigo-900/20')}`}>
                            <div className="flex items-center gap-2 mb-4">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tv(isDark, 'bg-blue-100', 'bg-blue-900/30')}`}>
                                <span className="text-blue-600 text-sm">🔑</span>
                              </div>
                              <h5 className={`font-bold text-base ${tv(isDark, 'text-blue-900', 'text-blue-200')}`}>Credenciales</h5>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <p className={`text-sm font-semibold mb-2 ${tv(isDark, 'text-blue-700', 'text-blue-300')}`}>Email</p>
                                <div className={`p-3 rounded-xl border-2 ${tv(isDark, 'bg-white border-blue-200', 'bg-gray-800 border-blue-600')}`}>
                                  <p className={`text-sm font-mono ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                                    {purchase.service_email}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <p className={`text-sm font-semibold mb-2 ${tv(isDark, 'text-blue-700', 'text-blue-300')}`}>Contraseña</p>
                                <div className="flex items-center gap-3">
                                  <div className={`p-3 rounded-xl border-2 flex-1 ${tv(isDark, 'bg-white border-blue-200', 'bg-gray-800 border-blue-600')}`}>
                                    <p className={`text-sm font-mono ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                                      {showPasswords[purchase.id] ? purchase.service_password : '•'.repeat(16)}
                                    </p>
                                  </div>
                                  <button 
                                    onClick={() => setShowPasswords(prev => ({ ...prev, [purchase.id]: !prev[purchase.id] }))}
                                    className={`px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all hover:scale-105 ${tv(isDark, 'border-blue-500 text-blue-600 hover:bg-blue-50', 'border-blue-500 text-blue-400 hover:bg-blue-900/20')}`}
                                  >
                                    {showPasswords[purchase.id] ? '👁️ Ocultar' : '👁️ Mostrar'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Información del servicio elegante */}
                        <div className={`p-5 ${tv(isDark,'bg-gradient-to-r from-gray-50 to-gray-100','bg-gradient-to-r from-gray-700 to-gray-800')}`}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tv(isDark, 'bg-gray-200', 'bg-gray-600')}`}>
                              <span className="text-gray-600 text-sm">ℹ️</span>
                            </div>
                            <h5 className={`font-bold text-base ${tv(isDark, 'text-gray-900', 'text-white')}`}>Información</h5>
                          </div>
                          <div className={`text-sm space-y-2 ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                            <div className="flex justify-between">
                              <span className="font-medium">Duración:</span>
                              <span className="font-bold">{purchase.months} {purchase.months === 1 ? 'mes' : 'meses'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Total días:</span>
                              <span className="font-bold">{serviceDays} días</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Estado:</span>
                              <span className={`font-bold ${daysRemaining <= 7 ? 'text-red-600' : daysRemaining <= 30 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {daysRemaining <= 7 ? 'Vence pronto' : daysRemaining <= 30 ? 'Por vencer' : 'Activo'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}