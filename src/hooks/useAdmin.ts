import { useState } from 'react';
import { DatabasePurchase, updatePurchase } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import { formatPhoneForWhatsApp } from '../utils/helpers';

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

      setMsg(`✅✨ Compra invalidada exitosamente ✨✅\n🔄 El cliente puede volver a solicitar cuando guste 🔄`);
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

      setMsg(`✅✨ Compra ${purchase.validated ? 'eliminada' : 'rechazada'} exitosamente ✨✅\n🗑️ La compra ha sido removida del sistema 🗑️`);
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
    
    // Crear mensaje cálido y atractivo con muchos emojis
    let message = `🎬✨ *StreamZone* ✨🎬\n`;
    message += `🌟 *Recordatorio de Renovación* 🌟\n\n`;
    message += `👋 ¡Hola *${purchase.customer}*! 👋\n\n`;
    message += `💝 Esperamos que estés disfrutando de nuestros servicios 💝\n\n`;
    
    if (daysLeft <= 0) {
      message += `😔 ¡Ups! Su servicio *${purchase.service}* venció el ${purchase.end} 😔\n\n`;
      message += `🔄✨ ¡No te preocupes! Podemos reactivarlo fácilmente ✨🔄\n\n`;
      message += `💬📱 Solo responde este mensaje y te ayudamos al instante 📱💬\n\n`;
    } else if (daysLeft === 1) {
      message += `⏰🚨 Su servicio *${purchase.service}* vence *MAÑANA* (${purchase.end}) 🚨⏰\n\n`;
      message += `🔥 ¡Renueva ahora y sigue disfrutando sin interrupciones! 🔥\n\n`;
      message += `💬📱 Responde este mensaje para renovar al instante 📱💬\n\n`;
    } else if (daysLeft <= 3) {
      message += `📅⏳ Su servicio *${purchase.service}* vence en *${daysLeft} días* (${purchase.end}) ⏳📅\n\n`;
      message += `🎯 ¡Renueva con anticipación y mantén tu entretenimiento continuo! 🎯\n\n`;
      message += `💬📱 Responde este mensaje cuando quieras renovar 📱💬\n\n`;
    } else {
      message += `📋💌 Recordatorio amigable: Su servicio *${purchase.service}* vence en *${daysLeft} días* (${purchase.end}) 💌📋\n\n`;
      message += `😊 ¡Tienes tiempo! Renueva cuando te sea conveniente 😊\n\n`;
      message += `💬📱 Responde este mensaje cuando quieras proceder 📱💬\n\n`;
    }
    
    message += `🎁 *Beneficios de renovar con nosotros:*\n`;
    message += `✅ Atención personalizada 24/7\n`;
    message += `✅ Precios competitivos\n`;
    message += `✅ Activación inmediata\n`;
    message += `✅ Soporte técnico incluido\n\n`;
    message += `🤝 *¡Gracias por confiar en StreamZone!* 🤝\n`;
    message += `💖 *Equipo StreamZone* 💖\n`;
    message += `🎬✨ *Tu entretenimiento es nuestra pasión* ✨🎬`;
    
    // Crear URL de WhatsApp
    const phoneNumber = formatPhoneForWhatsApp(purchase.phone);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Abrir WhatsApp
    try {
      window.open(whatsappUrl, '_blank');
      setMsg(`📱✨ Recordatorio enviado exitosamente a ${purchase.customer} ✨📱\n💬 El cliente recibirá un mensaje cálido y atractivo 💬`);
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
  
  const handleExportCSV = async () => {
    try {
      // Importar dinámicamente las librerías de PDF
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;
      
      // Crear nuevo documento PDF
      const doc = new jsPDF();
      
      // Configurar fuente y título
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('📊 REPORTE DE COMPRAS - StreamZone', 20, 30);
      
      // Información de la empresa
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Sistema de Gestión de Servicios de Streaming', 20, 45);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 55);
      doc.text(`Hora de generación: ${new Date().toLocaleTimeString('es-ES')}`, 20, 65);
      
      // Preparar datos reales de compras
      const header = ['Cliente', 'Teléfono', 'Servicio', 'Inicio', 'Fin', 'Estado', 'Creado'];
      const purchasesData = [header];
      
      // Agregar datos reales de compras
      purchases.forEach(purchase => {
        const isActive = new Date(purchase.end) >= new Date();
        const status = purchase.validated ? (isActive ? 'Activo' : 'Vencido') : 'Pendiente';
        const createdDate = new Date(purchase.created_at).toLocaleDateString('es-ES');
        
        purchasesData.push([
          purchase.customer || 'N/A',
          purchase.phone || 'N/A',
          purchase.service || 'N/A',
          purchase.start || 'N/A',
          purchase.end || 'N/A',
          status,
          createdDate
        ]);
      });
      
      // Si no hay compras, agregar mensaje
      if (purchases.length === 0) {
        purchasesData.push(['No hay compras registradas', '', '', '', '', '', '']);
      }
      
      // Agregar tabla de compras
      autoTable(doc, {
        head: [purchasesData[0]],
        body: purchasesData.slice(1),
        startY: 80,
        styles: {
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 80, left: 20, right: 20 },
      });
      
      // Agregar estadísticas al final
      const finalY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('📈 ESTADÍSTICAS', 20, finalY);
      
      // Calcular estadísticas reales
      const totalPurchases = purchases.length;
      const activePurchases = purchases.filter(p => p.validated && new Date(p.end) >= new Date()).length;
      const pendingPurchases = purchases.filter(p => !p.validated).length;
      const expiredPurchases = purchases.filter(p => p.validated && new Date(p.end) < new Date()).length;
      
      // Estadísticas por servicio
      const serviceStats = purchases.reduce((acc, purchase) => {
        const service = purchase.service || 'Desconocido';
        acc[service] = (acc[service] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`• Total de compras: ${totalPurchases}`, 20, finalY + 15);
      doc.text(`• Compras activas: ${activePurchases}`, 20, finalY + 25);
      doc.text(`• Compras pendientes: ${pendingPurchases}`, 20, finalY + 35);
      doc.text(`• Compras vencidas: ${expiredPurchases}`, 20, finalY + 45);
      
      // Estadísticas por servicio
      doc.text('• Servicios más populares:', 20, finalY + 60);
      Object.entries(serviceStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .forEach(([service, count], index) => {
          doc.text(`  ${index + 1}. ${service}: ${count} compras`, 25, finalY + 70 + (index * 10));
        });
      
      // Pie de página
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, 20, doc.internal.pageSize.height - 10);
        doc.text('Generado por StreamZone', doc.internal.pageSize.width - 60, doc.internal.pageSize.height - 10);
      }
      
      // Descargar el PDF
      const fileName = `reporte-compras-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      setMsg('📄 Reporte PDF generado exitosamente');
      setTimeout(() => setMsg(''), 3000);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      setMsg('❌ Error al generar el reporte PDF');
      setTimeout(() => setMsg(''), 3000);
    }
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

