import { useState } from 'react';
import { DatabasePurchase } from '../lib/supabase';
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

export const useAdmin = (purchases: any[] = [], setPurchases: (purchases: any[]) => void, refreshFromSupabase?: () => Promise<void>) => {
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

  const handleApproveSuccess = async () => {
    console.log('🎉 handleApproveSuccess called');
    console.log('🔄 refreshFromSupabase function:', refreshFromSupabase);
    
    // Recargar desde Supabase para asegurar sincronización
    if (refreshFromSupabase) {
      console.log('🔄 Recargando datos desde Supabase después de aprobación...');
      try {
        await refreshFromSupabase();
        console.log('✅ Datos recargados exitosamente desde Supabase');
      } catch (error) {
        console.error('❌ Error recargando datos:', error);
      }
    } else {
      console.warn('⚠️ refreshFromSupabase function not available');
    }
  };

  const handleUpdatePurchase = (purchaseId: string, updates: any) => {
    console.log('🔄 Actualizando compra localmente:', { purchaseId, updates });
    setPurchases(prev => 
      prev.map(p => 
        p.id === purchaseId 
          ? { ...p, ...updates }
          : p
      )
    );
    console.log('✅ Compra actualizada localmente');
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
    handleApproveSuccess,
    handleUpdatePurchase,
    handleExportCSV
  };
};

