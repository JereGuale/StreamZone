import React from 'react';
import { Logo } from '../components/Logo';
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
    <div className={`min-h-screen ${tv(isDark, 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 text-zinc-900', 'bg-gradient-to-br from-zinc-950 via-blue-950 to-purple-950 text-zinc-100')}`}>
      {/* Navbar moderno */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md shadow-lg ${tv(isDark, 'bg-white/90 border-zinc-200/50', 'bg-zinc-950/90 border-zinc-800/50')}`}>
        <div className="mx-auto max-w-7xl px-4 py-4">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Logo className="h-12 w-12" />
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${tv(isDark, 'bg-green-500', 'bg-green-400')} animate-pulse`}></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">StreamZone</h1>
                <p className={`text-sm ${tv(isDark, 'text-zinc-600', 'text-zinc-400')}`}>Streaming Premium</p>
              </div>
            </div>
            
            <nav className="flex items-center gap-6">
              <button
                onClick={() => onSetView('home')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${view === 'home' ? tv(isDark, 'bg-blue-600 text-white', 'bg-blue-500 text-white') : tv(isDark, 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100', 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800')}`}
              >
                🏠 Inicio
              </button>
              
              <button
                onClick={() => onSetView('combos')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${view === 'combos' ? tv(isDark, 'bg-green-600 text-white', 'bg-green-500 text-white') : tv(isDark, 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100', 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800')}`}
              >
                🎁 Combos
              </button>
              
              {user ? (
                <>
                  <button
                    onClick={() => onSetView('profile')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${view === 'profile' ? tv(isDark, 'bg-blue-600 text-white', 'bg-blue-500 text-white') : tv(isDark, 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100', 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800')}`}
                  >
                    👤 Mi Perfil
                  </button>
                  <button
                    onClick={onLogout}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${tv(isDark, 'text-red-600 hover:text-red-700 hover:bg-red-50', 'text-red-400 hover:text-red-300 hover:bg-red-900/20')}`}
                  >
                    🚪 Salir
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSetView('auth')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${tv(isDark, 'bg-blue-600 text-white hover:bg-blue-700', 'bg-blue-500 text-white hover:bg-blue-600')}`}
                  >
                    🔐 Iniciar Sesión
                  </button>
                  <button
                    onClick={() => onSetView('admin')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${tv(isDark, 'bg-red-600 text-white hover:bg-red-700', 'bg-red-500 text-white hover:bg-red-600')}`}
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
              <Logo className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-bold">StreamZone</h1>
                <p className={`text-xs ${tv(isDark, 'text-zinc-600', 'text-zinc-400')}`}>Streaming Premium</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {user ? (
                <button
                  onClick={() => onSetView('profile')}
                  className={`p-2 rounded-lg ${view === 'profile' ? tv(isDark, 'bg-blue-600 text-white', 'bg-blue-500 text-white') : tv(isDark, 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100', 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800')}`}
                >
                  👤
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSetView('auth')}
                    className={`p-2 rounded-lg ${tv(isDark, 'bg-blue-600 text-white', 'bg-blue-500 text-white')}`}
                  >
                    🔐
                  </button>
                  <button
                    onClick={() => onSetView('admin')}
                    className={`p-2 rounded-lg ${tv(isDark, 'bg-red-600 text-white', 'bg-red-500 text-white')}`}
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

      {/* Floating Theme Toggle */}
      <FloatingThemeToggle isDark={isDark} onToggle={onToggleTheme} />
    </div>
  );
}