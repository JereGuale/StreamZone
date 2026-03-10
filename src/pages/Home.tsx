import { ServiceCard } from '../components/ServiceCard';
import { Logo } from '../components/Logo';
import { getPlatformLogo } from '../components/PlatformLogos';

interface HomeProps {
  isDark: boolean;
  onReserve: (service: any) => void;
  user: any;
  setView: (view: string) => void;
  services: any[];
}

const Home = ({ isDark, onReserve, user, setView, services }: HomeProps) => {
  console.log('Home component rendering with props:', { isDark, user, setView, servicesCount: services?.length });

  const getServicePrice = (keyword: string, fallback: string) => {
    const service = services?.find(s => s.name.toLowerCase().includes(keyword.toLowerCase()));
    return service ? `$${Number(service.price).toFixed(2)}` : fallback;
  };

  return (
    <>
      {/* Hero Section */}
      <section className={`relative overflow-x-hidden min-h-0 lg:min-h-[600px] flex items-center transition-colors duration-300 ${isDark ? 'bg-[#0B1120]' : 'bg-white'}`}>
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse ${isDark ? 'bg-blue-600/10' : 'bg-blue-200/40'}`}></div>
          <div className={`absolute bottom-0 right-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-50 animate-pulse animation-delay-2000 ${isDark ? 'bg-purple-600/10' : 'bg-purple-200/40'}`}></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left Column: Content */}
            <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
                  <span className="text-sm">✨</span>
                  <span className="text-xs font-medium uppercase tracking-wider">Cuentas premium activas y soporte rápido</span>
                </div>

                <h1 className={`text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Tus plataformas favoritas <span className="text-blue-500">más claras, más confiables y listas para usar.</span>
                </h1>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setView('combos')}
                  className="flex-1 sm:flex-none px-6 sm:px-8 py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95 text-sm sm:text-base"
                >
                  Ver combos
                </button>
                <a
                  href="https://api.whatsapp.com/send?phone=593984280334&text=Hola%2C%20me%20gustar%C3%ADa%20recibir%20m%C3%A1s%20informaci%C3%B3n%20acerca%20de%20c%C3%B3mo%20comprar%20en%20StreamZone."
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-1 sm:flex-none px-6 sm:px-8 py-3.5 sm:py-4 font-bold rounded-xl border transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base ${isDark ? 'bg-[#1e293b]/50 hover:bg-[#1e293b] text-white border-gray-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300'}`}
                >
                  <span>💬</span>
                  Cómo comprar
                </a>
              </div>

              {/* Stats Cards */}
              <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-6 sm:pt-8 border-t transition-colors ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className={`p-3 sm:p-4 rounded-2xl border backdrop-blur-sm transition-colors ${isDark ? 'bg-gray-900/40 border-gray-800/50 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-900 shadow-sm'}`}>
                  <div className="text-xl sm:text-2xl font-bold">+500</div>
                  <div className={`text-[10px] sm:text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Clientes activos</div>
                </div>
                <div className={`p-3 sm:p-4 rounded-2xl border backdrop-blur-sm transition-colors ${isDark ? 'bg-gray-900/40 border-gray-800/50 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-900 shadow-sm'}`}>
                  <div className="text-xl sm:text-2xl font-bold">24/7</div>
                  <div className={`text-[10px] sm:text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Soporte rápido</div>
                </div>
                <div className={`col-span-2 sm:col-span-1 p-3 sm:p-4 rounded-2xl border backdrop-blur-sm transition-colors ${isDark ? 'bg-gray-900/40 border-gray-800/50 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-900 shadow-sm'}`}>
                  <div className="text-xl sm:text-2xl font-bold">100%</div>
                  <div className={`text-[10px] sm:text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Garantía real</div>
                </div>
              </div>
            </div>

            {/* Right Column: Featured Platforms */}
            <div className="relative z-10 lg:pl-12">
              <div className={`p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] border backdrop-blur-xl shadow-2xl transition-all duration-300 ${isDark ? 'bg-[#0F172A]/80 border-white/5' : 'bg-white/90 border-gray-200'}`}>
                <div className="mb-6 sm:mb-8">
                  <h2 className={`text-xl sm:text-2xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Plataformas destacadas</h2>
                  <p className={`text-xs sm:text-sm transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Precios visibles para que el usuario compare más rápido.</p>
                </div>

                <div className="space-y-6">
                  {/* Platform Item */}
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center shadow-lg transition-colors ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        {getPlatformLogo('netflix', 48, 'w-full h-full')}
                      </div>
                      <div>
                        <div className={`font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Netflix Premium</div>
                        <div className="text-gray-500 text-xs">Perfil individual</div>
                      </div>
                    </div>
                    <div className={`font-bold text-xl transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{getServicePrice('netflix', '$4.00')}</div>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center shadow-lg transition-colors ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        {getPlatformLogo('disney_premium', 48, 'w-full h-full')}
                      </div>
                      <div>
                        <div className={`font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Disney+ Premium</div>
                        <div className="text-gray-500 text-xs">Series, películas y deportes</div>
                      </div>
                    </div>
                    <div className={`font-bold text-xl transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{getServicePrice('disney', '$4.00')}</div>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center shadow-lg transition-colors ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        {getPlatformLogo('max', 48, 'w-full h-full')}
                      </div>
                      <div>
                        <div className={`font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Max Standard</div>
                        <div className="text-gray-500 text-xs">Entretenimiento premium</div>
                      </div>
                    </div>
                    <div className={`font-bold text-xl transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{getServicePrice('max', '$3.00')}</div>
                  </div>

                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden flex items-center justify-center shadow-lg transition-colors ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        {getPlatformLogo('prime', 48, 'w-full h-full')}
                      </div>
                      <div>
                        <div className={`text-sm sm:text-base font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Prime Video</div>
                        <div className="text-gray-500 text-[10px] sm:text-xs">Catálogo familiar y 4K</div>
                      </div>
                    </div>
                    <div className={`font-bold text-lg sm:text-xl transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{getServicePrice('prime', '$2.50')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                <a
                  href="https://api.whatsapp.com/send?phone=593984280334"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors"
                >
                  <span>📱</span>
                  <span className="text-sm sm:text-base">+593 98 428 0334</span>
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=593984280334"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors"
                >
                  <span>💬</span>
                  <span className="text-sm sm:text-base">WhatsApp</span>
                </a>
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
