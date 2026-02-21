import React, { useState, useRef, useEffect } from 'react';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Close dropdown on view change
  useEffect(() => { setDropdownOpen(false); }, [view]);

  // User initials for avatar
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : '?';

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-500 ${tv(isDark, 'bg-white/95 border-gray-200/50 shadow-lg', 'bg-zinc-900/95 border-zinc-700/50 shadow-2xl')}`}>
      {/* Subtle gradient accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"></div>

      <div className="relative mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className="flex h-16 sm:h-24 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center group cursor-pointer" onClick={() => setView('home')}>
            <div className="relative">
              {/* Subtle back-glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <Logo className="relative h-10 sm:h-12 w-auto drop-shadow-2xl transition-all duration-500 group-hover:scale-105" />
            </div>
            <div className="ml-2 sm:ml-3">
              <span className="text-lg sm:text-xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-pink-500 transition-all duration-300">
                StreamZone
              </span>
              <div className={`text-[10px] sm:text-xs font-medium hidden sm:block ${tv(isDark, 'text-gray-500', 'text-gray-400')} group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300`}>
                Premium Streaming
              </div>
            </div>
          </div>



          {/* Right Navigation */}
          <nav className="flex items-center gap-1.5 sm:gap-3">
            {/* Inicio */}
            <button
              onClick={() => setView('home')}
              className={`relative px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${view === 'home'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                : tv(isDark, 'text-gray-600 hover:text-gray-900 hover:bg-gray-100', 'text-gray-400 hover:text-white hover:bg-white/10')
                }`}
            >
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden xs:inline sm:inline">Inicio</span>
              </span>
            </button>

            {/* Combos — visible only when logged in */}
            {user && (
              <button
                onClick={() => setView('combos')}
                className={`relative px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${view === 'combos'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                  : tv(isDark, 'text-gray-600 hover:text-gray-900 hover:bg-gray-100', 'text-gray-400 hover:text-white hover:bg-white/10')
                  }`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="hidden xs:inline sm:inline">Combos</span>
                </span>
              </button>
            )}

            {/* User section */}
            {user ? (
              /* ===== Logged-in: Avatar Dropdown ===== */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className={`flex items-center gap-2 pl-1 pr-2 sm:pr-3 py-1 rounded-full transition-all duration-300 ${dropdownOpen
                    ? tv(isDark, 'bg-blue-50 ring-2 ring-blue-400', 'bg-white/15 ring-2 ring-purple-500')
                    : tv(isDark, 'hover:bg-gray-100', 'hover:bg-white/10')
                    }`}
                  title="Menú de usuario"
                >
                  {/* Avatar circle */}
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-md select-none">
                    {userInitial}
                  </div>
                  {/* Name (desktop) */}
                  <span className={`hidden md:block text-sm font-semibold truncate max-w-[120px] ${tv(isDark, 'text-gray-700', 'text-gray-200')}`}>
                    {user.name || user.email || 'Usuario'}
                  </span>
                  {/* Chevron */}
                  <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''} ${tv(isDark, 'text-gray-500', 'text-gray-400')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className={`dropdown-animate absolute right-0 mt-2 w-60 rounded-2xl shadow-2xl border overflow-hidden ${tv(isDark, 'bg-white border-gray-200', 'bg-zinc-800 border-zinc-700')}`}>
                    {/* User info header */}
                    <div className={`px-4 py-3 border-b ${tv(isDark, 'border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50', 'border-zinc-700 bg-gradient-to-r from-blue-900/30 to-purple-900/30')}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md select-none flex-shrink-0">
                          {userInitial}
                        </div>
                        <div className="min-w-0">
                          <div className={`font-bold text-sm truncate ${tv(isDark, 'text-gray-900', 'text-white')}`}>{user.name || 'Usuario'}</div>
                          <div className={`text-xs truncate ${tv(isDark, 'text-gray-500', 'text-gray-400')}`}>{user.email || user.phone || ''}</div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <button
                        onClick={() => { setView('profile'); setDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${view === 'profile'
                          ? tv(isDark, 'bg-blue-50 text-blue-700', 'bg-blue-900/30 text-blue-300')
                          : tv(isDark, 'text-gray-700 hover:bg-gray-50', 'text-gray-200 hover:bg-white/5')
                          }`}
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Mi Perfil
                      </button>

                      <button
                        onClick={() => { setView('combos'); setDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${view === 'combos'
                          ? tv(isDark, 'bg-emerald-50 text-emerald-700', 'bg-emerald-900/30 text-emerald-300')
                          : tv(isDark, 'text-gray-700 hover:bg-gray-50', 'text-gray-200 hover:bg-white/5')
                          }`}
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Combos
                      </button>
                    </div>

                    {/* Divider + Logout */}
                    <div className={`border-t ${tv(isDark, 'border-gray-100', 'border-zinc-700')}`}>
                      <button
                        onClick={() => { handleLogout(); setDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${tv(isDark, 'text-red-600 hover:bg-red-50', 'text-red-400 hover:bg-red-900/20')}`}
                      >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ===== Not logged in: Login button ===== */
              <button
                onClick={() => setView('auth')}
                className="relative px-4 sm:px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Ingresar</span>
                </span>
              </button>
            )}

            {/* Admin button */}
            {adminLogged ? (
              <button
                onClick={() => setView('admin')}
                className={`relative px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${view === 'admin'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                  : tv(isDark, 'text-gray-600 hover:text-gray-900 hover:bg-gray-100', 'text-gray-400 hover:text-white hover:bg-white/10')
                  }`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden sm:inline">Admin</span>
                </span>
              </button>
            ) : (
              <button
                onClick={() => setView('admin')}
                className={`relative px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 text-xs sm:text-sm ${tv(isDark, 'text-gray-500 hover:text-gray-700 hover:bg-gray-100', 'text-gray-500 hover:text-gray-300 hover:bg-white/10')}`}
                title="Panel Admin"
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="hidden sm:inline">Admin</span>
                </span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
