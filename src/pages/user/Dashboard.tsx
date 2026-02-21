import { ServiceCard } from '../../components/ServiceCard';
import { Logo } from '../../components/Logo';
import { SERVICES, COMBOS } from '../../constants/services';
import { tv } from '../../utils/helpers';

interface DashboardProps {
  isDark: boolean;
  onReserve: (service: any) => void;
  user: any;
}

export function Dashboard({ isDark, onReserve, user }: DashboardProps) {
  return (
    <section className="mx-auto max-w-6xl px-3 sm:px-4 pb-8 sm:pb-16">
      {/* Hero Section */}
      <div className="text-center py-8 sm:py-12">
        <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-6 flex items-center justify-center gap-3 ${tv(isDark, 'text-gray-900', 'text-white')}`}>
          <Logo className="h-10 w-auto sm:h-12" />
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">StreamZone</span>
        </h1>
        <p className={`text-lg sm:text-xl mb-6 sm:mb-8 ${tv(isDark, 'text-gray-600', 'text-gray-300')}`}>
          Los mejores servicios de streaming al mejor precio
        </p>
        {user && (
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${tv(isDark, 'bg-green-100 text-green-800', 'bg-green-900/30 text-green-300')}`}>
            <span>👋</span>
            <span>¡Hola, {user.name}!</span>
          </div>
        )}
      </div>

      {/* Servicios Individuales */}
      <div className="mb-12">
        <h2 className={`text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center ${tv(isDark, 'text-gray-900', 'text-white')}`}>
          📺 Servicios Individuales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.id}
              s={service}
              onReserve={onReserve}
              isDark={isDark}
            />
          ))}
        </div>
      </div>

      {/* Combos */}
      <div className="mb-12">
        <h2 className={`text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center ${tv(isDark, 'text-gray-900', 'text-white')}`}>
          🎁 Combos Especiales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {COMBOS.map((combo) => (
            <ServiceCard
              key={combo.id}
              s={combo}
              onReserve={onReserve}
              isDark={isDark}
            />
          ))}
        </div>
      </div>

      {/* Información adicional */}
      <div className={`p-6 sm:p-8 rounded-2xl ${tv(isDark, 'bg-blue-50 border border-blue-200', 'bg-blue-900/20 border border-blue-700')}`}>
        <div className="text-center">
          <h3 className={`text-xl sm:text-2xl font-bold mb-4 ${tv(isDark, 'text-blue-900', 'text-blue-100')}`}>
            🚀 ¿Cómo funciona?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">1️⃣</div>
              <h4 className={`font-semibold mb-2 ${tv(isDark, 'text-blue-800', 'text-blue-200')}`}>Elige tu servicio</h4>
              <p className={`text-sm ${tv(isDark, 'text-blue-700', 'text-blue-300')}`}>
                Selecciona el servicio que más te guste
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">2️⃣</div>
              <h4 className={`font-semibold mb-2 ${tv(isDark, 'text-blue-800', 'text-blue-200')}`}>Realiza el pago</h4>
              <p className={`text-sm ${tv(isDark, 'text-blue-700', 'text-blue-300')}`}>
                Paga de forma segura y rápida
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">3️⃣</div>
              <h4 className={`font-semibold mb-2 ${tv(isDark, 'text-blue-800', 'text-blue-200')}`}>Disfruta</h4>
              <p className={`text-sm ${tv(isDark, 'text-blue-700', 'text-blue-300')}`}>
                Recibe tus credenciales y comienza a ver
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

