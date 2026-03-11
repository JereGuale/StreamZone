import React, { useState, useEffect, useRef } from 'react';
import { tv } from '../utils/helpers';
import { Logo } from './Logo';

interface AppHeaderProps {
  isDark: boolean;
  view: string;
  setView: (view: string) => void;
  user: any;
  onLogout: () => void;
  adminLogged: boolean;
  onAdminMenuToggle?: () => void;
}

export function AppHeader({ isDark, view, setView, user, onLogout, adminLogged, onAdminMenuToggle }: AppHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <header className={`sticky top-0 z-[60] w-full border-b backdrop-blur-md transition-all duration-500 overflow-visible ${tv(isDark,
      'bg-white/80 border-gray-100 shadow-sm',
      'bg-[#0B1120]/80 border-white/5 shadow-2xl shadow-black/20'
    )}`}>
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 overflow-visible">
          {/* Logo Section */}
          <div className="flex items-center gap-2 sm:gap-4 flex-none">
            <div
              className="flex items-center gap-3 cursor-pointer group transition-transform active:scale-95"
              onClick={() => setView('home')}
            >
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center transition-all bg-black border border-yellow-500/30 overflow-hidden shadow-lg group-hover:border-yellow-500/60 flex-shrink-0">
                  <Logo className="h-6 sm:h-7 w-auto block max-w-full" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-0">
                  <span className={`text-lg sm:text-2xl font-black tracking-tight leading-none ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                    <span className="text-blue-600">Stream</span><span className="text-[#ff0080]">Zone</span>
                  </span>
                </div>
                <span className={`text-[9px] sm:text-[10px] font-bold tracking-[0.1em] uppercase opacity-60 ${tv(isDark, 'text-gray-500', 'text-gray-400')}`}>
                  Premium Streaming
                </span>
              </div>
            </div>
          </div>


          {/* Right Navigation */}
          <nav className="flex items-center justify-end gap-1.5 sm:gap-3 flex-1 overflow-visible">
            {/* Inicio Button */}
            <button
              onClick={() => setView('home')}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-300 shadow-lg flex-shrink-0 ${view === 'home'
                ? 'bg-blue-600 text-white shadow-blue-600/30'
                : tv(isDark, 'bg-white border text-gray-500', 'bg-slate-800/50 border border-white/5 text-gray-400 hover:text-white')}`}
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>


            {/* User section - SIEMPRE visible */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  if (user) {
                    setDropdownOpen(o => !o);
                  } else {
                    setView('profile');
                  }
                }}
                className={`flex flex-shrink-0 items-center gap-1 p-1 rounded-lg transition-all duration-300 border ${dropdownOpen && user
                  ? tv(isDark, 'bg-blue-50 border-blue-200', 'bg-white/10 border-white/20')
                  : tv(isDark, 'bg-white border-gray-100', 'bg-slate-800/40 border-white/5 hover:bg-slate-800/60')
                  }`}
              >
                {user ? (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-[8px] sm:text-[9px] font-black shadow-lg flex-shrink-0">
                    {userInitial}
                  </div>
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                {user && (
                  <svg className={`w-3 h-3 transition-transform duration-500 ${dropdownOpen ? 'rotate-180' : ''} ${tv(isDark, 'text-gray-400', 'text-gray-500')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Dropdown Menu - solo si user logueado */}
              {user && dropdownOpen && (
                <div className={`absolute right-0 mt-3 w-56 sm:w-64 rounded-2xl sm:rounded-3xl shadow-2xl border backdrop-blur-3xl overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-top-2 z-[70] ${tv(isDark, 'bg-white/95 border-gray-100', 'bg-[#0B1120]/95 border-white/10')}`}>
                  <div className="p-3 sm:p-4">
                    <div className="mb-3 px-3 py-2 rounded-xl sm:rounded-2xl bg-blue-500/10 border border-blue-500/10">
                      <p className={`text-[9px] sm:text-[10px] font-black tracking-widest uppercase opacity-40 mb-1 ${tv(isDark, 'text-blue-900', 'text-blue-300')}`}>Sesión como</p>
                      <p className={`text-xs sm:text-sm font-black truncate ${tv(isDark, 'text-gray-900', 'text-white')}`}>{user.name}</p>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => { setView('profile'); setDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl transition-all group ${tv(isDark, 'hover:bg-blue-50 text-gray-700', 'hover:bg-white/5 text-gray-300')}`}
                      >
                        <span className="font-bold text-xs sm:text-sm">Mi Perfil</span>
                      </button>

                      <button
                        onClick={() => { setView('combos'); setDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl transition-all group ${tv(isDark, 'hover:bg-blue-50 text-gray-700', 'hover:bg-white/5 text-gray-300')}`}
                      >
                        <span className="font-bold text-xs sm:text-sm">Combos</span>
                      </button>

                      <div className="my-2 h-px bg-gray-100 dark:bg-white/5 mx-2"></div>

                      <button
                        onClick={() => { onLogout(); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group"
                      >
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Admin toggle - SIEMPRE visible */}
            <button
              onClick={() => {
                if (view === 'admin' && onAdminMenuToggle) {
                  onAdminMenuToggle();
                } else {
                  setView('admin');
                }
              }}
              className={`flex flex-shrink-0 items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg transition-all duration-300 border ${view === 'admin'
                ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/20'
                : tv(isDark, 'bg-white border-gray-100 text-gray-500', 'bg-slate-800/40 border-white/5 text-gray-400 hover:text-white')}`}
            >
              <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${view === 'admin' ? 'text-white' : 'text-purple-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

          </nav>
        </div>
      </div>
    </header>
  );
}
