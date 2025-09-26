import React from 'react';
import { COMBOS } from '../constants/services';
import { tv } from '../utils/helpers';

interface CombosProps {
  isDark: boolean;
  onReserve: (service: any) => void;
}

export function Combos({ isDark, onReserve }: CombosProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16">
      <div className="mb-8">
        <h3 className="text-3xl font-bold mb-2">🎯 Combos Especiales</h3>
        <p className={tv(isDark, 'text-zinc-600', 'text-zinc-300')}>Ahorra más con nuestras combinaciones exclusivas</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {COMBOS.map((combo) => (
          <div key={combo.id} className={`${combo.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg`}>
                {combo.logo}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{combo.price.toLocaleString('es-CO', { style: 'currency', currency: 'USD' })}</div>
                <div className="text-sm opacity-80">por mes</div>
              </div>
            </div>
            
            <h4 className="text-xl font-semibold mb-3">{combo.name}</h4>
            
            <div className="mb-4">
              <div className="text-sm opacity-90">
                💰 Ahorro significativo vs compras individuales
              </div>
              <div className="text-sm opacity-90">
                🎬 Acceso completo a todas las plataformas
              </div>
              <div className="text-sm opacity-90">
                ⚡ Activación inmediata
              </div>
            </div>
            
            <button 
              onClick={() => onReserve(combo)}
              className={`w-full rounded-xl px-6 py-3 text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl ${tv(isDark, 'bg-white/20 text-white hover:bg-white/30', 'bg-white/20 text-white hover:bg-white/30')}`}
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

