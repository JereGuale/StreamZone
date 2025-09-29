import React from "react";
import { tv } from "./utils/helpers";
import { SERVICES, COMBOS } from "./constants/services_original";
import { AppHeader } from "./components/AppHeader";
import { MainContent } from "./components/MainContent";
import { AdminDrawer } from "./components/admin/AdminDrawer";
import { AdminMenuDrawer } from "./components/admin/AdminMenuDrawer";
import { FloatingChatbot } from "./components/FloatingChatbot";
import { FloatingThemeToggle } from "./components/FloatingThemeToggle";
import { ModalsManager } from "./components/ModalsManager";
import { ApprovePurchaseModal } from "./components/ApprovePurchaseModal";
import { ErrorModal } from "./components/ErrorModal";
import { useChatbot } from "./chatbot/useChatbot";
import { useReservations } from "./hooks/useReservations";
import { usePurchases } from "./hooks/usePurchases";
import { useSupabaseData } from "./hooks/useSupabaseData";
import { useTheme } from "./hooks/useTheme";
import { useAuth } from "./hooks/useAuth";
import { useAdmin } from "./hooks/useAdmin";
import { useNavigation } from "./hooks/useNavigation";
import { supabase, createUser, getUserByPhone, updateUser, createPurchase, syncServices, DatabasePurchase, getUserPurchases, getUserByEmail, generateResetToken, verifyResetToken, resetPassword, loginUser, approvePurchase, getPendingPurchases, getUserActivePurchases, getAllPurchases, getExpiringServices, createRenewal, getRenewalHistory, toggleAutoRenewal, getRenewalNotifications, getRenewalStats, updatePurchase, updatePurchaseValidation, RenewalHistory, ExpiringService } from "./lib/supabase";
import './animations.css';
import './styles.css';

/**
 * StreamZone – Tienda de Streaming (React + TS + Tailwind)
 * - Catálogo con precios
 * - Reserva por WhatsApp
 * - Registro y "Mis compras"
 * - Panel Admin minimalista con menú desplegable
 * - Toggle oscuro/claro + chatbot flotante
 */


