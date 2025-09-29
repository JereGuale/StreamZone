import React, { useState } from 'react';
import { fmt, tv } from '../utils/helpers';

interface PurchaseModalProps {
  open: boolean;
  onClose: () => void;
  service: any;
  user: any;
  isDark: boolean;
  onPurchase: (data: any) => void;
}

export function PurchaseModal({ open, onClose, service, user, isDark, onPurchase }: PurchaseModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [duration, setDuration] = useState<number>(1);
  const [devices, setDevices] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  if (!open || !service) return null;

  const isAnnual = service.billing === 'annual';
  const total = service.price * duration * devices;

  const handlePurchase = () => {
    // Validaciones básicas y simples
    if (!user) {
      alert('Error: No hay usuario autenticado. Por favor, inicia sesión nuevamente.');
      return;
    }

    if (!service || !service.name || !service.price) {
      alert('Error: Datos del servicio incompletos.');
      return;
    }

    if (duration < 1 || devices < 1) {
      alert('Error: Duración y dispositivos deben ser al menos 1.');
      return;
    }

    // Formatear teléfono de forma simple
    let phoneNumber = user.phone || '';
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+593' + phoneNumber.replace(/[^\d]/g, '');
    }

    // Datos básicos para la compra
    const purchaseData = {
      service: service.name,
      price: service.price,
      duration: duration,
      devices: devices,
      total: service.price * duration * devices,
      paymentMethod: 'pichincha',
      notes: notes || '',
      customer: user.name || 'Cliente',
      phone: phoneNumber,
      email: user.email || 'sin-email@temp.com',
      start: new Date().toISOString().slice(0, 10),
      end: new Date(Date.now() + (isAnnual ? duration * 365 : duration * 30) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    };
    
    console.log('🛒 Procesando compra:', purchaseData);
    onPurchase(purchaseData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4" onClick={onClose}>
      <div className={`w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[95vh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl overflow-y-auto ${tv(isDark,'bg-white','bg-zinc-900 text-zinc-100')}`} onClick={e=>e.stopPropagation()}>
        <div className="mb-3 sm:mb-4 md:mb-6 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold">Completar Compra</h3>
          <button 
            onClick={onClose} 
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${tv(isDark,'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100','text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800')}`}
          >
            ×
          </button>
        </div>

        <div className="space-y-6">

          {/* Información del servicio */}
          <div className={`rounded-2xl p-3 sm:p-4 ${tv(isDark,'bg-zinc-50','bg-zinc-800')}`}>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`h-12 w-12 sm:h-16 sm:w-16 ${service.color} rounded-xl text-white grid place-content-center text-lg sm:text-2xl font-bold`}>
                {service.logo}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-base sm:text-lg font-bold truncate ${tv(isDark,'text-gray-900','text-white')}`}>{service.name}</h4>
                <p className={`text-xs sm:text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>{fmt(service.price)} por {isAnnual ? 'año' : 'mes'}</p>
              </div>
            </div>
          </div>

          {/* Duración */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${tv(isDark,'text-gray-800','text-gray-200')}`}>Duración</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[1, 2, 3, 6].map((months) => (
              <button
                  key={months}
                  type="button"
                  onClick={() => setDuration(months)}
                  className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border-2 ${
                    duration === months
                      ? 'bg-blue-600 text-white border-blue-700 shadow-lg'
                      : tv(isDark,'bg-gray-100 text-gray-900 border-gray-500 hover:bg-gray-200 hover:border-gray-600','bg-gray-600 text-white border-gray-400 hover:bg-gray-500 hover:border-gray-300')
                  }`}
                >
                  {months} {isAnnual ? (months === 1 ? 'año' : 'años') : (months === 1 ? 'mes' : 'meses')}
              </button>
              ))}
            </div>
          </div>

          {/* Número de Dispositivos - Centrado */}
          <div className="text-center">
            <label className={`block text-sm font-semibold mb-3 ${tv(isDark,'text-gray-800','text-gray-200')}`}>Número de Dispositivos</label>
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => devices > 1 && setDevices(devices - 1)}
                disabled={devices <= 1}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold transition-all border-2 ${
                  devices <= 1 
                    ? tv(isDark,'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300','bg-gray-600 text-gray-500 cursor-not-allowed border-gray-500')
                    : tv(isDark,'bg-blue-200 text-blue-800 hover:bg-blue-300 border-blue-500','bg-blue-700 text-blue-100 hover:bg-blue-600 border-blue-500')
                }`}
              >
                −
              </button>
              
              <div className={`border-2 rounded-xl px-4 sm:px-6 py-2 sm:py-3 min-w-[100px] sm:min-w-[120px] text-center ${tv(isDark,'bg-blue-200 border-blue-600','bg-blue-800 border-blue-400')}`}>
                <div className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">{devices}</div>
                <div className={`text-xs sm:text-sm font-bold ${tv(isDark,'text-blue-800','text-blue-200')}`}>
                  {devices === 1 ? 'Dispositivo' : 'Dispositivos'}
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => devices < 5 && setDevices(devices + 1)}
                disabled={devices >= 5}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold transition-all border-2 ${
                  devices >= 5 
                    ? tv(isDark,'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300','bg-gray-600 text-gray-500 cursor-not-allowed border-gray-500')
                    : tv(isDark,'bg-blue-200 text-blue-800 hover:bg-blue-300 border-blue-500','bg-blue-700 text-blue-100 hover:bg-blue-600 border-blue-500')
                }`}
              >
                +
              </button>
            </div>
            <div className={`mt-2 text-xs ${tv(isDark,'text-gray-600','text-gray-300')}`}>
              Máximo 5 dispositivos por compra
            </div>
          </div>

          {/* Información de cuentas bancarias */}
          <div>
            <h4 className={`font-semibold mb-3 sm:mb-4 text-sm sm:text-base ${tv(isDark,'text-gray-800','text-gray-200')}`}>💳 Información de Pago</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {/* Banco Pichincha */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-3 sm:p-4 text-white shadow-lg border-2 border-blue-800">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-lg sm:text-xl">🏦</span>
                  <span className="font-bold text-sm sm:text-base text-white">Banco Pichincha</span>
                </div>
                <div className="text-xs sm:text-sm space-y-1 text-white">
                  <div><strong className="text-white">Titular:</strong> Jeremias Guale Santana</div>
                  <div><strong className="text-white">Cuenta:</strong> 2209034638</div>
                  <div><strong className="text-white">Tipo:</strong> Ahorro Transaccional</div>
                </div>
              </div>

              {/* Banco Guayaquil */}
              <div className="bg-gradient-to-br from-blue-700 to-purple-700 rounded-xl p-3 sm:p-4 text-white shadow-lg border-2 border-purple-800">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-lg sm:text-xl">🏛️</span>
                  <span className="font-bold text-sm sm:text-base text-white">Banco Guayaquil</span>
                </div>
                <div className="text-xs sm:text-sm space-y-1 text-white">
                  <div><strong className="text-white">Titular:</strong> Jeremias Joel Guale Santana</div>
                  <div><strong className="text-white">Cuenta:</strong> 0122407273</div>
                  <div><strong className="text-white">Tipo:</strong> Ahorros</div>
                </div>
              </div>

              {/* Banco Pacífico */}
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg p-3 sm:p-4 text-white shadow-md">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-base sm:text-lg">🌊</span>
                  <span className="font-semibold text-xs sm:text-sm text-white">Banco Pacífico</span>
                </div>
                <div className="text-xs space-y-1 text-purple-100">
                  <div><strong className="text-white">Titular:</strong> Byron Guale Santana</div>
                  <div><strong className="text-white">Cuenta:</strong> 1061220256</div>
                  <div><strong className="text-white">Tipo:</strong> Ahorros</div>
                </div>
              </div>

              {/* PayPal */}
              <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg p-3 sm:p-4 text-white shadow-md">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <span className="text-base sm:text-lg">💳</span>
                  <span className="font-semibold text-xs sm:text-sm text-white">PayPal</span>
                </div>
                <div className="text-xs space-y-1 text-blue-100">
                  <div><strong className="text-white">Email:</strong> guale2023@outlook.com</div>
                  <div><strong className="text-white">Método:</strong> PayPal</div>
                  <div><strong className="text-white">Tipo:</strong> Transferencia</div>
                </div>
              </div>
            </div>

            {/* Instrucciones de confirmación */}
            <div className={`mt-3 sm:mt-4 p-4 sm:p-6 rounded-2xl ${tv(isDark,'bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200','bg-gradient-to-br from-orange-900/30 to-yellow-900/30 border-2 border-orange-500')}`}>
              <div className="text-center">
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className={`p-3 sm:p-4 rounded-full ${tv(isDark,'bg-orange-100','bg-orange-800/50')}`}>
                    <span className="text-3xl sm:text-4xl">🚨</span>
                  </div>
                </div>
                <h5 className="text-lg sm:text-xl font-bold text-orange-800 dark:text-orange-200 mb-2 sm:mb-3">
                  ⚠️ Instrucciones Importantes
                </h5>
                <div className={`p-3 sm:p-4 rounded-xl ${tv(isDark,'bg-white/80','bg-black/20')}`}>
                  <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 mb-3 sm:mb-4">
                    Una vez que hayas realizado el pago, <strong className="text-orange-800 dark:text-orange-200">debes confirmar tu compra</strong> enviando una captura del comprobante por WhatsApp a nuestros agentes.
                  </p>
                  <div className="flex justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <div className={`px-3 sm:px-4 py-2 rounded-lg ${tv(isDark,'bg-green-100 text-green-800','bg-green-800/50 text-green-200')}`}>
                      <span className="text-base sm:text-lg">📱</span>
                      <span className="ml-1 sm:ml-2 font-semibold text-xs sm:text-sm">WhatsApp</span>
                    </div>
                    <div className={`px-3 sm:px-4 py-2 rounded-lg ${tv(isDark,'bg-blue-100 text-blue-800','bg-blue-800/50 text-blue-200')}`}>
                      <span className="text-base sm:text-lg">💬</span>
                      <span className="ml-1 sm:ml-2 font-semibold text-xs sm:text-sm">Agentes</span>
                    </div>
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    ⚡ Sin el comprobante, tu servicio NO será activado
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${tv(isDark,'text-gray-800','text-gray-200')}`}>Notas adicionales (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Comentarios o instrucciones especiales..."
              className={`w-full rounded-lg border px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm resize-none ${tv(isDark,'border-gray-300 bg-white text-gray-900','border-gray-600 bg-gray-700 text-gray-100')}`}
              rows={2}
            />
          </div>

          {/* Total */}
          <div className={`bg-gradient-to-r border-2 rounded-xl p-4 sm:p-6 ${tv(isDark,'from-blue-200 to-purple-200 border-blue-400','from-blue-800 to-purple-800 border-blue-500')}`}>
            <div className="flex justify-between items-center">
              <span className={`text-xl font-bold ${tv(isDark,'text-gray-900','text-white')}`}>Total a pagar:</span>
              <span className={`text-3xl font-black ${tv(isDark,'text-blue-700','text-blue-200')}`}>{fmt(total)}</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
            <button 
              onClick={onClose} 
              className={`flex-1 rounded-xl px-4 sm:px-6 py-3 sm:py-4 font-bold transition-all text-sm sm:text-base border-2 ${tv(isDark,'bg-white text-gray-800 hover:bg-gray-50 border-gray-400','bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-500')}`}
            >
              Cancelar
            </button>
            <button 
              onClick={handlePurchase}
              className="flex-1 rounded-xl px-4 sm:px-6 py-3 sm:py-4 font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base border-2 border-blue-700"
            >
              Completar Compra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}