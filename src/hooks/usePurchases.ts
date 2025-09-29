import { useState } from 'react';
import { AGENTE_1_WHATSAPP, AGENTE_2_WHATSAPP, PAYMENT_METHODS } from '../constants/agents';
import { createUser, getUserByPhone, updateUser, createPurchase, DatabasePurchase } from '../lib/supabase';

export function usePurchases() {
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
          <h3 class="text-xl font-bold text-gray-800">¡Compra Exitosa! 🎉</h3>
          <button id="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
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

  // Función principal para procesar compra - SIMPLIFICADA
  const processPurchase = async (purchaseData: any) => {
    setIsProcessing(true);
    
    try {
      console.log('🛒 Procesando compra de forma simplificada:', purchaseData);
      
      // Validaciones básicas
      if (!purchaseData.customer || !purchaseData.phone || !purchaseData.service) {
        throw new Error('Faltan datos obligatorios para procesar la compra');
      }
      
      console.log('✅ Validaciones básicas pasadas');
      
      // Intentar guardar en Supabase (opcional, no crítico)
      try {
        console.log('💾 Intentando guardar en Supabase (opcional)...');
        
        // Buscar usuario existente
        const { data: existingUser } = await getUserByPhone(purchaseData.phone);
        let userId = existingUser?.id;
        
        // Si no existe usuario, crear uno simple
        if (!userId) {
          const userData = {
            name: purchaseData.customer,
            phone: purchaseData.phone,
            email: purchaseData.email || 'sin-email@temp.com'
          };
          
          const { data: newUser } = await createUser(userData);
          userId = newUser?.id;
        }
        
        // Si tenemos userId, guardar la compra
        if (userId) {
          const purchaseDataForDB: Omit<DatabasePurchase, 'id' | 'created_at'> = {
            customer: purchaseData.customer,
            phone: purchaseData.phone,
            service: purchaseData.service,
            start: purchaseData.start,
            end: purchaseData.end,
            months: purchaseData.duration,
            validated: false,
            service_email: undefined,
            service_password: undefined,
            admin_notes: purchaseData.notes || '',
            approved_by: undefined,
            approved_at: undefined,
            auto_renewal: false,
            renewal_reminder_sent: false,
            renewal_attempts: 0,
            last_renewal_attempt: undefined,
            renewal_status: 'none',
            original_purchase_id: undefined,
            is_renewal: false
          };
          
          await createPurchase(purchaseDataForDB);
          console.log('✅ Compra guardada en Supabase');
        }
      } catch (dbError) {
        console.warn('⚠️ Error guardando en BD (no crítico):', dbError);
        // No lanzar error, continuar con el proceso
      }
      
      // SIEMPRE mostrar el panel de agentes, independientemente de la BD
      console.log('🎉 Mostrando panel de agentes...');
      showAgentSelection(purchaseData);
      
    } catch (error) {
      console.error('❌ Error crítico:', error);
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
