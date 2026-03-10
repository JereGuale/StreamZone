import React, { useState, useEffect } from 'react';
import { fmt, daysBetween, tv } from '../utils/helpers';
import { getPlatformLogo } from './PlatformLogos';

interface PurchaseCardProps {
  key?: any;
  item: any;
  isDark: boolean;
  onToggleValidate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onReminder?: () => void;
  showAdminActions?: boolean;
}

export function PurchaseCard({ item, isDark, onToggleValidate, onDelete, onEdit, onReminder, showAdminActions = false }: PurchaseCardProps) {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().slice(0, 10));
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [isOpen, setIsOpen] = useState(false);

  // Detectar si es un combo y qué servicios incluye
  const serviceName = item?.service || '';
  const trimmedName = serviceName.trim();

  // Primero verificar si es SOLO Disney (sin otros servicios)
  const isOnlyDisney = /^Disney\+?\s*$/i.test(trimmedName) ||
    /^Disney\+?\s+(Standard|Estándar|Premium)\s*$/i.test(trimmedName) ||
    /^Disney\s+(Standard|Estándar|Premium)\s*$/i.test(trimmedName);

  // Verificar que NO contenga otros servicios
  const hasOtherServices = trimmedName.includes('Netflix') ||
    trimmedName.includes('Max') ||
    trimmedName.includes('Prime') ||
    trimmedName.includes('Spotify') ||
    trimmedName.includes('Paramount') ||
    /\s+\+\s+/.test(trimmedName);

  const isIndividualService = isOnlyDisney && !hasOtherServices;
  const hasMultipleServices = /\s+\+\s+/.test(serviceName);
  const isCombo = !isIndividualService && hasMultipleServices;

  // DETECTAR TODOS LOS COMBOS POSIBLES
  let services = [serviceName];
  if (isCombo) {
    if (serviceName.includes('Netflix') && serviceName.includes('Disney')) {
      services = ['Netflix', serviceName.includes('Premium') ? 'Disney+ Premium' : 'Disney+ Estándar'];
    } else if (serviceName.includes('Max') && serviceName.includes('Prime')) {
      services = ['Max', 'Prime Video'];
    } else if (serviceName.includes('Netflix') && serviceName.includes('Max')) {
      services = ['Netflix', 'Max'];
    } else if (serviceName.includes('Netflix') && serviceName.includes('Prime')) {
      services = ['Netflix', 'Prime Video'];
    } else if (serviceName.includes('Prime') && serviceName.includes('Disney')) {
      services = ['Prime Video', serviceName.includes('Premium') ? 'Disney+ Premium' : 'Disney+ Estándar'];
    } else if (serviceName.includes('Disney') && serviceName.includes('Max')) {
      services = [serviceName.includes('Premium') ? 'Disney+ Premium' : 'Disney+ Estándar', 'Max'];
    } else if (serviceName.includes('Spotify') && serviceName.includes('Netflix')) {
      services = ['Spotify', 'Netflix'];
    } else if (serviceName.includes('Spotify') && serviceName.includes('Disney')) {
      services = ['Spotify', serviceName.includes('Premium') ? 'Disney+ Premium' : 'Disney+ Estándar'];
    } else if (serviceName.includes('Spotify') && serviceName.includes('Prime')) {
      services = ['Spotify', 'Prime Video'];
    } else if (serviceName.includes('Paramount') && serviceName.includes('Max') && serviceName.includes('Prime')) {
      services = ['Paramount+', 'Max', 'Prime Video'];
    } else if (serviceName.includes('Netflix') && serviceName.includes('Max') && serviceName.includes('Disney')) {
      services = ['Netflix', 'Max', serviceName.includes('Premium') ? 'Disney+ Premium' : 'Disney+ Estándar', 'Prime Video', 'Paramount+'];
    } else {
      services = serviceName.split(/\s*\+\s*/).map(s => s.trim()).filter(s => s.length > 0);
    }
  }

  // Parsear credenciales si es combo
  let credentials: { [key: string]: { email: string, password: string } } = {};
  if (isCombo && item.service_password) {
    const sections = item.service_password.split('\n\n');
    sections.forEach(section => {
      const lines = section.split('\n');
      if (lines.length >= 3) {
        const sName = lines[0].replace(':', '').trim();
        const email = lines[1].replace('Email: ', '').trim();
        const password = lines[2].replace('Contraseña: ', '').trim();

        if (sName && email && password) {
          credentials[sName] = { email, password };
        }
      }
    });
  }

  // 🔄 ACTUALIZAR FECHA CADA HORA PARA DESCONTAR DÍAS EN TIEMPO REAL
  useEffect(() => {
    const updateDate = () => {
      const newDate = new Date().toISOString().slice(0, 10);
      setCurrentDate(newDate);
    };
    updateDate();
    const interval = setInterval(updateDate, 3600000);
    return () => clearInterval(interval);
  }, []);

  const days = daysBetween(currentDate, item.end);

  const getBadgeColor = (serviceName: string, isDark: boolean) => {
    const name = (serviceName || '').toLowerCase();
    if (name.includes('spotify')) {
      return isDark ? 'bg-green-900/30 text-green-400 border-green-800/50' : 'bg-white text-gray-900 border-gray-300 shadow-sm';
    }
    if (name.includes('netflix') || name.includes('crunchyroll') || name.includes('youtube') || name.includes('apple')) {
      return isDark ? 'bg-red-900/30 text-red-500 border-red-800/50' : 'bg-white text-gray-900 border-gray-300 shadow-sm';
    }
    if (name.includes('disney') || name.includes('paramount') || name.includes('max') || name.includes('prime') || name.includes('amazon')) {
      return isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-white text-gray-900 border-gray-300 shadow-sm';
    }
    return isDark ? 'bg-zinc-800 text-zinc-300 border-zinc-700' : 'bg-white text-gray-900 border-gray-300 shadow-sm';
  };

  // Helper formatting logic
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-');
      return `${d}/${m}/${y.slice(2)}`;
    } catch {
      return dateStr;
    }
  };

  const getStatusText = (days: number) => {
    if (days < 0) return 'Suscripción vencida';
    if (days === 0) return 'Vence hoy mismo';
    if (days <= 7) return 'Vence en menos de una semana';
    if (days <= 30) return 'Vence en menos de un mes';
    return `Vence en ${Math.floor(days / 30)} meses aproximadamente`;
  };

  const serviceIdParsed = serviceName.toLowerCase().replace('+', '').replace('premium', '').replace('estándar', '').trim();
  const platformLogo = getPlatformLogo(serviceIdParsed, 44, 'w-10 h-10 object-contain');

  // Si es una compra pendiente, mostrar diseño profesional previo
  if (!item.validated) {
    const badgeColorClass = getBadgeColor(item.service, isDark);

    return (
      <div className={`p-4 sm:p-5 rounded-xl border mb-4 ${tv(isDark, 'bg-white border-gray-200 shadow-sm', 'bg-[#18181b] border-zinc-800')}`}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`text-base sm:text-lg font-bold ${tv(isDark, 'text-gray-900', 'text-zinc-100')}`}>
                  {item.customer}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mx-1 ${badgeColorClass}`}>
                  {item.service}
                </span>
              </div>

              <div className={`flex items-center gap-4 text-xs font-medium ${tv(isDark, 'text-gray-500', 'text-zinc-400')}`}>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {item.phone}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {item.start}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleValidate(); }}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-lg bg-[#0e7490] hover:bg-[#164e63] text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Aprobar
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                className={`flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-lg font-semibold text-sm transition-colors cursor-pointer ${tv(isDark, 'bg-[#ef4444] text-white hover:bg-red-600 shadow-sm', 'bg-red-600 text-white hover:bg-red-700 shadow-sm')}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Rechazar
              </button>
            </div>
          </div>

          <div className={`grid grid-cols-3 gap-4 px-4 py-3 rounded-lg ${tv(isDark, 'bg-[#e2e8f0]', 'bg-zinc-800/60')}`}>
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${tv(isDark, 'text-gray-500', 'text-zinc-500')}`}>DURACIÓN</div>
              <div className={`text-sm font-semibold ${tv(isDark, 'text-gray-900', 'text-zinc-200')}`}>{item.months} {item.months === 1 ? 'mes' : 'meses'}</div>
            </div>
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${tv(isDark, 'text-gray-500', 'text-zinc-500')}`}>INICIO</div>
              <div className={`text-sm font-semibold ${tv(isDark, 'text-gray-900', 'text-zinc-200')}`}>{item.start}</div>
            </div>
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${tv(isDark, 'text-gray-500', 'text-zinc-500')}`}>FIN</div>
              <div className={`text-sm font-semibold ${tv(isDark, 'text-gray-900', 'text-zinc-200')}`}>{item.end}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =============================================
  // COMPRA ACTIVA - Rediseño Refinado (Más Compacto)
  // =============================================
  return (
    <div className={`group relative rounded-[2rem] border transition-all duration-700 hover:shadow-2xl overflow-hidden ${tv(isDark, 'bg-white/80 border-gray-100 shadow-xl', 'bg-[#0B1120]/60 border-white/5 shadow-2xl')}`} style={{ backdropFilter: 'blur(20px)' }}>
      {/* Decorative gradient background */}
      <div className={`absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none transition-all duration-1000 group-hover:opacity-30 ${tv(isDark, 'bg-blue-400', 'bg-blue-600')}`}></div>

      {/* Top Header Section */}
      <div className="relative p-5 sm:p-6 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center shadow-2xl border transition-all duration-700 group-hover:scale-105 group-hover:rotate-3 ${tv(isDark, 'bg-white border-gray-100 text-blue-600', 'bg-slate-800 border-white/10 text-blue-400')}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className={`font-black text-lg tracking-tight leading-none uppercase ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                  {item.customer}
                </h3>
                {!showAdminActions && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black tracking-widest uppercase">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                    Activo
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-black uppercase tracking-wider ${tv(isDark, 'text-blue-600', 'text-blue-400')}`}>
                  {item.service}
                </span>
                <span className={`text-[9px] font-medium opacity-40 ${tv(isDark, 'text-gray-500', 'text-gray-400')}`}>
                  • Tél: {item.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {showAdminActions && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-md ${tv(isDark, 'bg-white text-blue-600 border border-gray-100', 'bg-slate-800 text-blue-400 border border-white/10')}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-blue-600 text-white rotate-180 shadow-blue-500/40' : tv(isDark, 'bg-gray-100 text-gray-400', 'bg-white/5 text-gray-500 hover:text-white')}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Info Grid - More Compact */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
          <div className="flex flex-col gap-0.5">
            <span className={`text-[8px] font-black uppercase tracking-widest opacity-30 ${tv(isDark, 'text-gray-900', 'text-white')}`}>Inicio</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500`}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <span className={`text-[11px] font-black ${tv(isDark, 'text-gray-700', 'text-gray-200')}`}>{formatDate(item.start)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className={`text-[8px] font-black uppercase tracking-widest opacity-30 ${tv(isDark, 'text-gray-900', 'text-white')}`}>Vence</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-500`}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <span className={`text-[11px] font-black ${tv(isDark, 'text-gray-700', 'text-gray-200')}`}>{formatDate(item.end)}</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center justify-center sm:justify-end">
            <div className={`relative px-3 py-1.5 rounded-xl flex items-center gap-2 border overflow-hidden ${days <= 3 ? 'bg-rose-500/5 border-rose-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
              <div className="flex flex-col text-center">
                <span className={`text-[7px] font-black uppercase tracking-widest opacity-50 ${days <= 3 ? 'text-rose-500' : 'text-blue-500'}`}>Quedan</span>
                <span className={`text-lg font-black italic leading-none ${days <= 3 ? 'text-rose-500' : 'text-blue-500'}`}>{days < 0 ? '0' : days} <span className="text-[8px] non-italic opacity-70">Días</span></span>
              </div>
              <div className={`w-7 h-7 rounded-full border flex items-center justify-center ${days <= 3 ? 'border-rose-500/30' : 'border-blue-500/30'}`}>
                <svg className={`w-3.5 h-3.5 ${days <= 3 ? 'text-rose-500 animate-pulse' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Integrated Credentials Button - More Compact */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full relative py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all duration-500 group/btn isolate overflow-hidden shadow-xl ${isOpen
            ? 'bg-slate-900 text-white ring-1 ring-white/10'
            : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0'}`}
        >
          <span className="flex items-center justify-center gap-2 relative z-10">
            <svg className={`w-4 h-4 transition-transform duration-700 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />}
            </svg>
            {isOpen ? 'Ocultar Credenciales' : 'Ver Acceso'}
          </span>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 blur-md opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
        </button>
      </div>

      {/* Expanded Section (Credentials) */}
      {isOpen && (
        <div className={`p-4 animate-in slide-in-from-top-4 duration-500 border-t ${tv(isDark, 'bg-gray-50/50 border-gray-100', 'bg-slate-900/40 border-white/5')}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isCombo ? (
              services.map((service) => {
                const serviceCreds = credentials[service];
                if (!serviceCreds) return null;
                return (
                  <div key={service} className="space-y-2">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${tv(isDark, 'text-blue-600', 'text-blue-400')}`}>{service}</span>
                    </div>
                    <div className="space-y-2">
                      <CredRow label="Email" value={serviceCreds.email} isDark={isDark} />
                      <CredRow
                        label="Password"
                        value={serviceCreds.password}
                        isDark={isDark}
                        isPassword
                        showPassword={showPasswords[service]}
                        onToggleShow={() => setShowPasswords(prev => ({ ...prev, [service]: !prev[service] }))}
                        icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <CredRow label="Email" value={item.service_email || 'No disponible'} isDark={isDark} icon={<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
                <CredRow label="Contraseña" value={item.service_password || 'No disponible'} isDark={isDark} isPassword showPassword={showPassword} onToggleShow={() => setShowPassword(!showPassword)} />
              </>
            )}
          </div>

          {/* Admin Actions Container */}
          {showAdminActions && (
            <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-2">
              <button onClick={onEdit} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${tv(isDark, 'bg-white border text-gray-700 shadow-sm', 'bg-slate-800 text-white border border-white/10 hover:bg-slate-700')}`}>
                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Editar
              </button>
              <button onClick={onReminder} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                WhatsApp
              </button>
              <button onClick={onDelete} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${tv(isDark, 'bg-rose-50 border-rose-100 text-rose-600', 'bg-rose-500/5 border-rose-500/10 text-rose-400 hover:bg-rose-500/20')}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Eliminar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Sub-component for Credential Rows
function CredRow({ label, value, isDark, isPassword, showPassword, onToggleShow, icon }: any) {
  return (
    <div className="relative group">
      <span className={`absolute -top-1.5 left-4 px-2 text-[7px] font-black uppercase tracking-widest z-20 transition-colors ${tv(isDark, 'bg-[#fdfdfd] text-gray-400', 'bg-[#121a2b] text-gray-500')}`}>{label}</span>
      <div className="flex gap-1.5 relative z-10">
        <div className="relative flex-1">
          <input
            type={isPassword && !showPassword ? 'password' : 'text'}
            value={value}
            readOnly
            className={`w-full pl-3 pr-8 py-2.5 rounded-xl border text-[12px] font-mono outline-none transition-all ${tv(isDark, 'bg-white border-gray-100 text-gray-700 shadow-sm', 'bg-slate-950/50 border-white/5 text-gray-100 shadow-inner group-focus-within:border-blue-500/50')}`}
          />
          {icon && <div className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-20 text-gray-400 scale-75">{icon}</div>}
        </div>
        {isPassword && (
          <button onClick={onToggleShow} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              {showPassword ? <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> : <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />}
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}