// ===================== App =====================
function App(){
  // Hooks personalizados
  const { isDark, systemPrefersDark, toggleTheme } = useTheme();
  const { view, setView } = useNavigation();
  const { 
    user, adminLogged, userProfile, allPurchases, setAllPurchases,
    authStep, setAuthStep, resetEmail, resetToken,
    handleLogin, handleLogout, handleAdminLogin, handleAdminLogout,
    handleForgotPassword, handleCodeVerified, handlePasswordReset
  } = useAuth();
  
  // Hook para manejar datos de Supabase
  const supabaseData = useSupabaseData();
  
  const {
    adminUsers, setAdminUsers,
    adminView, setAdminView, adminDrawerOpen, setAdminDrawerOpen,
    adminMenuOpen, setAdminMenuOpen, adminRegisterPurchaseOpen,
    setAdminRegisterPurchaseOpen, editPurchaseOpen, setEditPurchaseOpen,
    editingPurchase, setEditingPurchase, approvePurchaseOpen, setApprovePurchaseOpen,
    selectedPurchase, setSelectedPurchase, adminEmails,
    handleToggleValidate, handleDeletePurchase, handleEditPurchase, handleReminderPurchase, handleApproveSuccess, handleUpdatePurchase, handleExportCSV
  } = useAdmin(supabaseData.allPurchases, (newPurchases) => {
    setAllPurchases(newPurchases);
    // También actualizar en Supabase si es necesario
  }, supabaseData.refreshAllStats);
  
  // Hook para manejar reservas
  const reservations = useReservations();
  
  // Hook para manejar compras
  const purchaseHandler = usePurchases();
  
  // Chatbot
  const chatbot = useChatbot(SERVICES, COMBOS);
  
  // Sincronizar servicios con Supabase al inicio
  React.useEffect(() => {
    const syncServicesOnInit = async () => {
      try {
        // Sincronizar servicios individuales
        await syncServices([...SERVICES]);
        console.log('Servicios sincronizados con Supabase');
        
        // Sincronizar combos
        await syncServices([...COMBOS]);
        console.log('Combos sincronizados con Supabase');
      } catch (error) {
        console.error('Error sincronizando servicios:', error);
      }
    };
    
    syncServicesOnInit();
  }, []);

  // Handlers
  const handleReserve = (service: any) => {
    console.log('handleReserve called with:', { service, user });
    reservations.handleReserve(service, user);
  };

  const handleAddPurchase = (purchaseData: any) => {
    console.log('Agregando compra:', purchaseData);
    reservations.setReserveModalOpen(false);
  };

  const handlePurchase = async (purchaseData: any) => {
    // Cerrar el modal primero
    reservations.setPurchaseModalOpen(false);
    
    // Procesar la compra con la lógica original de agentes
    await purchaseHandler.processPurchase(purchaseData);
    
    // Recargar los datos desde Supabase después de la compra
    console.log('🔄 handlePurchase: Recargando datos después de la compra...');
    await supabaseData.refreshAllStats();
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${tv(isDark, 'bg-gray-50', 'bg-zinc-900')}`}>
      {/* Header */}
      <AppHeader 
                  isDark={isDark}
        view={view}
        user={user}
        adminLogged={adminLogged}
        setView={setView}
        handleLogout={handleLogout}
      />

      {/* Contenido principal */}
      <main className="flex-1">
        <MainContent
          view={view}
                  isDark={isDark}
          user={user}
          adminLogged={adminLogged}
          purchases={supabaseData.allPurchases}
          pendingPurchases={supabaseData.pendingPurchases}
          userActivePurchases={supabaseData.userActivePurchases}
          expiringServices={supabaseData.expiringServices}
          renewalStats={supabaseData.renewalStats}
          loading={supabaseData.loading}
          error={supabaseData.error}
          adminUsers={adminUsers}
          setAdminUsers={setAdminUsers}
          authStep={authStep}
          resetEmail={resetEmail}
          resetToken={resetToken}
          setView={setView}
          setAuthStep={setAuthStep}
          handleReserve={handleReserve}
          handleToggleValidate={handleToggleValidate}
          handleDeletePurchase={handleDeletePurchase}
          handleEditPurchase={handleEditPurchase}
          handleReminderPurchase={handleReminderPurchase}
          handleLogin={handleLogin}
          handleAdminLogin={handleAdminLogin}
          handleAdminLogout={handleAdminLogout}
          handleForgotPassword={handleForgotPassword}
          handleCodeVerified={handleCodeVerified}
          handlePasswordReset={handlePasswordReset}
          setAdminRegisterPurchaseOpen={setAdminRegisterPurchaseOpen}
          handleExportCSV={handleExportCSV}
          refreshAllStats={supabaseData.refreshAllStats}
          adminEmails={adminEmails}
        />
      </main>

      {/* Modales */}
      <ModalsManager
        reserveModalOpen={reservations.reserveModalOpen}
        registrationRequiredOpen={reservations.registrationRequiredOpen}
        purchaseModalOpen={reservations.purchaseModalOpen}
        adminRegisterPurchaseOpen={adminRegisterPurchaseOpen}
        editPurchaseOpen={editPurchaseOpen}
        selectedService={reservations.selectedService}
        purchaseData={reservations.purchaseData}
        editingPurchase={editingPurchase}
        user={user}
                  isDark={isDark}
        systemPrefersDark={systemPrefersDark}
        setReserveModalOpen={reservations.setReserveModalOpen}
        setRegistrationRequiredOpen={reservations.setRegistrationRequiredOpen}
        setPurchaseModalOpen={reservations.setPurchaseModalOpen}
        setAdminRegisterPurchaseOpen={setAdminRegisterPurchaseOpen}
        setEditPurchaseOpen={setEditPurchaseOpen}
        onAddPurchase={handleAddPurchase}
        onGoToAuth={() => {
          reservations.setReserveModalOpen(false);
          setView('auth');
        }}
        onPurchase={handlePurchase}
        onRegister={() => {}}
        onUpdate={(updates) => {
          if (editingPurchase?.id) {
            handleUpdatePurchase(editingPurchase.id, updates);
          }
        }}
      />

      {/* Drawers */}
      <AdminDrawer 
        open={adminDrawerOpen} 
        onClose={()=>setAdminDrawerOpen(false)} 
                  isDark={isDark}
        adminUsers={adminUsers} 
        setAdminUsers={setAdminUsers} 
      />
      
      <AdminMenuDrawer 
        open={adminMenuOpen} 
        onClose={()=>setAdminMenuOpen(false)} 
                          isDark={isDark}
        setSubView={() => {}} 
        openAdmins={()=>setAdminDrawerOpen(true)} 
        onExportCSV={handleExportCSV} 
        onLogout={handleAdminLogout} 
        onRegisterPurchase={()=>setAdminRegisterPurchaseOpen(true)} 
      />

      {/* Modal de aprobación de compras */}
      <ApprovePurchaseModal
        isOpen={approvePurchaseOpen}
        onClose={() => setApprovePurchaseOpen(false)}
        purchase={selectedPurchase}
        isDark={isDark}
        onApprove={handleApproveSuccess}
        onUpdatePurchase={handleUpdatePurchase}
      />

      {/* Modal de error para compras */}
      <ErrorModal
        isOpen={purchaseHandler.errorModal.isOpen}
        onClose={purchaseHandler.closeErrorModal}
        title="Error en la Compra"
        message={purchaseHandler.errorModal.message}
        isDark={isDark}
        showRetry={false}
      />

      {/* Componentes flotantes */}
      <FloatingChatbot answerFn={chatbot.answer} isDark={isDark}/>
      <FloatingThemeToggle isDark={isDark} onToggle={toggleTheme} />
    </div>
  );
}

export default App;
