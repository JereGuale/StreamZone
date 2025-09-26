import React, { useState } from "react";
import { SERVICES } from "../constants/services_original";
import { fmt, tv, tvContrast } from "../utils/helpers_original";

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
    notes: ''
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
      endDate: endDate.toISOString()
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
      notes: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`w-full max-w-3xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto ${tv(isDark,'bg-white','bg-gray-900')}`} onClick={e=>e.stopPropagation()}>
        {/* Header minimalista */}
        <div className={`relative p-6 border-b ${tv(isDark,'bg-gray-50 border-gray-200','bg-gray-800 border-gray-700')}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-semibold ${tv(isDark,'text-gray-900','text-white')}`}>Registrar Compra Manual</h3>
          <button 
            onClick={onClose} 
              className={`w-6 h-6 rounded flex items-center justify-center text-lg font-bold ${tv(isDark,'text-gray-500 hover:bg-gray-100','text-gray-400 hover:bg-gray-700')}`}
          >
            ×
          </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información del cliente */}
            <div className={`p-4 rounded-lg ${tv(isDark,'bg-gray-50','bg-gray-800')}`}>
              <h4 className={`text-lg font-semibold mb-4 ${tv(isDark,'text-gray-900','text-white')}`}>Información del Cliente</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Nombre completo *
                  </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100','border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30','border-gray-400 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200')}`}
                  placeholder="Juan Pérez"
                />
              </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    WhatsApp *
                  </label>
                <input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100','border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30','border-gray-400 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200')}`}
                  placeholder="+593987654321"
                />
              </div>
                <div className="md:col-span-2 space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Email (opcional)
                  </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100','border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30','border-gray-400 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200')}`}
                  placeholder="juan@correo.com"
                />
              </div>
            </div>
          </div>

          {/* Información del servicio */}
            <div className={`p-4 rounded-lg ${tv(isDark,'bg-gray-50','bg-gray-800')}`}>
              <h4 className={`text-lg font-semibold mb-4 ${tv(isDark,'text-gray-900','text-white')}`}>Información del Servicio</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Servicio *
                  </label>
                <select
                  required
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-green-400 focus:ring-green-800/20','border-gray-400 bg-gray-50 text-gray-900 focus:border-green-600 focus:ring-green-300')}`}
                >
                  <option value="">Seleccionar servicio</option>
                  {SERVICES.map(service => (
                    <option key={service.id} value={service.name}>
                      {service.name} - {fmt(service.price)}/{service.billing === 'annual' ? 'año' : 'mes'}
                    </option>
                  ))}
                </select>
              </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Precio (USD) *
                  </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-green-400 focus:ring-green-800/20','border-gray-400 bg-gray-50 text-gray-900 focus:border-green-600 focus:ring-green-300')}`}
                  placeholder="4.00"
                />
              </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Duración *
                  </label>
                  <div className="flex gap-3">
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 1})}
                      className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-green-400 focus:ring-green-800/20')}`}
                  />
                  <select
                    value={formData.isAnnual ? 'annual' : 'monthly'}
                    onChange={(e) => setFormData({...formData, isAnnual: e.target.value === 'annual'})}
                      className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-green-400 focus:ring-green-800/20')}`}
                  >
                    <option value="monthly">Meses</option>
                    <option value="annual">Años</option>
                  </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Fecha de inicio *
                  </label>
                <input
                  required
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-green-400 focus:ring-green-800/20')}`}
                />
              </div>
            </div>
          </div>

          {/* Notas adicionales */}
            <div className={`p-4 rounded-lg ${tv(isDark,'bg-gray-50','bg-gray-800')}`}>
              <h4 className={`text-lg font-semibold mb-4 ${tv(isDark,'text-gray-900','text-white')}`}>Notas Adicionales</h4>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-blue-400 focus:ring-blue-800/20')}`}
                rows={3}
                placeholder="Información adicional sobre la compra..."
              />
            </div>

            {/* Botones de acción */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${tv(isDark,'text-gray-600 bg-gray-100 hover:bg-gray-200','text-gray-300 bg-gray-700 hover:bg-gray-600')}`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold text-white transition-all ${tv(isDark,'bg-blue-600 hover:bg-blue-700','bg-blue-500 hover:bg-blue-600')}`}
              >
                Registrar Compra
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
