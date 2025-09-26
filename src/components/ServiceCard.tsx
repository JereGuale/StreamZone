import React from 'react';
import { fmt, tv } from '../utils/helpers';

interface ServiceCardProps {
  s: any;
  onReserve: (s: any) => void;
  isDark: boolean;
}

export function ServiceCard({ s, onReserve, isDark }: ServiceCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-3xl border-2 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 ${tv(isDark,'border-gray-200 bg-gradient-to-br from-white to-gray-50','border-gray-700 bg-gradient-to-br from-zinc-800 to-zinc-900')}`}>
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative text-center">
        <div className="relative mb-6">
          <div className={`h-16 w-16 md:h-20 md:w-20 ${s.color} rounded-3xl text-white grid place-content-center text-2xl md:text-3xl font-bold mx-auto mb-4 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
            {s.logo}
          </div>
          <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${tv(isDark,'bg-green-500','bg-green-400')} flex items-center justify-center text-white text-xs font-bold animate-pulse`}>
            ✓
          </div>
        </div>
        
        <div className="mb-6 space-y-2">
          <div className={tv(isDark,'text-gray-900 font-bold text-lg md:text-xl mb-2','text-white font-bold text-lg md:text-xl mb-2')}>{s.name}</div>
          <div className="flex items-center justify-center gap-2">
            <span className={tv(isDark,'text-3xl md:text-4xl font-bold text-gray-700','text-3xl md:text-4xl font-bold text-gray-200')}>{fmt(s.price)}</span>
            <span className={tv(isDark,'text-sm text-gray-500','text-sm text-gray-400')}>/{s.billing === 'annual' ? 'año' : 'mes'}</span>
          </div>
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${tv(isDark,'bg-green-100 text-green-700','bg-green-900/30 text-green-300')}`}>
            <span>⚡</span>
            Acceso inmediato
          </div>
        </div>
        
        <button 
          onClick={() => onReserve(s)} 
          className={`w-full rounded-2xl px-6 py-4 text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl ${tv(isDark,'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700','bg-gradient-to-r from-blue-700 to-purple-700 text-white hover:from-blue-800 hover:to-purple-800')}`}
        >
          <span className="flex items-center justify-center gap-2">
            <span>🚀</span>
            Comprar Ahora
            <span>✨</span>
          </span>
        </button>
      </div>
    </div>
  );
}