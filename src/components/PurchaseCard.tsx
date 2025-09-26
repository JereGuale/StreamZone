import React from 'react';
import { fmt, daysBetween, getServiceStatus, tv } from '../utils/helpers';

interface PurchaseCardProps {
  item: any;
  isDark: boolean;
  onToggleValidate: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export function PurchaseCard({ item, isDark, onToggleValidate, onDelete, onEdit }: PurchaseCardProps) {
  const days = daysBetween(new Date().toISOString().slice(0,10), item.end);
  const serviceStatus = getServiceStatus(item.end);
  
  return (
    <div className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${tv(isDark,'bg-white border-gray-200 hover:border-blue-300','bg-zinc-800 border-zinc-700 hover:border-blue-600')}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-lg mb-1">{item.service}</h4>
          <p className="text-sm opacity-80">Cliente: {item.customer}</p>
          <p className="text-sm opacity-80">Teléfono: {item.phone}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${tv(isDark,'bg-blue-100 text-blue-700 hover:bg-blue-200','bg-blue-900/30 text-blue-300 hover:bg-blue-900/50')}`}
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${tv(isDark,'bg-red-100 text-red-700 hover:bg-red-200','bg-red-900/30 text-red-300 hover:bg-red-900/50')}`}
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs opacity-60">Precio</p>
          <p className="font-semibold">{fmt(item.price)}</p>
        </div>
        <div>
          <p className="text-xs opacity-60">Método de pago</p>
          <p className="font-semibold capitalize">{item.payment_method}</p>
        </div>
        <div>
          <p className="text-xs opacity-60">Inicio</p>
          <p className="font-semibold">{new Date(item.start).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-xs opacity-60">Fin</p>
          <p className="font-semibold">{new Date(item.end).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{serviceStatus.icon}</span>
          <span className={`text-sm font-medium ${serviceStatus.color}`}>
            {serviceStatus.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.validated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {item.validated ? '✅ Validado' : '⏳ Pendiente'}
          </span>
        </div>
      </div>

      {item.notes && (
        <div className={`p-2 rounded-lg text-sm ${tv(isDark,'bg-gray-50','bg-gray-700')}`}>
          <p className="font-medium mb-1">Notas:</p>
          <p className="opacity-80">{item.notes}</p>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <button
          onClick={onToggleValidate}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${item.validated ? 
            tv(isDark,'bg-yellow-100 text-yellow-700 hover:bg-yellow-200','bg-yellow-900/30 text-yellow-300 hover:bg-yellow-900/50') :
            tv(isDark,'bg-green-100 text-green-700 hover:bg-green-200','bg-green-900/30 text-green-300 hover:bg-green-900/50')
          }`}
        >
          {item.validated ? '⏳ Marcar Pendiente' : '✅ Validar'}
        </button>
      </div>
    </div>
  );
}

