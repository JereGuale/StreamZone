import React, { useState } from 'react';
import { fmt, tv } from '../utils/helpers';

interface ReserveFormProps {
  service: any;
  onClose: () => void;
  onAddPurchase: (p: any) => void;
  isDark: boolean;
  user: any;
}

export function ReserveForm({ service, onClose, onAddPurchase, isDark, user }: ReserveFormProps) {
  const [months, setMonths] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('pichincha');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const confirm = () => {
    if (!user) {
      setMsg('Debes estar registrado para reservar');
      return;
    }

    setLoading(true);
    setMsg('');

    try {
      const purchaseData = {
        customer: user.name,
        phone: user.phone,
        email: user.email,
        service: service.name,
        serviceId: service.id,
        months: months,
        price: service.price * months,
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        validated: false, // ✅ PENDIENTE de aprobación del admin
        payment_method: paymentMethod,
        notes: notes
      };

      onAddPurchase(purchaseData);
      setMsg('✅ ¡Reserva registrada! Selecciona un agente para enviar tu comprobante');
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      setMsg('❌ Error al realizar la reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">🛒 Reservar {service.name}</h3>
        <p className="text-sm opacity-80">Completa los datos de tu reserva</p>
      </div>

      {/* Información del servicio */}
      <div className={`p-4 rounded-xl ${tv(isDark,'bg-blue-50 border border-blue-200','bg-blue-900/20 border border-blue-400/30')}`}>
        <div className="flex items-center gap-3">
          <div className={`h-16 w-16 ${service.color} rounded-xl text-white flex items-center justify-center text-2xl font-bold`}>
            {service.logo}
          </div>
          <div>
            <h4 className="font-semibold">{service.name}</h4>
            <p className="text-sm opacity-80">
              {fmt(service.price)}/{service.billing === 'annual' ? 'año' : 'mes'}
            </p>
          </div>
        </div>
      </div>

      {/* Duración */}
      <div>
        <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>Duración (meses)</label>
        <select
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`}
          value={months}
          onChange={e => setMonths(Number(e.target.value))}
        >
          <option value={1}>1 mes</option>
          <option value={3}>3 meses</option>
          <option value={6}>6 meses</option>
          <option value={12}>12 meses</option>
        </select>
      </div>

      {/* Método de pago */}
      <div>
        <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>Método de pago</label>
        <select
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`}
          value={paymentMethod}
          onChange={e => setPaymentMethod(e.target.value)}
        >
          <option value="pichincha">Banco Pichincha</option>
          <option value="guayaquil">Banco de Guayaquil</option>
          <option value="pacifico">Banco del Pacífico</option>
          <option value="paypal">PayPal</option>
          <option value="mobile">Pago móvil</option>
        </select>
      </div>

      {/* Notas */}
      <div>
        <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>Notas adicionales (opcional)</label>
        <textarea
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Información adicional..."
          rows={3}
        />
      </div>

      {/* Resumen */}
      <div className={`p-4 rounded-xl ${tv(isDark,'bg-green-50 border border-green-200','bg-green-900/20 border border-green-400/30')}`}>
        <h4 className="font-semibold mb-2">💰 Resumen de la compra</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Servicio:</span>
            <span>{service.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Duración:</span>
            <span>{months} {months === 1 ? 'mes' : 'meses'}</span>
          </div>
          <div className="flex justify-between">
            <span>Precio unitario:</span>
            <span>{fmt(service.price)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg">
            <span>Total:</span>
            <span>{fmt(service.price * months)}</span>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`text-sm ${msg.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {msg}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${tv(isDark,'bg-gray-200 text-gray-800 hover:bg-gray-300','bg-gray-700 text-gray-200 hover:bg-gray-600')}`}
        >
          Cancelar
        </button>
        <button
          onClick={confirm}
          disabled={loading}
          className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${tv(isDark,'bg-blue-600 text-white hover:bg-blue-700','bg-blue-500 text-white hover:bg-blue-600')}`}
        >
          {loading ? '⏳ Procesando...' : '✅ Confirmar Reserva'}
        </button>
      </div>
    </div>
  );
}

