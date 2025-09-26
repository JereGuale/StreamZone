import React from 'react';
import { SERVICES, COMBOS } from '../constants/services';
import { ServiceCard } from '../components/ServiceCard';
import { fmt, tv } from '../utils/helpers';
import { Logo } from '../components/Logo';

interface HomeProps {
  isDark: boolean;
  onReserve: (service: any) => void;
  user: any;
  setView: (view: string) => void;
}

export function Home({ isDark, onReserve, user, setView }: HomeProps) {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 lg:py-32">
          <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-2">
            <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <span className="text-2xl">🎬</span>
                  <span className={`text-sm font-semibold ${tv(isDark,'text-blue-600','text-blue-400')}`}>Entretenimiento Premium</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">StreamZone</span>
                </h1>
                <p className={`text-xl md:text-2xl font-semibold ${tv(isDark,'text-gray-700','text-gray-200')}`}>
                  Tus plataformas favoritas, al mejor precio
                </p>
                <p className={`text-base md:text-lg ${tv(isDark,'text-gray-600','text-gray-300')}`}>
                  Reserva por WhatsApp, recibe acceso con soporte inmediato y renueva sin complicaciones. 
                  <span className="font-semibold text-blue-600"> Administra tus servicios desde tu cuenta.</span>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <a href="#catalogo" className={`inline-flex items-center justify-center px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg ${tv(isDark,'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700','bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800')}`}>
                    <span className="mr-2">✨</span>
                    Ver Catálogo
                    <span className="ml-2">🚀</span>
                  </a>
                ) : (
                  <button onClick={() => setView('auth')} className={`inline-flex items-center justify-center px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg ${tv(isDark,'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700','bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800')}`}>
                    <span className="mr-2">🔐</span>
                    Iniciar Sesión
                    <span className="ml-2">✨</span>
                  </button>
                )}
                <button onClick={() => setView('combos')} className={`inline-flex items-center justify-center px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105 ${tv(isDark,'bg-white text-purple-600 border-2 border-purple-200 hover:bg-purple-50','bg-zinc-800 text-purple-400 border-2 border-purple-600 hover:bg-purple-900/20')}`}>
                  <span className="mr-2">📦</span>
                  Ver Combos
                </button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${tv(isDark,'text-blue-600','text-blue-400')}`}>500+</div>
                  <div className={`text-sm ${tv(isDark,'text-gray-600','text-gray-400')}`}>Clientes felices</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${tv(isDark,'text-purple-600','text-purple-400')}`}>24/7</div>
                  <div className={`text-sm ${tv(isDark,'text-gray-600','text-gray-400')}`}>Soporte</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${tv(isDark,'text-green-600','text-green-400')}`}>100%</div>
                  <div className={`text-sm ${tv(isDark,'text-gray-600','text-gray-400')}`}>Garantía</div>
                </div>
              </div>
            </div>
            {/* Hero Illustration */}
            <div className="relative z-10">
              <div className={`relative rounded-3xl p-8 shadow-2xl backdrop-blur-md border-2 ${tv(isDark,'bg-gradient-to-br from-white/80 to-blue-50/80 border-blue-200/50','bg-gradient-to-br from-zinc-900/80 to-blue-900/80 border-blue-700/50')}`}>
                {/* Floating Cards */}
                <div className="relative h-80 flex items-center justify-center">
                  <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center text-white text-2xl animate-float">
                    🎬
                  </div>
                  <div className="absolute top-8 right-8 w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg flex items-center justify-center text-white text-xl animate-float animation-delay-1000">
                    🎧
                  </div>
                  <div className="absolute bottom-8 left-8 w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg flex items-center justify-center text-white text-lg animate-float animation-delay-2000">
                    📺
                  </div>
                  <div className="absolute bottom-4 right-4 w-18 h-18 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl shadow-lg flex items-center justify-center text-white text-2xl animate-float animation-delay-3000">
                    🏰
                  </div>
                  
                  {/* Central Icon */}
                  <div className={`w-24 h-24 rounded-3xl shadow-2xl flex items-center justify-center text-white text-4xl ${tv(isDark,'bg-gradient-to-r from-blue-600 to-purple-600','bg-gradient-to-r from-blue-700 to-purple-700')}`}>
                    ✨
                  </div>
                </div>
                
                {/* Payment Methods */}
                <div className="mt-6 space-y-4">
                  <div className={`text-center font-bold text-lg ${tv(isDark,'text-gray-800','text-gray-200')}`}>
                    💳 Métodos de Pago
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className={`p-3 rounded-xl text-center ${tv(isDark,'bg-blue-50 border border-blue-200','bg-blue-900/30 border border-blue-700')}`}>
                      <div className="text-2xl mb-1">🏦</div>
                      <div className={`text-xs font-semibold ${tv(isDark,'text-blue-700','text-blue-300')}`}>Bancos</div>
                    </div>
                    <div className={`p-3 rounded-xl text-center ${tv(isDark,'bg-green-50 border border-green-200','bg-green-900/30 border border-green-700')}`}>
                      <div className="text-2xl mb-1">💚</div>
                      <div className={`text-xs font-semibold ${tv(isDark,'text-green-700','text-green-300')}`}>PayPal</div>
                    </div>
                    <div className={`p-3 rounded-xl text-center ${tv(isDark,'bg-purple-50 border border-purple-200','bg-purple-900/30 border border-purple-700')}`}>
                      <div className="text-2xl mb-1">📱</div>
                      <div className={`text-xs font-semibold ${tv(isDark,'text-purple-700','text-purple-300')}`}>Pago Móvil</div>
                    </div>
                  </div>
                  
                  {/* Bank Details */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <span className={`text-xs px-3 py-2 rounded-lg text-center ${tv(isDark,'bg-green-100 text-green-700','bg-green-800 text-green-200')}`}>🏦 Pichincha</span>
                    <span className={`text-xs px-3 py-2 rounded-lg text-center ${tv(isDark,'bg-blue-100 text-blue-700','bg-blue-800 text-blue-200')}`}>🏛️ Guayaquil</span>
                    <span className={`text-xs px-3 py-2 rounded-lg text-center ${tv(isDark,'bg-purple-100 text-purple-700','bg-purple-800 text-purple-200')}`}>🌊 Pacífico</span>
                    <span className={`text-xs px-3 py-2 rounded-lg text-center ${tv(isDark,'bg-orange-100 text-orange-700','bg-orange-800 text-orange-200')}`}>💳 PayPal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 -z-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700" />
      </section>

      {/* Catálogo de Servicios */}
      <section id="catalogo" className="relative py-16 md:py-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/50 dark:via-purple-950/50 dark:to-pink-950/50"></div>
        
        <div className="relative mx-auto max-w-7xl px-4">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6">
              <span className="text-xl">✨</span>
              <span className={`text-sm font-semibold ${tv(isDark,'text-blue-600','text-blue-400')}`}>Plataformas Premium</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Nuestro Catálogo</span>
            </h2>
            <p className={`text-lg md:text-xl max-w-3xl mx-auto ${tv(isDark,'text-gray-600','text-gray-300')}`}>
              Descubre todas las plataformas de streaming disponibles con acceso inmediato y soporte 24/7
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {SERVICES.map((s, index) => (
              <div key={s.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <ServiceCard s={s} onReserve={onReserve} isDark={isDark}/>
              </div>
            ))}
          </div>
          
          {/* Call to Action */}
          <div className="text-center mt-12 md:mt-16">
            <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl shadow-lg ${tv(isDark,'bg-gradient-to-r from-blue-500 to-purple-600 text-white','bg-gradient-to-r from-blue-600 to-purple-700 text-white')}`}>
              <span className="text-2xl">🎯</span>
              <div>
                <div className="font-bold text-lg">¿No encuentras lo que buscas?</div>
                <div className="text-sm opacity-90">Contáctanos por WhatsApp para más opciones</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer Moderno */}
      <footer className={`relative py-16 ${tv(isDark,'bg-gradient-to-r from-gray-900 to-gray-800','bg-gradient-to-r from-zinc-900 to-zinc-800')}`}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo y Descripción */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Logo className="h-12 w-12" />
                <div>
                  <div className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">StreamZone</div>
                  <div className="text-sm text-gray-400">Tu entretenimiento digital</div>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                La mejor plataforma para acceder a todos tus servicios de streaming favoritos con precios increíbles y soporte 24/7.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg hover:scale-110 transition-transform cursor-pointer">
                  📱
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-lg hover:scale-110 transition-transform cursor-pointer">
                  💬
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg hover:scale-110 transition-transform cursor-pointer">
                  ✨
                </div>
              </div>
            </div>
            
            {/* Enlaces Rápidos */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li><button onClick={() => setView('home')} className="text-gray-300 hover:text-blue-400 transition-colors">🏠 Inicio</button></li>
                <li><button onClick={() => setView('combos')} className="text-gray-300 hover:text-purple-400 transition-colors">📦 Combos</button></li>
                <li><button onClick={() => setView('register')} className="text-gray-300 hover:text-green-400 transition-colors">✨ Registro</button></li>
                <li><button onClick={() => setView('auth')} className="text-gray-300 hover:text-blue-400 transition-colors">🔐 Iniciar Sesión</button></li>
              </ul>
            </div>
            
            {/* Contacto */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Contacto</h3>
              <ul className="space-y-2">
                <li className="text-gray-300 flex items-center gap-2">
                  <span>📱</span>
                  WhatsApp 24/7
                </li>
                <li className="text-gray-300 flex items-center gap-2">
                  <span>💬</span>
                  Soporte Inmediato
                </li>
                <li className="text-gray-300 flex items-center gap-2">
                  <span>⚡</span>
                  Acceso Rápido
                </li>
                <li className="text-gray-300 flex items-center gap-2">
                  <span>🔒</span>
                  Pago Seguro
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 StreamZone. Todos los derechos reservados. 
              <span className="text-blue-400"> Hecho con ❤️ para tu entretenimiento</span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}