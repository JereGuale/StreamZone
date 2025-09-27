import React from 'react';
import { tv } from '../utils/helpers';
import { Logo } from './Logo';

interface AppHeaderProps {
  isDark: boolean;
  view: string;
  user: any;
  adminLogged: boolean;
  setView: (view: string) => void;
  handleLogout: () => void;
}

export function AppHeader({ isDark, view, user, adminLogged, setView, handleLogout }: AppHeaderProps) {
  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-500 ${tv(isDark, 'bg-white/80 border-gray-200/50 shadow-lg', 'bg-zinc-900/80 border-zinc-700/50 shadow-2xl')}`}>
      {/* Efecto de gradiente de fondo */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
      
      <div className="relative mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className="flex h-16 sm:h-18 items-center justify-between">
          {/* Logo mejorado */}
          <div className="flex items-center group cursor-pointer" onClick={() => setView('home')}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Logo className="relative h-8 w-8 sm:h-10 sm:w-10 drop-shadow-lg" />
            </div>
            <div className="ml-3 sm:ml-4">
              <span className={`text-xl sm:text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-pink-500 transition-all duration-300`}>
                StreamZone
              </span>
              <div className={`text-xs font-medium ${tv(isDark, 'text-gray-500', 'text-gray-400')} group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300`}>
                Premium Streaming
              </div>
            </div>
          </div>
          
          {/* Navegación - Responsive */}
          <nav className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Botones de navegación - Diseño moderno */}
            <button 
              onClick={() => setView('home')}
              className={`group relative min-w-[70px] sm:min-w-[85px] px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-xs overflow-hidden ${view === 'home' 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                : tv(isDark, 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border border-gray-200 hover:border-blue-300', 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-900/20 hover:to-purple-900/20 border border-gray-600 hover:border-blue-500/50')
              }`}
              title="Inicio"
            >
              <div className="relative z-10 flex items-center justify-center gap-1.5">
                <span className="text-sm">🏠</span>
                <span className="hidden sm:inline">Inicio</span>
              </div>
              {view === 'home' && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </button>
            
            <button 
              onClick={() => setView('combos')}
              className={`group relative min-w-[70px] sm:min-w-[85px] px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-xs overflow-hidden ${view === 'combos' 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25' 
                : tv(isDark, 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 border border-gray-200 hover:border-green-300', 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-green-900/20 hover:to-emerald-900/20 border border-gray-600 hover:border-green-500/50')
              }`}
              title="Combos"
            >
              <div className="relative z-10 flex items-center justify-center gap-1.5">
                <span className="text-sm">🎁</span>
                <span className="hidden sm:inline">Combos</span>
              </div>
              {view === 'combos' && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </button>
            
            {/* Botones de usuario */}
            {user ? (
              <>
                <button
                  onClick={() => setView('profile')}
                  className={`group relative min-w-[70px] sm:min-w-[85px] px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-xs overflow-hidden ${view === 'profile' 
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25' 
                    : tv(isDark, 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 border border-gray-200 hover:border-indigo-300', 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-900/20 hover:to-blue-900/20 border border-gray-600 hover:border-indigo-500/50')
                  }`}
                  title="Mi Perfil"
                >
                  <div className="relative z-10 flex items-center justify-center gap-1.5">
                    <span className="text-sm">👤</span>
                    <span className="hidden sm:inline">Mi Perfil</span>
                  </div>
                  {view === 'profile' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </button>
                <button
                  onClick={handleLogout}
                  className={`group relative min-w-[70px] sm:min-w-[85px] px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-xs overflow-hidden ${tv(isDark, 'text-red-600 hover:text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 border border-red-200 hover:border-red-300', 'text-red-400 hover:text-red-300 hover:bg-gradient-to-r hover:from-red-900/20 hover:to-pink-900/20 border border-red-600 hover:border-red-500/50')}`}
                  title="Salir"
                >
                  <div className="relative z-10 flex items-center justify-center gap-1.5">
                    <span className="text-sm">🚪</span>
                    <span className="hidden sm:inline">Salir</span>
                  </div>
                </button>
              </>
            ) : (
              <button
                onClick={() => setView('auth')}
                className={`group relative min-w-[70px] sm:min-w-[85px] px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-xs overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105`}
                title="Iniciar Sesión"
              >
                <div className="relative z-10 flex items-center justify-center gap-1.5">
                  <span className="text-sm">🔐</span>
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            )}
            
            {/* Botón Admin */}
            {adminLogged ? (
              <button 
                onClick={() => setView('admin')}
                className={`group relative min-w-[70px] sm:min-w-[85px] px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-xs overflow-hidden ${view === 'admin' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
                  : tv(isDark, 'text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border border-gray-200 hover:border-purple-300', 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-900/20 hover:to-pink-900/20 border border-gray-600 hover:border-purple-500/50')
                }`}
                title="Admin"
              >
                <div className="relative z-10 flex items-center justify-center gap-1.5">
                  <span className="text-sm">🔧</span>
                  <span className="hidden sm:inline">Admin</span>
                </div>
                {view === 'admin' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
            ) : (
              <button 
                onClick={() => setView('admin')}
                className={`group relative min-w-[70px] sm:min-w-[85px] px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-xs overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105`}
                title="Login Admin"
              >
                <div className="relative z-10 flex items-center justify-center gap-1.5">
                  <span className="text-sm">🔧</span>
                  <span className="hidden sm:inline">Login Admin</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
