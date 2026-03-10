import React from 'react';
import { tv } from '../utils/helpers';
import { Logo } from './Logo';

interface UserMenuDrawerProps {
    open: boolean;
    onClose: () => void;
    isDark: boolean;
    user: any;
    onSetView: (v: string) => void;
    onLogout: () => void;
    adminLogged: boolean;
}

export function UserMenuDrawer({ open, onClose, isDark, user, onSetView, onLogout, adminLogged }: UserMenuDrawerProps) {
    if (!open) return null;

    const NavButton = ({ onClick, icon, label, color, description }: { onClick: () => void, icon: string, label: string, color: string, description?: string }) => (
        <button
            onClick={onClick}
            className={`group w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border mb-3 relative overflow-hidden active:scale-95 ${tv(isDark,
                'bg-white border-gray-100 hover:border-blue-200 hover:shadow-lg',
                'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
            )}`}
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3 ${color}`}>
                {icon}
            </div>
            <div className="text-left flex-1">
                <div className={`font-black text-sm tracking-tight ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                    {label}
                </div>
                {description && (
                    <div className={`text-[10px] font-bold opacity-40 uppercase tracking-widest ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>
                        {description}
                    </div>
                )}
            </div>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 ${tv(isDark, 'text-gray-400', 'text-white/20')}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </button>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-500"
                onClick={onClose}
            />

            <aside
                className={`relative h-[96dvh] w-[90%] sm:w-[380px] m-2 sm:m-4 rounded-[32px] shadow-2xl overflow-hidden border transition-transform duration-500 ease-out animate-in slide-in-from-right ${tv(isDark,
                    'bg-white/90 border-white shadow-blue-900/10',
                    'bg-zinc-900/90 border-white/10 shadow-black'
                )}`}
                style={{ backdropFilter: 'blur(24px)' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="relative h-full flex flex-col p-6">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Logo className="h-8 w-auto" />
                            <div className="leading-tight">
                                <h4 className={`text-xl font-black italic tracking-tighter ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                                    Stream<span className="text-blue-500">Zone</span>
                                </h4>
                                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest text-blue-500">Menú de Usuario</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition-all hover:rotate-90 active:scale-90 ${tv(isDark, 'bg-gray-100 text-gray-900 hover:bg-gray-200', 'bg-white/5 text-white hover:bg-white/10')}`}
                        >
                            ×
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <nav className="space-y-1">
                            <NavButton
                                onClick={() => { onSetView('home'); onClose(); }}
                                icon="🏠"
                                label="INICIO"
                                description="Volver a la tienda"
                                color="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                            />
                            {user && (
                                <NavButton
                                    onClick={() => { onSetView('profile'); onClose(); }}
                                    icon="👤"
                                    label="MI PERFIL"
                                    description="Mis suscripciones y datos"
                                    color="bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
                                />
                            )}
                            <NavButton
                                onClick={() => { onSetView('combos'); onClose(); }}
                                icon="🍿"
                                label="VER COMBOS"
                                description="Ahorro en combos premium"
                                color="bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                            />
                            {adminLogged && (
                                <NavButton
                                    onClick={() => { onSetView('admin'); onClose(); }}
                                    icon="🔧"
                                    label="PANEL ADMIN"
                                    description="Gestión del sistema"
                                    color="bg-gradient-to-br from-zinc-700 to-zinc-900 text-white"
                                />
                            )}
                        </nav>
                    </div>

                    {/* User Info & Bottom Actions */}
                    <div className="mt-auto pt-6 border-t border-white/10">
                        {user ? (
                            <div className="mb-6 px-2">
                                <div className={`text-[10px] font-black tracking-widest uppercase opacity-40 mb-2 ${tv(isDark, 'text-gray-900', 'text-white')}`}>Sesión como</div>
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-800/10 border border-white/5">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-black">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className={`font-black text-sm truncate ${tv(isDark, 'text-gray-900', 'text-white')}`}>{user.name}</p>
                                        <p className={`text-[10px] font-bold opacity-40 truncate ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>{user.phone}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => { onSetView('auth'); onClose(); }}
                                className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-sm tracking-widest bg-blue-600 text-white hover:bg-blue-500 mb-6"
                            >
                                <span>🔑</span> INICIAR SESIÓN
                            </button>
                        )}

                        {user && (
                            <button
                                onClick={() => { onLogout(); onClose(); }}
                                className={`w-full flex items-center justify-center gap-3 p-4 rounded-2xl font-black text-sm tracking-widest transition-all active:scale-95 ${tv(isDark,
                                    'bg-red-50 text-red-600 hover:bg-red-100',
                                    'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                )}`}
                            >
                                <span>🚪</span> CERRAR SESIÓN
                            </button>
                        )}
                        <div className={`mt-4 text-center text-[10px] font-bold opacity-30 ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                            StreamZone v2.5 • 2026
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
