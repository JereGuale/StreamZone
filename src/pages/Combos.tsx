import React from 'react';
import { fmt, tv } from '../utils/helpers';
import { getComboLogos } from '../components/PlatformLogos';

interface CombosProps {
  isDark: boolean;
  onReserve: (combo: any) => void;
  combos: any[];
}

export const Combos = ({ isDark, onReserve, combos }: CombosProps) => {
  const getPremiumGradient = (colorClass: string) => {
    const c = colorClass.toLowerCase();
    if (c.includes('red')) return 'bg-gradient-to-br from-red-600/90 to-purple-900/90';
    if (c.includes('blue')) return 'bg-gradient-to-br from-blue-600/90 to-indigo-900/90';
    if (c.includes('purple')) return 'bg-gradient-to-br from-purple-600/90 to-pink-900/90';
    if (c.includes('orange') || c.includes('amber')) return 'bg-gradient-to-br from-orange-500/90 to-red-800/90';
    if (c.includes('green')) return 'bg-gradient-to-br from-green-500/90 to-cyan-900/90';
    if (c.includes('indigo')) return 'bg-gradient-to-br from-indigo-600/90 to-slate-900/90';
    return 'bg-gradient-to-br from-zinc-800 to-zinc-950';
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
      <div className={`mb-8 p-6 sm:p-8 rounded-2xl ${tv(isDark, 'bg-white/10 backdrop-blur-md border border-white/20 shadow-xl', 'bg-gray-800/40 backdrop-blur-md border border-white/10 shadow-xl')}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow-inner">
            <div className="w-6 h-6 rounded-full border-2 border-pink-500/50 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_10px_#ec4899]"></div>
            </div>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Combos Especiales</h3>
            <p className="text-sm sm:text-base text-gray-400">Ahorra más con nuestras combinaciones exclusivas</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl mx-auto">
        {combos.map((combo) => {
          const logos = getComboLogos(combo.id, 24, combo.name);
          const gradient = getPremiumGradient(combo.color || '');

          return (
            <div
              key={combo.id}
              className={`group flex flex-col ${gradient} rounded-xl p-6 text-white shadow-2xl border border-white/5 transition-all duration-300 hover:scale-[1.02]`}
            >
              {/* Row 1: Logos (Top) */}
              <div className="flex items-center -space-x-1 mb-3">
                {logos.length > 0 ? (
                  logos.map((logo, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-lg bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center overflow-hidden shadow-lg"
                      style={{ zIndex: logos.length - i }}
                    >
                      {logo}
                    </div>
                  ))
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/20 flex items-center justify-center overflow-hidden">
                    {combo.logo?.startsWith('http') ? (
                      <img src={combo.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold">{combo.logo || combo.name.charAt(0)}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Row 2: Price (Below Logos) */}
              <div className="mb-4">
                <div className="text-2xl font-black tracking-tight leading-none">
                  US$ {combo.price.toFixed(2).replace('.', ',')}
                </div>
                <div className="text-[10px] sm:text-xs font-bold opacity-60 mt-1 uppercase tracking-widest">por mes</div>
              </div>

              {/* Row 3: Title */}
              <h4 className="text-xl font-bold mb-6 min-h-[3rem] leading-snug">{combo.name}</h4>

              {/* Row 4: Features */}
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-start gap-3">
                  <span className="text-lg opacity-80">🐷</span>
                  <p className="text-xs sm:text-sm font-medium leading-tight opacity-90">Ahorro significativo vs compras individuales</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg opacity-80">📺</span>
                  <p className="text-xs sm:text-sm font-medium leading-tight opacity-90">
                    {combo.name.toLowerCase().includes('max') ? 'Acceso completo a todas las plataformas en 4K' : 'Acceso completo a todas las plataformas'}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg opacity-80">⚡</span>
                  <p className="text-xs sm:text-sm font-medium leading-tight opacity-90">Activación inmediata</p>
                </div>
              </div>

              {/* Row 5: Button */}
              <button
                onClick={() => onReserve(combo)}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/10 py-3 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
              >
                <span>🚀</span>
                <span>Comprar Combo</span>
                <span className="text-yellow-400">✨</span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
