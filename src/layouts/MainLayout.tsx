import React from 'react';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import { FloatingThemeToggle } from '../components/FloatingThemeToggle';
import { tv } from '../utils/helpers';

interface MainLayoutProps {
  isDark: boolean;
  onToggleTheme: () => void;
  children: React.ReactNode;
  user: any;
  adminLogged: boolean;
  view: string;
  onSetView: (view: string) => void;
  onLogout: () => void;
  onLogoutAdmin: () => void;
}

export function MainLayout({
  isDark,
  onToggleTheme,
  children,
  user,
  adminLogged,
  view,
  onSetView,
  onLogout,
  onLogoutAdmin
}: MainLayoutProps) {
  return (
    <div className={`min-h-screen relative overflow-hidden ${tv(isDark, 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 text-zinc-900', 'bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-zinc-100')}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-br from-purple-500/5 to-pink-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-500/3 to-blue-600/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navbar moderno y profesional */}
      <header className={`relative sticky top-0 z-30 border-b backdrop-blur-xl shadow-2xl ${tv(isDark, 'bg-white/95 border-gray-200/50', 'bg-zinc-950/95 border-gray-800/50')}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-6">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-500 group-hover:scale-110`}>
                  <span className="text-white font-bold text-2xl">SZ</span>
                </div>
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${tv(isDark, 'bg-green-500', 'bg-green-400')} animate-bounce shadow-lg`}>
                  <div className="w-full h-full rounded-full bg-white/30 animate-ping"></div>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>
              </div>
              <div>
                <h1 className={`text-4xl font-bold bg-gradient-to-r ${tv(isDark, 'from-gray-900 to-gray-700', 'from-white to-gray-300')} bg-clip-text text-transparent`}>
                  StreamZone
                </h1>
                <p className={`text-base font-medium ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>
                  🎬 Tu entretenimiento digital premium
                </p>
              </div>
            </div>
            
            <nav className="flex items-center gap-3">
              <button
                onClick={() => onSetView('home')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md ${
                  view === 'home' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : tv(isDark, 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-gray-200', 'text-gray-300 hover:text-blue-400 hover:bg-blue-900/20 border border-gray-700')
                }`}
              >
                🏠 Inicio
              </button>
              
              <button
                onClick={() => onSetView('combos')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md ${
                  view === 'combos' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                    : tv(isDark, 'text-gray-700 hover:text-purple-600 hover:bg-purple-50 border border-gray-200', 'text-gray-300 hover:text-purple-400 hover:bg-purple-900/20 border border-gray-700')
                }`}
              >
                🎁 Combos
              </button>
              
              {user ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSetView('profile')}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md ${
                      view === 'profile' 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                        : tv(isDark, 'text-gray-700 hover:text-green-600 hover:bg-green-50 border border-gray-200', 'text-gray-300 hover:text-green-400 hover:bg-green-900/20 border border-gray-700')
                    }`}
                  >
                    👤 Mi Perfil
                  </button>
                  <button
                    onClick={onLogout}
                    className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md ${tv(isDark, 'text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200', 'text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-700')}`}
                  >
                    🚪 Salir
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSetView('auth')}
                    className="px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    🔐 Iniciar Sesión
                  </button>
                  <button
                    onClick={() => onSetView('admin')}
                    className="px-4 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    🔧 Admin
                  </button>
                </div>
              )}
              
              {adminLogged && (
                <button
                  onClick={() => onSetView('admin')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${view === 'admin' ? tv(isDark, 'bg-purple-600 text-white', 'bg-purple-500 text-white') : tv(isDark, 'text-purple-600 hover:text-purple-700 hover:bg-purple-50', 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/20')}`}
                >
                  🔧 Admin
                </button>
              )}
            </nav>
          </div>
          
          {/* Mobile Layout */}
          <div className="md:hidden flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-lg">SZ</span>
                </div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${tv(isDark, 'bg-green-500', 'bg-green-400')} animate-pulse shadow-md`}></div>
              </div>
              <div>
                <h1 className={`text-xl font-bold bg-gradient-to-r ${tv(isDark, 'from-gray-900 to-gray-700', 'from-white to-gray-300')} bg-clip-text text-transparent`}>
                  StreamZone
                </h1>
                <p className={`text-xs font-medium ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>🎬 Premium</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {user ? (
                <button
                  onClick={() => onSetView('profile')}
                  className={`p-3 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105 ${
                    view === 'profile' 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' 
                      : tv(isDark, 'bg-gray-100 text-gray-700 border border-gray-200', 'bg-gray-800 text-gray-300 border border-gray-600')
                  }`}
                >
                  👤
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSetView('auth')}
                    className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    🔐
                  </button>
                  <button
                    onClick={() => onSetView('admin')}
                    className="p-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    🔧
                  </button>
                </div>
              )}
              
              {adminLogged && (
                <button
                  onClick={() => onSetView('admin')}
                  className={`p-2 rounded-lg ${view === 'admin' ? tv(isDark, 'bg-purple-600 text-white', 'bg-purple-500 text-white') : tv(isDark, 'text-purple-600 hover:text-purple-700 hover:bg-purple-50', 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/20')}`}
                >
                  🔧
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer isDark={isDark} />

      {/* Floating Theme Toggle */}
      <FloatingThemeToggle isDark={isDark} onToggle={onToggleTheme} />
    </div>
  );
}