import React, { useState, useEffect } from "react";
import { SERVICES, COMBOS } from "../constants/services";
import { COUNTRIES } from "../constants/countries";
import { fmt, tv, formatPhoneForWhatsApp, formatPhoneNumber, whatsappLinkSimple } from "../utils/helpers";

interface AdminRegisterPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  onRegister: (data: any) => void;
  isDark: boolean;
  systemPrefersDark: boolean;
  services: any[];
  combos: any[];
}

export function AdminRegisterPurchaseModal({ open, onClose, onRegister, isDark, systemPrefersDark, services = [], combos = [] }: AdminRegisterPurchaseModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    countryCode: '+593',
    email: '',
    service: '',
    price: '',
    duration: 1,
    isAnnual: false,
    startDate: new Date().toISOString().slice(0, 10),
    service_email: '',
    service_password: '',
    admin_notes: ''
  });

  // Para combos, manejar múltiples credenciales
  const [multiCredentials, setMultiCredentials] = useState<{ [key: string]: { email: string, password: string } }>({});

  // Detectar si el servicio actual es un combo
  const serviceName = formData.service || '';
  const isIndividualServiceFromCatalog = services.find(s => s.name === serviceName);
  const isComboFromCatalog = combos.find(c => c.name === serviceName);

  // Lógica de detección de servicios múltiples similar a PurchaseCard
  const hasRealServiceSeparator = /\s+\+\s+/.test(formData.service);
  const isDisneyService = /Disney/i.test(formData.service) && /(Standard|Estándar|Premium)/i.test(formData.service);
  const hasOtherServices = /Netflix|Max|Prime|Spotify|Paramount/i.test(formData.service);

  const isCombo = (isComboFromCatalog || hasRealServiceSeparator) && !(isDisneyService && !hasOtherServices && !hasRealServiceSeparator);

  // Calcular servicios del combo
  let comboServices: string[] = [];
  if (isCombo) {
    if (serviceName.toLowerCase().includes('netflix') && serviceName.toLowerCase().includes('max') && serviceName.toLowerCase().includes('disney')) {
      comboServices = ['Netflix', 'Max', serviceName.includes('Premium') ? 'Disney+ Premium' : 'Disney+ Estándar', 'Prime Video', 'Paramount+'];
    } else {
      comboServices = serviceName.split(/\s*\+\s*/).map(s => s.trim()).filter(s => s.length > 0);
    }
  }

  // Calcular precio automáticamente cuando cambia el servicio o duración
  useEffect(() => {
    if (formData.service) {
      const selected = services.find(s => s.name === formData.service) || combos.find(c => c.name === formData.service);
      if (selected) {
        const basePrice = Number(selected.price);
        const totalPrice = basePrice * formData.duration;
        setFormData(prev => ({ ...prev, price: totalPrice.toString() }));
      }
    }
  }, [formData.service, formData.duration, services, combos]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar credenciales según si es combo o no
    if (isCombo) {
      const missingCredentials = comboServices.some(service =>
        !multiCredentials[service]?.email || !multiCredentials[service]?.password
      );
      if (missingCredentials) {
        alert('⚠️ Por favor completa el email y contraseña para todos los servicios del combo');
        return;
      }
    } else {
      if (!formData.name || !formData.phone || !formData.service || !formData.service_email || !formData.service_password) {
        alert('⚠️ Por favor completa todos los campos requeridos, incluyendo las credenciales del servicio');
        return;
      }
    }

    // Formatear número de teléfono completo
    const fullPhone = formatPhoneNumber(formData.phone, formData.countryCode);

    const endDate = new Date(formData.startDate);
    const monthsToAdd = formData.isAnnual ? formData.duration * 12 : formData.duration;
    endDate.setDate(endDate.getDate() + (monthsToAdd * 30));

    let finalData = {
      ...formData,
      phone: fullPhone,
      price: parseFloat(formData.price),
      endDate: endDate.toISOString().slice(0, 10),
      months: monthsToAdd
    };

    // Si es combo, concatenar las credenciales múltiples
    if (isCombo) {
      const credentialsText = comboServices.map(service => {
        const creds = multiCredentials[service];
        return `${service}:\nEmail: ${creds.email}\nContraseña: ${creds.password}`;
      }).join('\n\n');

      finalData.service_email = `COMBO: ${comboServices.join(' + ')}`;
      finalData.service_password = credentialsText;
    }

    onRegister(finalData);

    // Reset form
    setFormData({
      name: '',
      phone: '',
      countryCode: '+593',
      email: '',
      service: '',
      price: '',
      duration: 1,
      isAnnual: false,
      startDate: new Date().toISOString().slice(0, 10),
      service_email: '',
      service_password: '',
      admin_notes: ''
    });
    setMultiCredentials({});
    onClose();
  };

  const handleWhatsApp = () => {
    let credentialsText = "";
    if (isCombo) {
      credentialsText = comboServices.map(service => {
        const creds = multiCredentials[service];
        return `${service}: ${creds?.email || ''} / ${creds?.password || ''}`;
      }).join('\n');
    } else {
      if (!formData.phone || !formData.service_email || !formData.service_password) {
        alert('\u26A0\uFE0F Por favor completa todos los campos requeridos antes de enviar por WhatsApp');
        return;
      }
      credentialsText = `Email: ${formData.service_email}\nPass: ${formData.service_password}`;
    }

    const endDate = new Date(formData.startDate);
    const monthsToAdd = formData.isAnnual ? formData.duration * 12 : formData.duration;
    endDate.setDate(endDate.getDate() + (monthsToAdd * 30));
    const endDateStr = endDate.toISOString().slice(0, 10);

    const message = `\u2605 StreamZone \u2605\n\u00A1Compra Aprobada! \uD83D\uDE80\n\n\u00A1Hola ${formData.name}! Tu servicio ${formData.service} ya esta activo. \u2713\n\n\uD83D\uDD11 CREDENCIALES:\n${credentialsText}\n\n\uD83D\uDCC5 Duracion: ${monthsToAdd} ${monthsToAdd === 1 ? 'mes' : 'meses'}\n\u23F0 Vence: ${endDateStr}\n\uD83D\uDC8E \u00A1Disfruta tu entretenimiento!`;

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
            <h3 className={`text-2xl font-bold ${tv(isDark, 'text-gray-900', 'text-white')}`}>Registrar Compra Manual</h3>
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
            {/* Información del cliente */}
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
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200', 'border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/30')}`}
                    placeholder="Nombre completo del cliente"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                    📱 Teléfono *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      className={`w-28 sm:w-32 rounded-xl border-2 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200', 'border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/30')}`}
                    >
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>

                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`flex-1 min-w-0 rounded-xl border-2 px-3 sm:px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200', 'border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/30')}`}
                      placeholder="99 999 9999"
                      required
                    />
                  </div>
                  <div className={`text-xs ${tv(isDark, 'text-gray-500', 'text-gray-400')}`}>
                    Número completo: {formData.countryCode} {formData.phone}
                  </div>
                </div>
              </div>
            </div>

            {/* Selección de Servicio y Duración */}
            <div className={`p-6 rounded-xl border-2 ${tv(isDark, 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200', 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700')}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tv(isDark, 'bg-green-100', 'bg-green-900/30')}`}>
                  🎬
                </div>
                <h4 className={`text-xl font-bold ${tv(isDark, 'text-gray-900', 'text-white')}`}>Servicio y Duración</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                    🎬 Servicio *
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200', 'border-gray-600 bg-gray-700 text-white focus:border-green-400 focus:ring-green-800/30')}`}
                    required
                  >
                    <option value="">Selecciona un servicio</option>
                    <optgroup label="🎬 Servicios Individuales">
                      {services.map((service) => (
                        <option key={service.id || service.name} value={service.name}>
                          {service.name} - ${Number(service.price).toFixed(2)}/mes
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="🎁 Combos Especiales">
                      {combos.map((combo) => (
                        <option key={combo.id || combo.name} value={combo.name}>
                          {combo.name} - ${Number(combo.price).toFixed(2)}/mes
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                    ⏱️ Duración (meses) *
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200', 'border-gray-600 bg-gray-700 text-white focus:border-green-400 focus:ring-green-800/30')}`}
                    required
                  >
                    <option value={1}>1 mes</option>
                    <option value={3}>3 meses</option>
                    <option value={6}>6 meses</option>
                    <option value={12}>12 meses</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className={`block text-sm font-bold ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                  💰 Precio Total
                </label>
                <div className={`p-3 rounded-lg ${tv(isDark, 'bg-green-100 border border-green-200', 'bg-green-900/20 border border-green-600')}`}>
                  <p className={`text-lg font-bold ${tv(isDark, 'text-green-800', 'text-green-300')}`}>
                    ${formData.price || '0.00'} USD
                  </p>
                  <p className={`text-sm ${tv(isDark, 'text-green-700', 'text-green-400')}`}>
                    {formData.duration} {formData.duration === 1 ? 'mes' : 'meses'} de {formData.service || 'servicio'}
                  </p>
                </div>
              </div>
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
                <div className="space-y-4">
                  <div className={`p-3 rounded-lg ${tv(isDark, 'bg-orange-50 border border-orange-200', 'bg-orange-900/20 border border-orange-600')}`}>
                    <p className={`text-sm font-semibold ${tv(isDark, 'text-orange-800', 'text-orange-300')}`}>
                      🎁 Combo detectado: Ingresa las credenciales para cada servicio
                    </p>
                  </div>
                  {comboServices.map((service, index) => (
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
                            className={`w-full rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-blue-500', 'border-gray-600 bg-gray-700 text-white focus:border-blue-400')}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-bold mb-2 ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                            🔑 Contraseña del {service}
                          </label>
                          <input
                            type="text"
                            value={multiCredentials[service]?.password || ''}
                            onChange={(e) => setMultiCredentials(prev => ({
                              ...prev,
                              [service]: { ...prev[service], password: e.target.value, email: prev[service]?.email || '' }
                            }))}
                            className={`w-full rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-amber-500', 'border-gray-600 bg-gray-700 text-white focus:border-amber-400')}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={`block text-sm font-bold ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                      📧 Email del servicio *
                    </label>
                    <input
                      type="email"
                      value={formData.service_email}
                      onChange={(e) => setFormData({ ...formData, service_email: e.target.value })}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200', 'border-gray-600 bg-gray-700 text-white focus:border-purple-400 focus:ring-purple-800/30')}`}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-bold ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
                      🔐 Contraseña del servicio *
                    </label>
                    <input
                      type="text"
                      value={formData.service_password}
                      onChange={(e) => setFormData({ ...formData, service_password: e.target.value })}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200', 'border-gray-600 bg-gray-700 text-white focus:border-purple-400 focus:ring-purple-800/30')}`}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Notas del administrador */}
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
                placeholder="Notas adicionales..."
              />
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className={`w-full sm:flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 ${tv(isDark, 'bg-gray-200 text-gray-800 hover:bg-gray-300', 'bg-gray-700 text-gray-200 hover:bg-gray-600')}`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleWhatsApp}
                className={`w-full sm:flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 ${tv(isDark, 'bg-green-500 text-white hover:bg-green-600 shadow-lg', 'bg-green-600 text-white hover:bg-green-700 shadow-lg')}`}
              >
                📱 WhatsApp
              </button>
              <button
                type="submit"
                className={`w-full sm:flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg`}
              >
                💾 Registrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}