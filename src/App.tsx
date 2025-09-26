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
import { useChatbot } from "./chatbot/useChatbot";
import { useReservations } from "./hooks/useReservations";
import { useTheme } from "./hooks/useTheme";
import { useAuth } from "./hooks/useAuth";
import { useAdmin } from "./hooks/useAdmin";
import { useNavigation } from "./hooks/useNavigation";
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
    user, adminLogged, userProfile, allPurchases,
    authStep, setAuthStep, resetEmail, resetToken,
    handleLogin, handleLogout, handleAdminLogin, handleAdminLogout,
    handleForgotPassword, handleCodeVerified, handlePasswordReset
  } = useAuth();
  const {
    adminUsers, setAdminUsers, purchases, setPurchases,
    adminView, setAdminView, adminDrawerOpen, setAdminDrawerOpen,
    adminMenuOpen, setAdminMenuOpen, adminRegisterPurchaseOpen,
    setAdminRegisterPurchaseOpen, editPurchaseOpen, setEditPurchaseOpen,
    editingPurchase, setEditingPurchase, adminEmails,
    handleToggleValidate, handleDeletePurchase, handleEditPurchase, handleExportCSV
  } = useAdmin();
  
  // Hook para manejar reservas
  const reservations = useReservations();
  
  // Chatbot
  const chatbot = useChatbot(SERVICES, COMBOS);

  // Handlers
  const handleReserve = (service: any) => {
    reservations.handleReserve(service, user);
  };

  const handleAddPurchase = (purchaseData: any) => {
    console.log('Agregando compra:', purchaseData);
    reservations.setReserveModalOpen(false);
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
          purchases={purchases}
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
          handleLogin={handleLogin}
          handleAdminLogin={handleAdminLogin}
          handleAdminLogout={handleAdminLogout}
          handleForgotPassword={handleForgotPassword}
          handleCodeVerified={handleCodeVerified}
          handlePasswordReset={handlePasswordReset}
          setAdminRegisterPurchaseOpen={setAdminRegisterPurchaseOpen}
          handleExportCSV={handleExportCSV}
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
        onPurchase={() => {}}
        onRegister={() => {}}
        onUpdate={() => {}}
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

      {/* Componentes flotantes */}
      <FloatingChatbot answerFn={chatbot.answer} isDark={isDark}/>
      <FloatingThemeToggle isDark={isDark} onToggle={toggleTheme} />
    </div>
  );
}

export default App;
