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

  const handleWhatsApp = () => {
    const message = `Hola! 👋 

Tu compra de ${purchase.service} ha sido aprobada! 🎉

📧 Email: ${serviceCredentials.email || 'Pendiente'}
🔑 Contraseña: ${serviceCredentials.password || 'Pendiente'}

${serviceCredentials.notes ? `📝 Notas: ${serviceCredentials.notes}` : ''}

¡Disfruta tu contenido! 🚀`;

    const whatsappUrl = `https://wa.me/${purchase.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-1 sm:p-2 z-50">
      <div className={`w-full max-w-sm sm:max-w-md rounded-xl sm:rounded-2xl shadow-2xl border-2 overflow-hidden max-h-[98vh] overflow-y-auto ${tv(isDark,'bg-white border-gray-200','bg-gray-900 border-gray-700')}`}>
        {/* Header con gradiente - Super compacto */}
        <div className={`relative p-2 sm:p-3 md:p-4 ${tv(isDark,'bg-gradient-to-r from-green-500 to-emerald-600','bg-gradient-to-r from-green-600 to-emerald-700')}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-md sm:rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-sm sm:text-lg md:text-xl">✅</span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">Aprobar Compra</h3>
                <p className="text-green-100 text-xs">Completar credenciales</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
            >
              <span className="text-sm sm:text-lg">×</span>
            </button>
          </div>
        </div>
        
        {/* Información del cliente - Super compacto */}
        <div className={`p-2 sm:p-3 md:p-4 border-b ${tv(isDark,'bg-gray-50 border-gray-200','bg-gray-800 border-gray-700')}`}>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg md:text-xl ${tv(isDark,'bg-blue-100 text-blue-600','bg-blue-900/30 text-blue-400')}`}>
              🎬
            </div>
            <div>
              <h4 className={`text-sm sm:text-base md:text-lg font-bold ${tv(isDark,'text-gray-900','text-white')}`}>{purchase.customer}</h4>
              <p className={`text-xs font-medium ${tv(isDark,'text-gray-600','text-gray-400')}`}>
                {purchase.service} • {purchase.months} {purchase.months === 1 ? 'mes' : 'meses'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Formulario de credenciales - Super compacto */}
        <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4">
          <div>
            <label className={`flex items-center gap-1 sm:gap-1.5 text-xs font-semibold mb-1 sm:mb-2 ${tv(isDark,'text-gray-700','text-gray-300')}`}>
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xs">📧</span>
              Email del Servicio
            </label>
            <div className="relative">
              <input
                type="email"
                value={serviceCredentials.email}
                onChange={(e) => setServiceCredentials(prev => ({...prev, email: e.target.value}))}
                className={`w-full rounded-lg sm:rounded-xl border-2 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500','border-gray-600 bg-gray-800 text-white focus:border-blue-400')}`}
                placeholder="usuario@netflix.com"
              />
            </div>
          </div>
          
          <div>
            <label className={`flex items-center gap-1 sm:gap-1.5 text-xs font-semibold mb-1 sm:mb-2 ${tv(isDark,'text-gray-700','text-gray-300')}`}>
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xs">🔑</span>
              Contraseña del Servicio
            </label>
            <div className="relative">
              <input
                type="password"
                value={serviceCredentials.password}
                onChange={(e) => setServiceCredentials(prev => ({...prev, password: e.target.value}))}
                className={`w-full rounded-lg sm:rounded-xl border-2 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-amber-500','border-gray-600 bg-gray-800 text-white focus:border-amber-400')}`}
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div>
            <label className={`flex items-center gap-1 sm:gap-1.5 text-xs font-semibold mb-1 sm:mb-2 ${tv(isDark,'text-gray-700','text-gray-300')}`}>
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xs">📝</span>
              Notas Adicionales
              <span className="text-xs text-gray-500">(opcional)</span>
            </label>
            <textarea
              value={serviceCredentials.notes}
              onChange={(e) => setServiceCredentials(prev => ({...prev, notes: e.target.value}))}
              className={`w-full rounded-lg sm:rounded-xl border-2 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-purple-500','border-gray-600 bg-gray-800 text-white focus:border-purple-400')}`}
              rows={2}
              placeholder="Notas adicionales sobre esta compra..."
            />
          </div>
        </div>
        
        {/* Botones de acción - Super compactos */}
        <div className={`p-2 sm:p-3 md:p-4 ${tv(isDark,'bg-gray-50','bg-gray-800')}`}>
          <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
            <button 
              onClick={onClose}
              className={`w-full sm:flex-1 px-2 sm:px-3 py-2 sm:py-2.5 rounded-md sm:rounded-lg font-semibold text-xs transition-all duration-200 hover:scale-105 ${tv(isDark,'bg-gray-200 text-gray-700 hover:bg-gray-300','bg-gray-700 text-gray-200 hover:bg-gray-600')}`}
            >
              Cancelar
            </button>
            
            <button 
              onClick={handleWhatsApp}
              disabled={!serviceCredentials.email || !serviceCredentials.password}
              className={`w-full sm:flex-1 px-2 sm:px-3 py-2 sm:py-2.5 rounded-md sm:rounded-lg font-semibold text-xs transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 ${tv(isDark,'bg-green-500 text-white hover:bg-green-600','bg-green-600 text-white hover:bg-green-700')}`}
            >
              <span className="text-sm">📱</span>
              <span className="truncate">Enviar por WhatsApp</span>
            </button>
            
            <button 
              onClick={handleApprove}
              disabled={loading || !serviceCredentials.email || !serviceCredentials.password}
              className={`w-full sm:flex-1 px-2 sm:px-3 py-2 sm:py-2.5 rounded-md sm:rounded-lg font-semibold text-xs transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${tv(isDark,'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl','bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 shadow-lg hover:shadow-xl')}`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-1">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="truncate">Aprobando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <span>✅</span>
                  <span className="truncate">Aprobar Compra</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
