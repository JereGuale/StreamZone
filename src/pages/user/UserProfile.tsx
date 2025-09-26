import React from 'react';
import { fmt, tv, getServiceStatus, getDaysRemaining } from '../../utils/helpers';

interface UserProfileProps {
  isDark: boolean;
  user: any;
  purchases: any[];
  onToggleValidate: (id: string) => void;
  onDeletePurchase: (id: string) => void;
  onEditPurchase: (purchase: any) => void;
  onSetView: (view: string) => void;
}

export function UserProfile({ isDark, user, purchases, onToggleValidate, onDeletePurchase, onEditPurchase, onSetView }: UserProfileProps) {
  const userActivePurchases = purchases.filter(p => p.phone === user.phone && p.validated);

  return (
    <section className="mx-auto max-w-6xl px-3 sm:px-4 pb-8 sm:pb-16">
      <div className="mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">👤 Mi Perfil</h3>
            <p className={`text-sm sm:text-base ${tv(isDark,'text-zinc-600','text-zinc-300')}`}>Gestiona tu cuenta y compras activas</p>
          </div>
          <button 
            onClick={() => onSetView('home')}
            className={`rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm hover:scale-105 transition-transform ${tv(isDark,'bg-zinc-100 text-zinc-700 hover:bg-zinc-200','bg-zinc-800 text-zinc-200 hover:bg-zinc-700')}`}
          >
            ← Inicio
          </button>
        </div>
      </div>
      
      <div className="grid gap-6">
        {/* Información del perfil */}
        <div className={`p-4 sm:p-6 rounded-2xl border ${tv(isDark,'bg-white border-zinc-200','bg-zinc-800 border-zinc-700')}`}>
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">👤 Información Personal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={`text-xs sm:text-sm ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>Nombre</label>
              <p className={`font-medium text-sm sm:text-base ${tv(isDark, 'text-zinc-900', 'text-zinc-100')}`}>{user.name}</p>
            </div>
            <div>
              <label className={`text-xs sm:text-sm ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>WhatsApp</label>
              <p className={`font-medium text-sm sm:text-base ${tv(isDark, 'text-zinc-900', 'text-zinc-100')}`}>{user.phone}</p>
            </div>
            <div>
              <label className={`text-xs sm:text-sm ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>Email</label>
              <p className={`font-medium text-sm sm:text-base ${tv(isDark, 'text-zinc-900', 'text-zinc-100')}`}>{user.email}</p>
            </div>
            <div>
              <label className={`text-xs sm:text-sm ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>Miembro desde</label>
              <p className={`font-medium text-sm sm:text-base ${tv(isDark, 'text-zinc-900', 'text-zinc-100')}`}>{new Date().toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        </div>

        {/* Mis Compras Activas */}
        <div className={`p-4 sm:p-6 rounded-2xl border ${tv(isDark,'bg-white border-zinc-200','bg-zinc-800 border-zinc-700')}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
            <h3 className="text-lg sm:text-xl font-semibold">🛍️ Mis Compras Activas</h3>
            <button 
              onClick={() => window.location.reload()}
              className={`px-3 py-1 rounded-lg text-xs sm:text-sm ${tv(isDark,'bg-blue-100 text-blue-700 hover:bg-blue-200','bg-blue-900/30 text-blue-400 hover:bg-blue-900/50')}`}
            >
              🔄 Actualizar
            </button>
          </div>

          {userActivePurchases.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📺</div>
              <p className={tv(isDark,'text-zinc-600','text-zinc-400')}>No tienes compras activas</p>
              <button 
                onClick={() => onSetView('home')}
                className={`mt-4 px-4 py-2 rounded-xl text-sm ${tv(isDark,'bg-blue-600 text-white hover:bg-blue-700','bg-blue-500 text-white hover:bg-blue-600')}`}
              >
                Ver Catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userActivePurchases
                .filter((purchase) => getDaysRemaining(purchase.end) >= 0)
                .map((purchase) => {
                  const serviceStatus = getServiceStatus(purchase.end);
                  const daysRemaining = getDaysRemaining(purchase.end);
                  
                  return (
                    <div key={purchase.id} className={`p-3 sm:p-4 rounded-xl border ${tv(isDark, 'bg-green-50 border-green-200', 'bg-green-900/20 border-green-700')}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="text-xl sm:text-2xl">
                            {purchase.service === 'Netflix' ? '🎬' :
                             purchase.service === 'Disney+' ? '🏰' :
                             purchase.service === 'Max' ? '🎭' :
                             purchase.service === 'Prime Video' ? '📺' :
                             purchase.service === 'Spotify' ? '🎧' : '📱'}
                          </div>
                          <div>
                            <h4 className="font-bold text-base sm:text-lg">{purchase.service}</h4>
                            <p className={`text-xs sm:text-sm ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>
                              {purchase.months} meses • Activo
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end sm:justify-start">
                          <div className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-center min-w-[100px] sm:min-w-[120px] ${tv(isDark, 'bg-red-100 text-red-800', 'bg-red-900/30 text-red-400')}`}>
                            {serviceStatus.message}
                          </div>
                        </div>
                      </div>
                  
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-2 sm:mb-3">
                        <div>
                          <label className={`text-xs sm:text-sm font-medium ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>📅 Fecha de inicio</label>
                          <p className={`font-medium text-sm sm:text-base ${tv(isDark, 'text-zinc-900', 'text-zinc-100')}`}>{new Date(purchase.start).toLocaleDateString('es-ES')}</p>
                        </div>
                        <div>
                          <label className={`text-xs sm:text-sm font-medium ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>⏰ Fecha de vencimiento</label>
                          <p className={`font-medium text-sm sm:text-base ${tv(isDark, 'text-zinc-900', 'text-zinc-100')}`}>{new Date(purchase.end).toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>

                      {purchase.service_email && purchase.service_password && (
                        <div className={`p-2 sm:p-3 rounded-lg ${tv(isDark,'bg-blue-50 border border-blue-200','bg-blue-900/20 border border-blue-700')}`}>
                          <h5 className="font-semibold mb-2 text-blue-800 dark:text-blue-300 text-sm sm:text-base">🔑 Credenciales del Servicio</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            <div>
                              <label className={`text-xs ${tv(isDark, 'text-blue-600', 'text-blue-400')}`}>Email:</label>
                              <p className={`font-mono text-xs sm:text-sm p-2 rounded border ${tv(isDark, 'bg-gray-50 border-gray-200 text-gray-900', 'bg-zinc-800 border-zinc-600 text-zinc-100')}`}>{purchase.service_email}</p>
                            </div>
                            <div>
                              <label className={`text-xs ${tv(isDark, 'text-blue-600', 'text-blue-400')}`}>Contraseña:</label>
                              <p className={`font-mono text-xs sm:text-sm p-2 rounded border ${tv(isDark, 'bg-gray-50 border-gray-200 text-gray-900', 'bg-zinc-800 border-zinc-600 text-zinc-100')}`}>{purchase.service_password}</p>
                            </div>
                          </div>
                          {purchase.admin_notes && (
                            <div className="mt-2">
                              <label className={`text-xs ${tv(isDark, 'text-blue-600', 'text-blue-400')}`}>Notas:</label>
                              <p className={`text-xs sm:text-sm p-2 rounded border ${tv(isDark, 'bg-gray-50 border-gray-200 text-gray-900', 'bg-zinc-800 border-zinc-600 text-zinc-100')}`}>{purchase.admin_notes}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Información de Renovación */}
                      <div className={`p-2 sm:p-3 rounded-lg mt-2 sm:mt-3 ${tv(isDark,'bg-blue-50 border border-blue-200','bg-blue-900/20 border border-blue-700')}`}>
                        <h5 className="font-semibold mb-2 text-blue-800 dark:text-blue-300 text-sm sm:text-base">ℹ️ Información del Servicio</h5>
                        <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                          <p>📅 <strong>Duración:</strong> {purchase.months} {purchase.months === 1 ? 'mes' : 'meses'}</p>
                          <p>📧 <strong>Contacto:</strong> Para renovaciones, contacta al administrador</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}