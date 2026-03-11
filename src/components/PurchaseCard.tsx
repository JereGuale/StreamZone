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
  // Detectar combo si tiene un "+" que NO sea el de "Disney+" (excepto si Disney+ está en un combo)
  // O simplemente si tiene un "+" y no es puramente un servicio de Disney individual
  const hasMultipleServices = trimmedName.includes('+') && !isIndividualService;
  const isCombo = hasMultipleServices;

  // DETECTAR TODOS LOS COMBOS POSIBLES
  let services: string[] = [serviceName];
  if (isCombo) {
    // Caso especial: Mega Combos de 5 servicios (detectar por palabras clave)
    const lowerName = trimmedName.toLowerCase();
    if (lowerName.includes('netflix') && lowerName.includes('max') && lowerName.includes('disney')) {
      services = ['Netflix', 'Max', serviceName.includes('Premium') ? 'Disney+ Premium' : 'Disney+ Estándar', 'Prime Video', 'Paramount+'];
    } else {
      // General case: split by "+" and clean, handling optional spaces
      services = serviceName.split('+').map(s => s.trim()).filter(s => s.length > 0);

      // Re-fix Disney+ if it was split accidentally (e.g. "Disney+ + Netflix")
      // But usually split('+') on "Disney+" results in ["Disney", ""] which is filtered out or "Disney".
      // We want to keep "Disney+" as a name.
      services = services.map(s => {
        if (s.toLowerCase() === 'disney' || s.toLowerCase() === 'disney+') return serviceName.includes('Premium') ? 'Disney+ Premium' : 'Disney+ Estándar';
        return s;
      });
    }
  }

  // Parsear credenciales si es combo
  let credentials: { [key: string]: { email: string, password: string } } = {};
  let hasValidStructuredCredentials = false;

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
          hasValidStructuredCredentials = true;
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
  // =============================================
  // COMPRA ACTIVA - Rediseño según Imagen
  // =============================================
  const initials = item.customer?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className={`group relative rounded-3xl border transition-all duration-500 overflow-hidden ${tv(isDark, 'bg-white border-gray-200 shadow-xl', 'bg-[#0B1120] border-white/5')}`}>
      {/* 🟢 Header Section (Always Visible) */}
      <div className="p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex gap-3 sm:gap-4">
            {/* Ícono Principal Condicional */}
            {showAdminActions ? (
              /* Avatar Administrador (Enfoque en Cliente) */
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex-shrink-0 flex items-center justify-center text-base sm:text-lg font-bold text-white shadow-lg ${tv(isDark, 'bg-blue-600', 'bg-blue-500/80')}`}>
                {initials}
              </div>
            ) : (
              /* Logo Cliente (Enfoque en Servicio) */
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex-shrink-0 flex items-center justify-center p-2 shadow-inner border transition-all duration-700 ${tv(isDark, 'bg-white border-gray-100 text-blue-600', 'bg-slate-800 border-white/10 text-blue-400')}`}>
                {getPlatformLogo(item.service, 32, 'w-full h-full object-contain rounded-xl')}
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <h3 className={`text-base sm:text-lg font-black leading-tight truncate uppercase tracking-tight ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                {showAdminActions ? item.customer : item.service}
              </h3>

              <div className={`text-[10px] sm:text-[11px] font-medium ${tv(isDark, 'text-gray-500', 'text-zinc-400')}`}>
                {showAdminActions ? `+${item.phone}` : `Compra activa • ${item.months} ${item.months === 1 ? 'mes' : 'meses'}`}
              </div>

              {/* Subdetalles Condicionales */}
              <div className="mt-2 space-y-0.5">
                <div className={`text-xs font-bold ${tv(isDark, 'text-blue-600', 'text-blue-400')}`}>
                  {showAdminActions ? item.service : `Vence el ${formatDate(item.end)}`}
                </div>
                {showAdminActions && (
                  <div className={`text-[9px] sm:text-[10px] font-medium ${tv(isDark, 'text-gray-500', 'text-zinc-500')}`}>
                    {formatDate(item.start)} → {formatDate(item.end)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end sm:justify-start gap-2">
            {/* Días Restantes (Badge compacto) */}
            <div className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black flex items-center gap-1.5 shadow-sm border ${tv(isDark, 'bg-blue-50 text-blue-600 border-blue-100', 'bg-blue-500/10 text-blue-400 border-blue-500/20')}`}>
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {days} Días
            </div>

            {/* Acciones de Admin */}
            {showAdminActions && (
              <button
                onClick={onEdit}
                title="Editar Compra"
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 border ${tv(isDark,
                  'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100',
                  'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/40'
                )} hover:scale-105 active:scale-95 shadow-sm`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                </svg>
              </button>
            )}

            {/* Botón de Desplegar (Visible para ambos) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${tv(isDark, 'bg-gray-100 text-gray-500 hover:bg-gray-200', 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10')}`}
            >
              <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Marcador de Estado (Admin solamente) */}
            {showAdminActions && (
              <div className={`hidden sm:flex px-3 py-1.5 rounded-lg font-bold tracking-widest uppercase items-center gap-1.5 text-[9px] shadow-sm border ${days < 0
                ? tv(isDark, 'bg-red-50 text-red-600 border-red-100', 'bg-red-500/10 text-red-500 border-red-500/20')
                : tv(isDark, 'bg-emerald-50 text-emerald-600 border-emerald-100', 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20')}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${days < 0 ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                {days < 0 ? 'Vencida' : 'Activa'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🟡 Expanded Content (Credentials & Notes) */}
      {isOpen && (
        <div className={`p-4 sm:p-5 transition-all duration-500 border-t flex flex-col gap-4 ${tv(isDark, 'bg-gray-50/50 border-gray-100', 'bg-[#050914] border-white/5')}`}>

          {/* 🔑 Sección de Credenciales */}
          <div className={`p-4 sm:p-6 rounded-2xl border ${tv(isDark, 'bg-white border-gray-100 shadow-sm', 'bg-[#0B1120]/60 border-white/5')}`}>
            <div className="flex items-center gap-2 mb-6 sm:mb-8">
              <span className="text-xl">🔑</span>
              <h4 className={`text-sm sm:text-base font-black tracking-tight ${tv(isDark, 'text-gray-900', 'text-zinc-100')}`}>
                Credenciales del Servicio
              </h4>
            </div>

            <div className="space-y-6 sm:space-y-8">
              {isCombo ? (
                /* Caso Combo */
                hasValidStructuredCredentials ? (
                  /* Vista Estructurada (Ideal) */
                  Object.keys(credentials).map((serviceName) => {
                    const serviceCreds = credentials[serviceName];
                    return (
                      <div key={serviceName} className="space-y-4 pb-6 border-b border-gray-100 dark:border-white/5 last:border-0 last:pb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span className="text-[11px] font-black uppercase tracking-widest text-blue-500">{serviceName}</span>
                        </div>
                        <CredRow label="Email:" value={serviceCreds.email} isDark={isDark} />
                        <CredRow
                          label="Password:"
                          value={serviceCreds.password}
                          isDark={isDark}
                          isPassword
                          showPassword={showPasswords[serviceName]}
                          onToggleShow={() => setShowPasswords(prev => ({ ...prev, [serviceName]: !prev[serviceName] }))}
                        />
                      </div>
                    );
                  })
                ) : (
                  /* ⚠️ FALLBACK: Vista Simplificada (Mejorada para claridad) */
                  <div className={`p-4 sm:p-6 rounded-2xl border-2 border-dashed transition-all ${tv(isDark, 'bg-orange-50/30 border-orange-200/60', 'bg-orange-500/5 border-orange-500/20')}`}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <span className="text-base">⚠️</span>
                        <span className={`text-[11px] font-black uppercase tracking-widest ${tv(isDark, 'text-orange-700', 'text-orange-400')}`}>
                          Vista Simplificada (Combo Completo)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className={`mb-4 p-3 rounded-xl border ${tv(isDark, 'bg-white/80 border-orange-100', 'bg-orange-950/20 border-orange-900/30')}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 ${tv(isDark, 'text-orange-900', 'text-orange-300')}`}>Servicios incluidos en esta cuenta:</p>
                        <p className={`text-xs font-bold leading-relaxed ${tv(isDark, 'text-orange-800', 'text-orange-200')}`}>
                          {services.join(' + ')}
                        </p>
                      </div>

                      <CredRow
                        label="Email Único:"
                        value={item.service_email || 'No disponible'}
                        isDark={isDark}
                      />
                      <CredRow
                        label="Contraseña:"
                        value={item.service_password || 'No disponible'}
                        isDark={isDark}
                        isPassword
                        showPassword={showPassword}
                        onToggleShow={() => setShowPassword(!showPassword)}
                      />
                    </div>

                    <p className={`mt-6 text-[10px] font-bold leading-relaxed text-center opacity-40 uppercase tracking-tighter ${tv(isDark, 'text-orange-900', 'text-orange-300')}`}>
                      Nota: Compra registrada con credencial maestra para todos los servicios.
                    </p>
                  </div>
                )
              ) : (
                /* Caso Individual */
                <div className="space-y-4">
                  <CredRow label="Email:" value={item.service_email || 'No disponible'} isDark={isDark} />
                  <CredRow label="Password:" value={item.service_password || 'No disponible'} isDark={isDark} isPassword showPassword={showPassword} onToggleShow={() => setShowPassword(!showPassword)} />
                </div>
              )}
            </div>
          </div>

          {/* 📝 Notas del Administrador (Rediseño Profesional) */}
          {item.admin_notes && (
            <div className={`rounded-2xl border transition-all overflow-hidden ${tv(isDark,
              'bg-[#F8FAFC] border-gray-100 shadow-sm',
              'bg-[#0B1120]/40 border-white/5'
            )}`}>
              <div className={`px-5 py-3 border-b flex items-center gap-2 ${tv(isDark, 'bg-gray-50/50 border-gray-100', 'bg-white/5 border-white/5')}`}>
                <svg className={`w-3.5 h-3.5 ${tv(isDark, 'text-gray-400', 'text-zinc-500')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className={`text-[10px] font-black tracking-widest uppercase ${tv(isDark, 'text-gray-500', 'text-zinc-500')}`}>
                  NOTAS ADICIONALES
                </h4>
              </div>
              <div className="p-5">
                <p className={`text-[13px] font-medium leading-relaxed whitespace-pre-wrap ${tv(isDark, 'text-gray-600', 'text-zinc-300')}`}>
                  {item.admin_notes}
                </p>
              </div>
            </div>
          )}

          {/* 🔵 Footer Actions Bar (Rediseño Estilo Botones Blancos/Gris) */}
          {showAdminActions && (
            <div className="mt-4 flex flex-wrap items-center justify-start gap-2.5">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleValidate(); }}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-black transition-all shadow-lg active:scale-95 ${days < 0
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {days < 0 ? 'Vencida' : 'Activa'}
              </button>

              <button
                onClick={onEdit}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-95 ${tv(isDark,
                  'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm',
                  'bg-white/5 border-white/10 text-zinc-100 hover:bg-white/10 hover:border-white/20'
                )}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar
              </button>

              <button
                onClick={onReminder}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-95 ${tv(isDark,
                  'bg-white border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 shadow-sm',
                  'bg-white/5 border-white/10 text-zinc-100 hover:bg-emerald-500/10 hover:border-emerald-500/20'
                )}`}
              >
                <svg className={`w-3.5 h-3.5 ${tv(isDark, 'text-emerald-500', 'text-emerald-400')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Recordatorio
              </button>

              <button
                onClick={onDelete}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-black transition-all active:scale-95 ${tv(isDark,
                  'bg-white border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 shadow-sm',
                  'bg-white/5 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30'
                )}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Sub-component for Credential Rows (Fidelity to Image)
function CredRow({ label, value, isDark, isPassword, showPassword, onToggleShow }: any) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
      <span className={`w-24 text-[11px] sm:text-xs font-black uppercase tracking-widest opacity-40 ${tv(isDark, 'text-gray-900', 'text-white')}`}>
        {label}
      </span>
      <div className="relative flex-1 group">
        <input
          type={isPassword && !showPassword ? 'password' : 'text'}
          value={value}
          readOnly
          className={`w-full pl-5 pr-12 py-3.5 rounded-2xl border text-[13px] sm:text-sm font-mono tracking-tight outline-none transition-all duration-300 ${tv(isDark,
            'bg-[#F8FAFC] border-gray-100 text-gray-700 focus:border-blue-500/50 shadow-sm',
            'bg-[#0B1120] border-white/5 text-gray-100 focus:border-blue-500/30'
          )} group-hover:border-blue-500/20`}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isPassword ? (
            <button
              onClick={onToggleShow}
              className={`p-2 rounded-xl transition-all ${tv(isDark, 'text-gray-400 hover:text-blue-600 hover:bg-blue-50', 'text-zinc-500 hover:text-blue-400 hover:bg-white/5')}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                )}
              </svg>
            </button>
          ) : (
            <button
              onClick={handleCopy}
              className={`p-2 rounded-xl transition-all flex items-center gap-1.5 ${copied ? 'text-emerald-500' : tv(isDark, 'text-gray-400 hover:text-blue-600 hover:bg-blue-50', 'text-zinc-500 hover:text-blue-400 hover:bg-white/5')}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {copied ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />}
              </svg>
              {copied && <span className="text-[9px] font-black uppercase tracking-tighter mr-1">Listo</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}