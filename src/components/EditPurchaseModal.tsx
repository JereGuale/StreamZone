import React, { useState, useEffect } from "react";
import { DatabasePurchase } from "../lib/supabase";
import { tv, tvContrast } from "../utils/helpers_original";

interface EditPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (data: Partial<DatabasePurchase>) => void;
  purchase: DatabasePurchase | null;
  isDark: boolean;
  systemPrefersDark: boolean;
}

export function EditPurchaseModal({ open, onClose, onUpdate, purchase, isDark, systemPrefersDark }: EditPurchaseModalProps) {
  const [formData, setFormData] = useState({
    customer: '',
    phone: '',
    service: '',
    start: '',
    end: '',
    months: 1,
    service_email: '',
    service_password: '',
    admin_notes: ''
  });

  useEffect(() => {
    if (purchase) {
      setFormData({
        customer: purchase.customer || '',
        phone: purchase.phone || '',
        service: purchase.service || '',
        start: purchase.start || '',
        end: purchase.end || '',
        months: purchase.months || 1,
        service_email: purchase.service_email || '',
        service_password: purchase.service_password || '',
        admin_notes: purchase.admin_notes || ''
      });
    }
  }, [purchase]);

  if (!open || !purchase) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`w-full max-w-3xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto ${tv(isDark,'bg-white','bg-gray-900')}`} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div className={`relative p-6 border-b ${tv(isDark,'bg-gray-50 border-gray-200','bg-gray-800 border-gray-700')}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-semibold ${tv(isDark,'text-gray-900','text-white')}`}>Editar Compra</h3>
            <button 
              onClick={onClose} 
              className={`w-6 h-6 rounded flex items-center justify-center text-lg font-bold ${tv(isDark,'text-gray-500 hover:bg-gray-100','text-gray-400 hover:bg-gray-700')}`}
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del cliente */}
            <div className={`p-4 rounded-lg ${tv(isDark,'bg-gray-50','bg-gray-800')}`}>
              <h4 className={`text-lg font-semibold mb-4 ${tv(isDark,'text-gray-900','text-white')}`}>Información del Cliente</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Nombre del cliente
                  </label>
                  <input
                    value={formData.customer}
                    onChange={(e) => setFormData({...formData, customer: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100','border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30','border-gray-400 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200')}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Teléfono
                  </label>
                  <input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100','border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30','border-gray-400 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200')}`}
                  />
                </div>
              </div>
            </div>

            {/* Información del servicio */}
            <div className={`p-4 rounded-lg ${tv(isDark,'bg-gray-50','bg-gray-800')}`}>
              <h4 className={`text-lg font-semibold mb-4 ${tv(isDark,'text-gray-900','text-white')}`}>Información del Servicio</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Servicio
                  </label>
                  <input
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-green-400 focus:ring-green-800/20','border-gray-400 bg-gray-50 text-gray-900 focus:border-green-600 focus:ring-green-300')}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Meses
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.months}
                    onChange={(e) => setFormData({...formData, months: parseInt(e.target.value) || 1})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-green-400 focus:ring-green-800/20','border-gray-400 bg-gray-50 text-gray-900 focus:border-green-600 focus:ring-green-300')}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    value={formData.start}
                    onChange={(e) => setFormData({...formData, start: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-green-400 focus:ring-green-800/20','border-gray-400 bg-gray-50 text-gray-900 focus:border-green-600 focus:ring-green-300')}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Fecha de fin
                  </label>
                  <input
                    type="date"
                    value={formData.end}
                    onChange={(e) => setFormData({...formData, end: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-green-400 focus:ring-green-800/20','border-gray-400 bg-gray-50 text-gray-900 focus:border-green-600 focus:ring-green-300')}`}
                  />
                </div>
              </div>
            </div>

            {/* Credenciales del servicio */}
            <div className={`p-4 rounded-lg ${tv(isDark,'bg-gray-50','bg-gray-800')}`}>
              <h4 className={`text-lg font-semibold mb-4 ${tv(isDark,'text-gray-900','text-white')}`}>Credenciales del Servicio</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Email del servicio
                  </label>
                  <input
                    value={formData.service_email}
                    onChange={(e) => setFormData({...formData, service_email: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100','border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30','border-gray-400 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200')}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Contraseña del servicio
                  </label>
                  <input
                    value={formData.service_password}
                    onChange={(e) => setFormData({...formData, service_password: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100','border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30','border-gray-400 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200')}`}
                  />
                </div>
              </div>
            </div>

            {/* Notas del administrador */}
            <div className={`p-4 rounded-lg ${tv(isDark,'bg-gray-50','bg-gray-800')}`}>
              <h4 className={`text-lg font-semibold mb-4 ${tv(isDark,'text-gray-900','text-white')}`}>Notas del Administrador</h4>
              <textarea
                value={formData.admin_notes}
                onChange={(e) => setFormData({...formData, admin_notes: e.target.value})}
                className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-blue-400 focus:ring-blue-800/20')}`}
                rows={4}
                placeholder="Notas adicionales sobre esta compra..."
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
                Actualizar Compra
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
