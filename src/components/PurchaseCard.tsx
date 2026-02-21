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

  // Si es una compra pendiente, mostrar diseño profesional de la referencia
  if (!item.validated) {
    return (
      <div className={`p-6 rounded-2xl transition-all shadow-xl border ${tv(isDark, 'bg-white border-gray-100', 'bg-zinc-900 border-white/5')}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            {/* Row 1: Name and Service Tag */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h3 className={`text-xl font-bold tracking-tight ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                {item.customer}
              </h3>
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest">
                {item.service}
              </span>
            </div>

            {/* Row 2: Basic Info (Phone, Date) */}
            <div className={`flex items-center gap-4 text-xs font-medium mb-6 opacity-60 ${tv(isDark, 'text-gray-600', 'text-zinc-400')}`}>
              <div className="flex items-center gap-1.5">
                <span>📱</span>
                {item.phone}
              </div>
              <div className="flex items-center gap-1.5">
                <span>📅</span>
                {item.start}
              </div>
            </div>

            {/* Row 3: Service Detail Box (Darker Container) */}
            <div className={`grid grid-cols-3 gap-6 p-4 rounded-xl ${tv(isDark, 'bg-gray-50 border border-gray-100', 'bg-black/50 border border-white/5 outline outline-1 outline-white/5')}`}>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 text-white">DURACIÓN</div>
                <div className="text-sm font-bold text-white">{item.months} {item.months === 1 ? 'mes' : 'meses'}</div>
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 text-white">INICIO</div>
                <div className="text-sm font-bold text-white">{item.start}</div>
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 text-white">FIN</div>
                <div className="text-sm font-bold text-white">{item.end}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleValidate}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-black text-sm transition-all hover:scale-105 shadow-lg shadow-emerald-500/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Aprobar
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-black text-sm transition-all hover:scale-105 shadow-lg shadow-red-500/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Rechazar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si es una compra activa, mostrar diseño expandible con details/summary
  return (
    <details className={`relative group rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-200 ${tv(isDark, 'border-gray-200 bg-white hover:border-gray-300', 'border-gray-700 bg-gray-800 hover:border-gray-600')}`}>
      <summary className="cursor-pointer list-none p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm ${tv(isDark, 'bg-gradient-to-r from-blue-500 to-purple-600', 'bg-gradient-to-r from-blue-600 to-purple-700')}`}>
                {item.customer.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-base sm:text-lg ${tv(isDark, 'text-gray-900', 'text-white')}`}>
                  {item.customer}
                </h3>
                <p className={`text-xs sm:text-sm ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>
                  📱 {item.phone}
                </p>
              </div>
            </div>

            <div className={`text-sm sm:text-base font-medium mb-2 ${tv(isDark, 'text-gray-800', 'text-gray-200')}`}>
              🎬 {item.service}
            </div>

            <div className={`text-xs sm:text-sm ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>
              📅 {item.start} → {item.end} • {item.months} {item.months === 1 ? 'mes' : 'meses'}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end gap-2 sm:gap-2">
            <div className="flex items-center gap-2">
              <button
                className={`w-8 h-8 rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center group ${tv(isDark, 'bg-gray-100 hover:bg-gray-200 text-gray-600', 'bg-gray-700 hover:bg-gray-600 text-gray-300')}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const details = e.currentTarget.closest('details');
                  if (details) {
                    details.open = !details.open;
                  }
                }}
                title="Ver detalles"
              >
                <span className="text-sm group-hover:scale-110 transition-transform duration-200">▼</span>
              </button>

              <button
                className={`w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center group ${tv(isDark, 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white', 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white')}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit();
                }}
                title="Editar compra"
              >
                <span className="text-lg group-hover:scale-110 transition-transform duration-200">✏️</span>
              </button>
            </div>

            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${tv(isDark, 'bg-green-100 text-green-800 border border-green-200', 'bg-green-800 text-green-100 border border-green-500')}`}>
              ✅ Validada
            </span>

            <span className={`px-3 py-2 text-sm font-bold rounded-full border-2 shadow-lg ${days <= 0
                ? tv(isDark, 'bg-red-200 text-red-900 border-red-400 shadow-red-300/50', 'bg-red-900 text-red-100 border-red-500 shadow-red-900/50')
                : days <= 3
                  ? tv(isDark, 'bg-orange-200 text-orange-900 border-orange-400 shadow-orange-300/50', 'bg-orange-900 text-orange-100 border-orange-500 shadow-orange-900/50')
                  : days <= 7
                    ? tv(isDark, 'bg-yellow-200 text-yellow-900 border-yellow-400 shadow-yellow-300/50', 'bg-yellow-900 text-yellow-100 border-yellow-500 shadow-yellow-900/50')
                    : tv(isDark, 'bg-blue-200 text-blue-900 border-blue-400 shadow-blue-300/50', 'bg-blue-900 text-blue-100 border-blue-500 shadow-blue-900/50')
              }`}>
              {days <= 0 ? '⚠️ VENCIDO' : days === 1 ? '🔥 VENCE MAÑANA' : days === 0 ? '🔥 VENCE HOY' : `📅 ${days} días`}
            </span>
          </div>
        </div>
      </summary>

      <div className={`mx-2 sm:mx-4 mb-3 sm:mb-4 p-3 sm:p-6 rounded-xl border-2 ${tv(isDark, 'bg-green-50 border-green-200', 'bg-green-900/20 border-green-700')}`}>
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base ${tv(isDark, 'bg-yellow-100', 'bg-yellow-900/30')}`}>
            🔑
          </div>
          <h5 className={`font-bold text-base sm:text-lg ${tv(isDark, 'text-gray-800', 'text-white')}`}>
            {isCombo ? 'Credenciales del Combo' : 'Credenciales del Servicio'}
          </h5>
        </div>

        {isCombo ? (
          <div className="space-y-3 sm:space-y-4">
            {services.map((service) => {
              const serviceCreds = credentials[service];
              if (!serviceCreds) return null;
              return (
                <div key={service} className={`p-3 rounded-lg border ${tv(isDark, 'bg-gray-50 border-gray-200', 'bg-gray-800 border-gray-600')}`}>
                  <h6 className={`text-sm font-bold mb-2 ${tv(isDark, 'text-gray-800', 'text-white')}`}>
                    {service}
                  </h6>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <span className={`text-xs font-semibold w-16 sm:w-20 ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>📧 Email:</span>
                      <input
                        type="text"
                        value={serviceCreds.email}
                        readOnly
                        className={`text-xs font-mono px-3 py-2 rounded-lg border flex-1 ${tv(isDark, 'bg-white text-gray-800 border-gray-300', 'bg-gray-700 text-gray-200 border-gray-600')}`}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <span className={`text-xs font-semibold w-16 sm:w-20 ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>🔑 Pass:</span>
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type={showPasswords[service] ? 'text' : 'password'}
                          value={serviceCreds.password}
                          readOnly
                          className={`text-xs font-mono px-3 py-2 rounded-lg border flex-1 ${tv(isDark, 'bg-white text-gray-800 border-gray-300', 'bg-gray-700 text-gray-200 border-gray-600')}`}
                        />
                        <button
                          onClick={() => setShowPasswords(prev => ({ ...prev, [service]: !prev[service] }))}
                          className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors ${tv(isDark, 'bg-blue-100 text-blue-700 hover:bg-blue-200', 'bg-blue-900 text-blue-300 hover:bg-blue-800')}`}
                        >
                          {showPasswords[service] ? '👁️' : '🔒'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className={`text-xs sm:text-sm font-semibold w-16 sm:w-20 ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>Email:</span>
              <input
                type="text"
                value={item.service_email || 'No disponible'}
                readOnly
                className={`text-xs sm:text-sm font-mono px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 flex-1 ${tv(isDark, 'bg-white text-gray-800 border-gray-300', 'bg-gray-800 text-gray-200 border-gray-600')}`}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <span className={`text-xs sm:text-sm font-semibold w-16 sm:w-20 ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>Password:</span>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={item.service_password || 'No disponible'}
                  readOnly
                  className={`text-xs sm:text-sm font-mono px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 flex-1 ${tv(isDark, 'bg-white text-gray-800 border-gray-300', 'bg-gray-800 text-gray-200 border-gray-600')}`}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className={`px-2 sm:px-3 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${tv(isDark, 'bg-blue-100 text-blue-700 hover:bg-blue-200', 'bg-blue-900 text-blue-300 hover:bg-blue-800')}`}
                >
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-b-xl ${tv(isDark, 'bg-gray-100', 'bg-gray-900')}`}>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={onToggleValidate}
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${tv(isDark, 'bg-blue-500 text-white hover:bg-blue-600', 'bg-blue-600 text-white hover:bg-blue-700')}`}
          >
            ✅ Validada
          </button>
          <button
            onClick={onEdit}
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${tv(isDark, 'bg-orange-500 text-white hover:bg-orange-600', 'bg-orange-600 text-white hover:bg-orange-700')}`}
          >
            ✏️ Editar
          </button>
          <button
            onClick={onReminder}
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${tv(isDark, 'bg-green-500 text-white hover:bg-green-600', 'bg-green-600 text-white hover:bg-green-700')}`}
          >
            📅 Recordatorio
          </button>
          <button
            onClick={onDelete}
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${tv(isDark, 'bg-red-500 text-white hover:bg-red-600', 'bg-red-600 text-white hover:bg-red-700')}`}
          >
            🗑️ Eliminar
          </button>
        </div>
        <div className={`px-3 py-2 text-sm font-bold rounded-full border-2 shadow-lg ${days <= 0
            ? tv(isDark, 'bg-red-200 text-red-900 border-red-400 shadow-red-300/50', 'bg-red-900 text-red-100 border-red-500 shadow-red-900/50')
            : days <= 3
              ? tv(isDark, 'bg-orange-200 text-orange-900 border-orange-400 shadow-orange-300/50', 'bg-orange-900 text-orange-100 border-orange-500 shadow-orange-900/50')
              : days <= 7
                ? tv(isDark, 'bg-yellow-200 text-yellow-900 border-yellow-400 shadow-yellow-300/50', 'bg-yellow-900 text-yellow-100 border-yellow-500 shadow-yellow-900/50')
                : tv(isDark, 'bg-blue-200 text-blue-900 border-blue-400 shadow-blue-300/50', 'bg-blue-900 text-blue-100 border-blue-500 shadow-blue-900/50')
          }`}>
          {days <= 0 ? '⚠️ VENCIDO' : days === 1 ? '🔥 VENCE MAÑANA' : days === 0 ? '🔥 VENCE HOY' : `📅 ${days} días`}
        </div>
      </div>
    </details>
  );
}