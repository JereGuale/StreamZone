import { useState } from 'react';
import { DatabasePurchase } from '../lib/supabase';

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

export const useAdmin = () => {
  const [adminUsers, setAdminUsers] = useState(DEFAULT_ADMIN_USERS);
  const [purchases, setPurchases] = useState<any[]>([]);
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
  
  // Lista de emails para compatibilidad con login
  const adminEmails = adminUsers.map(user => user.email);
  
  const handleToggleValidate = async (purchaseId: string) => {
    // Lógica de toggle validate
  };
  
  const handleDeletePurchase = async (purchaseId: string) => {
    // Lógica de delete purchase
  };
  
  const handleEditPurchase = (purchase: DatabasePurchase) => {
    setEditingPurchase(purchase);
    setEditPurchaseOpen(true);
  };
  
  const handleExportCSV = () => {
    // Lógica de export CSV
  };
  
  return {
    adminUsers,
    setAdminUsers,
    purchases,
    setPurchases,
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
    adminEmails,
    handleToggleValidate,
    handleDeletePurchase,
    handleEditPurchase,
    handleExportCSV
  };
};
