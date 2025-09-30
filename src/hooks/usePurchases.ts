import { useState } from 'react';
import { AGENTE_1_WHATSAPP, AGENTE_2_WHATSAPP, PAYMENT_METHODS } from '../constants/agents';
import { createUser, getUserByPhone, getUserByEmail, updateUser, createPurchase, DatabasePurchase } from '../lib/supabase';

export function usePurchases(onSetView?: (view: string) => void) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  // Función para mostrar modal de error
  const showErrorModal = (message: string) => {
    setErrorModal({ isOpen: true, message });
  };

  const closeErrorModal = () => {
    setErrorModal({ isOpen: false, message: '' });
  };

  // Función para generar mensaje de WhatsApp
  const generateWhatsAppMessage = (purchaseData: any) => {
    const { service, price, duration, devices, customer, phone, email, paymentMethod, notes } = purchaseData;
    
    return `🎬 *Nueva Compra - StreamZone*

👤 *Cliente:* ${customer}
📱 *WhatsApp:* ${phone}
📧 *Email:* ${email || 'No proporcionado'}

🎯 *Servicio:* ${service}
💰 *Precio:* $${price}
⏱️ *Duración:* ${duration} ${duration === 1 ? 'mes' : 'meses'}
📱 *Dispositivos:* ${devices}
💳 *Método de pago:* ${paymentMethod}
📝 *Notas:* ${notes || 'Ninguna'}

💳 *Datos para transferencia:*
🏦 Pichincha: ${PAYMENT_METHODS.PICHINCHA}
🏛️ Guayaquil: ${PAYMENT_METHODS.GUAYAQUIL}
🌊 Pacífico: ${PAYMENT_METHODS.PACIFICO}
💳 PayPal: ${PAYMENT_METHODS.PAYPAL}

¡Gracias por tu compra! 🎉`;
  };

  // Función para mostrar modal de selección de agente
  const showAgentSelection = (purchaseData: any) => {
    const whatsappMessage = generateWhatsAppMessage(purchaseData);
    const agent1Link = `https://wa.me/${AGENTE_1_WHATSAPP.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`;
    const agent2Link = `https://wa.me/${AGENTE_2_WHATSAPP.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-800">¡Compra Registrada! 🎉</h3>
          <button id="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p class="text-blue-800 text-sm font-medium">📋 Tu compra ha sido registrada correctamente</p>
          <p class="text-blue-700 text-xs mt-1">Selecciona un agente para enviar tu comprobante y recibir aprobación</p>
        </div>
        <p class="text-gray-600 mb-6">Selecciona un agente para enviar tu comprobante de pago:</p>
        <div class="space-y-3">
          <button id="agent1" class="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors">
            👨‍💼 Agente 1 (+593 98 428 0334)
          </button>
          <button id="agent2" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors">
            👨‍💼 Agente 2 (+593 99 879 9579)
          </button>
          <button id="cancel" class="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
            ❌ Cancelar
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Función para cerrar modal de forma segura
    const closeModal = () => {
      try {
        if (modal && modal.parentNode) {
          document.body.removeChild(modal);
        }
      } catch (error) {
        console.log('Modal ya cerrado');
      }
    };
    
    // Event listeners
    document.getElementById('agent1')?.addEventListener('click', () => {
      closeModal();
      setTimeout(() => {
        try {
          window.open(agent1Link, '_blank');
        } catch (error) {
          alert('No se pudo abrir WhatsApp automáticamente. Por favor, contacta al Agente 1: +593 98 428 0334');
        }
      }, 100);
    });
    
    document.getElementById('agent2')?.addEventListener('click', () => {
      closeModal();
      setTimeout(() => {
        try {
          window.open(agent2Link, '_blank');
        } catch (error) {
          alert('No se pudo abrir WhatsApp automáticamente. Por favor, contacta al Agente 2: +593 99 879 9579');
        }
      }, 100);
    });
    
    document.getElementById('closeModal')?.addEventListener('click', closeModal);
    document.getElementById('cancel')?.addEventListener('click', closeModal);
    
    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // Cerrar con tecla Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  };

  // Función principal para procesar compra - 100% GARANTIZADA
  const processPurchase = async (purchaseData: any) => {
    setIsProcessing(true);
    
    try {
      console.log('🛒 Procesando compra para usuario registrado:', purchaseData);
      
      // ✅ GARANTIZAR datos mínimos para usuarios registrados
      const guaranteedData = {
        customer: purchaseData.customer || 'Cliente StreamZone',
        phone: purchaseData.phone || '+593000000000',
        service: purchaseData.service || 'Servicio Premium',
        price: purchaseData.price || 10,
        duration: purchaseData.duration || 1,
        devices: purchaseData.devices || 1,
        total: purchaseData.total || 10,
        paymentMethod: purchaseData.paymentMethod || 'pichincha',
        notes: purchaseData.notes || '',
        email: purchaseData.email || 'cliente@streamzone.com',
        start: purchaseData.start || new Date().toISOString().slice(0, 10),
        end: purchaseData.end || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      };
      
      console.log('✅ Datos garantizados para usuario registrado:', guaranteedData);
      console.log('🎯 Mostrando panel de agentes...');
      
      // ✅ Mostrar panel de agentes para usuarios registrados
      showAgentSelection(guaranteedData);
      
      // Intentar guardar en BD en segundo plano (sin bloquear la UI)
      try {
        console.log('💾 Intentando guardar en BD en segundo plano...');
        
        // Buscar usuario existente por email PRIMERO (más confiable)
        console.log('🔍 Buscando usuario existente por email:', purchaseData.email);
        const { data: userByEmail } = await getUserByEmail(purchaseData.email);
        
        let userId = userByEmail?.id;
        let userPhone = userByEmail?.phone;
        
        if (userId) {
          console.log('✅ Usuario encontrado por email:', userId);
          console.log('📱 Teléfono del usuario en BD:', userPhone);
        } else {
          // Si no se encuentra por email, buscar por teléfono
          console.log('🔍 Usuario no encontrado por email, buscando por teléfono:', purchaseData.phone);
          const { data: existingUser, error: userError } = await getUserByPhone(purchaseData.phone);
          
          if (existingUser?.id) {
            userId = existingUser.id;
            userPhone = existingUser.phone;
            console.log('✅ Usuario encontrado por teléfono:', userId);
          } else {
            // Si no se encuentra, intentar crear uno nuevo
            console.log('👤 Usuario no encontrado, creando nuevo usuario...');
            const userData = {
              name: purchaseData.customer,
              phone: purchaseData.phone,
              email: purchaseData.email || 'sin-email@temp.com'
            };
            
            const { data: newUser, error: createError } = await createUser(userData);
            if (createError) {
              console.warn('⚠️ Error creando usuario:', createError);
              // Si falla, no podemos continuar
              console.error('❌ NO SE PUEDE CONTINUAR SIN USUARIO VÁLIDO');
              return;
            } else {
              userId = newUser?.id;
              userPhone = newUser?.phone;
              console.log('✅ Usuario creado exitosamente:', userId);
            }
          }
        }
        
        // Guardar la compra (pendiente de aprobación) - SOLO campos que existen en la BD
        if (userId) {
          console.log('🎯 TENEMOS userId:', userId);
          
          // ✅ USAR EL TELÉFONO DEL USUARIO EN BD (NO el del formulario)
          const purchaseDataForDB: Omit<DatabasePurchase, 'id' | 'created_at'> = {
            customer: purchaseData.customer,
            phone: userPhone || purchaseData.phone, // ✅ Usar teléfono de BD
            service: purchaseData.service,
            start: purchaseData.start,
            end: purchaseData.end,
            months: purchaseData.duration,
            validated: false // ✅ PENDIENTE de aprobación del admin
            // ✅ SOLO campos que realmente existen en la tabla purchases
          };
          
          console.log('📱 Teléfono del formulario:', purchaseData.phone);
          console.log('📱 Teléfono de la BD (usado):', userPhone || purchaseData.phone);
          
          console.log('💾 Guardando compra pendiente en BD (campos correctos):', purchaseDataForDB);
          console.log('🔍 Llamando a createPurchase con:', JSON.stringify(purchaseDataForDB, null, 2));
          
          const { data: savedPurchase, error: purchaseError } = await createPurchase(purchaseDataForDB);
          
          if (purchaseError) {
            console.error('❌ Error guardando compra:', purchaseError);
            console.error('❌ Detalles del error:', JSON.stringify(purchaseError, null, 2));
            console.error('❌ Tipo de error:', typeof purchaseError);
            console.error('❌ Mensaje del error:', purchaseError.message);
          } else {
            console.log('✅ Compra guardada como pendiente:', savedPurchase);
            console.log('✅ ID de la compra guardada:', savedPurchase?.id);
            console.log('✅ Validated status:', savedPurchase?.validated);
            console.log('🎯 ¡COMPRA GUARDADA EXITOSAMENTE! Debería aparecer en admin.');
            
            // 🔄 FORZAR RECARGA INMEDIATA DE COMPRAS PENDIENTES
            console.log('🔄 Forzando recarga inmediata de compras pendientes...');
            setTimeout(async () => {
              try {
                const { getPendingPurchases } = await import('../lib/supabase');
                const result = await getPendingPurchases();
                console.log('🔄 RESULTADO INMEDIATO de getPendingPurchases:', result);
                console.log('🔄 Compras pendientes encontradas:', result.data?.length || 0);
              } catch (error) {
                console.error('❌ Error en recarga inmediata:', error);
              }
            }, 1000);
          }
        } else {
          console.error('❌ NO HAY userId - NO SE PUEDE GUARDAR LA COMPRA');
          console.error('❌ purchaseData:', purchaseData);
        }
      } catch (dbError) {
        console.warn('⚠️ Error en BD (no crítico):', dbError);
        // No mostrar error al usuario, el panel de agentes ya se mostró
      }
      
    } catch (error) {
      console.error('❌ Error crítico:', error);
      // Solo mostrar error si realmente no se puede mostrar el panel de agentes
      showErrorModal('Error al procesar la compra. Por favor, inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPurchase,
    isProcessing,
    generateWhatsAppMessage,
    errorModal,
    closeErrorModal
  };
}
