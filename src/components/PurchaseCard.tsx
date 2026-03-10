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
}

export function PurchaseCard({ item, isDark, onToggleValidate, onDelete, onEdit, onReminder }: PurchaseCardProps) {
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
  // COMPRA ACTIVA - Rediseño según Screenshot
  // =============================================
  return (
    <div className={`rounded-3xl border shadow-2xl mb-6 overflow-hidden transition-all duration-300 ${tv(isDark, 'bg-white border-gray-100', 'bg-[#0B1120] border-white/5')}`}>
      {/* Header - Styled like screenshot */}
      <div className={`p-4 sm:p-5 cursor-pointer select-none transition-colors ${tv(isDark, 'bg-gray-50/50 hover:bg-gray-100/50', 'bg-gradient-to-r from-[#1a1b26] to-[#0B1120] hover:from-[#1e1f2b]')}`} onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm border ${tv(isDark, 'bg-gray-100 border-gray-200', 'bg-white/5 border-white/10')} shrink-0`}>
              {platformLogo || <span className="text-xl font-bold text-white uppercase">{item.service.charAt(0)}</span>}
            </div>
            <div className="flex flex-col">
              <h3 className={`font-black text-lg sm:text-xl tracking-tight leading-none mb-1 sm:mb-1.5 ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                {item.service}
              </h3>
              <div className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${tv(isDark, 'text-gray-500', 'text-gray-400')}`}>
                {item.months} {item.months === 1 ? 'mes' : 'meses'} • <span className="text-emerald-500">Activo</span>
              </div>
            </div>
          </div>

          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center border transition-all ${tv(isDark, 'bg-white border-gray-200 text-gray-400', 'bg-white/5 border-white/5 text-gray-500')}`}>
            <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Single Unified Info Block */}
      <div className={`p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 transition-colors ${tv(isDark, 'bg-gray-50', 'bg-[#121827]')}`}>
        {/* Dates Row */}
        <div className="flex items-center justify-around w-full">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 transition-colors shadow-inner border border-white/5 ${tv(isDark, 'bg-blue-50', 'bg-blue-500/10')}`}>
              <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="#3b82f6" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15.6947 13.7H15.7037M15.6947 16.7H15.7037M11.9955 13.7H12.0045M11.9955 16.7H12.0045M8.29639 13.7H8.30537M8.29639 16.7H8.30537" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${tv(isDark, 'text-gray-400', 'text-gray-500')}`}>Inicio: <span className={tv(isDark, 'text-gray-900', 'text-white')}>{formatDate(item.start)}</span></span>
          </div>

          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mb-1 transition-colors shadow-inner border border-white/5 ${tv(isDark, 'bg-red-50', 'bg-red-500/10')}`}>
              <svg width="16" height="16" className="sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.2467 22 21.5 17.7467 21.5 12.5C21.5 7.25329 17.2467 3 12 3C6.75329 3 2.5 7.25329 2.5 12.5C2.5 17.7467 6.75329 22 12 22Z" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 8V13H17" stroke="#ef4444" stroke-width="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.5 5.5L4.5 3.5M21.5 5.5L19.5 3.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${tv(isDark, 'text-gray-400', 'text-gray-500')}`}>Vence: <span className={tv(isDark, 'text-gray-900', 'text-white')}>{formatDate(item.end)}</span></span>
          </div>
        </div>

        {/* Countdown Row */}
        <div className="text-center pt-1.5 sm:pt-2 border-t border-white/5">
          <h4 className="text-3xl sm:text-4xl font-black text-red-600 tracking-tighter tabular-nums drop-shadow-sm">
            {days < 0 ? '00' : days.toString().padStart(2, '0')}
          </h4>
          <p className="text-[10px] sm:text-sm font-black text-red-600/90 uppercase tracking-[0.2em] -mt-0.5 sm:-mt-1">
            días restantes
          </p>
        </div>
      </div>

      {/* Ver Credenciales Button - Below Dates */}
      <div className={`px-6 pb-6 transition-colors ${tv(isDark, 'bg-white', 'bg-[#1a202e]')}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full py-4 rounded-2xl font-black text-sm transition-all border-2 flex items-center justify-center gap-3 ${isOpen
            ? (isDark ? 'bg-red-500 border-red-500 text-white shadow-lg' : 'bg-red-600 border-red-600 text-white shadow-md')
            : (isDark ? 'bg-white/5 border-white/20 text-white hover:bg-white/10' : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 shadow-sm')
            }`}
        >
          {isOpen ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              Ocultar credenciales
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              Ver credenciales de acceso
            </>
          )}
        </button>
      </div>

      {/* Expandable Credentials & Actions */}
      {isOpen && (
        <div className={`px-5 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300 ${tv(isDark, 'bg-white', 'bg-[#1a202e]')}`}>
          <div className="h-px w-full bg-white/5 mb-6"></div>

          <div className={`p-5 rounded-3xl border mb-6 ${tv(isDark, 'bg-white border-black', 'bg-[#0B1120] border-white/5')}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              </div>
              <h5 className={`font-black text-sm uppercase tracking-widest ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                Credenciales
              </h5>
            </div>

            {isCombo ? (
              <div className="space-y-6">
                {services.map((service) => {
                  const serviceCreds = credentials[service];
                  if (!serviceCreds) return null;
                  return (
                    <div key={service} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
                        <h6 className={`text-xs font-black uppercase tracking-wider ${tv(isDark, 'text-gray-900', 'text-white')}`}>{service}</h6>
                      </div>
                      <div className="space-y-3">
                        <div className="relative">
                          <label className={`absolute -top-2 left-3 px-1 text-[9px] font-black uppercase tracking-widest ${tv(isDark, 'bg-white text-gray-400', 'bg-[#0B1120] text-gray-500')}`}>Email</label>
                          <input type="text" value={serviceCreds.email} readOnly
                            className={`text-sm font-mono px-4 py-3.5 rounded-2xl border w-full outline-none transition-all ${tv(isDark, 'bg-white text-gray-700 border-black focus:border-gray-900', 'bg-black/20 text-gray-200 border-white/5 focus:border-white/10')}`} />
                        </div>
                        <div className="relative flex items-center gap-2">
                          <label className={`absolute -top-2 left-3 px-1 text-[9px] font-black uppercase tracking-widest ${tv(isDark, 'bg-white text-gray-400', 'bg-[#0B1120] text-gray-500')}`}>Password</label>
                          <input type={showPasswords[service] ? 'text' : 'password'} value={serviceCreds.password} readOnly
                            className={`text-sm font-mono px-4 py-3.5 rounded-2xl border flex-1 outline-none transition-all ${tv(isDark, 'bg-white text-gray-700 border-black focus:border-gray-900', 'bg-black/20 text-gray-200 border-white/5 focus:border-white/10')}`} />
                          <button
                            onClick={() => setShowPasswords(prev => ({ ...prev, [service]: !prev[service] }))}
                            className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 active:scale-95`}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              {showPasswords[service]
                                ? <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                : <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              }
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <label className={`absolute -top-2 left-3 px-1 text-[9px] font-black uppercase tracking-widest ${tv(isDark, 'bg-white text-gray-400', 'bg-[#0B1120] text-gray-500')}`}>Email</label>
                  <input type="text" value={item.service_email || 'No disponible'} readOnly
                    className={`text-sm font-mono px-4 py-3.5 rounded-2xl border w-full outline-none transition-all ${tv(isDark, 'bg-white text-gray-700 border-black focus:border-gray-900', 'bg-black/20 text-gray-200 border-white/5 focus:border-white/10')}`} />
                </div>
                <div className="relative flex items-center gap-2">
                  <label className={`absolute -top-2 left-3 px-1 text-[9px] font-black uppercase tracking-widest ${tv(isDark, 'bg-white text-gray-400', 'bg-[#0B1120] text-gray-500')}`}>Password</label>
                  <input type={showPassword ? 'text' : 'password'} value={item.service_password || 'No disponible'} readOnly
                    className={`text-sm font-mono px-4 py-3.5 rounded-2xl border flex-1 outline-none transition-all ${tv(isDark, 'bg-white text-gray-700 border-black focus:border-gray-900', 'bg-black/20 text-gray-200 border-white/5 focus:border-white/10')}`} />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-all bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 active:scale-95`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {showPassword
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      }
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={onDelete}
              className={`flex-1 min-w-[120px] py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white shadow-sm active:scale-95`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Eliminar
            </button>
            <button onClick={onReminder}
              className={`flex-1 min-w-[120px] py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_4px_15px_rgba(16,185,129,0.3)] active:scale-95`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Renovar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}