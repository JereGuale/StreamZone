import React, { useState } from 'react';
import { tv } from '../utils/helpers';
import { approvePurchase } from '../lib/supabase';

interface ApprovePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: any;
  isDark: boolean;
  onApprove: () => void;
  onUpdatePurchase?: (purchaseId: string, updates: any) => void;
}

export function ApprovePurchaseModal({ isOpen, onClose, purchase, isDark, onApprove, onUpdatePurchase }: ApprovePurchaseModalProps) {
  const [serviceCredentials, setServiceCredentials] = useState({
    email: '',
    password: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !purchase) return null;

  const handleApprove = async () => {
    if (!serviceCredentials.email || !serviceCredentials.password) {
      alert('Por favor completa el email y contraseña del servicio');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Modal: Iniciando aprobación...', {
        purchaseId: purchase.id,
        email: serviceCredentials.email,
        password: serviceCredentials.password ? '***' : 'undefined',
        notes: serviceCredentials.notes
      });

      // Usar la función original approvePurchase
      const result = await approvePurchase(
        purchase.id,
        serviceCredentials.email,
        serviceCredentials.password,
        serviceCredentials.notes,
        'admin' // Por ahora hardcodeado
      );

      console.log('📋 Modal: Resultado de approvePurchase:', result);

      if (result.data) {
        console.log('✅ Modal: Compra aprobada en Supabase, actualizando estado local...');
        // Actualizar estado local inmediatamente (como en el original)
        if (onUpdatePurchase) {
          onUpdatePurchase(purchase.id, {
            validated: true,
            service_email: serviceCredentials.email,
            service_password: serviceCredentials.password,
            admin_notes: serviceCredentials.notes
          });
        }

        alert('✅ Compra guardada en la base de datos');
        
        // Llamar a la función de aprobación exitosa para recargar datos
        await onApprove();
        
        // Cerrar el modal
        onClose();
        
        // Limpiar el formulario
        setServiceCredentials({ email: '', password: '', notes: '' });
      } else {
        throw new Error('No se pudo guardar en la base de datos');
      }
    } catch (error) {
      console.error('Error aprobando compra:', error);
      alert('❌ Error al guardar en la base de datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-lg rounded-3xl shadow-2xl border-2 overflow-hidden ${tv(isDark,'bg-white border-gray-200','bg-gray-900 border-gray-700')}`}>
        {/* Header con gradiente */}
        <div className={`relative p-6 ${tv(isDark,'bg-gradient-to-r from-green-500 to-emerald-600','bg-gradient-to-r from-green-600 to-emerald-700')}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Aprobar Compra</h3>
                <p className="text-green-100 text-sm">Completar credenciales del servicio</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
            >
              <span className="text-xl">×</span>
            </button>
          </div>
        </div>
        
        {/* Información del cliente */}
        <div className={`p-6 border-b ${tv(isDark,'bg-gray-50 border-gray-200','bg-gray-800 border-gray-700')}`}>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${tv(isDark,'bg-blue-100 text-blue-600','bg-blue-900/30 text-blue-400')}`}>
              🎬
            </div>
            <div>
              <h4 className={`text-xl font-bold ${tv(isDark,'text-gray-900','text-white')}`}>{purchase.customer}</h4>
              <p className={`text-sm font-medium ${tv(isDark,'text-gray-600','text-gray-400')}`}>
                {purchase.service} • {purchase.months} {purchase.months === 1 ? 'mes' : 'meses'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Formulario de credenciales */}
        <div className="p-6 space-y-6">
          <div>
            <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${tv(isDark,'text-gray-700','text-gray-300')}`}>
              <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs">📧</span>
              Email del Servicio
            </label>
            <div className="relative">
              <input
                type="email"
                value={serviceCredentials.email}
                onChange={(e) => setServiceCredentials(prev => ({...prev, email: e.target.value}))}
                className={`w-full rounded-2xl border-2 px-4 py-4 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500','border-gray-600 bg-gray-800 text-white focus:border-blue-400')}`}
                placeholder="usuario@netflix.com"
              />
            </div>
          </div>
          
          <div>
            <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${tv(isDark,'text-gray-700','text-gray-300')}`}>
              <span className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs">🔑</span>
              Contraseña del Servicio
            </label>
            <div className="relative">
              <input
                type="password"
                value={serviceCredentials.password}
                onChange={(e) => setServiceCredentials(prev => ({...prev, password: e.target.value}))}
                className={`w-full rounded-2xl border-2 px-4 py-4 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-amber-500','border-gray-600 bg-gray-800 text-white focus:border-amber-400')}`}
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div>
            <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${tv(isDark,'text-gray-700','text-gray-300')}`}>
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs">📝</span>
              Notas Adicionales
              <span className="text-xs text-gray-500">(opcional)</span>
            </label>
            <textarea
              value={serviceCredentials.notes}
              onChange={(e) => setServiceCredentials(prev => ({...prev, notes: e.target.value}))}
              className={`w-full rounded-2xl border-2 px-4 py-4 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-purple-500','border-gray-600 bg-gray-800 text-white focus:border-purple-400')}`}
              rows={3}
              placeholder="Notas adicionales sobre esta compra..."
            />
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className={`p-6 ${tv(isDark,'bg-gray-50','bg-gray-800')}`}>
          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className={`flex-1 px-6 py-4 rounded-2xl font-semibold text-sm transition-all duration-200 hover:scale-105 ${tv(isDark,'bg-gray-200 text-gray-700 hover:bg-gray-300','bg-gray-700 text-gray-200 hover:bg-gray-600')}`}
            >
              Cancelar
            </button>
            <button 
              onClick={handleApprove}
              disabled={loading || !serviceCredentials.email || !serviceCredentials.password}
              className={`flex-1 px-6 py-4 rounded-2xl font-semibold text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${tv(isDark,'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl','bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 shadow-lg hover:shadow-xl')}`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Aprobando...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>✅</span>
                  Aprobar Compra
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
