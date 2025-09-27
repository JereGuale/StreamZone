import { useState } from 'react';

export function useReservations() {
  // Estados de modales
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [registrationRequiredOpen, setRegistrationRequiredOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [purchaseData, setPurchaseData] = useState<any>(null);

  // Función para manejar reservas (lógica original)
  const handleReserve = (service: any, user: any) => {
    if (user) {
      setPurchaseData(service);
      setPurchaseModalOpen(true);
    } else {
      // Mostrar aviso de que debe registrarse (como en el original)
      setSelectedService(service);
      setReserveModalOpen(true);
    }
  };

  // Función para cerrar todos los modales
  const closeAllModals = () => {
    setReserveModalOpen(false);
    setRegistrationRequiredOpen(false);
    setPurchaseModalOpen(false);
    setSelectedService(null);
    setPurchaseData(null);
  };

  return {
    // Estados
    reserveModalOpen,
    registrationRequiredOpen,
    purchaseModalOpen,
    selectedService,
    purchaseData,
    
    // Setters
    setReserveModalOpen,
    setRegistrationRequiredOpen,
    setPurchaseModalOpen,
    setSelectedService,
    setPurchaseData,
    
    // Funciones
    handleReserve,
    closeAllModals
  };
}
