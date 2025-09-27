import React from 'react';
import { COMBOS } from '../constants/services';
import { tv } from '../utils/helpers';

interface CombosProps {
  isDark: boolean;
  onReserve: (service: any) => void;
}

export function Combos({ isDark, onReserve }: CombosProps) {
  return (
    <section className="mx-auto max-w-6xl px-3 sm:px-4 pb-12 sm:pb-16">
      <div className={`mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl ${tv(isDark, 'bg-white/90 shadow-lg', 'bg-gray-800/90 shadow-lg')}`}>
        <h3 className={`text-2xl sm:text-3xl font-bold mb-2 ${tv(isDark, 'text-gray-800', 'text-white')}`}>🎯 Combos Especiales</h3>
        <p className={`text-sm sm:text-base ${tv(isDark, 'text-gray-600', 'text-gray-300')}`}>Ahorra más con nuestras combinaciones exclusivas</p>
      </div>
      
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {COMBOS.map((combo) => (
          <div key={combo.id} className={`${combo.color} rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`h-12 w-12 sm:h-16 sm:w-16 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-xl sm:text-2xl`}>
                {combo.logo}
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-2xl font-bold">{combo.price.toLocaleString('es-CO', { style: 'currency', currency: 'USD' })}</div>
                <div className="text-xs sm:text-sm opacity-80">por mes</div>
              </div>
            </div>
            
            <h4 className="text-lg sm:text-xl font-semibold mb-3">{combo.name}</h4>
            
            <div className="mb-4">
              <div className="text-xs sm:text-sm opacity-90 mb-1">
                💰 Ahorro significativo vs compras individuales
              </div>
              <div className="text-xs sm:text-sm opacity-90 mb-1">
                🎬 Acceso completo a todas las plataformas
              </div>
              <div className="text-xs sm:text-sm opacity-90">
                ⚡ Activación inmediata
              </div>
            </div>
            
            <button 
              onClick={() => onReserve(combo)}
              className={`w-full rounded-xl px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl ${tv(isDark, 'bg-white/20 text-white hover:bg-white/30', 'bg-white/20 text-white hover:bg-white/30')}`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>🚀</span>
                Comprar Combo
                <span>✨</span>
              </span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

