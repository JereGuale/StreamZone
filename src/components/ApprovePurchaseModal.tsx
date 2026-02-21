import React, { useState } from 'react';
import { tv, formatPhoneForWhatsApp } from '../utils/helpers';
import { approvePurchase } from '../lib/supabase';

interface ApprovePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: any;
  isDark: boolean;
  onApprove: () => void;
  onUpdatePurchase?: (purchaseId: string, updates: any) => void;
}

export function ApprovePurchaseModal({ isOpen, onClose, purchase, isDark, onApprove, onUpdatePurchase }: ApprovePurchaseModalProps) {
  // Detectar si es un combo y qué servicios incluye - FORZAR DETECCIÓN
  const serviceName = purchase?.service || '';
  console.log('🔍 DEBUGGING - Servicio completo:', serviceName);
  
  // Servicios individuales que NO deben ser detectados como combos (incluso si tienen "+" en el nombre)
  const trimmedName = serviceName.trim();
  
  // Verificar si contiene "Disney" y alguna variante de Standard/Estándar/Premium
  const isDisneyService = /Disney/i.test(trimmedName) && 
                         /(Standard|Estándar|Premium)/i.test(trimmedName);
  
  // Verificar que NO contenga otros servicios (Netflix, Max, Prime, etc.)
  const hasOtherServices = trimmedName.includes('Netflix') || 
                          trimmedName.includes('Max') || 
                          trimmedName.includes('Prime') || 
                          trimmedName.includes('Spotify') || 
                          trimmedName.includes('Paramount');
  
  // Verificar si tiene " + " (con espacios alrededor) que separa servicios REALES
  // NO confundir con el "+" en "Disney+" que es parte del nombre del servicio
  const hasRealServiceSeparator = /\s+\+\s+/.test(trimmedName);
  
  // Es servicio individual de Disney si:
  // 1. Contiene "Disney" y "Standard/Estándar/Premium"
  // 2. NO contiene otros servicios
  // 3. NO tiene " + " que separa servicios múltiples (solo puede tener "+ " que es parte del nombre)
  const isIndividualService = isDisneyService && !hasOtherServices && !hasRealServiceSeparator;
  
  // Es combo solo si contiene " + " (con espacios alrededor) que separa servicios MÚLTIPLES
  // Y NO es un servicio individual de Disney
  const isCombo = hasRealServiceSeparator && !isIndividualService;
  
  console.log('🔍 DEBUGGING - Servicio:', serviceName);
  console.log('🔍 DEBUGGING - Es servicio Disney?:', isDisneyService);
  console.log('🔍 DEBUGGING - Tiene otros servicios?:', hasOtherServices);
  console.log('🔍 DEBUGGING - Tiene separador real?:', hasRealServiceSeparator);
  console.log('🔍 DEBUGGING - Es servicio individual?:', isIndividualService);
  console.log('🔍 DEBUGGING - Es combo?:', isCombo);
  
  // DETECTAR TODOS LOS COMBOS POSIBLES
  let services = [serviceName];
  if (isCombo) {
    if (serviceName.includes('Netflix') && serviceName.includes('Disney')) {
      services = ['Netflix', serviceName.includes('Premium') ? 'Disney+ Premium' : 'Disney+ Estándar'];
    } else if (serviceName.includes('Max') && serviceName.includes('Prime')) {
      services = ['Max', 'Prime Video'];
    } else if (serviceName.includes('Netflix') && serviceName.includes('Max')) {
      services = ['Netflix', 'Max'];
    } else if (serviceName.includes('Netflix') && serviceName.includes('Prime')) {
      services = ['Netflix', 'Prime Video'];
    } else if (serviceName.includes('Prime') && serviceName.includes('Disney')) {
      services = ['Prime Video', serviceName.includes('Premium') ? 'Disney+ Premium' : 'Disney+ Estándar'];
    } else if (serviceName.includes('Disney') && serviceName.includes('Max')) {
      services = [serviceName.includes('Premium') ? 'Disney+ Premium' : 'Disney+ Estándar', 'Max'];
    } else if (serviceName.includes('Spotify') && serviceName.includes('Netflix')) {
      services = ['Spotify', 'Netflix'];
    } else if (serviceName.includes('Spotify') && serviceName.includes('Disney')) {
      services = ['Spotify', serviceName.includes('Premium') ? 'Disney+ Premium' : 'Disney+ Estándar'];
    } else if (serviceName.includes('Spotify') && serviceName.includes('Prime')) {
      services = ['Spotify', 'Prime Video'];
    } else if (serviceName.includes('Paramount') && serviceName.includes('Max') && serviceName.includes('Prime')) {
      services = ['Paramount+', 'Max', 'Prime Video'];
    } else if (serviceName.includes('Netflix') && serviceName.includes('Max') && serviceName.includes('Disney')) {
      // Mega combo
      services = ['Netflix', 'Max', serviceName.includes('Premium') ? 'Disney+ Premium' : 'Disney+ Estándar', 'Prime Video', 'Paramount+'];
    } else {
      // Fallback: split por + y limpiar
      services = serviceName.split(/\s*\+\s*/).map(s => s.trim()).filter(s => s.length > 0);
    }
    console.log('🎯 COMBO DETECTADO - Servicios separados:', services);
  }
  
  console.log('🎯 FINAL - isCombo:', isCombo, 'services:', services);
  
  const [serviceCredentials, setServiceCredentials] = useState({
    email: '',
    password: '',
    notes: ''
  });
  
  // Para combos, manejar múltiples credenciales
  const [multiCredentials, setMultiCredentials] = useState<{[key: string]: {email: string, password: string}}>({});
  
  const [loading, setLoading] = useState(false);

  if (!isOpen || !purchase) return null;

  const handleWhatsApp = () => {
    const message = `★ STREAMZONE ★

🎉 ¡COMPRA APROBADA! 🎉

★ ¡HOLA ${purchase.customer.toUpperCase()}! ★

🎉 ¡FELICIDADES! 🎉
Tu compra de ${purchase.service} ha sido aprobada exitosamente

>>> DETALLES DE TU COMPRA <<<
📱 Servicio: ${purchase.service}
📅 Duración: ${purchase.months} meses
💰 Estado: ACTIVO ✓

★ Puedes ver todos los detalles en nuestra página web ★

>>> BENEFICIOS QUE OBTIENES <<<
✓ Acceso inmediato al servicio
✓ Soporte técnico 24/7
✓ Actualizaciones automáticas
✓ Calidad premium garantizada

★ ¡Tu recomendación nos ayuda a crecer! ★
✓ ¡Muchas gracias por confiar en StreamZone! ✓

★ ¡DISFRUTA TU ENTRETENIMIENTO! ★`;

    const phoneNumber = formatPhoneForWhatsApp(purchase.phone);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleApprove = async () => {
    console.log('🚀 ===== INICIANDO APROBACIÓN DE COMPRA =====');
    console.log('📋 purchase:', purchase);
    console.log('📋 isCombo:', isCombo);
    console.log('📋 services:', services);
    console.log('📋 serviceCredentials:', serviceCredentials);
    console.log('📋 multiCredentials:', multiCredentials);
    console.log('📋 onApprove function:', onApprove);
    console.log('📋 onUpdatePurchase function:', onUpdatePurchase);
    
    // Validar credenciales según si es combo o no
    if (isCombo) {
      // Para combos, verificar que todos los servicios tengan credenciales
      const missingCredentials = services.some(service => 
        !multiCredentials[service]?.email || !multiCredentials[service]?.password
      );
      if (missingCredentials) {
        alert('Por favor completa el email y contraseña para todos los servicios del combo');
        return;
      }
    } else {
      // Para servicios individuales
      if (!serviceCredentials.email || !serviceCredentials.password) {
        alert('Por favor completa el email y contraseña del servicio');
        return;
      }
    }

    setLoading(true);
    try {
      // Preparar credenciales según si es combo o no
      let emailToSave, passwordToSave, notesToSave;
      
      if (isCombo) {
        // Para combos, concatenar todas las credenciales
        const credentialsText = services.map(service => {
          const creds = multiCredentials[service];
          return `${service}:\nEmail: ${creds.email}\nContraseña: ${creds.password}`;
        }).join('\n\n');
        
        emailToSave = `COMBO: ${services.join(' + ')}`;
        passwordToSave = credentialsText;
        notesToSave = serviceCredentials.notes;
      } else {
        // Para servicios individuales
        emailToSave = serviceCredentials.email;
        passwordToSave = serviceCredentials.password;
        notesToSave = serviceCredentials.notes;
      }
      
      console.log('🔄 Modal: Iniciando aprobación...', {
        purchaseId: purchase.id,
        isCombo,
        emailToSave,
        passwordToSave: passwordToSave ? '***' : 'undefined',
        notesToSave
      });

      // Usar la función original approvePurchase
      const result = await approvePurchase(
        purchase.id,
        emailToSave,
        passwordToSave,
        notesToSave,
        'admin' // Por ahora hardcodeado
      );

      console.log('📋 Modal: Resultado de approvePurchase:', result);

      if (result.data) {
        console.log('✅ Modal: Compra aprobada en Supabase, actualizando estado local...');
        // Actualizar estado local inmediatamente (como en el original)
        if (onUpdatePurchase) {
          onUpdatePurchase(purchase.id, {
            validated: true,
            service_email: emailToSave,
            service_password: passwordToSave,
            admin_notes: notesToSave
          });
        }

        console.log('✅ Compra guardada en la base de datos exitosamente');
        
        // 🔄 ACTUALIZAR ESTADO LOCAL PRIMERO (SIN ESPERAR)
        console.log('🔄 Actualizando estado local inmediatamente...');
        if (onUpdatePurchase) {
          onUpdatePurchase(purchase.id, {
            validated: true,
            service_email: emailToSave,
            service_password: passwordToSave,
            admin_notes: notesToSave
          });
        }
        
        // 🔄 LLAMAR A onApprove PARA RECARGAR DATOS
        console.log('🔄 Llamando a onApprove para recargar datos...');
        await onApprove();
        
        // ⏳ ESPERAR UN MOMENTO ANTES DE CERRAR EL MODAL
        setTimeout(() => {
          console.log('🔄 Cerrando modal después de actualización...');
          onClose();
          setServiceCredentials({ email: '', password: '', notes: '' });
          setMultiCredentials({});
        }, 500);
        
        alert('✅ Compra aprobada y actualizada correctamente');
      } else {
        throw new Error('No se pudo guardar en la base de datos');
      }
    } catch (error) {
      console.error('Error aprobando compra:', error);
      alert('❌ Error al guardar en la base de datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${tv(isDark,'bg-white','bg-gray-900')}`} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div className={`relative p-6 border-b-2 ${tv(isDark,'bg-gray-50 border-gray-200','bg-gray-800 border-gray-700')}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-2xl font-bold ${tv(isDark,'text-gray-900','text-white')}`}>Aprobar Compra</h3>
            <button 
              onClick={onClose} 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xl font-bold transition-all ${tv(isDark,'text-gray-500 hover:bg-gray-100','text-gray-400 hover:bg-gray-700')}`}
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <form className="space-y-6">
            {/* Información del cliente */}
            <div className={`p-6 rounded-xl border-2 ${tv(isDark,'bg-gray-50 border-gray-200','bg-gray-800 border-gray-700')}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className={`text-xl font-bold ${tv(isDark,'text-gray-900','text-white')}`}>{purchase.customer}</h4>
                  <p className={`text-lg font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    {purchase.service} • {purchase.months} {purchase.months === 1 ? 'mes' : 'meses'}
                  </p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${tv(isDark,'bg-blue-100','bg-blue-900/30')}`}>
                  <span className="text-lg">📱</span>
                  <span className={`font-semibold ${tv(isDark,'text-blue-800','text-blue-200')}`}>{purchase.phone}</span>
                </div>
              </div>
            </div>

            {/* Credenciales del servicio */}
            <div className={`p-6 rounded-xl border-2 ${tv(isDark,'bg-purple-50 border-purple-200','bg-purple-900/20 border-purple-700')}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tv(isDark,'bg-yellow-100','bg-yellow-900/30')}`}>
                  🔑
                </div>
                <h4 className={`text-xl font-bold ${tv(isDark,'text-gray-900','text-white')}`}>Credenciales del Servicio</h4>
              </div>
              
              {isCombo ? (
                <div className="space-y-4">
                  <div className={`p-3 rounded-lg ${tv(isDark,'bg-orange-50 border border-orange-200','bg-orange-900/20 border border-orange-600')}`}>
                    <p className={`text-sm font-semibold ${tv(isDark,'text-orange-800','text-orange-300')}`}>
                      🎁 Combo detectado: Ingresa las credenciales para cada servicio
                    </p>
                  </div>
                  {services.map((service, index) => (
                    <div key={service} className={`p-4 rounded-lg border ${tv(isDark,'bg-gray-50 border-gray-200','bg-gray-800 border-gray-600')}`}>
                      <h5 className={`text-lg font-bold mb-3 ${tv(isDark,'text-gray-800','text-white')}`}>
                        {service} {index === 0 ? '🎬' : index === 1 ? '🎭' : index === 2 ? '🎪' : '🎯'}
                      </h5>
                      
                      <div className="space-y-3">
                        <div>
                          <label className={`block text-sm font-bold mb-2 ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                            📧 Email del {service}
                          </label>
                          <input
                            type="email"
                            value={multiCredentials[service]?.email || ''}
                            onChange={(e) => setMultiCredentials(prev => ({
                              ...prev,
                              [service]: { ...prev[service], email: e.target.value, password: prev[service]?.password || '' }
                            }))}
                            className={`w-full rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500','border-gray-600 bg-gray-700 text-white focus:border-blue-400')}`}
                            placeholder={`usuario@${service.toLowerCase().replace(/[^a-z]/g, '')}.com`}
                          />
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-bold mb-2 ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                            🔑 Contraseña del {service}
                          </label>
                          <input
                            type="password"
                            value={multiCredentials[service]?.password || ''}
                            onChange={(e) => setMultiCredentials(prev => ({
                              ...prev,
                              [service]: { ...prev[service], password: e.target.value, email: prev[service]?.email || '' }
                            }))}
                            className={`w-full rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-amber-500','border-gray-600 bg-gray-700 text-white focus:border-amber-400')}`}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className={`block text-sm font-bold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                      Email del servicio *
                    </label>
                    <input
                      type="email"
                      value={serviceCredentials.email}
                      onChange={(e) => setServiceCredentials(prev => ({...prev, email: e.target.value}))}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200','border-gray-600 bg-gray-700 text-white focus:border-purple-400 focus:ring-purple-800/30')}`}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className={`block text-sm font-bold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                      Contraseña del servicio *
                    </label>
                    <input
                      type="text"
                      value={serviceCredentials.password}
                      onChange={(e) => setServiceCredentials(prev => ({...prev, password: e.target.value}))}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200','border-gray-600 bg-gray-700 text-white focus:border-purple-400 focus:ring-purple-800/30')}`}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Información importante del administrador */}
            <div className={`p-6 rounded-xl border-2 ${tv(isDark,'bg-gray-50 border-gray-200','bg-gray-800 border-gray-700')}`}>
              <h4 className={`text-lg font-bold mb-4 ${tv(isDark,'text-gray-900','text-white')}`}>Información Importante</h4>
              <textarea
                value={serviceCredentials.notes}
                onChange={(e) => setServiceCredentials(prev => ({...prev, notes: e.target.value}))}
                placeholder="Notas adicionales sobre esta compra..."
                className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 resize-none ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-gray-500 focus:ring-gray-200','border-gray-600 bg-gray-700 text-white focus:border-gray-400 focus:ring-gray-800/30')}`}
                rows={3}
              />
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button 
                onClick={onClose}
                className={`w-full sm:flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105 ${tv(isDark,'bg-gray-200 text-gray-700 hover:bg-gray-300','bg-gray-700 text-gray-200 hover:bg-gray-600')}`}
              >
                Cancelar
              </button>
              
              <button 
                onClick={handleWhatsApp}
                disabled={isCombo ? 
                  services.some(service => !multiCredentials[service]?.email || !multiCredentials[service]?.password) :
                  (!serviceCredentials.email || !serviceCredentials.password)
                }
                className={`w-full sm:flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${tv(isDark,'bg-green-500 text-white hover:bg-green-600','bg-green-600 text-white hover:bg-green-700')}`}
              >
                <span className="text-lg">📱</span>
                <span className="truncate">Enviar por WhatsApp</span>
              </button>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🚀 BOTÓN APROBAR CLICKEADO');
                  console.log('🔍 loading:', loading);
                  console.log('🔍 serviceCredentials:', serviceCredentials);
                  handleApprove();
                }}
                disabled={loading || (isCombo ? 
                  services.some(service => !multiCredentials[service]?.email || !multiCredentials[service]?.password) :
                  (!serviceCredentials.email || !serviceCredentials.password)
                )}
                className={`w-full sm:flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${tv(isDark,'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl','bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 shadow-lg hover:shadow-xl')}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="truncate">Aprobando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>✅</span>
                    <span className="truncate">Aprobar Compra</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
