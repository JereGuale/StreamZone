import React, { useState, useEffect } from "react";
import { DatabasePurchase } from "../lib/supabase";
import { tv, formatPhoneForWhatsApp } from "../utils/helpers";
import { SERVICES, COMBOS } from "../constants/services";

interface EditPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (data: Partial<DatabasePurchase>) => void;
  purchase: DatabasePurchase | null;
  isDark: boolean;
  systemPrefersDark: boolean;
}

export function EditPurchaseModal({ open, onClose, onUpdate, purchase, isDark, systemPrefersDark }: EditPurchaseModalProps) {
  // Memoizar la detección de combo y lista de servicios para evitar re-renders infinitos
  const { isCombo, services } = React.useMemo(() => {
    const sName = purchase?.service || '';
    const tName = sName.trim();

    const isOnlyDisney = /^Disney\+?\s*$/i.test(tName) ||
      /^Disney\+?\s+(Standard|Estándar|Premium)\s*$/i.test(tName) ||
      /^Disney\s+(Standard|Estándar|Premium)\s*$/i.test(tName);

    const hasOtherServices = tName.includes('Netflix') ||
      tName.includes('Max') ||
      tName.includes('Prime') ||
      tName.includes('Spotify') ||
      tName.includes('Paramount') ||
      /\s+\+\s+/.test(tName);

    const isIndividual = isOnlyDisney && !hasOtherServices;

    // Usar la misma lógica flexible que en PurchaseCard
    const hasMultiple = tName.includes('+') && !isIndividual;
    const combo = hasMultiple;

    let svcList = [sName];
    if (combo) {
      if (sName.toLowerCase().includes('netflix') && sName.toLowerCase().includes('max') && sName.toLowerCase().includes('disney')) {
        svcList = ['Netflix', 'Max', sName.includes('Premium') ? 'Disney+ Premium' : 'Disney+ Estándar', 'Prime Video', 'Paramount+'];
      } else {
        svcList = sName.split('+').map(s => s.trim()).filter(s => s.length > 0);

        // Re-fix Disney+ si fue separado accidentalmente
        svcList = svcList.map(s => {
          if (s.toLowerCase() === 'disney' || s.toLowerCase() === 'disney+') {
            return sName.includes('Premium') ? 'Disney+ Premium' : 'Disney+ Estándar';
          }
          return s;
        });
      }
    }

    return { isCombo: combo, services: svcList };
  }, [purchase?.service]);

  const [formData, setFormData] = useState({
    customer: '',
    phone: '',
    service: '',
    start: '',
    end: '',
    months: 1,
    service_email: '',
    service_password: '',
    admin_notes: '',
    price: 0
  });

  // Estado para controlar si se está editando fechas
  const [isEditingDates, setIsEditingDates] = useState(false);

  // Para combos, manejar múltiples credenciales
  const [multiCredentials, setMultiCredentials] = useState<{ [key: string]: { email: string, password: string } }>({});

  // Función para calcular fecha de fin automáticamente
  const calculateEndDate = (startDate: string, months: number) => {
    if (!startDate) return '';
    const start = new Date(startDate);
    const end = new Date(start);
    // Calcular fecha de fin con días exactos (30 días por mes)
    end.setDate(end.getDate() + (months * 30));
    return end.toISOString().split('T')[0];
  };

  // Función para manejar cambios en fecha de inicio
  const handleStartDateChange = (newStartDate: string) => {
    setFormData(prev => ({
      ...prev,
      start: newStartDate,
      end: calculateEndDate(newStartDate, prev.months)
    }));
  };

  // Función para manejar cambios en meses
  const handleMonthsChange = (newMonths: number) => {
    setFormData(prev => {
      const updatedData = {
        ...prev,
        months: newMonths,
        end: calculateEndDate(prev.start, newMonths)
      };

      // Autocalcular precio si el servicio existe
      const service = SERVICES.find(s => s.name === prev.service) ||
        COMBOS.find(c => c.name === prev.service);

      if (service) {
        updatedData.price = (service as any).price * newMonths;
      }

      return updatedData;
    });
  };

  // Efecto para calcular precio base si es 0 y actualizar cuando cambian los meses
  useEffect(() => {
    if (open && purchase) {
      // Solo calcular si el precio actual es 0 (compra antigua) O si el usuario está activamente editando los meses
      const service = SERVICES.find(s => s.name === formData.service) ||
        COMBOS.find(c => c.name === formData.service);

      if (service) {
        const calculatedPrice = (service as any).price * formData.months;

        // Si el precio actual en el formulario es 0, lo ponemos automáticamente
        if (formData.price === 0) {
          setFormData(prev => ({ ...prev, price: calculatedPrice }));
        }
        // Nota: No forzamos el precio si ya es > 0 para permitir descuentos manuales,
        // a menos que sea un cambio de meses, pero aquí es difícil distinguir.
        // El usuario pidió "automático", así que vamos a ayudarle.
      }
    }
  }, [formData.service, formData.months, open, purchase]);

  // Inicializar el formulario SOLO cuando cambia la compra o se abre el modal
  useEffect(() => {
    if (purchase && open) {
      setFormData({
        customer: purchase.customer || '',
        phone: purchase.phone || '',
        service: purchase.service || '',
        start: purchase.start || '',
        end: purchase.end || '',
        months: purchase.months || 1,
        service_email: purchase.service_email || '',
        service_password: purchase.service_password || '',
        admin_notes: purchase.admin_notes || '',
        price: purchase.price || 0
      });

      // Si es combo, parsear las credenciales existentes
      if (isCombo && purchase.service_password) {
        const credentials: { [key: string]: { email: string, password: string } } = {};

        // Intentar parsear el formato: "Servicio:\nEmail: xxx\nContraseña: xxx"
        const sections = purchase.service_password.split('\n\n');
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

        // 🚨 FALLBACK: Si es un combo pero el parseo falló (registro antiguo)
        if (Object.keys(credentials).length === 0 && services.length > 0) {
          const firstService = services[0];
          credentials[firstService] = {
            email: purchase.service_email || '',
            password: purchase.service_password || ''
          };
        }

        setMultiCredentials(credentials);
        console.log('📋 Credenciales inicializadas para edición');
      }
    }
  }, [purchase?.id, open, isCombo, services]);

  if (!open || !purchase) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalFormData = { ...formData };

    // Si es combo, concatenar las credenciales múltiples
    if (isCombo) {
      const credentialsText = services.map(service => {
        const creds = multiCredentials[service];
        if (creds?.email && creds?.password) {
          return `${service}:\nEmail: ${creds.email}\nContraseña: ${creds.password}`;
        }
        return '';
      }).filter(text => text.length > 0).join('\n\n');

      finalFormData.service_email = `COMBO: ${services.join(' + ')}`;
      finalFormData.service_password = credentialsText;
    }

    onUpdate(finalFormData);
    onClose();
  };

  const handleWhatsApp = () => {
    // Si es combo y tiene credenciales parseadas, mostrarlas de forma clara
    let credentialsText = formData.service_email && formData.service_password ?
      `Email: ${formData.service_email}\nPass: ${formData.service_password}` : "";

    // Si detectamos formato de combo en service_password, intentar mostrarlo mejor
    if (isCombo && formData.service_password.includes('Email:')) {
      credentialsText = formData.service_password.replace(/Email: /g, '').replace(/Contraseña: /g, '/ ');
    }

    const message = `\u2605 StreamZone \u2605\n\u00A1Actualizaci\u00F3n Exitosa! \u2728\n\n\u00A1Hola ${formData.customer}! Tu servicio ${formData.service} ya esta listo. \u2713\n\n\uD83D\uDD11 CREDENCIALES:\n${credentialsText}\n\n\uD83D\uDCC5 Duracion: ${formData.months} ${formData.months === 1 ? 'mes' : 'meses'}\n\u23F0 Vence: ${formData.end}\n\uD83D\uDC8E \u00A1Disfruta tu entretenimiento!`;

    const phoneNumber = formatPhoneForWhatsApp(formData.phone);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${tv(isDark, 'bg-white', 'bg-gray-900')}`} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`relative p-6 border-b-2 ${tv(isDark, 'bg-gray-50 border-gray-200', 'bg-gray-800 border-gray-700')}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-2xl font-bold ${tv(isDark, 'text-gray-900', 'text-white')}`}>Editar Compra</h3>
            <button
              onClick={onClose}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold transition-all ${tv(isDark, 'text-gray-500 hover:bg-gray-100', 'text-gray-400 hover:bg-gray-700')}`}
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del cliente - Editable */}
            <div className={`p-6 rounded-xl border-2 ${tv(isDark, 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200', 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-700')}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tv(isDark, 'bg-blue-100', 'bg-blue-900/30')}`}>
                  👤
                </div>
                <h4 className={`text-xl font-bold ${tv(isDark, 'text-gray-900', 'text-white')}`}>Información del Cliente</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                    👤 Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200', 'border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/30')}`}
                    placeholder="Nombre completo del cliente"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                    📱 Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200', 'border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/30')}`}
                    placeholder="+593 99 999 9999"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                    💰 Precio de Venta *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    readOnly
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-bold transition-all bg-gray-100 cursor-not-allowed ${tv(isDark, 'border-gray-300 text-gray-500', 'border-gray-600 bg-gray-800 text-gray-400')}`}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Sección de Fechas y Duración */}
            <div className={`p-6 rounded-xl border-2 ${tv(isDark, 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200', 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700')}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tv(isDark, 'bg-green-100', 'bg-green-900/30')}`}>
                    📅
                  </div>
                  <h4 className={`text-xl font-bold ${tv(isDark, 'text-gray-900', 'text-white')}`}>Fechas y Duración</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingDates(!isEditingDates)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tv(isDark, 'bg-green-100 text-green-800 hover:bg-green-200', 'bg-green-900/30 text-green-200 hover:bg-green-800/40')}`}
                >
                  {isEditingDates ? '🔒 Bloquear' : '✏️ Editar Fechas'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                    📅 Fecha de Inicio *
                  </label>
                  <input
                    type="date"
                    value={formData.start}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    disabled={!isEditingDates}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200', 'border-gray-600 bg-gray-700 text-white focus:border-green-400 focus:ring-green-800/30')} ${!isEditingDates ? 'opacity-60 cursor-not-allowed' : ''}`}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                    ⏱️ Duración (meses) *
                  </label>
                  <select
                    value={formData.months}
                    onChange={(e) => handleMonthsChange(Number(e.target.value))}
                    disabled={!isEditingDates}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200', 'border-gray-600 bg-gray-700 text-white focus:border-green-400 focus:ring-green-800/30')} ${!isEditingDates ? 'opacity-60 cursor-not-allowed' : ''}`}
                    required
                  >
                    <option value={1}>1 mes</option>
                    <option value={3}>3 meses</option>
                    <option value={6}>6 meses</option>
                    <option value={12}>12 meses</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                    🏁 Fecha de Fin
                  </label>
                  <input
                    type="date"
                    value={formData.end}
                    onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                    disabled={!isEditingDates}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200', 'border-gray-600 bg-gray-700 text-white focus:border-green-400 focus:ring-green-800/30')} ${!isEditingDates ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>

              {isEditingDates && (
                <div className={`mt-4 p-3 rounded-lg ${tv(isDark, 'bg-green-100 border border-green-200', 'bg-green-900/20 border border-green-600')}`}>
                  <p className={`text-sm font-semibold ${tv(isDark, 'text-green-800', 'text-green-300')}`}>
                    💡 <strong>Tip:</strong> La fecha de fin se calcula automáticamente basada en la fecha de inicio y duración.
                    Útil para renovaciones o ajustes de fechas.
                  </p>
                </div>
              )}
            </div>

            {/* Credenciales del servicio */}
            <div className={`p-6 rounded-xl border-2 ${tv(isDark, 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200', 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700')}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tv(isDark, 'bg-yellow-100', 'bg-yellow-900/30')}`}>
                  🔑
                </div>
                <h4 className={`text-xl font-bold ${tv(isDark, 'text-gray-900', 'text-white')}`}>Credenciales del Servicio</h4>
              </div>

              {isCombo ? (
                // Para combos: mostrar campos para cada servicio
                <div className="space-y-4">
                  <div className={`p-3 rounded-lg ${tv(isDark, 'bg-orange-50 border border-orange-200', 'bg-orange-900/20 border border-orange-600')}`}>
                    <p className={`text-sm font-semibold ${tv(isDark, 'text-orange-800', 'text-orange-300')}`}>
                      🎁 Combo detectado: Edita las credenciales para cada servicio
                    </p>
                  </div>
                  {services.map((service, index) => (
                    <div key={service} className={`p-4 rounded-lg border ${tv(isDark, 'bg-gray-50 border-gray-200', 'bg-gray-800 border-gray-600')}`}>
                      <h5 className={`text-lg font-bold mb-3 ${tv(isDark, 'text-gray-800', 'text-white')}`}>
                        {service} {index === 0 ? '🎬' : index === 1 ? '🎭' : index === 2 ? '🎪' : '🎯'}
                      </h5>

                      <div className="space-y-3">
                        <div>
                          <label className={`block text-sm font-bold mb-2 ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                            📧 Email del {service}
                          </label>
                          <input
                            type="email"
                            value={multiCredentials[service]?.email || ''}
                            onChange={(e) => setMultiCredentials(prev => ({
                              ...prev,
                              [service]: { ...prev[service], email: e.target.value, password: prev[service]?.password || '' }
                            }))}
                            autoComplete="off"
                            className={`w-full rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-blue-500', 'border-gray-600 bg-gray-700 text-white focus:border-blue-400')}`}
                            placeholder={`usuario@${service.toLowerCase().replace(/[^a-z]/g, '')}.com`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-bold mb-2 ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                            🔑 Contraseña del {service}
                          </label>
                          <input
                            type="password"
                            value={multiCredentials[service]?.password || ''}
                            onChange={(e) => setMultiCredentials(prev => ({
                              ...prev,
                              [service]: { ...prev[service], password: e.target.value, email: prev[service]?.email || '' }
                            }))}
                            autoComplete="off"
                            className={`w-full rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-amber-500', 'border-gray-600 bg-gray-700 text-white focus:border-amber-400')}`}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Para servicios individuales: formulario original
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={`block text-sm font-bold ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                      Email del servicio *
                    </label>
                    <input
                      type="email"
                      value={formData.service_email}
                      onChange={(e) => setFormData({ ...formData, service_email: e.target.value })}
                      autoComplete="off"
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200', 'border-gray-600 bg-gray-700 text-white focus:border-purple-400 focus:ring-purple-800/30')}`}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className={`block text-sm font-bold ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                      Contraseña del servicio *
                    </label>
                    <input
                      type="text"
                      value={formData.service_password}
                      onChange={(e) => setFormData({ ...formData, service_password: e.target.value })}
                      autoComplete="off"
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200', 'border-gray-600 bg-gray-700 text-white focus:border-purple-400 focus:ring-purple-800/30')}`}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Información importante del administrador */}
            <div className={`p-6 rounded-xl border-2 ${tv(isDark, 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200', 'bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-700')}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tv(isDark, 'bg-amber-100', 'bg-amber-900/30')}`}>
                  📝
                </div>
                <h4 className={`text-xl font-bold ${tv(isDark, 'text-gray-900', 'text-white')}`}>Notas del Administrador</h4>
              </div>
              <textarea
                value={formData.admin_notes}
                onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 resize-none ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-amber-500 focus:ring-amber-200', 'border-gray-600 bg-gray-700 text-white focus:border-amber-400 focus:ring-amber-800/30')}`}
                rows={4}
                placeholder="Escribe información importante para el cliente (puedes usar saltos de línea)..."
              />
              <div className={`mt-3 p-3 rounded-lg ${tv(isDark, 'bg-amber-100 border border-amber-200', 'bg-amber-900/20 border border-amber-600')}`}>
                <p className={`text-sm font-semibold ${tv(isDark, 'text-amber-800', 'text-amber-300')}`}>
                  💡 <strong>Nota:</strong> Esta información será visible para el cliente y puede incluir instrucciones especiales,
                  detalles de renovación, o cualquier información relevante.
                </p>
              </div>
            </div>

            {/* Botones de acción - Diseño profesional */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className={`w-full sm:flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 ${tv(isDark, 'bg-gray-200 text-gray-800 hover:bg-gray-300', 'bg-gray-700 text-gray-200 hover:bg-gray-600')}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>❌</span>
                  <span>Cancelar</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleWhatsApp}
                className={`w-full sm:flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 ${tv(isDark, 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl', 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl')}`}
              >
                <span className="text-lg">📱</span>
                <span className="truncate">Enviar por WhatsApp</span>
              </button>

              <button
                type="submit"
                className={`w-full sm:flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl`}
              >
                <span className="text-lg">💾</span>
                <span className="truncate">Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}