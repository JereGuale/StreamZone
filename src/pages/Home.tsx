import { ServiceCard } from '../components/ServiceCard';
import { Logo } from '../components/Logo';

interface HomeProps {
  isDark: boolean;
  onReserve: (service: any) => void;
  user: any;
  setView: (view: string) => void;
  services: any[];
}

const Home = ({ isDark, onReserve, user, setView, services }: HomeProps) => {
  console.log('Home component rendering with props:', { isDark, user, setView, servicesCount: services?.length });

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>

        <div className="relative mx-auto max-w-7xl px-3 sm:px-4 py-8 sm:py-12 md:py-16 lg:py-24">
          <div className="grid items-center gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2">
            <div className="relative z-10 space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                  <span className="text-lg sm:text-xl">🎬</span>
                  <span className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Entretenimiento Premium</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight flex items-center gap-2 sm:gap-3">
                  <Logo className="h-12 w-auto sm:h-20 md:h-24 drop-shadow-2xl" />
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">StreamZone</span>
                </h1>
                <p className={`text-base sm:text-lg md:text-xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Tus plataformas favoritas, al mejor precio
                </p>
                <p className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Reserva por WhatsApp, recibe acceso con soporte inmediato y renueva sin complicaciones.
                  <span className="font-semibold text-blue-600"> Administra tus servicios desde tu cuenta.</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {user ? (
                  <a href="#catalogo" className={`inline-flex items-center justify-center px-4 sm:px-6 py-3 rounded-2xl font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 shadow-lg ${isDark ? 'bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'}`}>
                    <span className="mr-2">✨</span>
                    Ver Catálogo
                    <span className="ml-2">🚀</span>
                  </a>
                ) : (
                  <button onClick={() => setView('auth')} className={`inline-flex items-center justify-center px-4 sm:px-6 py-3 rounded-2xl font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 shadow-lg ${isDark ? 'bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'}`}>
                    <span className="mr-2">🔐</span>
                    Iniciar Sesión
                    <span className="ml-2">✨</span>
                  </button>
                )}
                <button onClick={() => setView('combos')} className={`inline-flex items-center justify-center px-4 sm:px-6 py-3 rounded-2xl font-semibold text-sm sm:text-base transition-all duration-200 hover:scale-105 ${isDark ? 'bg-zinc-800 text-purple-400 border-2 border-purple-600 hover:bg-purple-900/20' : 'bg-white text-purple-600 border-2 border-purple-200 hover:bg-purple-50'}`}>
                  <span className="mr-2">📦</span>
                  Ver Combos
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-6">
                <div className="text-center">
                  <div className={`text-lg sm:text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>500+</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Clientes felices</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg sm:text-xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>24/7</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Soporte</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg sm:text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>100%</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Garantía</div>
                </div>
              </div>
            </div>
            {/* Hero Illustration - Optimizada para móvil */}
            <div className="relative z-10">
              <div className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur-md border-2 ${isDark ? 'bg-gradient-to-br from-zinc-900/80 to-blue-900/80 border-blue-700/50' : 'bg-gradient-to-br from-white/80 to-blue-50/80 border-blue-200/50'}`}>
                {/* Floating Cards */}
                <div className="relative h-60 sm:h-80 flex items-center justify-center">
                  <div className="absolute top-2 sm:top-4 left-2 sm:left-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center text-white text-lg sm:text-2xl animate-float">
                    🎬
                  </div>
                  <div className="absolute top-4 sm:top-8 right-4 sm:right-8 w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center text-white text-base sm:text-xl animate-float animation-delay-1000">
                    🎧
                  </div>
                  <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center text-white text-sm sm:text-lg animate-float animation-delay-2000">
                    📺
                  </div>
                  <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 w-14 h-14 sm:w-18 sm:h-18 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl sm:rounded-2xl shadow-lg flex items-center justify-center text-white text-xl sm:text-2xl animate-float animation-delay-3000">
                    🏰
                  </div>

                  {/* Central Icon */}
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center justify-center text-white text-2xl sm:text-3xl md:text-4xl ${isDark ? 'bg-gradient-to-r from-blue-700 to-purple-700' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
                    ✨
                  </div>
                </div>

                {/* Payment Methods - Optimizado para móvil */}
                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  <div className={`text-center font-bold text-sm sm:text-base ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    💳 Métodos de Pago
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl text-center ${isDark ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
                      <div className="text-lg sm:text-xl mb-1">🏦</div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Bancos</div>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl text-center ${isDark ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
                      <div className="text-lg sm:text-xl mb-1">💚</div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-green-300' : 'text-green-700'}`}>PayPal</div>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl text-center ${isDark ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}>
                      <div className="text-lg sm:text-xl mb-1">📱</div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>Pago Móvil</div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2">
                    <span className={`text-xs px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-center ${isDark ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-700'}`}>🏦 Pichincha</span>
                    <span className={`text-xs px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-center ${isDark ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>🏛️ Guayaquil</span>
                    <span className={`text-xs px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-center ${isDark ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-700'}`}>🌊 Pacífico</span>
                    <span className={`text-xs px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-center ${isDark ? 'bg-orange-800 text-orange-200' : 'bg-orange-100 text-orange-700'}`}>💳 PayPal</span>
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
      <section id="catalogo" className="relative py-8 sm:py-12 md:py-16">
        {/* Background Pattern */}
        <div className={`absolute inset-0 ${isDark
          ? 'bg-gradient-to-br from-blue-950/50 via-purple-950/50 to-pink-950/50'
          : 'bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50'
          }`}></div>

        <div className="relative mx-auto max-w-7xl px-3 sm:px-4">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-3 sm:mb-4">
              <span className="text-lg">✨</span>
              <span className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Plataformas Premium</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Nuestro Catálogo</span>
            </h2>
            <p className={`text-sm sm:text-base md:text-lg max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Descubre todas las plataformas de streaming disponibles con acceso inmediato y soporte 24/7
            </p>
          </div>
          <div className="grid gap-3 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                s={service}
                onReserve={onReserve}
                isDark={isDark}
              />
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-8 sm:mt-12">
            <div className={`inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg ${isDark ? 'bg-gradient-to-r from-blue-600 to-purple-700 text-white' : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'}`}>
              <span className="text-lg sm:text-xl">🎯</span>
              <div>
                <div className="font-bold text-sm sm:text-base">¿No encuentras lo que buscas?</div>
                <div className="text-xs sm:text-sm opacity-90">Contáctanos por WhatsApp para más opciones</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Moderno - Optimizado para móvil */}
      <footer className={`relative py-8 sm:py-12 md:py-16 ${isDark ? 'bg-gradient-to-r from-zinc-900 to-zinc-800' : 'bg-gradient-to-r from-gray-900 to-gray-800'}`}>
        <div className="mx-auto max-w-7xl px-3 sm:px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Logo y Descripción */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Logo className="h-12 w-auto sm:h-16" />
                <div>
                  <div className="text-xs sm:text-sm text-gray-400">Tu entretenimiento digital</div>
                </div>
              </div>
              <p className="text-gray-300 mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
                La mejor plataforma para acceder a todos tus servicios de streaming favoritos con precios increíbles y soporte 24/7.
              </p>
              <div className="flex gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm sm:text-base hover:scale-110 transition-transform cursor-pointer">
                  📱
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm sm:text-base hover:scale-110 transition-transform cursor-pointer">
                  💬
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm sm:text-base hover:scale-110 transition-transform cursor-pointer">
                  ✨
                </div>
              </div>
            </div>

            {/* Enlaces Rápidos */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li><a href="#catalogo" className="text-gray-300 hover:text-blue-400 transition-colors text-sm sm:text-base">Catálogo</a></li>
                <li><a href="#combos" className="text-gray-300 hover:text-blue-400 transition-colors text-sm sm:text-base">Combos</a></li>
                <li><a href="#contacto" className="text-gray-300 hover:text-blue-400 transition-colors text-sm sm:text-base">Contacto</a></li>
                <li><a href="#soporte" className="text-gray-300 hover:text-blue-400 transition-colors text-sm sm:text-base">Soporte</a></li>
              </ul>
            </div>

            {/* Información de Contacto */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Contacto</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-300">
                  <span>📱</span>
                  <span className="text-sm sm:text-base">+593 99 999 9999</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span>💬</span>
                  <span className="text-sm sm:text-base">WhatsApp</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span>✉️</span>
                  <span className="text-sm sm:text-base">info@streamzone.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-gray-400 text-xs sm:text-sm">
              © 2024 StreamZone. Todos los derechos reservados. |
              <a href="#" className="hover:text-blue-400 transition-colors ml-1">Términos de Servicio</a> |
              <a href="#" className="hover:text-blue-400 transition-colors ml-1">Política de Privacidad</a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;

// Updated: Home component with latest features
