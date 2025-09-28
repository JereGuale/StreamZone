import React, { useState } from "react";
import { SERVICES } from "../constants/services_original";
import { fmt, tv } from "../utils/helpers";

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

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const endDate = new Date(formData.startDate);
    const monthsToAdd = formData.isAnnual ? formData.duration * 12 : formData.duration;
    endDate.setMonth(endDate.getMonth() + monthsToAdd);

    onRegister({
      ...formData,
      price: parseFloat(formData.price),
      endDate: endDate.toISOString().slice(0, 10),
      months: monthsToAdd
    });
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
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
    
    const message = `🎉 ¡Hola ${formData.name}! 🎉\n\n✨ Aquí tienes tus credenciales de ${formData.service}:\n\n🔑 *CREDENCIALES DEL SERVICIO* 🔑\n📧 *Email:* ${formData.service_email}\n🔐 *Contraseña:* ${formData.service_password}\n\n⏰ *Duración:* ${monthsToAdd} ${monthsToAdd === 1 ? 'mes' : 'meses'}\n📅 *Válido hasta:* ${endDateStr}\n\n🎬 ¡Disfruta tu servicio! 🎬\n\n💬 Si tienes alguna pregunta, no dudes en contactarnos.\n\n🙏 ¡Gracias por confiar en nosotros!`;
    const whatsappUrl = `https://wa.me/${formData.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
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
            {/* Información del cliente */}
            <div className={`p-6 rounded-xl border-2 ${tv(isDark,'bg-gray-50 border-gray-200','bg-gray-800 border-gray-700')}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className={`text-xl font-bold ${tv(isDark,'text-gray-900','text-white')}`}>{formData.name || 'Nombre del Cliente'}</h4>
                  <p className={`text-lg font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    {formData.service || 'Servicio'} • {formData.duration} {formData.duration === 1 ? 'mes' : 'meses'}
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${tv(isDark,'bg-blue-100','bg-blue-900/30')}`}>
                  <span className="text-lg">📱</span>
                  <span className={`font-semibold ${tv(isDark,'text-blue-800','text-blue-200')}`}>{formData.phone || '+593...'}</span>
                </div>
              </div>
            </div>

            {/* Credenciales del servicio */}
            <div className={`p-6 rounded-xl border-2 ${tv(isDark,'bg-purple-50 border-purple-200','bg-purple-900/20 border-purple-700')}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tv(isDark,'bg-yellow-100','bg-yellow-900/30')}`}>
                  🔑
                </div>
                <h4 className={`text-xl font-bold ${tv(isDark,'text-gray-900','text-white')}`}>Credenciales del Servicio</h4>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Email del servicio *
                  </label>
                  <input
                    type="email"
                    value={formData.service_email}
                    onChange={(e) => setFormData({...formData, service_email: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200','border-gray-600 bg-gray-700 text-white focus:border-purple-400 focus:ring-purple-800/30')}`}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className={`block text-sm font-bold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Contraseña del servicio *
                  </label>
                  <input
                    type="text"
                    value={formData.service_password}
                    onChange={(e) => setFormData({...formData, service_password: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200','border-gray-600 bg-gray-700 text-white focus:border-purple-400 focus:ring-purple-800/30')}`}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Notas del administrador */}
            <div className={`p-6 rounded-xl border-2 ${tv(isDark,'bg-gray-50 border-gray-200','bg-gray-800 border-gray-700')}`}>
              <h4 className={`text-lg font-bold mb-4 ${tv(isDark,'text-gray-900','text-white')}`}>Notas del administrador</h4>
              <textarea
                value={formData.admin_notes}
                onChange={(e) => setFormData({...formData, admin_notes: e.target.value})}
                className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 resize-none ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/30')}`}
                rows={6}
                placeholder="Escribe algo..."
              />
            </div>

            {/* Botones de acción - Optimizados para móvil */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`w-full sm:flex-1 px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${tv(isDark,'bg-gray-200 text-gray-800 hover:bg-gray-300','bg-gray-700 text-gray-200 hover:bg-gray-600')}`}
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={handleWhatsApp}
                className={`w-full sm:flex-1 px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 ${tv(isDark,'bg-green-500 text-white hover:bg-green-600','bg-green-600 text-white hover:bg-green-700')}`}
              >
                <span className="text-sm sm:text-lg">📱</span>
                <span className="truncate">Enviar por WhatsApp</span>
              </button>
              
              <button
                type="submit"
                className={`w-full sm:flex-1 px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700`}
              >
                <span className="text-sm sm:text-lg">💾</span>
                <span className="truncate">Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}