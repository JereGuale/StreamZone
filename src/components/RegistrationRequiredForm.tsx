import React from 'react';
import { tv, fmt } from '../utils/helpers';

interface RegistrationRequiredFormProps {
  service: any;
  onClose: () => void;
  isDark: boolean;
  onGoToAuth: () => void;
}

export function RegistrationRequiredForm({ service, onClose, isDark, onGoToAuth }: RegistrationRequiredFormProps) {
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4">
      {/* Icono y mensaje principal - Mejorado */}
      <div className="text-center">
        <div className="relative mb-4 sm:mb-6">
          <div className="text-4xl sm:text-6xl mb-3 animate-bounce">🔐</div>
          <div className="absolute -top-2 -right-2 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Registro Requerido
        </h3>
        <p className={`text-sm sm:text-base mb-4 sm:mb-6 ${tv(isDark,'text-gray-700','text-gray-300')}`}>
          Para comprar <span className="font-bold text-blue-600">{service.name}</span> necesitas crear una cuenta en <span className="font-bold text-purple-600">StreamZone</span>
        </p>
      </div>

      {/* Beneficios del registro - Compacto */}
      <div className={`rounded-xl p-4 border ${tv(isDark,'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200','bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-600')}`}>
        <h4 className={`text-lg font-bold mb-4 text-center ${tv(isDark,'text-blue-900','text-blue-100')}`}>
          ✨ Beneficios de registrarte:
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-2 rounded-lg ${tv(isDark,'bg-white/70','bg-blue-800/20')}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className={`font-medium text-sm ${tv(isDark,'text-blue-800','text-blue-200')}`}>Acceso rápido</span>
            </div>
          </div>
          <div className={`p-2 rounded-lg ${tv(isDark,'bg-white/70','bg-blue-800/20')}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">📱</span>
              <span className={`font-medium text-sm ${tv(isDark,'text-blue-800','text-blue-200')}`}>Notificaciones</span>
            </div>
          </div>
          <div className={`p-2 rounded-lg ${tv(isDark,'bg-white/70','bg-blue-800/20')}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">💳</span>
              <span className={`font-medium text-sm ${tv(isDark,'text-blue-800','text-blue-200')}`}>Pago seguro</span>
            </div>
          </div>
          <div className={`p-2 rounded-lg ${tv(isDark,'bg-white/70','bg-blue-800/20')}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className={`font-medium text-sm ${tv(isDark,'text-blue-800','text-blue-200')}`}>Activación</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información del servicio - Compacto */}
      <div className={`rounded-xl p-4 border ${tv(isDark,'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200','bg-gradient-to-r from-gray-800 to-blue-900/20 border-gray-600')}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-16 w-16 ${service.color} rounded-xl text-white flex items-center justify-center text-2xl font-bold shadow-md`}>
              {service.logo}
            </div>
            <div>
              <h5 className={`text-lg font-bold ${tv(isDark,'text-gray-900','text-white')}`}>{service.name}</h5>
              <p className={`text-base ${tv(isDark,'text-gray-600','text-gray-300')}`}>Precio: <span className="font-bold text-green-600">{fmt(service.price)}</span>/mes</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full ${tv(isDark,'bg-green-100 text-green-800','bg-green-800/30 text-green-200')}`}>
            <span className="text-xs font-semibold">Premium</span>
          </div>
        </div>
      </div>

      {/* Botones de acción - Compactos */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <button 
          onClick={onGoToAuth}
          className={`w-full rounded-xl px-4 sm:px-6 py-3 sm:py-4 font-bold text-base sm:text-lg transition-all duration-300 hover:scale-105 shadow-xl ${tv(isDark,'bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white hover:from-purple-700 hover:via-blue-700 hover:to-pink-700','bg-gradient-to-r from-purple-700 via-blue-700 to-pink-700 text-white hover:from-purple-800 hover:via-blue-800 hover:to-pink-800')}`}
        >
          <span className="flex items-center justify-center gap-2 sm:gap-3">
            <span className="text-lg sm:text-xl">🚀</span>
            <span>Crear Cuenta y Comprar</span>
            <span className="text-lg sm:text-xl">✨</span>
          </span>
        </button>
        
        <button 
          onClick={onClose}
          className={`w-full rounded-xl px-3 sm:px-4 py-2 sm:py-3 font-semibold transition-all duration-300 hover:scale-105 border text-sm sm:text-base ${tv(isDark,'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400','bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500')}`}
        >
          <span className="flex items-center justify-center gap-2">
            <span>←</span>
            <span>Volver al Catálogo</span>
          </span>
        </button>
      </div>

      {/* Mensaje de ayuda - Mejorado */}
      <div className="text-center pt-4">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${tv(isDark,'bg-gray-100','bg-gray-800')}`}>
          <span className={`text-sm ${tv(isDark,'text-gray-600','text-gray-400')}`}>¿Ya tienes cuenta?</span>
          <button 
            onClick={onGoToAuth}
            className={`font-semibold text-sm px-3 py-1 rounded-full transition-all ${tv(isDark,'text-blue-600 hover:text-blue-700 hover:bg-blue-50','text-blue-400 hover:text-blue-300 hover:bg-blue-900/20')}`}
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}