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
    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase) return;

    if (!purchase.validated) {
      setSelectedPurchase(purchase);
      setApprovePurchaseOpen(true);
      return;
    }

    const action = 'invalidar';
    if (!supabase) {
      setMsg('❌ Error: Base de datos no disponible');
      setTimeout(() => setMsg(''), 3000);
      return;
    }

    if (!confirm(`¿Estás seguro de que quieres ${action} la compra de ${purchase.customer} - ${purchase.service}?`)) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('purchases')
        .update({ validated: false })
        .eq('id', purchaseId);

      if (error) throw error;

      setPurchases(prev =>
        prev.map(p =>
          p.id === purchaseId
            ? { ...p, validated: false }
            : p
        )
      );

      setMsg(`✅✨ Compra invalidada exitosamente ✨✅`);
      setTimeout(() => setMsg(''), 3000);

      if (refreshFromSupabase) await refreshFromSupabase();
    } catch (error) {
      console.error('Error al actualizar compra:', error);
      setMsg('❌ Error al actualizar la compra');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase) return;

    const warning = purchase.validated
      ? `⚠️ ADVERTENCIA: ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE a ${purchase.customer}?\n\nEscribe "ELIMINAR" para confirmar:`
      : `¿Estás seguro de que quieres rechazar la compra de ${purchase.customer}?`;

    if (!confirm(warning)) return;

    if (!supabase) {
      setMsg('❌ Error: Base de datos no disponible');
      setTimeout(() => setMsg(''), 3000);
      return;
    }

    if (purchase.validated) {
      const confirmation = prompt('Escribe exactamente: ELIMINAR');
      if (confirmation !== 'ELIMINAR') return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', purchaseId);

      if (error) throw error;

      setPurchases(prev => prev.filter(p => p.id !== purchaseId));
      setMsg(`✅✨ Compra eliminada exitosamente ✨✅`);
      setTimeout(() => setMsg(''), 3000);

      if (refreshFromSupabase) await refreshFromSupabase();
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
    const today = new Date();
    const endDate = new Date(purchase.end);
    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let message = `\u2605 StreamZone \u2605\n\u00A1Hola ${purchase.customer}! \uD83C\uDFAC\n\n`;

    if (daysLeft <= 0) {
      message += `Tu servicio ${purchase.service} vencio el ${purchase.end}. \u26A0\uFE0F\n\nResponde para reactivarlo. \u00A1Gracias! \u2728`;
    } else {
      message += `Tu servicio ${purchase.service} vence el ${purchase.end} (${daysLeft} dias). \u23F0\n\nResponde para renovar. \u00A1Gracias! \u2728`;
    }

    const phoneNumber = purchase.phone.replace(/\D/g, '');
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    try {
      window.open(whatsappUrl, '_blank');
      setMsg(`📱✨ Recordatorio enviado a ${purchase.customer}`);
      setTimeout(() => setMsg(''), 5000);
    } catch (error) {
      setMsg('❌ Error al abrir WhatsApp');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleApproveSuccess = async () => {
    setPurchases(prev =>
      prev.map(p =>
        p.id === selectedPurchase?.id
          ? { ...p, validated: true }
          : p
      )
    );

    if (refreshFromSupabase) {
      try {
        await refreshFromSupabase();
      } catch (error) {
        console.error('❌ Error recargando datos:', error);
      }
    }
  };

  const handleUpdatePurchase = async (purchaseId: string, updates: any) => {
    try {
      const { error } = await updatePurchase(purchaseId, updates);
      if (error) throw error;

      setPurchases(prev =>
        prev.map(p =>
          p.id === purchaseId
            ? { ...p, ...updates }
            : p
        )
      );

      setMsg('✅ Compra actualizada correctamente');
      setTimeout(() => setMsg(''), 5000);
      if (refreshFromSupabase) await refreshFromSupabase();
    } catch (error) {
      console.error('❌ Error actualizando compra:', error);
      setMsg(`❌ Error: ${error.message}`);
      setTimeout(() => setMsg(''), 5000);
    }
  };

  const handleExportCSV = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const today = new Date();

      // Constants for styling
      const primaryColor: [number, number, number] = [31, 41, 55]; // Slate 800
      const accentColor: [number, number, number] = [37, 99, 235]; // Blue 600
      const successColor: [number, number, number] = [5, 150, 105]; // Emerald 600

      // --- HEADER WITH LOGO ---
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 45, 'F');

      // Intentar cargar logo (como es asset estático en public)
      try {
        doc.addImage('/logo_app.png', 'PNG', 15, 7, 30, 30);
      } catch (e) {
        // Fallback si no carga imagen
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('SZ', 20, 25);
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('STREAMZONE', 50, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('SISTEMA INTEGRAL DE GESTIÓN OPERATIVA', 50, 28);

      doc.setFontSize(9);
      doc.text(`Generado: ${today.toLocaleDateString('es-ES')} ${today.toLocaleTimeString('es-ES')}`, pageWidth - 20, 20, { align: 'right' });
      doc.text('Documento Administrativo Original', pageWidth - 20, 26, { align: 'right' });

      // --- CALCULATE BUSINESS METRICS ---
      const validadas = purchases.filter(p => p.validated);
      const activas = validadas.filter(p => new Date(p.end) >= today).length;
      const ingresosTotales = validadas.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
      const pendientes = purchases.filter(p => !p.validated).length;

      // Draw Metric Boxes
      const drawBox = (x: number, y: number, w: number, title: string, value: string, color: [number, number, number]) => {
        doc.setFillColor(243, 244, 246);
        doc.rect(x, y, w, 24, 'F');
        doc.setDrawColor(209, 213, 219);
        doc.rect(x, y, w, 24, 'D');

        doc.setFontSize(8);
        doc.setTextColor(75, 85, 99);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), x + 5, y + 8);

        doc.setFontSize(14);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(value, x + 5, y + 18);
      };

      const boxW = (pageWidth - 50) / 3;
      drawBox(20, 55, boxW, 'Capital en Caja', `$${ingresosTotales.toLocaleString()}`, successColor);
      drawBox(25 + boxW, 55, boxW, 'Suscripciones Activas', activas.toString(), accentColor);
      drawBox(30 + boxW * 2, 55, boxW, 'Ventas por Validar', pendientes.toString(), [220, 38, 38]);

      // --- SUMMARY BY CATEGORY (PLATFORM) ---
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RENDIMIENTO POR PLATAFORMA', 20, 95);

      const categoryStats = validadas.reduce((acc, p) => {
        const cat = p.service || 'Otros';
        if (!acc[cat]) acc[cat] = { count: 0, revenue: 0 };
        acc[cat].count += 1;
        acc[cat].revenue += (Number(p.price) || 0);
        return acc;
      }, {} as Record<string, { count: number, revenue: number }>);

      const summaryRows = (Object.entries(categoryStats) as [string, { count: number, revenue: number }][])
        .filter(([, stats]) => stats.count > 0)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .map(([name, stats]) => [
          name.toUpperCase(),
          stats.count.toString(),
          `$${stats.revenue.toLocaleString()}`
        ]);

      autoTable(doc, {
        head: [['PLATAFORMA', 'VENTAS EXITOSAS', 'TOTAL GENERADO']],
        body: summaryRows,
        startY: 102,
        margin: { left: 20, right: 20 },
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: accentColor, textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
          1: { halign: 'center' },
          2: { halign: 'right', fontStyle: 'bold' }
        }
      });

      // --- TRANSACTION LEDGER (THE CORE DATA) ---
      const nextY = (doc as any).lastAutoTable.finalY + 15;
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('HISTORIAL DETALLADO DE TRANSACCIONES', 20, nextY);

      const tableData = purchases.map(p => {
        const isActive = new Date(p.end) >= today;
        const status = p.validated ? (isActive ? 'VIGENTE' : 'VENCIDO') : 'PENDIENTE';
        return [
          (p.customer || 'N/A').toUpperCase(),
          p.service || 'N/A',
          p.start || '-',
          p.end || '-',
          `$${(Number(p.price) || 0).toLocaleString()}`,
          status
        ];
      });

      autoTable(doc, {
        head: [['CLIENTE', 'SERVICIO', 'FECHA INICIO', 'VENCIMIENTO', 'PRECIO', 'ESTADO']],
        body: tableData,
        startY: nextY + 7,
        margin: { left: 20, right: 20 },
        styles: {
          fontSize: 7,
          cellPadding: 3,
          textColor: [31, 41, 55],
          lineColor: [229, 231, 235],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'right', fontStyle: 'bold' },
          5: { halign: 'center', fontStyle: 'bold' }
        },
        alternateRowStyles: {
          fillColor: [252, 253, 255]
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 5) {
            const val = data.cell.raw;
            if (val === 'VIGENTE') data.cell.styles.textColor = [5, 150, 105];
            if (val === 'PENDIENTE') data.cell.styles.textColor = [217, 119, 6];
            if (val === 'VENCIDO') data.cell.styles.textColor = [220, 38, 38];
          }
        }
      });

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(`Generado para StreamZone Admin \u2022 Página ${i} de ${totalPages}`, 20, doc.internal.pageSize.height - 10);
        doc.text('StreamZone CRM - Control y Auditoria Financiera', pageWidth - 20, doc.internal.pageSize.height - 10, { align: 'right' });
      }

      doc.save(`StreamZone_Report_${today.toISOString().split('T')[0]}.pdf`);
      setMsg('\u2705 Reporte Ejecutivo con Logo y Categorias generado');
      setTimeout(() => setMsg(''), 4000);

    } catch (error) {
      console.error('Error generando PDF:', error);
      setMsg('\u274C Error al generar el reporte corporativo');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return {
    adminUsers, setAdminUsers, loading, setLoading, msg, setMsg,
    adminView, setAdminView, adminDrawerOpen, setAdminDrawerOpen,
    adminMenuOpen, setAdminMenuOpen, adminRegisterPurchaseOpen, setAdminRegisterPurchaseOpen,
    editPurchaseOpen, setEditPurchaseOpen, editingPurchase, setEditingPurchase,
    approvePurchaseOpen, setApprovePurchaseOpen, selectedPurchase, setSelectedPurchase,
    adminEmails, handleToggleValidate, handleDeletePurchase, handleEditPurchase,
    handleReminderPurchase, handleApproveSuccess, handleUpdatePurchase, handleExportCSV
  };
};
