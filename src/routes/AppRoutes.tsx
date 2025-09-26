import React from 'react';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
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
  onLogin: (user: any) => void;
  onForgotPassword: () => void;
  onTokenSent: (email: string, token: string) => void;
  onRegister: () => void;
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
  onSetAdminRegisterPurchaseOpen: (open: boolean) => void;
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
  onLogin,
  onForgotPassword,
  onTokenSent,
  onRegister,
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
  onSetAdminRegisterPurchaseOpen,
  onSetDrawerOpen,
  onExportCSV,
  onLogout,
  onLogoutAdmin,
  adminEmails,
  resetEmail,
  resetToken
}: AppRoutesProps) {
  // Auth views
  if (view === 'auth') {
    switch (authStep) {
      case 'login':
        return (
          <Login
            isDark={isDark}
            onLogin={onLogin}
            onForgotPassword={onForgotPassword}
          />
        );
      case 'register':
        return (
          <Register
            isDark={isDark}
            onSubmit={onLogin}
          />
        );
      case 'forgot':
        return (
          <ForgotPassword
            isDark={isDark}
            onBack={onBack}
            onTokenSent={onTokenSent}
            onRegister={onRegister}
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
          <Login
            isDark={isDark}
            onLogin={onLogin}
            onForgotPassword={onForgotPassword}
          />
        );
    }
  }

  // Admin login view
  if (view === 'adminLogin') {
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
        adminSub={adminSub}
        setAdminSub={setAdminSub}
        purchases={purchases}
        pendingPurchases={pendingPurchases}
        expiringServices={expiringServices}
        adminLoading={adminLoading}
        onRefreshAllStats={onRefreshAllStats}
        onSetMenuOpen={onSetMenuOpen}
        onGoToHome={onGoToHome}
        onSetAdminRegisterPurchaseOpen={onSetAdminRegisterPurchaseOpen}
        onSetDrawerOpen={onSetDrawerOpen}
        onExportCSV={onExportCSV}
        onLogout={onLogoutAdmin}
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

