import React, { useState } from 'react';
import { fmt, daysBetween, tv } from '../utils/helpers';

interface PurchaseCardProps {
  item: any;
  isDark: boolean;
  onToggleValidate: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export function PurchaseCard({ item, isDark, onToggleValidate, onDelete, onEdit }: PurchaseCardProps) {
  const days = daysBetween(new Date().toISOString().slice(0,10), item.end);
  const status = days < 0 ? 'Vencido' : days === 0 ? 'Vence hoy' : `${days} dias`;
  
  // Si es una compra pendiente, mostrar diseño simple
  if (!item.validated) {
    return (
      <div className={`p-3 sm:p-4 rounded-xl border-2 transition-all hover:shadow-lg ${tv(isDark,'bg-white border-gray-200 hover:border-gray-300','bg-gray-800 border-gray-700 hover:border-gray-600')}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <h3 className={`font-bold text-lg sm:text-xl ${tv(isDark,'text-gray-900','text-white')}`}>
                {item.customer}
              </h3>
              <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${tv(isDark,'bg-blue-100 text-blue-800','bg-blue-800 text-blue-100')}`}>
                {item.service}
              </span>
            </div>
            
            <div className={`text-xs sm:text-sm ${tv(isDark,'text-gray-600','text-gray-400')} mb-2`}>
              📱 {item.phone} • 📅 {item.start}
            </div>
            
            <div className={`text-xs sm:text-sm ${tv(isDark,'text-gray-700','text-gray-300')}`}>
              <div className="mb-1"><strong>Duración:</strong> {item.months} {item.months === 1 ? 'mes' : 'meses'}</div>
              <div className="mb-1"><strong>Inicio:</strong> {item.start}</div>
              <div><strong>Fin:</strong> {item.end}</div>
            </div>
          </div>
          
          <div className="flex flex-row sm:flex-col gap-2 sm:gap-2">
            <button
              onClick={onToggleValidate}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${tv(isDark,'bg-green-500 text-white hover:bg-green-600','bg-green-600 text-white hover:bg-green-700')}`}
            >
              ✅ Aprobar
            </button>
            <button
              onClick={onDelete}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${tv(isDark,'bg-red-500 text-white hover:bg-red-600','bg-red-600 text-white hover:bg-red-700')}`}
            >
              ❌ Rechazar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Si es una compra activa, mostrar diseño expandible con details/summary
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <details className={`relative group rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-200 ${tv(isDark,'border-gray-200 bg-white hover:border-gray-300','border-gray-700 bg-gray-800 hover:border-gray-600')}`}>
      <summary className="cursor-pointer list-none p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm ${tv(isDark,'bg-gradient-to-r from-blue-500 to-purple-600','bg-gradient-to-r from-blue-600 to-purple-700')}`}>
                {item.customer.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-base sm:text-lg ${tv(isDark,'text-gray-900','text-white')}`}>
                  {item.customer}
                </h3>
                <p className={`text-xs sm:text-sm ${tv(isDark,'text-gray-600','text-gray-400')}`}>
                  📱 {item.phone}
                </p>
              </div>
            </div>
            
            <div className={`text-sm sm:text-base font-medium mb-2 ${tv(isDark,'text-gray-800','text-gray-200')}`}>
              🎬 {item.service}
            </div>
            
            <div className={`text-xs sm:text-sm ${tv(isDark,'text-gray-600','text-gray-400')}`}>
              📅 {item.start} → {item.end} • {item.months} {item.months === 1 ? 'mes' : 'meses'}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-end gap-2 sm:gap-2">
            <div className="flex items-center gap-2">
              {/* Botón de expansión/colapso */}
              <button 
                className={`w-8 h-8 rounded-full shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center group ${tv(isDark,'bg-gray-100 hover:bg-gray-200 text-gray-600','bg-gray-700 hover:bg-gray-600 text-gray-300')}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Toggle del details element
                  const details = e.currentTarget.closest('details');
                  if (details) {
                    details.open = !details.open;
                    // Actualizar el icono después del toggle
                    setTimeout(() => {
                      const icon = e.currentTarget?.querySelector('span');
                      if (icon && details.open) {
                        icon.textContent = '▲';
                      } else if (icon) {
                        icon.textContent = '▼';
                      }
                    }, 10);
                  }
                }}
                title="Ver detalles"
              >
                <span className="text-sm group-hover:scale-110 transition-transform duration-200">▼</span>
              </button>
              
              {/* Botón de editar prominente */}
              <button 
                className={`w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center group ${tv(isDark,'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white','bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white')}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit();
                }}
                title="Editar compra"
              >
                <span className="text-lg group-hover:scale-110 transition-transform duration-200">✏️</span>
              </button>
            </div>
            
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${tv(isDark,'bg-green-100 text-green-800 border border-green-200','bg-green-800 text-green-100 border border-green-500')}`}>
              ✅ Validada
            </span>
            
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${days<=0? 
              tv(isDark,'bg-red-100 text-red-800','bg-red-800 text-red-100') : 
              tv(isDark,'bg-gray-100 text-gray-800','bg-gray-700 text-gray-200')
            }`}>
              {status}
            </span>
          </div>
        </div>
      </summary>
      
      {/* Contenido expandible - Credenciales del servicio */}
      <div className={`mx-2 sm:mx-4 mb-3 sm:mb-4 p-3 sm:p-6 rounded-xl border-2 ${tv(isDark,'bg-green-50 border-green-200','bg-green-900/20 border-green-700')}`}>
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-sm sm:text-base ${tv(isDark,'bg-yellow-100','bg-yellow-900/30')}`}>
            🔑
          </div>
          <h5 className={`font-bold text-base sm:text-lg ${tv(isDark,'text-gray-800','text-white')}`}>
            Credenciales del Servicio
          </h5>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className={`text-xs sm:text-sm font-semibold w-16 sm:w-20 ${tv(isDark,'text-gray-700','text-gray-300')}`}>Email:</span> 
            <input 
              type="text" 
              value={item.service_email || 'No disponible'} 
              readOnly
              className={`text-xs sm:text-sm font-mono px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 flex-1 ${tv(isDark,'bg-white text-gray-800 border-gray-300','bg-gray-800 text-gray-200 border-gray-600')}`}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className={`text-xs sm:text-sm font-semibold w-16 sm:w-20 ${tv(isDark,'text-gray-700','text-gray-300')}`}>Password:</span> 
            <div className="flex items-center gap-2 flex-1">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={item.service_password || 'No disponible'} 
                readOnly
                className={`text-xs sm:text-sm font-mono px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 flex-1 ${tv(isDark,'bg-white text-gray-800 border-gray-300','bg-gray-800 text-gray-200 border-gray-600')}`}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className={`px-2 sm:px-3 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${tv(isDark,'bg-blue-100 text-blue-700 hover:bg-blue-200','bg-blue-900 text-blue-300 hover:bg-blue-800')}`}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Barra de botones de acción en la parte inferior */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-b-xl ${tv(isDark,'bg-gray-800','bg-gray-900')}`}>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={onToggleValidate}
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${tv(isDark,'bg-blue-500 text-white hover:bg-blue-600','bg-blue-600 text-white hover:bg-blue-700')}`}
          >
            ✅ Validada
          </button>
          
          <button
            onClick={onEdit}
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${tv(isDark,'bg-orange-500 text-white hover:bg-orange-600','bg-orange-600 text-white hover:bg-orange-700')}`}
          >
            ✏️ Editar
          </button>
          
          <button
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${tv(isDark,'bg-green-500 text-white hover:bg-green-600','bg-green-600 text-white hover:bg-green-700')}`}
          >
            📅 Recordatorio
          </button>
          
          <button
            onClick={onDelete}
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${tv(isDark,'bg-red-500 text-white hover:bg-red-600','bg-red-600 text-white hover:bg-red-700')}`}
          >
            🗑️ Eliminar
          </button>
        </div>
        
        <div className={`text-xs sm:text-sm font-semibold ${tv(isDark,'text-gray-300','text-gray-400')}`}>
          {status}
        </div>
      </div>
    </details>
  );
}