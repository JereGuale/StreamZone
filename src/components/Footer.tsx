import React from 'react';
import { tv } from '../utils/helpers';

interface FooterProps {
  isDark: boolean;
}

export function Footer({ isDark }: FooterProps) {
  return (
    <footer className={`relative mt-20 overflow-hidden ${tv(isDark, 'bg-gradient-to-br from-gray-50 to-white', 'bg-gradient-to-br from-zinc-950 via-gray-900 to-black')}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-500/5 to-blue-600/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Section - Enhanced */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-500 group-hover:scale-110`}>
                  <span className="text-white font-bold text-2xl">SZ</span>
                </div>
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${tv(isDark, 'bg-green-500', 'bg-green-400')} animate-bounce shadow-lg`}>
                  <div className="w-full h-full rounded-full bg-white/30 animate-ping"></div>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>
              </div>
              <div>
                <h3 className={`text-3xl font-bold bg-gradient-to-r ${tv(isDark, 'from-gray-900 to-gray-700', 'from-white to-gray-300')} bg-clip-text text-transparent`}>
                  StreamZone
                </h3>
                <p className={`text-lg font-medium ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>Tu entretenimiento digital</p>
              </div>
            </div>
            
            <p className={`text-base leading-relaxed max-w-md ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
              La mejor plataforma para acceder a todos tus servicios de streaming favoritos con precios increíbles y soporte 24/7.
            </p>
            
            {/* Enhanced Social Icons */}
            <div className="flex items-center gap-6">
              <div className="group cursor-pointer">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 group-hover:scale-110">
                  <span className="text-white text-xl">📺</span>
                </div>
                <div className="absolute w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md -z-10"></div>
              </div>
              <div className="group cursor-pointer">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:shadow-green-500/50 transition-all duration-300 group-hover:scale-110">
                  <span className="text-white text-xl">☁️</span>
                </div>
                <div className="absolute w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md -z-10"></div>
              </div>
              <div className="group cursor-pointer">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
                  <span className="text-white text-xl">⭐</span>
                </div>
                <div className="absolute w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md -z-10"></div>
              </div>
            </div>
          </div>

          {/* Quick Links - Enhanced */}
          <div className="space-y-6">
            <h4 className={`text-xl font-bold ${tv(isDark, 'text-gray-900', 'text-white')} flex items-center gap-3`}>
              <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
              Enlaces Rápidos
            </h4>
            <nav className="space-y-4">
              {[
                { name: 'Catálogo', href: '#catalogo', icon: '📋', color: 'from-blue-500 to-blue-600' },
                { name: 'Combos', href: '#combos', icon: '🎁', color: 'from-green-500 to-green-600' },
                { name: 'Contacto', href: '#contacto', icon: '📞', color: 'from-purple-500 to-purple-600' },
                { name: 'Soporte', href: '#soporte', icon: '🆘', color: 'from-red-500 to-red-600' }
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`group flex items-center gap-4 text-sm transition-all duration-300 hover:scale-105 transform ${tv(isDark, 'text-gray-600 hover:text-gray-900', 'text-gray-400 hover:text-white')}`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300`}>
                    <span className="text-white text-lg">{link.icon}</span>
                  </div>
                  <span className="font-medium">{link.name}</span>
                </a>
              ))}
            </nav>
          </div>

          {/* Contact - Enhanced */}
          <div className="space-y-6">
            <h4 className={`text-xl font-bold ${tv(isDark, 'text-gray-900', 'text-white')} flex items-center gap-3`}>
              <span className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-600 rounded-full"></span>
              Contacto
            </h4>
            <div className="space-y-5">
              <a
                href="https://wa.me/593984280334"
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-4 text-sm transition-all duration-300 hover:scale-105 transform ${tv(isDark, 'text-gray-600 hover:text-green-600', 'text-gray-400 hover:text-green-400')}`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:shadow-green-500/50 transition-all duration-300">
                  <span className="text-white text-lg">📱</span>
                </div>
                <div>
                  <div className="font-semibold">+593 98 428 0334</div>
                  <div className={`text-xs ${tv(isDark, 'text-gray-500', 'text-gray-500')}`}>WhatsApp</div>
                </div>
              </a>
              
              <a
                href="https://wa.me/593984280334"
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center gap-4 text-sm transition-all duration-300 hover:scale-105 transform ${tv(isDark, 'text-gray-600 hover:text-green-600', 'text-gray-400 hover:text-green-400')}`}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:shadow-green-500/50 transition-all duration-300">
                  <span className="text-white text-lg">💬</span>
                </div>
                <div>
                  <div className="font-semibold">Chat en Vivo</div>
                  <div className={`text-xs ${tv(isDark, 'text-gray-500', 'text-gray-500')}`}>Respuesta inmediata</div>
                </div>
              </a>
              
              <div className={`group flex items-center gap-4 text-sm ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">🕒</span>
                </div>
                <div>
                  <div className="font-semibold">Soporte 24/7</div>
                  <div className={`text-xs ${tv(isDark, 'text-gray-500', 'text-gray-500')}`}>Siempre disponible</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Bottom Section */}
      <div className={`relative border-t ${tv(isDark, 'border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100', 'border-gray-800 bg-gradient-to-r from-gray-900 to-black')}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className={`text-sm font-medium ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
              © 2024 StreamZone. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-8 text-sm">
              <a
                href="#terminos"
                className={`font-medium transition-all duration-300 hover:scale-105 ${tv(isDark, 'text-gray-600 hover:text-gray-900', 'text-gray-400 hover:text-white')}`}
              >
                Términos de Servicio
              </a>
              <div className={`w-1 h-4 ${tv(isDark, 'bg-gray-300', 'bg-gray-600')} rounded-full`}></div>
              <a
                href="#privacidad"
                className={`font-medium transition-all duration-300 hover:scale-105 ${tv(isDark, 'text-gray-600 hover:text-gray-900', 'text-gray-400 hover:text-white')}`}
              >
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Floating Chat Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <a
          href="https://wa.me/593984280334"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-4 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-75 transition-opacity duration-500"></div>
          <div className="relative w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl animate-pulse">💬</span>
          </div>
          <div className="relative hidden sm:block">
            <div className="text-sm font-bold">¿Necesitas ayuda?</div>
            <div className="text-xs opacity-90">Chat en vivo 24/7</div>
          </div>
          <div className="relative w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
        </a>
      </div>
    </footer>
  );
}
