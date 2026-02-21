import React from 'react';
import { ReserveForm } from './ReserveForm';
import { RegistrationRequiredForm } from './RegistrationRequiredForm';
import { PurchaseModal } from './PurchaseModal';
import { AdminRegisterPurchaseModal } from './AdminRegisterPurchaseModal';
import { EditPurchaseModal } from './EditPurchaseModal';
import { Modal } from './Modal';

interface ModalsManagerProps {
  // Estados de modales
  reserveModalOpen: boolean;
  registrationRequiredOpen: boolean;
  purchaseModalOpen: boolean;
  adminRegisterPurchaseOpen: boolean;
  editPurchaseOpen: boolean;
  
  // Datos
  selectedService: any;
  purchaseData: any;
  editingPurchase: any;
  user: any;
  isDark: boolean;
  systemPrefersDark: boolean;
  
  // Setters
  setReserveModalOpen: (open: boolean) => void;
  setRegistrationRequiredOpen: (open: boolean) => void;
  setPurchaseModalOpen: (open: boolean) => void;
  setAdminRegisterPurchaseOpen: (open: boolean) => void;
  setEditPurchaseOpen: (open: boolean) => void;
  
  // Funciones
  onAddPurchase: (data: any) => void;
  onGoToAuth: () => void;
  onPurchase: (data: any) => void;
  onRegister: (data: any) => void;
  onUpdate: (data: any) => void;
}

export function ModalsManager({
  reserveModalOpen,
  registrationRequiredOpen,
  purchaseModalOpen,
  adminRegisterPurchaseOpen,
  editPurchaseOpen,
  selectedService,
  purchaseData,
  editingPurchase,
  user,
  isDark,
  systemPrefersDark,
  setReserveModalOpen,
  setRegistrationRequiredOpen,
  setPurchaseModalOpen,
  setAdminRegisterPurchaseOpen,
  setEditPurchaseOpen,
  onAddPurchase,
  onGoToAuth,
  onPurchase,
  onRegister,
  onUpdate
}: ModalsManagerProps) {
  return (
    <>
      {/* Modal de registro requerido (como en el original) */}
      <Modal 
        open={reserveModalOpen} 
        onClose={() => setReserveModalOpen(false)} 
        title={`🔐 Registro Requerido - ${selectedService?.name || ''}`} 
        isDark={isDark} 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {selectedService && (
          <RegistrationRequiredForm 
            service={selectedService} 
            onClose={() => setReserveModalOpen(false)} 
            isDark={isDark} 
            onGoToAuth={onGoToAuth}
          />
        )}
      </Modal>

      {/* Modal de reserva (para usuarios logueados) */}
      {registrationRequiredOpen && (
        <ReserveForm 
          service={selectedService} 
          onClose={() => setRegistrationRequiredOpen(false)} 
          onAddPurchase={onAddPurchase} 
          isDark={isDark} 
          user={user} 
        />
      )}

      {/* Modal de compra */}
      <PurchaseModal 
        open={purchaseModalOpen} 
        onClose={() => setPurchaseModalOpen(false)} 
        service={purchaseData} 
        user={user} 
        isDark={isDark} 
        onPurchase={onPurchase} 
      />

      {/* Modal de registro de compra por admin */}
      <AdminRegisterPurchaseModal 
        open={adminRegisterPurchaseOpen} 
        onClose={() => setAdminRegisterPurchaseOpen(false)} 
        onRegister={onRegister} 
        isDark={isDark} 
        systemPrefersDark={systemPrefersDark}
      />

      {/* Modal de edición de compra */}
      <EditPurchaseModal 
        open={editPurchaseOpen} 
        onClose={() => setEditPurchaseOpen(false)} 
        onUpdate={onUpdate} 
        purchase={editingPurchase}
        isDark={isDark}
        systemPrefersDark={systemPrefersDark}
      />
    </>
  );
}
