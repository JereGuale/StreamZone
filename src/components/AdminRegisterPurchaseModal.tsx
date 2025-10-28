import React, { useState, useEffect } from "react";
import { SERVICES, COMBOS } from "../constants/services_original";
import { COUNTRIES } from "../constants/countries";
import { fmt, tv, formatPhoneForWhatsApp, formatPhoneNumber, whatsappLinkSimple } from "../utils/helpers";

interface AdminRegisterPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  onRegister: (data: any) => void;
  isDark: boolean;
  systemPrefersDark: boolean;
}

export function AdminRegisterPurchaseModal({ open, onClose, onRegister, isDark, systemPrefersDark }: AdminRegisterPurchaseModalProps) {
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

  // Calcular precio automáticamente cuando cambia el servicio o duración
  useEffect(() => {
    if (formData.service) {
      // Buscar en servicios individuales
      const selectedService = SERVICES.find(s => s.name === formData.service);
      if (selectedService) {
        const totalPrice = selectedService.price * formData.duration;
        setFormData(prev => ({ ...prev, price: totalPrice.toString() }));
        return;
      }
      
      // Buscar en combos
      const selectedCombo = COMBOS.find(c => c.name === formData.service);
      if (selectedCombo) {
        const totalPrice = selectedCombo.price * formData.duration;
        setFormData(prev => ({ ...prev, price: totalPrice.toString() }));
      }
    }
  }, [formData.service, formData.duration]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que todos los campos requeridos estén llenos
    if (!formData.name || !formData.phone || !formData.service || !formData.service_email || !formData.service_password) {
      alert('⚠️ Por favor completa todos los campos requeridos, incluyendo las credenciales del servicio');
      return;
    }
    
    // Formatear número de teléfono completo
    const fullPhone = formatPhoneNumber(formData.phone, formData.countryCode);
    
    const endDate = new Date(formData.startDate);
    const monthsToAdd = formData.isAnnual ? formData.duration * 12 : formData.duration;
    // Calcular fecha de fin con días exactos (30 días por mes)
    endDate.setDate(endDate.getDate() + (monthsToAdd * 30));

    onRegister({
      ...formData,
      phone: fullPhone,
      price: parseFloat(formData.price),
      endDate: endDate.toISOString().slice(0, 10),
      months: monthsToAdd
    });
    
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
    
    onClose();
  };

  const handleWhatsApp = () => {
    if (!formData.phone || !formData.service_email || !formData.service_password) {
      alert('⚠️ Por favor completa todos los campos requeridos antes de enviar por WhatsApp');
      return;
    }
    
    const endDate = new Date(formData.startDate);
    const monthsToAdd = formData.isAnnual ? formData.duration * 12 : formData.duration;
    endDate.setMonth(endDate.getMonth() + monthsToAdd);
    const endDateStr = endDate.toISOString().slice(0, 10);
    
    const message = `★ ¡HOLA ${formData.name.toUpperCase()}! ★

🎉 ¡FELICIDADES! 🎉

★ Tu servicio ${formData.service} está listo ★

>>> TUS CREDENCIALES PREMIUM <<<
📧 Email: ${formData.service_email}
🔒 Contraseña: ${formData.service_password}

⏰ DURACIÓN: ${monthsToAdd} ${monthsToAdd === 1 ? 'mes' : 'meses'} ⏰
📅 Válido hasta: ${endDateStr} 📅

★ ¡DISFRUTA AL MÁXIMO! ★

💬 ¿Necesitas ayuda? 💬
¡Estamos aquí para ti 24/7!

✓ ¡Gracias por elegirnos! ✓

★ StreamZone - Tu entretenimiento digital ★`;
    const phoneNumber = formatPhoneForWhatsApp(formData.phone);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${tv(isDark,'bg-white','bg-gray-900')}`} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div className={`relative p-6 border-b-2 ${tv(isDark,'bg-gray-50 border-gray-200','bg-gray-800 border-gray-700')}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-2xl font-bold ${tv(isDark,'text-gray-900','text-white')}`}>Registrar Compra Manual</h3>
            <button 
              onClick={onClose} 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold transition-all ${tv(isDark,'text-gray-500 hover:bg-gray-100','text-gray-400 hover:bg-gray-700')}`}
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del cliente - Editable */}
            <div className={`p-6 rounded-xl border-2 ${tv(isDark,'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200','bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-700')}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tv(isDark,'bg-blue-100','bg-blue-900/30')}`}>
                  👤
                </div>
                <h4 className={`text-xl font-bold ${tv(isDark,'text-gray-900','text-white')}`}>Información del Cliente</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    👤 Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/30')}`}
                    placeholder="Nombre completo del cliente"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    📱 Teléfono *
                  </label>
                  <div className="flex gap-2">
                    {/* Selector de código de país */}
                    <select
                      value={formData.countryCode}
                      onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                      className={`w-28 sm:w-32 rounded-xl border-2 px-2 sm:px-3 py-3 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/30')}`}
                    >
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </select>
                    
                    {/* Campo de número de teléfono */}
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={`flex-1 min-w-0 rounded-xl border-2 px-3 sm:px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/30')}`}
                      placeholder="99 999 9999"
                      required
                    />
                  </div>
                  <div className={`text-xs ${tv(isDark,'text-gray-500','text-gray-400')}`}>
                    Número completo: {formData.countryCode} {formData.phone}
                  </div>
                </div>
              </div>
            </div>

            {/* Selección de Servicio y Duración */}
            <div className={`p-6 rounded-xl border-2 ${tv(isDark,'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200','bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700')}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tv(isDark,'bg-green-100','bg-green-900/30')}`}>
                  🎬
                </div>
                <h4 className={`text-xl font-bold ${tv(isDark,'text-gray-900','text-white')}`}>Servicio y Duración</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    🎬 Servicio *
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200','border-gray-600 bg-gray-700 text-white focus:border-green-400 focus:ring-green-800/30')}`}
                    required
                  >
                    <option value="">Selecciona un servicio</option>
                    
                    {/* Servicios individuales */}
                    <optgroup label="🎬 Servicios Individuales">
                      {SERVICES.map((service) => (
                        <option key={service.name} value={service.name}>
                          {service.name} - ${service.price}/mes
                        </option>
                      ))}
                    </optgroup>
                    
                    {/* Combos */}
                    <optgroup label="🎁 Combos Especiales">
                      {COMBOS.map((combo) => (
                        <option key={combo.name} value={combo.name}>
                          {combo.name} - ${combo.price}/mes
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    ⏱️ Duración (meses) *
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200','border-gray-600 bg-gray-700 text-white focus:border-green-400 focus:ring-green-800/30')}`}
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
                <label className={`block text-sm font-bold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                  💰 Precio Total
                </label>
                <div className={`p-3 rounded-lg ${tv(isDark,'bg-green-100 border border-green-200','bg-green-900/20 border border-green-600')}`}>
                  <p className={`text-lg font-bold ${tv(isDark,'text-green-800','text-green-300')}`}>
                    ${formData.price || '0.00'} USD
                  </p>
                  <p className={`text-sm ${tv(isDark,'text-green-700','text-green-400')}`}>
                    {formData.duration} {formData.duration === 1 ? 'mes' : 'meses'} de {formData.service || 'servicio'}
                  </p>
                </div>
              </div>
            </div>

            {/* Credenciales del servicio */}
            <div className={`p-6 rounded-xl border-2 ${tv(isDark,'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200','bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700')}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tv(isDark,'bg-yellow-100','bg-yellow-900/30')}`}>
                  🔑
                </div>
                <h4 className={`text-xl font-bold ${tv(isDark,'text-gray-900','text-white')}`}>Credenciales del Servicio</h4>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    📧 Email del servicio *
                  </label>
                  <input
                    type="email"
                    value={formData.service_email}
                    onChange={(e) => setFormData({...formData, service_email: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200','border-gray-600 bg-gray-700 text-white focus:border-purple-400 focus:ring-purple-800/30')}`}
                    placeholder="usuario@servicio.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    🔐 Contraseña del servicio *
                  </label>
                  <input
                    type="text"
                    value={formData.service_password}
                    onChange={(e) => setFormData({...formData, service_password: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200','border-gray-600 bg-gray-700 text-white focus:border-purple-400 focus:ring-purple-800/30')}`}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Notas del administrador */}
            <div className={`p-6 rounded-xl border-2 ${tv(isDark,'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200','bg-gradient-to-br from-amber-900/20 to-orange-900/20 border-amber-700')}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tv(isDark,'bg-amber-100','bg-amber-900/30')}`}>
                  📝
                </div>
                <h4 className={`text-xl font-bold ${tv(isDark,'text-gray-900','text-white')}`}>Notas del Administrador</h4>
              </div>
              <textarea
                value={formData.admin_notes}
                onChange={(e) => setFormData({...formData, admin_notes: e.target.value})}
                className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 resize-none ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-amber-500 focus:ring-amber-200','border-gray-600 bg-gray-700 text-white focus:border-amber-400 focus:ring-amber-800/30')}`}
                rows={4}
                placeholder="Escribe información importante para el cliente (puedes usar saltos de línea)..."
              />
              <div className={`mt-3 p-3 rounded-lg ${tv(isDark,'bg-amber-100 border border-amber-200','bg-amber-900/20 border border-amber-600')}`}>
                <p className={`text-sm font-semibold ${tv(isDark,'text-amber-800','text-amber-300')}`}>
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
                className={`w-full sm:flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 ${tv(isDark,'bg-gray-200 text-gray-800 hover:bg-gray-300','bg-gray-700 text-gray-200 hover:bg-gray-600')}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>❌</span>
                  <span>Cancelar</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={handleWhatsApp}
                className={`w-full sm:flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 ${tv(isDark,'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl','bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl')}`}
              >
                <span className="text-lg">📱</span>
                <span className="truncate">Enviar por WhatsApp</span>
              </button>
              
              <button
                type="submit"
                className={`w-full sm:flex-1 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl`}
              >
                <span className="text-lg">💾</span>
                <span className="truncate">Registrar Compra</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}