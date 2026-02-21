import React from 'react';
import { fmt, tv } from '../utils/helpers';
import { getPlatformLogo } from './PlatformLogos';

interface ServiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  key?: any;
  s: any;
  onReserve: (s: any) => void;
  isDark: boolean;
}

export function ServiceCard({ s, onReserve, isDark }: ServiceCardProps) {
  const svgLogo = getPlatformLogo(s.id, 0, 'w-full h-full');

  return (
    <div className={`group relative p-4 sm:p-5 rounded-3xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center ${tv(isDark,
      'bg-white border-gray-100 shadow-xl hover:shadow-blue-500/10',
      'bg-[#1a1b26] border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-blue-500/20'
    )}`}>
      {/* Background glow base on service color (subtle) */}
      <div className={`absolute inset-0 bg-gradient-to-b from-${tv(isDark, 'blue-50', 'white/[0.02]')} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl`}></div>

      {/* 1. Logo Section */}
      <div className="relative mt-2 sm:mt-4 mb-4 sm:mb-5 left-0 right-0 mx-auto w-16 h-16 sm:w-20 sm:h-20">
        {/* Glow behind the logo */}
        <div className={`absolute inset-0 ${s.color} blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 rounded-full`}></div>

        <div className="relative w-full h-full rounded-[1.2rem] sm:rounded-3xl shadow-lg border border-white/10 flex flex-col justify-center items-center overflow-hidden z-10">
          {svgLogo ? (
            <div className="w-full h-full p-2">{svgLogo}</div>
          ) : s.logo?.startsWith('http') || s.logo?.startsWith('data:image') ? (
            <img src={s.logo} alt={s.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className={`w-full h-full ${s.color} text-white flex items-center justify-center text-xl sm:text-2xl font-bold`}>
              {s.logo || s.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Green Check Badge directly on top right of the logo */}
        <div className="absolute -top-1 -right-1 z-20 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#1a1b26] shadow-md">
          <span className="text-white text-[10px] sm:text-xs font-bold leading-none">✓</span>
        </div>
      </div>

      {/* 2. Title */}
      <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 px-2 w-full truncate ${tv(isDark, 'text-gray-900', 'text-white')}`}>
        {s.name}
      </h3>

      {/* 3. Price Box */}
      <div className={`w-full py-2 sm:py-3 px-2 rounded-2xl border flex items-center justify-center mb-3 sm:mb-4 ${tv(isDark, 'bg-gray-50 border-gray-200', 'bg-[#14151f]/50 border-white/5')}`}>
        <span className={`text-xl sm:text-2xl font-black tracking-tight ${tv(isDark, 'text-gray-900', 'text-white')}`}>
          US{fmt(s.price)}
        </span>
        <span className={`text-xs sm:text-sm font-medium ml-1 mt-1 sm:mt-2 ${tv(isDark, 'text-gray-500', 'text-gray-400')}`}>
          /{s.billing === 'annual' ? 'año' : 'mes'}
        </span>
      </div>

      {/* 4. Acceso Inmediato Badge */}
      <div className={`w-[85%] sm:w-fit mx-auto py-1.5 px-3 sm:px-4 rounded-full border flex items-center justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-5 transition-colors ${tv(isDark, 'bg-emerald-50 border-emerald-200 text-emerald-700', 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/20')}`}>
        <span className="text-[10px] sm:text-xs">⚡</span>
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Acceso inmediato</span>
      </div>

      {/* 5. Comprar Ahora Button */}
      <button
        onClick={() => onReserve(s)}
        className="w-full mt-auto py-3 sm:py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transform hover:scale-[1.02] active:scale-95"
      >
        <span>🚀</span>
        <span>Comprar Ahora</span>
        <span>✨</span>
      </button>
    </div>
  );
}