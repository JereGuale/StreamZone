import React from 'react';
import { tv, getDaysRemaining, getServiceStatus } from '../../utils/helpers';

interface ProfileProps {
  user: any;
  userActivePurchases: any[];
  isDark: boolean;
  onLoadUserPurchases: (phone: string) => void;
  onGoToHome: () => void;
  onGoToAuth: () => void;
}

export function Profile({ user, userActivePurchases, isDark, onLoadUserPurchases, onGoToHome, onGoToAuth }: ProfileProps) {
  if (!user) {
    return (
      <section className="mx-auto max-w-6xl px-3 sm:px-4 pb-8 sm:pb-16">
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">👤 Mi Perfil</h3>
              <p className={`text-sm sm:text-base ${tv(isDark, 'text-zinc-600', 'text-zinc-300')}`}>Gestiona tu cuenta y compras activas</p>
            </div>
            <button 
              onClick={onGoToHome}
              className={`rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm hover:scale-105 transition-transform ${tv(isDark, 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200', 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700')}`}
            >
              ← Inicio
            </button>
          </div>
        </div>
        
        <div className={`text-center py-16 rounded-2xl border-2 border-dashed ${tv(isDark, 'border-zinc-200 bg-zinc-50', 'border-zinc-700 bg-zinc-800')}`}>
          <div className="text-6xl mb-4">🔐</div>
          <h4 className="text-xl font-semibold mb-2">Inicia sesión para ver tu perfil</h4>
          <p className={tv(isDark, 'text-zinc-600', 'text-zinc-400')}>Necesitas iniciar sesión para ver tus compras</p>
          <button 
            onClick={onGoToAuth}
            className={tv(isDark, 'mt-4 rounded-xl bg-zinc-900 text-white px-6 py-3', 'mt-4 rounded-xl bg-white text-zinc-900 px-6 py-3')}
          >
            Iniciar sesión
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-3 sm:px-4 pb-8 sm:pb-16">
      <div className="mb-4 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">👤 Mi Perfil</h3>
            <p className={`text-sm sm:text-base ${tv(isDark, 'text-zinc-600', 'text-zinc-300')}`}>Gestiona tu cuenta y compras activas</p>
          </div>
          <button 
            onClick={onGoToHome}
            className={`rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm hover:scale-105 transition-transform ${tv(isDark, 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200', 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700')}`}
          >
            ← Inicio
          </button>
        </div>
      </div>
      
      <div className="grid gap-6">
        {/* Información del perfil */}
        <div className={`p-4 sm:p-6 rounded-2xl border ${tv(isDark, 'bg-white border-zinc-200', 'bg-zinc-800 border-zinc-700')}`}>
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
        <div className={`p-4 sm:p-6 rounded-2xl border ${tv(isDark, 'bg-white border-zinc-200', 'bg-zinc-800 border-zinc-700')}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
            <h3 className="text-lg sm:text-xl font-semibold">🛍️ Mis Compras Activas</h3>
            <button 
              onClick={() => onLoadUserPurchases(user.phone)}
              className={`px-3 py-1 rounded-lg text-xs sm:text-sm ${tv(isDark, 'bg-blue-100 text-blue-700 hover:bg-blue-200', 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50')}`}
            >
              🔄 Actualizar
            </button>
          </div>

          {userActivePurchases.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📺</div>
              <p className={tv(isDark, 'text-zinc-600', 'text-zinc-400')}>No tienes compras activas</p>
              <button 
                onClick={onGoToHome}
                className={`mt-4 px-4 py-2 rounded-xl text-sm ${tv(isDark, 'bg-blue-600 text-white hover:bg-blue-700', 'bg-blue-500 text-white hover:bg-blue-600')}`}
              >
                Ver Catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userActivePurchases
                .filter((purchase) => getDaysRemaining(purchase.end) >= 0) // Filtrar servicios caducados
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
                        <div className="text-right">
                          <div className={`text-sm font-semibold ${serviceStatus.color}`}>
                            {serviceStatus.icon} {serviceStatus.message}
                          </div>
                          <div className={`text-xs ${tv(isDark, 'text-zinc-600', 'text-zinc-400')}`}>
                            Vence: {new Date(purchase.end).toLocaleDateString('es-ES')}
                          </div>
                        </div>
                      </div>
                      
                      {purchase.serviceEmail && (
                        <div className={`mt-3 p-3 rounded-lg ${tv(isDark, 'bg-blue-50 border border-blue-200', 'bg-blue-900/20 border border-blue-700')}`}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className={`text-xs font-semibold ${tv(isDark, 'text-blue-800', 'text-blue-300')}`}>Email</label>
                              <p className={`text-sm font-mono ${tv(isDark, 'text-blue-900', 'text-blue-100')}`}>{purchase.serviceEmail}</p>
                            </div>
                            <div>
                              <label className={`text-xs font-semibold ${tv(isDark, 'text-blue-800', 'text-blue-300')}`}>Contraseña</label>
                              <p className={`text-sm font-mono ${tv(isDark, 'text-blue-900', 'text-blue-100')}`}>{purchase.servicePassword}</p>
                            </div>
                          </div>
                        </div>
                      )}
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

