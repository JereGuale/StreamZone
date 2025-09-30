import React from 'react';
import { tv } from '../utils/helpers';

interface FooterProps {
  isDark: boolean;
}

export function Footer({ isDark }: FooterProps) {
  return (
    <footer className={`mt-20 border-t ${tv(isDark, 'border-gray-200 bg-white', 'border-gray-800 bg-zinc-950')}`}>
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Left Column - Branding */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-xl">SZ</span>
                </div>
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${tv(isDark, 'bg-green-500', 'bg-green-400')} animate-pulse shadow-md`}></div>
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${tv(isDark, 'text-gray-900', 'text-white')}`}>StreamZone</h3>
                <p className={`text-sm ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>Tu entretenimiento digital</p>
              </div>
            </div>
            
            <p className={`text-sm leading-relaxed ${tv(isDark, 'text-gray-700', 'text-gray-300')}`}>
              La mejor plataforma para acceder a todos tus servicios de streaming favoritos con precios increíbles y soporte 24/7.
            </p>
            
            {/* Social/Service Icons */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <span className="text-white text-lg">📺</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                <span className="text-white text-lg">☁️</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                <span className="text-white text-lg">⭐</span>
              </div>
            </div>
          </div>

          {/* Middle Column - Quick Links */}
          <div className="space-y-6">
            <h4 className={`text-lg font-semibold ${tv(isDark, 'text-gray-900', 'text-white')}`}>Enlaces Rápidos</h4>
            <nav className="space-y-3">
              {[
                { name: 'Catálogo', href: '#catalogo', icon: '📋' },
                { name: 'Combos', href: '#combos', icon: '🎁' },
                { name: 'Contacto', href: '#contacto', icon: '📞' },
                { name: 'Soporte', href: '#soporte', icon: '🆘' }
              ].map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 text-sm transition-colors hover:scale-105 transform ${tv(isDark, 'text-gray-600 hover:text-gray-900', 'text-gray-400 hover:text-white')}`}
                >
                  <span className="text-lg">{link.icon}</span>
                  {link.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Right Column - Contact */}
          <div className="space-y-6">
            <h4 className={`text-lg font-semibold ${tv(isDark, 'text-gray-900', 'text-white')}`}>Contacto</h4>
            <div className="space-y-4">
              <a
                href="https://wa.me/593984280334"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 text-sm transition-all hover:scale-105 transform group ${tv(isDark, 'text-gray-600 hover:text-green-600', 'text-gray-400 hover:text-green-400')}`}
              >
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <span className="text-white text-sm">📱</span>
                </div>
                <span className="font-medium">+593 98 428 0334</span>
              </a>
              
              <a
                href="https://wa.me/593984280334"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 text-sm transition-all hover:scale-105 transform group ${tv(isDark, 'text-gray-600 hover:text-green-600', 'text-gray-400 hover:text-green-400')}`}
              >
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <span className="text-white text-sm">💬</span>
                </div>
                <span className="font-medium">WhatsApp</span>
              </a>
              
              <div className={`flex items-center gap-3 text-sm ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <span className="text-white text-sm">✉️</span>
                </div>
                <span className="font-medium">Soporte 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className={`border-t ${tv(isDark, 'border-gray-200 bg-gray-50', 'border-gray-800 bg-zinc-900')}`}>
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className={`text-sm ${tv(isDark, 'text-gray-600', 'text-gray-400')}`}>
              © 2024 StreamZone. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a
                href="#terminos"
                className={`transition-colors hover:underline ${tv(isDark, 'text-gray-600 hover:text-gray-900', 'text-gray-400 hover:text-white')}`}
              >
                Términos de Servicio
              </a>
              <span className={tv(isDark, 'text-gray-400', 'text-gray-600')}>|</span>
              <a
                href="#privacidad"
                className={`transition-colors hover:underline ${tv(isDark, 'text-gray-600 hover:text-gray-900', 'text-gray-400 hover:text-white')}`}
              >
                Política de Privacidad
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <a
          href="https://wa.me/593984280334"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-lg">💬</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium">¿Necesitas ayuda?</div>
            <div className="text-xs opacity-90">Chat en vivo</div>
          </div>
        </a>
      </div>
    </footer>
  );
}
