import React from 'react';
import { tv } from '../utils/helpers';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  isDark: boolean;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorModal({ 
  isOpen, 
  onClose, 
  title = "Error", 
  message, 
  isDark, 
  onRetry,
  showRetry = true 
}: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop mejorado para móviles */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal optimizado para móviles */}
      <div className="relative w-full max-w-xs sm:max-w-sm transform transition-all duration-300 scale-100 opacity-100">
        <div className={`rounded-xl sm:rounded-2xl shadow-2xl border-2 ${
          isDark 
            ? 'bg-gray-900 border-red-600' 
            : 'bg-white border-red-500'
        }`}>
          {/* Header con gradiente de error mejorado */}
          <div className="relative overflow-hidden rounded-t-xl sm:rounded-t-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-700 to-red-800" />
            <div className="relative p-4 sm:p-6 text-center">
              {/* Icono de error animado con mejor contraste */}
              <div className="mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/30 flex items-center justify-center shadow-lg">
                  <svg 
                    className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={3} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                    />
                  </svg>
                </div>
              </div>
              
              {/* Título de error con mejor contraste */}
              <h2 className="text-lg sm:text-xl font-bold mb-2 text-white drop-shadow-lg">
                {title}
              </h2>
            </div>
          </div>

          {/* Contenido del modal optimizado para móviles */}
          <div className="p-4 sm:p-6">
            {/* Mensaje de error con mejor contraste */}
            <div className="text-center mb-4 sm:mb-6">
              <p className={`text-sm sm:text-base leading-relaxed ${
                isDark 
                  ? 'text-gray-100' 
                  : 'text-gray-800'
              }`}>
                {message}
              </p>
            </div>

            {/* Opciones de acción con mejor contraste */}
            <div className="space-y-2 sm:space-y-3">
              {showRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className={`w-full py-3 sm:py-3 px-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 shadow-lg ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border border-blue-400'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 border border-blue-500'
                  }`}
                >
                  🔄 Intentar de nuevo
                </button>
              )}
              
              <button
                onClick={onClose}
                className={`w-full py-2.5 sm:py-2 px-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-all duration-200 shadow-md ${
                  isDark
                    ? 'bg-gray-700 text-gray-100 hover:bg-gray-600 border border-gray-500'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-400'
                }`}
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Footer con efectos visuales mejorados */}
          <div className={`px-4 sm:px-6 pb-3 sm:pb-4 ${
            isDark ? 'bg-gray-900/80' : 'bg-gray-100/80'
          }`}>
            <div className="flex justify-center space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    isDark ? 'bg-red-400' : 'bg-red-600'
                  }`}
                  style={{
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '1.5s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


