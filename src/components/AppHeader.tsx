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
    <header className={`sticky top-0 z-40 border-b transition-colors duration-300 ${tv(isDark, 'bg-white border-gray-200', 'bg-zinc-800 border-zinc-700')}`}>
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Logo className="h-6 w-6 sm:h-8 sm:w-8" />
            <span className={`ml-2 sm:ml-3 text-lg sm:text-xl font-bold ${tv(isDark, 'text-gray-900', 'text-white')}`}>
              StreamZone
            </span>
          </div>
          
          {/* Navegación - Responsive */}
          <nav className="flex items-center gap-1 sm:gap-2 lg:gap-4">
            {/* Botones de navegación - Solo iconos en móvil */}
            <button 
              onClick={() => setView('home')}
              className={`px-2 sm:px-3 lg:px-4 py-2 rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm ${view === 'home' ? tv(isDark, 'bg-blue-600 text-white', 'bg-blue-500 text-white') : tv(isDark, 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100', 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800')}`}
              title="Inicio"
            >
              <span className="hidden sm:inline">🏠 Inicio</span>
              <span className="sm:hidden">🏠</span>
            </button>
            
            <button 
              onClick={() => setView('combos')}
              className={`px-2 sm:px-3 lg:px-4 py-2 rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm ${view === 'combos' ? tv(isDark, 'bg-green-600 text-white', 'bg-green-500 text-white') : tv(isDark, 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100', 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800')}`}
              title="Combos"
            >
              <span className="hidden sm:inline">🎁 Combos</span>
              <span className="sm:hidden">🎁</span>
            </button>
            
            {/* Botones de usuario */}
            {user ? (
              <>
                <button
                  onClick={() => setView('profile')}
                  className={`px-2 sm:px-3 lg:px-4 py-2 rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm ${view === 'profile' ? tv(isDark, 'bg-blue-600 text-white', 'bg-blue-500 text-white') : tv(isDark, 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100', 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800')}`}
                  title="Mi Perfil"
                >
                  <span className="hidden sm:inline">👤 Mi Perfil</span>
                  <span className="sm:hidden">👤</span>
                </button>
                <button
                  onClick={handleLogout}
                  className={`px-2 sm:px-3 lg:px-4 py-2 rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm ${tv(isDark, 'text-red-600 hover:text-red-700 hover:bg-red-50', 'text-red-400 hover:text-red-300 hover:bg-red-900/20')}`}
                  title="Salir"
                >
                  <span className="hidden sm:inline">🚪 Salir</span>
                  <span className="sm:hidden">🚪</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setView('auth')}
                className={`px-2 sm:px-3 lg:px-4 py-2 rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm ${tv(isDark, 'bg-blue-600 text-white hover:bg-blue-700', 'bg-blue-500 text-white hover:bg-blue-600')}`}
                title="Iniciar Sesión"
              >
                <span className="hidden sm:inline">🔐 Iniciar Sesión</span>
                <span className="sm:hidden">🔐</span>
              </button>
            )}
            
            {/* Botón Admin */}
            {adminLogged && (
              <button 
                onClick={() => setView('admin')}
                className={`px-2 sm:px-3 lg:px-4 py-2 rounded-lg sm:rounded-xl font-medium transition-all text-xs sm:text-sm ${view === 'admin' ? tv(isDark, 'bg-purple-600 text-white', 'bg-purple-500 text-white') : tv(isDark, 'text-purple-600 hover:text-purple-700 hover:bg-purple-50', 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/20')}`}
                title="Admin"
              >
                <span className="hidden sm:inline">🔧 Admin</span>
                <span className="sm:hidden">🔧</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
