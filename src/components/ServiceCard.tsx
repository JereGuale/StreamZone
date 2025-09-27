import React from 'react';
import { fmt, tv } from '../utils/helpers';

interface ServiceCardProps {
  s: any;
  onReserve: (s: any) => void;
  isDark: boolean;
}

export function ServiceCard({ s, onReserve, isDark }: ServiceCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-3xl border transition-all duration-500 hover:scale-105 hover:-translate-y-3 hover:rotate-1 ${tv(isDark,
      'border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl shadow-blue-500/10 hover:shadow-blue-500/20',
      'border-white/10 bg-zinc-900/40 backdrop-blur-xl shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20'
    )}`}>
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
      
      {/* Animated Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 -top-2 -left-2 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-1000"></div>
      
      <div className="relative z-10 text-center p-6">
        <div className="relative mb-8">
          {/* Icono con efecto 3D - Más grande */}
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl blur-sm"></div>
            <div className={`relative h-20 w-20 ${s.color} rounded-3xl text-white grid place-content-center text-3xl font-bold mx-auto shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
              {s.logo}
            </div>
            {/* Badge de verificación mejorado */}
            <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${tv(isDark,'bg-gradient-to-r from-green-500 to-emerald-500','bg-gradient-to-r from-green-400 to-emerald-400')} flex items-center justify-center text-white text-sm font-bold shadow-lg animate-bounce`}>
              ✓
            </div>
          </div>
        </div>
        
        <div className="mb-8 space-y-4">
          {/* Nombre del servicio */}
          <div className={`${tv(isDark,'text-gray-900','text-white')} font-black text-xl md:text-2xl mb-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent`}>
            {s.name}
          </div>
          
          {/* Precio con diseño mejorado */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`px-4 py-2 rounded-2xl ${tv(isDark,'bg-gradient-to-r from-blue-50 to-purple-50','bg-gradient-to-r from-blue-900/20 to-purple-900/20')} border ${tv(isDark,'border-blue-200','border-blue-500/30')}`}>
              <span className={`text-3xl md:text-4xl font-black ${tv(isDark,'text-gray-800','text-white')}`}>{fmt(s.price)}</span>
              <span className={`text-sm font-semibold ml-2 ${tv(isDark,'text-gray-600','text-gray-300')}`}>/{s.billing === 'annual' ? 'año' : 'mes'}</span>
            </div>
          </div>
          
          {/* Badge de acceso inmediato mejorado */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${tv(isDark,'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200','bg-gradient-to-r from-green-900/40 to-emerald-900/40 text-green-200 border border-green-500/30')} shadow-lg`}>
            <span className="text-lg animate-pulse">⚡</span>
            <span>Acceso inmediato</span>
          </div>
        </div>
        
        <button 
          onClick={() => onReserve(s)} 
          className={`group relative w-full rounded-2xl px-6 py-4 text-sm font-bold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 overflow-hidden ${tv(isDark,
            'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white hover:from-blue-500 hover:via-purple-500 hover:to-pink-500',
            'bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 text-white hover:from-blue-600 hover:via-purple-600 hover:to-pink-600'
          )}`}
        >
          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500"></div>
          
          <span className="relative z-10 flex items-center justify-center gap-3">
            <span className="text-lg group-hover:scale-110 transition-transform duration-300">🚀</span>
            <span className="font-black">Comprar Ahora</span>
            <span className="text-lg group-hover:scale-110 transition-transform duration-300">✨</span>
          </span>
        </button>
      </div>
    </div>
  );
}