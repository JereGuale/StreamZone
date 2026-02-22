import React, { useState, useEffect } from 'react';
import { fmt, daysBetween, tv } from '../utils/helpers';

interface PurchaseCardProps {
  key?: any;
  item: any;
  isDark: boolean;
  onToggleValidate: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onReminder: () => void;
}

export function PurchaseCard({ item, isDark, onToggleValidate, onDelete, onEdit, onReminder }: PurchaseCardProps) {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().slice(0, 10));
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [isOpen, setIsOpen] = useState(false);

  // Debug: Log para verificar las credenciales
  console.log('🔍 PurchaseCard - Item completo:', item);

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
        const serviceName = lines[0].replace(':', '').trim();
        const email = lines[1].replace('Email: ', '').trim();
        const password = lines[2].replace('Contraseña: ', '').trim();

        if (serviceName && email && password) {
          credentials[serviceName] = { email, password };
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
  const status = days < 0 ? 'Vencido' : days === 0 ? 'Vence hoy' : `${days} días`;

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

  // Si es una compra pendiente, mostrar diseño profesional de la referencia
  if (!item.validated) {
    const badgeColorClass = getBadgeColor(item.service, isDark);

    return (
      <div className={`p-4 sm:p-5 rounded-xl border mb-4 ${tv(isDark, 'bg-white border-gray-200 shadow-sm', 'bg-[#18181b] border-zinc-800')}`}>
        <div className="flex flex-col gap-4">

          {/* Top Header: Info + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

            {/* Left side: Name, Badge, Phone, Date */}
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
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {item.phone}
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {item.start}
                </div>
              </div>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={onToggleValidate}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0e7490] hover:bg-[#164e63] text-white font-semibold text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Aprobar
              </button>
              <button
                onClick={onDelete}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${tv(isDark, 'text-gray-700 hover:bg-gray-100', 'text-zinc-300 hover:bg-zinc-800')}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Rechazar
              </button>
            </div>
          </div>

          {/* Details Box */}
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
  // COMPRA ACTIVA - con expand/collapse via state
  // =============================================
  return (
    <div className={`rounded-xl border shadow-sm mb-4 overflow-hidden ${tv(isDark, 'bg-white border-gray-200', 'bg-[#18181b] border-zinc-800')}`}>
      {/* Header - siempre visible, clickeable para expandir */}
      <div className="p-4 sm:p-5 cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          {/* Left: User info */}
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm ${tv(isDark, 'bg-gradient-to-br from-blue-500 to-indigo-600', 'bg-gradient-to-br from-blue-600 to-indigo-700')}`}>
              {item.customer.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <h3 className={`font-bold text-base sm:text-lg tracking-tight ${tv(isDark, 'text-gray-900', 'text-zinc-100')}`}>
                {item.customer}
              </h3>
              <div className={`flex items-center gap-1.5 text-xs font-medium mb-3 ${tv(isDark, 'text-gray-500', 'text-zinc-400')}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                {item.phone}
              </div>
              <div className={`flex items-center gap-1.5 text-sm font-bold mb-1 ${tv(isDark, 'text-gray-800', 'text-zinc-200')}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                {item.service}
              </div>
              <div className={`flex items-center gap-1.5 text-xs ${tv(isDark, 'text-gray-500', 'text-zinc-400')}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {item.start} → {item.end} • {item.months} {item.months === 1 ? 'mes' : 'meses'}
              </div>
            </div>
          </div>

          {/* Right: Status badges + toggle */}
          <div className="flex items-center gap-2 lg:gap-3 lg:self-start flex-wrap">
            <button
              className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${tv(isDark, 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-600', 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300')}`}
              onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
            >
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm ${tv(isDark, 'bg-[#f97316] hover:bg-[#ea580c] text-white', 'bg-[#ea580c] hover:bg-[#c2410c] text-white')}`}
              title="Editar compra"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>

            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border flex items-center gap-1 ${tv(isDark, 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]', 'bg-green-900/30 text-green-400 border-green-800/50')}`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Validada
            </span>

            <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm flex items-center gap-1.5 border ${days <= 0
              ? tv(isDark, 'bg-red-100 text-red-700 border-red-200', 'bg-red-900/20 text-red-400 border-red-800')
              : tv(isDark, 'bg-[#dbeafe] text-[#1d4ed8] border-blue-200', 'bg-blue-900/20 text-blue-400 border-blue-800')
              }`}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {days <= 0 ? 'VENCIDO' : `${days} días`}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable content - credentials + action buttons */}
      {isOpen && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5">
          {/* Credentials section */}
          <div className={`p-4 sm:p-5 rounded-xl border ${tv(isDark, 'bg-[#f0fdf4] border-[#bbf7d0]', 'bg-green-950/20 border-green-900/40')}`}>
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              <h5 className={`font-bold text-base ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                {isCombo ? 'Credenciales del Combo' : 'Credenciales del Servicio'}
              </h5>
            </div>

            {isCombo ? (
              <div className="space-y-4">
                {services.map((service) => {
                  const serviceCreds = credentials[service];
                  if (!serviceCreds) return null;
                  return (
                    <div key={service} className="space-y-3">
                      <h6 className={`text-sm font-bold ${tv(isDark, 'text-gray-800', 'text-white')}`}>{service}</h6>
                      <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] items-center gap-2 sm:gap-4">
                        <span className={`text-sm font-medium ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>Email:</span>
                        <input type="text" value={serviceCreds.email} readOnly
                          className={`text-sm font-mono px-4 py-2.5 rounded-lg border w-full outline-none ${tv(isDark, 'bg-white text-gray-700 border-gray-300', 'bg-zinc-800 text-gray-200 border-zinc-700')}`} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] items-center gap-2 sm:gap-4">
                        <span className={`text-sm font-medium ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>Password:</span>
                        <div className="flex items-center gap-2 w-full">
                          <input type={showPasswords[service] ? 'text' : 'password'} value={serviceCreds.password} readOnly
                            className={`text-sm font-mono px-4 py-2.5 rounded-lg border flex-1 w-full outline-none ${tv(isDark, 'bg-white text-gray-700 border-gray-300', 'bg-zinc-800 text-gray-200 border-zinc-700')}`} />
                          <button
                            onClick={() => setShowPasswords(prev => ({ ...prev, [service]: !prev[service] }))}
                            className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center transition-colors shadow-sm ${tv(isDark, 'bg-[#dbeafe] text-[#2563eb] hover:bg-blue-200', 'bg-blue-900/40 text-blue-400 hover:bg-blue-900/60')}`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] items-center gap-2 sm:gap-4">
                  <span className={`text-sm font-bold ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>Email:</span>
                  <input type="text" value={item.service_email || 'No disponible'} readOnly
                    className={`text-sm font-mono px-4 py-2.5 rounded-lg border w-full outline-none ${tv(isDark, 'bg-white text-gray-800 border-gray-300', 'bg-[#18181b] text-gray-200 border-zinc-700')}`} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] items-center gap-2 sm:gap-4">
                  <span className={`text-sm font-bold ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>Password:</span>
                  <div className="flex items-center gap-2 w-full">
                    <input type={showPassword ? 'text' : 'password'} value={item.service_password || 'No disponible'} readOnly
                      className={`text-sm font-mono px-4 py-2.5 rounded-lg border flex-1 w-full outline-none ${tv(isDark, 'bg-white text-gray-800 border-gray-300', 'bg-[#18181b] text-gray-200 border-zinc-700')}`} />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className={`w-11 h-10 shrink-0 rounded-lg flex items-center justify-center transition-colors shadow-sm ${tv(isDark, 'bg-[#dbeafe] text-[#2563eb] hover:bg-blue-200', 'bg-blue-900/40 text-blue-400 hover:bg-blue-900/60')}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {showPassword
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        }
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className={`mt-4 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${tv(isDark, 'bg-[#f8fafc]', 'bg-zinc-800/40')}`}>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button onClick={onToggleValidate}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm ${tv(isDark, 'bg-[#3b82f6] text-white hover:bg-blue-600', 'bg-blue-600 text-white hover:bg-blue-700')}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Validada
              </button>
              <button onClick={onEdit}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm ${tv(isDark, 'bg-[#f97316] text-white hover:bg-[#ea580c]', 'bg-[#ea580c] text-white hover:bg-[#c2410c]')}`}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                Editar
              </button>
              <button onClick={onReminder}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm ${tv(isDark, 'bg-[#22c55e] text-white hover:bg-[#16a34a]', 'bg-[#16a34a] text-white hover:bg-[#15803d]')}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Recordatorio
              </button>
              <button onClick={onDelete}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm ${tv(isDark, 'bg-[#ef4444] text-white hover:bg-red-600', 'bg-red-600 text-white hover:bg-red-700')}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Eliminar
              </button>
            </div>
            <div className={`px-4 py-2 text-sm font-bold rounded-full shadow-sm flex items-center gap-1.5 border-2 ${days <= 0
              ? tv(isDark, 'bg-red-100 text-red-700 border-red-200', 'bg-red-900/20 text-red-400 border-red-800')
              : tv(isDark, 'bg-[#dbeafe] text-[#1d4ed8] border-[#bfdbfe]', 'bg-blue-900/20 text-blue-400 border-blue-800')
              }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {days <= 0 ? 'VENCIDO' : `${days} días`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}