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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm transform transition-all duration-300 scale-100 opacity-100">
        <div className={`rounded-2xl shadow-2xl border-2 ${
          isDark 
            ? 'bg-gray-800 border-red-500/30' 
            : 'bg-white border-red-200'
        }`}>
          {/* Header con gradiente de error */}
          <div className="relative overflow-hidden rounded-t-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-600 to-pink-600 opacity-90" />
            <div className="relative p-6 text-center">
              {/* Icono de error animado */}
              <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <svg 
                    className="w-8 h-8 text-white animate-pulse"
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
              
              {/* Título de error */}
              <h2 className={`text-xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-white'
              }`}>
                {title}
              </h2>
            </div>
          </div>

          {/* Contenido del modal */}
          <div className="p-6">
            {/* Mensaje de error */}
            <div className="text-center mb-6">
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {message}
              </p>
            </div>

            {/* Opciones de acción */}
            <div className="space-y-3">
              {showRetry && onRetry && (
                <button
                  onClick={onRetry}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                  }`}
                >
                  🔄 Intentar de nuevo
                </button>
              )}
              
              <button
                onClick={onClose}
                className={`w-full py-2 px-4 rounded-xl text-sm transition-all duration-200 ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Footer con efectos visuales */}
          <div className={`px-6 pb-4 ${
            isDark ? 'bg-gray-800/50' : 'bg-gray-50/50'
          }`}>
            <div className="flex justify-center space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    isDark ? 'bg-red-400' : 'bg-red-500'
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

