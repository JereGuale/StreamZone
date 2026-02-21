import React from 'react';
import { UserLoginForm } from '../pages/auth/Login';
import { UserRegisterForm } from '../pages/auth/Register';
import { ForgotPasswordForm } from '../pages/auth/ForgotPassword';
import { Dashboard } from '../pages/user/Dashboard';
import { Profile } from '../pages/user/Profile';
import { AdminDashboard } from '../pages/admin/AdminDashboard';

interface AppRoutesProps {
  view: string;
  authStep: string;
  isDark: boolean;
  user: any;
  adminLogged: boolean;
  // Auth props
  onUserLoginForm: (user: any) => void;
  onForgotPasswordForm: () => void;
  onTokenSent: (email: string, token: string) => void;
  onUserRegisterForm: () => void;
  onBack: () => void;
  onCodeVerified: (token: string) => void;
  onSuccess: () => void;
  // User props
  onReserve: (service: any) => void;
  onLoadUserPurchases: (phone: string) => void;
  onGoToHome: () => void;
  onGoToAuth: () => void;
  userActivePurchases: any[];
  // Admin props
  adminSub: 'dashboard' | 'purchases';
  setAdminSub: (sub: 'dashboard' | 'purchases') => void;
  purchases: any[];
  pendingPurchases: any[];
  expiringServices: any[];
  adminLoading: boolean;
  onRefreshAllStats: () => void;
  onSetMenuOpen: (open: boolean) => void;
  onSetAdminUserRegisterFormPurchaseOpen: (open: boolean) => void;
  adminUsers: any[];
  setAdminUsers: (users: any[]) => void;
  onToggleValidate: (id: string) => void;
  onDeletePurchase: (id: string) => void;
  onEditPurchase: (purchase: any) => void;
  onSetView: (view: string) => void;
  onSetDrawerOpen: (open: boolean) => void;
  onExportCSV: () => void;
  onLogout: () => void;
  onLogoutAdmin: () => void;
  adminEmails: string[];
  resetEmail: string;
  resetToken: string;
}

export function AppRoutes({
  view,
  authStep,
  isDark,
  user,
  adminLogged,
  onUserLoginForm,
  onForgotPasswordForm,
  onTokenSent,
  onUserRegisterForm,
  onBack,
  onCodeVerified,
  onSuccess,
  onReserve,
  onLoadUserPurchases,
  onGoToHome,
  onGoToAuth,
  userActivePurchases,
  adminSub,
  setAdminSub,
  purchases,
  pendingPurchases,
  expiringServices,
  adminLoading,
  onRefreshAllStats,
  onSetMenuOpen,
  onSetAdminUserRegisterFormPurchaseOpen,
  onSetDrawerOpen,
  onExportCSV,
  onLogout,
  onLogoutAdmin,
  adminEmails,
  resetEmail,
  resetToken,
  adminUsers,
  setAdminUsers,
  onToggleValidate,
  onDeletePurchase,
  onEditPurchase,
  onSetView
}: AppRoutesProps) {
  // Auth views
  if (view === 'auth') {
    switch (authStep) {
      case 'login':
        return (
          <UserLoginForm
            isDark={isDark}
            onLogin={onUserLoginForm}
            onForgotPassword={onForgotPasswordForm}
          />
        );
      case 'register':
        return (
          <UserRegisterForm
            isDark={isDark}
            onSubmit={onUserLoginForm}
          />
        );
      case 'forgot':
        return (
          <ForgotPasswordForm
            isDark={isDark}
            onBack={onBack}
            onTokenSent={onTokenSent}
            onRegister={onUserRegisterForm}
          />
        );
      case 'code':
        return (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">🔐 Verificar Código</h2>
                <p className="text-sm opacity-80">Ingresa el código que recibiste</p>
              </div>
              {/* Code verification form would go here */}
            </div>
          </div>
        );
      case 'reset':
        return (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">🔐 Nueva Contraseña</h2>
                <p className="text-sm opacity-80">Crea una nueva contraseña</p>
              </div>
              {/* Reset password form would go here */}
            </div>
          </div>
        );
      default:
        return (
          <UserLoginForm
            isDark={isDark}
            onLogin={onUserLoginForm}
            onForgotPassword={onForgotPasswordForm}
          />
        );
    }
  }

  // Admin login view
  if (view === 'adminUserLoginForm') {
    return (
      <section className="min-h-screen relative">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
          <div className="absolute inset-0 bg-[url('/img/bg-cinema.jpg')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative z-10 min-h-screen grid place-items-center">
          <div className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl border border-gray-200">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl text-white">🔐</span>
              </div>
              <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Acceso Administrador</h3>
              <p className="text-sm text-gray-600">Ingresa tus credenciales para acceder al panel</p>
            </div>
            {/* Admin login form would go here */}
            <div className="mt-8 text-center">
              <button 
                onClick={onGoToHome}
                className="text-gray-600 hover:text-gray-800 text-sm transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <span>←</span> Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Admin view
  if (view === 'admin') {
    return (
      <AdminDashboard
        isDark={isDark}
        purchases={purchases}
        pendingPurchases={pendingPurchases}
        expiringServices={expiringServices}
        loading={adminLoading}
        adminUsers={adminUsers}
        setAdminUsers={setAdminUsers}
        onToggleValidate={onToggleValidate}
        onDeletePurchase={onDeletePurchase}
        onEditPurchase={onEditPurchase}
        onRegisterPurchase={() => onSetAdminUserRegisterFormPurchaseOpen(true)}
        onExportCSV={onExportCSV}
        refreshAllStats={onRefreshAllStats}
        onGoToHome={onGoToHome}
        onSetAdminUserRegisterFormPurchaseOpen={onSetAdminUserRegisterFormPurchaseOpen}
        onSetDrawerOpen={onSetDrawerOpen}
        onLogout={onLogoutAdmin}
        onSetView={onSetView}
      />
    );
  }

  // User profile view
  if (view === 'profile') {
    return (
      <Profile
        user={user}
        userActivePurchases={userActivePurchases}
        isDark={isDark}
        onLoadUserPurchases={onLoadUserPurchases}
        onGoToHome={onGoToHome}
        onGoToAuth={onGoToAuth}
      />
    );
  }

  // Default home/dashboard view
  return (
    <Dashboard
      isDark={isDark}
      onReserve={onReserve}
      user={user}
    />
  );
}

