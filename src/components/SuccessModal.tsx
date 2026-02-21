import React, { useEffect, useState } from 'react';
import { tv } from '../utils/helpers';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  isDark: boolean;
  onContinue: () => void;
  onExploreServices?: () => void;
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  userName, 
  userEmail, 
  isDark, 
  onContinue,
  onExploreServices 
}: SuccessModalProps) {
  const [showContent, setShowContent] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Pequeño delay para la animación de entrada
      setTimeout(() => setShowContent(true), 100);
      setTimeout(() => setShowCheckmark(true), 300);
    } else {
      setShowContent(false);
      setShowCheckmark(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md transform transition-all duration-500 ${
        showContent 
          ? 'scale-100 opacity-100 translate-y-0' 
          : 'scale-95 opacity-0 translate-y-4'
      }`}>
        <div className={`rounded-2xl shadow-2xl border-2 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Header con gradiente */}
          <div className="relative overflow-hidden rounded-t-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 opacity-90" />
            <div className="relative p-6 text-center">
              {/* Icono de éxito animado */}
              <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700 ${
                  showCheckmark 
                    ? 'bg-white scale-100' 
                    : 'bg-white/20 scale-75'
                }`}>
                  <svg 
                    className={`w-8 h-8 text-green-600 transition-all duration-500 ${
                      showCheckmark ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={3} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>
              </div>
              
              {/* Título de éxito */}
              <h2 className={`text-2xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-white'
              }`}>
                🎉✨ ¡Bienvenido a StreamZone! ✨🎉
              </h2>
              
              <p className={`text-lg ${
                isDark ? 'text-white/90' : 'text-white/90'
              }`}>
                🎬 Tu cuenta ha sido creada exitosamente 🎬
              </p>
            </div>
          </div>

          {/* Contenido del modal */}
          <div className="p-6">
            {/* Mensaje personalizado */}
            <div className="text-center mb-6">
              <h3 className={`text-xl font-semibold mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                👋 ¡Hola, {userName}! 👋
              </h3>
              
              <p className={`text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                🎊 ¡Tu cuenta ha sido creada con éxito! 🎊\n💫 Ahora puedes iniciar sesión y disfrutar de nuestros servicios 💫
              </p>
            </div>

            {/* Opciones de acción */}
            <div className="space-y-3">
              <button
                onClick={onContinue}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                🔐✨ Iniciar sesión ✨🔐
              </button>
              
              {onExploreServices && (
                <button
                  onClick={onExploreServices}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    isDark
                      ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  🎬✨ Explorar servicios ✨🎬
                </button>
              )}
              
              <button
                onClick={onClose}
                className={`w-full py-2 px-4 rounded-xl text-sm transition-all duration-200 ${
                  isDark
                    ? 'text-gray-400 hover:text-gray-300'
                    : 'text-gray-500 hover:text-gray-700'
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
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    isDark ? 'bg-green-400' : 'bg-green-500'
                  }`}
                  style={{
                    animationDelay: `${i * 0.2}s`,
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
