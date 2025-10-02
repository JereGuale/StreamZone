import { useState } from 'react';
import { DatabasePurchase, updatePurchase } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface AdminUser {
  email: string;
  role: 'principal' | 'secundario';
  canGenerateKeys: boolean;
  canDeleteOthers: boolean;
  isProtected: boolean;
}

const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    email: 'gualejeremi@gmail.com',
    role: 'principal',
    canGenerateKeys: false,
    canDeleteOthers: true,
    isProtected: true
  }
];

export const useAdmin = (purchases: any[] = [], setPurchases: (purchases: any[] | ((prev: any[]) => any[])) => void, refreshFromSupabase?: () => Promise<void>) => {
  const [adminUsers, setAdminUsers] = useState(DEFAULT_ADMIN_USERS);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  
  // Estados de admin
  const [adminView, setAdminView] = useState('dashboard');
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  
  // Estados de modales
  const [adminRegisterPurchaseOpen, setAdminRegisterPurchaseOpen] = useState(false);
  const [editPurchaseOpen, setEditPurchaseOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<DatabasePurchase | null>(null);
  const [approvePurchaseOpen, setApprovePurchaseOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<DatabasePurchase | null>(null);
  
  // Lista de emails para compatibilidad con login
  const adminEmails = adminUsers.map(user => user.email);
  
  const handleToggleValidate = async (purchaseId: string) => {
    console.log('🔍 handleToggleValidate called with ID:', purchaseId);
    console.log('📦 Current purchases:', purchases);
    
    const purchase = purchases.find(p => p.id === purchaseId);
    console.log('🎯 Found purchase:', purchase);
    
    if (!purchase) {
      console.log('❌ Purchase not found');
      return;
    }

    // Si es una compra pendiente, abrir modal de aprobación
    if (!purchase.validated) {
      setSelectedPurchase(purchase);
      setApprovePurchaseOpen(true);
      return;
    }

    // Si es una compra activa, invalidar directamente
    const action = 'invalidar';
    
    console.log('🔄 Invalidating purchase:', purchaseId);
    
    // Verificar conexión a Supabase
    if (!supabase) {
      console.error('❌ Supabase no está configurado');
      setMsg('❌ Error: Base de datos no disponible');
      setTimeout(() => setMsg(''), 3000);
      return;
    }
    
    if (!confirm(`¿Estás seguro de que quieres ${action} la compra de ${purchase.customer} - ${purchase.service}?`)) {
      console.log('❌ User cancelled');
      return;
    }

    setLoading(true);
    try {
      // Actualizar en Supabase
      console.log('🔄 Actualizando en Supabase...', { purchaseId, validated: false });
      const { error } = await supabase
        .from('purchases')
        .update({ validated: false })
        .eq('id', purchaseId);

      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw error;
      }
      
      console.log('✅ Actualización en Supabase exitosa');

      // Actualizar estado local
      setPurchases(prev => 
        prev.map(p => 
          p.id === purchaseId 
            ? { ...p, validated: false }
            : p
        )
      );

      setMsg(`✅ Compra invalidada exitosamente`);
      setTimeout(() => setMsg(''), 3000);
      
      // Recargar desde Supabase para asegurar sincronización
      if (refreshFromSupabase) {
        console.log('🔄 Recargando datos desde Supabase...');
        await refreshFromSupabase();
      }
    } catch (error) {
      console.error('Error al actualizar compra:', error);
      setMsg('❌ Error al actualizar la compra');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeletePurchase = async (purchaseId: string) => {
    console.log('🗑️ handleDeletePurchase called with ID:', purchaseId);
    console.log('📦 Current purchases:', purchases);
    
    const purchase = purchases.find(p => p.id === purchaseId);
    console.log('🎯 Found purchase:', purchase);
    
    if (!purchase) {
      console.log('❌ Purchase not found');
      return;
    }

    const action = purchase.validated ? 'ELIMINAR PERMANENTEMENTE' : 'rechazar';
    const warning = purchase.validated 
      ? `⚠️ ADVERTENCIA: ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE la compra activa de ${purchase.customer} - ${purchase.service}?\n\nEsta acción:\n• Eliminará la compra de la base de datos\n• El cliente perderá acceso al servicio\n• NO se puede deshacer\n\nEscribe "ELIMINAR" para confirmar:`
      : `¿Estás seguro de que quieres rechazar la compra de ${purchase.customer} - ${purchase.service}?`;

    if (!confirm(warning)) {
      return;
    }

    // Verificar conexión a Supabase
    if (!supabase) {
      console.error('❌ Supabase no está configurado');
      setMsg('❌ Error: Base de datos no disponible');
      setTimeout(() => setMsg(''), 3000);
      return;
    }

    // Verificación adicional para compras activas
    if (purchase.validated) {
      const confirmation = prompt('Para confirmar la eliminación, escribe exactamente: ELIMINAR');
      if (confirmation !== 'ELIMINAR') {
        alert('❌ Eliminación cancelada. Debes escribir "ELIMINAR" para confirmar.');
        return;
      }
    }

    setLoading(true);
    try {
      // Eliminar de Supabase
      console.log('🗑️ Eliminando de Supabase...', { purchaseId });
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', purchaseId);

      if (error) {
        console.error('❌ Error de Supabase:', error);
        throw error;
      }
      
      console.log('✅ Eliminación en Supabase exitosa');

      // Actualizar estado local
      setPurchases(prev => prev.filter(p => p.id !== purchaseId));

      setMsg(`✅ Compra ${purchase.validated ? 'eliminada' : 'rechazada'} exitosamente`);
      setTimeout(() => setMsg(''), 3000);
      
      // Recargar desde Supabase para asegurar sincronización
      if (refreshFromSupabase) {
        console.log('🔄 Recargando datos desde Supabase...');
        await refreshFromSupabase();
      }
    } catch (error) {
      console.error('Error al eliminar compra:', error);
      setMsg('❌ Error al eliminar la compra');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditPurchase = (purchase: DatabasePurchase) => {
    setEditingPurchase(purchase);
    setEditPurchaseOpen(true);
  };

  const handleReminderPurchase = (purchase: DatabasePurchase) => {
    // Calcular días restantes
    const today = new Date();
    const endDate = new Date(purchase.end);
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Crear mensaje formal y conciso con emojis
    let message = `🎬 *StreamZone* - Renovación de Servicio\n\n`;
    message += `Estimado/a ${purchase.customer},\n\n`;
    
    if (daysLeft <= 0) {
      message += `⚠️ Su servicio *${purchase.service}* venció el ${purchase.end}.\n\n`;
      message += `🔄 Para reactivar su cuenta, responda este mensaje.\n\n`;
    } else if (daysLeft === 1) {
      message += `⏰ Su servicio *${purchase.service}* vence mañana (${purchase.end}).\n\n`;
      message += `🔄 Renueve ahora para evitar interrupciones.\n\n`;
    } else if (daysLeft <= 3) {
      message += `📅 Su servicio *${purchase.service}* vence en ${daysLeft} días (${purchase.end}).\n\n`;
      message += `🔄 Renueve con anticipación para continuar sin interrupciones.\n\n`;
    } else {
      message += `📋 Recordatorio: Su servicio *${purchase.service}* vence en ${daysLeft} días (${purchase.end}).\n\n`;
      message += `🔄 Puede renovar cuando guste respondiendo este mensaje.\n\n`;
    }
    
    message += `💬 Responda para proceder con la renovación.\n\n`;
    message += `Atentamente,\n*Equipo StreamZone* 🎯`;
    
    // Crear URL de WhatsApp
    const phoneNumber = purchase.phone.replace(/[^\d]/g, '');
    const whatsappUrl = `https://wa.me/593${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Abrir WhatsApp
    try {
      window.open(whatsappUrl, '_blank');
      setMsg(`📱 Recordatorio enviado a ${purchase.customer} (${purchase.phone})`);
      setTimeout(() => setMsg(''), 5000);
    } catch (error) {
      console.error('Error abriendo WhatsApp:', error);
      setMsg('❌ Error al abrir WhatsApp. Por favor, contacta manualmente.');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleApproveSuccess = async () => {
    console.log('🎉 handleApproveSuccess called');
    console.log('🎯 selectedPurchase:', selectedPurchase);
    
    // 🔄 ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE
    console.log('🔄 Actualizando estado local inmediatamente...');
    setPurchases(prev => {
      const updated = prev.map(p => 
        p.id === selectedPurchase?.id 
          ? { ...p, validated: true }
          : p
      );
      console.log('📋 Estado actualizado:', updated);
      return updated;
    });
    
    // 🔄 FORZAR RE-RENDER INMEDIATO
    console.log('🔄 Forzando re-render del componente...');
    
    // Recargar desde Supabase para asegurar sincronización
    if (refreshFromSupabase) {
      console.log('🔄 Recargando datos desde Supabase después de aprobación...');
      try {
        await refreshFromSupabase();
        console.log('✅ Datos recargados exitosamente desde Supabase');
        
        // Forzar recarga de compras del usuario si hay una compra seleccionada
        if (selectedPurchase && selectedPurchase.phone) {
          console.log('🔄 Forzando recarga de compras del usuario:', selectedPurchase.phone);
          // La recarga se manejará automáticamente en el hook useSupabaseData
          // cuando el usuario inicie sesión o se refresque la página
        }
      } catch (error) {
        console.error('❌ Error recargando datos:', error);
      }
    } else {
      console.warn('⚠️ refreshFromSupabase function not available');
    }
  };

  const handleUpdatePurchase = async (purchaseId: string, updates: any) => {
    console.log('🔄 ===== INICIANDO ACTUALIZACIÓN DE COMPRA =====');
    console.log('🆔 Purchase ID:', purchaseId);
    console.log('📝 Updates recibidos:', updates);
    console.log('📊 Tipo de updates:', typeof updates);
    console.log('🔍 Keys de updates:', Object.keys(updates));
    
    try {
      // Validar que tenemos un ID válido
      if (!purchaseId || purchaseId === 'undefined' || purchaseId === 'null') {
        throw new Error('ID de compra inválido');
      }
      
      // Validar que tenemos updates
      if (!updates || Object.keys(updates).length === 0) {
        throw new Error('No hay datos para actualizar');
      }
      
      // Guardar en Supabase
      console.log('💾 Guardando cambios en Supabase...');
      console.log('📤 Datos enviados a updatePurchase:', { id: purchaseId, updateData: updates });
      
      const { data, error } = await updatePurchase(purchaseId, updates);
      
      console.log('📥 Respuesta de updatePurchase:', { data, error });
      
      if (error) {
        console.error('❌ Error guardando en Supabase:', error);
        console.error('❌ Detalles del error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        setMsg(`❌ Error al guardar: ${error.message}`);
        setTimeout(() => setMsg(''), 5000);
        return;
      }
      
      console.log('✅ Cambios guardados exitosamente en Supabase:', data);
      
      // Actualizar estado local
      console.log('🔄 Actualizando estado local...');
      setPurchases(prev => {
        const updated = prev.map(p => 
          p.id === purchaseId 
            ? { ...p, ...updates }
            : p
        );
        console.log('📊 Estado local actualizado:', updated.find(p => p.id === purchaseId));
        return updated;
      });
      
      setMsg('✅ Compra actualizada correctamente en la base de datos');
      setTimeout(() => setMsg(''), 5000);
      
      // Recargar desde Supabase para sincronizar
      if (refreshFromSupabase) {
        console.log('🔄 Recargando datos desde Supabase...');
        await refreshFromSupabase();
        console.log('✅ Datos recargados desde Supabase');
      }
      
      console.log('🎉 ===== ACTUALIZACIÓN COMPLETADA EXITOSAMENTE =====');
      
    } catch (error) {
      console.error('❌ ===== ERROR EN ACTUALIZACIÓN =====');
      console.error('❌ Error actualizando compra:', error);
      console.error('❌ Stack trace:', error.stack);
      setMsg(`❌ Error: ${error.message}`);
      setTimeout(() => setMsg(''), 5000);
    }
  };
  
  const handleExportCSV = () => {
    // Lógica de export CSV
  };
  
  return {
    adminUsers,
    setAdminUsers,
    loading,
    setLoading,
    msg,
    setMsg,
    adminView,
    setAdminView,
    adminDrawerOpen,
    setAdminDrawerOpen,
    adminMenuOpen,
    setAdminMenuOpen,
    adminRegisterPurchaseOpen,
    setAdminRegisterPurchaseOpen,
    editPurchaseOpen,
    setEditPurchaseOpen,
    editingPurchase,
    setEditingPurchase,
    approvePurchaseOpen,
    setApprovePurchaseOpen,
    selectedPurchase,
    setSelectedPurchase,
    adminEmails,
    handleToggleValidate,
    handleDeletePurchase,
    handleEditPurchase,
    handleReminderPurchase,
    handleApproveSuccess,
    handleUpdatePurchase,
    handleExportCSV
  };
};

