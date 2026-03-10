import React from 'react';
import { fmt, tv } from '../utils/helpers';
import { getComboLogos } from '../components/PlatformLogos';

interface CombosProps {
  isDark: boolean;
  onReserve: (combo: any) => void;
  combos: any[];
}

export const Combos = ({ isDark, onReserve, combos }: CombosProps) => {
  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0B1120]' : 'bg-white'}`}>
      {/* Background Pattern - Mirrored from Home */}
      <div className="absolute inset-x-0 top-0 h-[500px] pointer-events-none">
        <div className={`absolute inset-0 ${isDark
          ? 'bg-gradient-to-br from-blue-950/50 via-purple-950/50 to-pink-950/50'
          : 'bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50'
          }`}></div>
        <div className={`absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t ${isDark ? 'from-[#0B1120]' : 'from-white'} to-transparent`}></div>
      </div>

      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-20">
        {/* Header Mirroring Home Category Style */}
        <div className="text-center mb-12 md:mb-16">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors mb-6 ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
            <span className="text-lg">💎</span>
            <span className="text-xs font-bold uppercase tracking-widest">Promociones Especiales</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Combos Especiales
            </span>
          </h1>

          <p className={`text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Ahorra más con nuestras combinaciones exclusivas. <br className="hidden sm:block" />
            Elige el plan que mejor se adapte a tu entretenimiento.
          </p>
        </div>

        {/* Cards Grid - Mirroring ServiceCard.tsx */}
        <div className="grid gap-4 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {combos.map((combo) => {
            const logos = getComboLogos(combo.id, 40, combo.name);

            return (
              <div
                key={combo.id}
                className={`group relative p-5 sm:p-7 rounded-[24px] sm:rounded-[32px] border transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center shadow-lg ${tv(isDark,
                  'bg-white border-gray-100 hover:shadow-blue-500/10',
                  'bg-[#0F172A] border-white/5 hover:shadow-blue-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.5)]'
                )}`}
              >
                {/* Logo Section */}
                <div className="relative mt-2 mb-6 w-full flex justify-center -space-x-4">
                  {logos.length > 0 ? (
                    logos.map((logo, i) => (
                      <div
                        key={i}
                        className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl shadow-xl border border-white/10 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
                        style={{ zIndex: logos.length - i }}
                      >
                        <div className="w-full h-full p-2.5 sm:p-3">{logo}</div>
                      </div>
                    ))
                  ) : (
                    <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl shadow-xl border border-white/10 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110 ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
                      <span className="text-xl sm:text-2xl font-bold">{combo.name.charAt(0)}</span>
                    </div>
                  )}

                  {/* Green Check Badge */}
                  <div className="absolute -top-1 right-1/4 translate-x-1/2 z-20 w-5 h-5 sm:w-7 sm:h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 shadow-md" style={{ borderColor: isDark ? '#0F172A' : '#FFFFFF' }}>
                    <span className="text-white text-[10px] sm:text-xs font-bold">✓</span>
                  </div>
                </div>

                {/* Info Container */}
                <div className="w-full flex-1 flex flex-col">
                  <h3 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 px-1 sm:px-2 line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem] flex items-center justify-center tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {combo.name}
                  </h3>

                  {/* Benefits Grid */}
                  <div className={`grid grid-cols-2 gap-x-1 sm:gap-x-2 gap-y-2 mb-6 sm:mb-8 p-2.5 sm:p-3 rounded-2xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-[10px] sm:text-xs">🎬</span>
                      <span className={`text-[9px] sm:text-[10px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>4K Ultra HD</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-[10px] sm:text-xs">💰</span>
                      <span className={`text-[9px] sm:text-[10px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Gran Ahorro</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-[10px] sm:text-xs">🔒</span>
                      <span className={`text-[9px] sm:text-[10px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Garantía Total</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-[10px] sm:text-xs">⭐</span>
                      <span className={`text-[9px] sm:text-[10px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Soporte 24/7</span>
                    </div>
                  </div>

                  {/* Price Box */}
                  <div className={`w-full py-3 sm:py-4 px-3 sm:px-4 rounded-2xl sm:rounded-3xl border flex flex-col items-center justify-center mb-5 sm:mb-6 transition-transform group-hover:scale-[1.02] ${isDark ? 'bg-[#0B1120] border-blue-500/20 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]' : 'bg-gray-50 border-blue-100'}`}>
                    <div className="flex items-center">
                      <span className={`text-2xl sm:text-3xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        US${combo.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className={`text-xs sm:text-sm font-bold ml-1 sm:ml-1.5 mt-1 sm:mt-2 ${isDark ? 'text-blue-400/60' : 'text-blue-600/60'}`}>
                        /mes
                      </span>
                    </div>
                    <p className={`text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] mt-0.5 sm:mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Acceso Ilimitado</p>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => onReserve(combo)}
                    className="w-full mt-auto py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_10px_25px_rgba(37,99,235,0.4)] hover:shadow-[0_10px_35px_rgba(37,99,235,0.5)] hover:scale-[1.03] active:scale-95"
                  >
                    <span>🚀</span>
                    <span>Comprar ahora</span>
                    <span>✨</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
