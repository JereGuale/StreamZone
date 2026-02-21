import React from 'react';
import { tv } from '../utils/helpers';
import Home from '../pages/Home';
import { Combos } from '../pages/Combos';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { UserProfile } from '../pages/user/UserProfile';
import { UserLoginForm } from '../pages/auth/Login';
import { UserRegisterForm } from '../pages/auth/Register';
import { ForgotPasswordForm } from '../pages/auth/ForgotPassword';
import { CodeVerificationForm } from '../pages/auth/CodeVerification';
import { ResetPasswordForm } from '../pages/auth/ResetPassword';
import { AdminLoginForm } from '../pages/auth/AdminLogin';

interface MainContentProps {
  view: string;
  isDark: boolean;
  user: any;
  adminLogged: boolean;
  purchases: any[];
  pendingPurchases?: any[];
  userActivePurchases?: any[];
  expiringServices?: any[];
  renewalStats?: any;
  services?: any[];
  combos?: any[];
  loading?: boolean;
  error?: string | null;
  adminUsers: any[];
  setAdminUsers: (users: any[]) => void;
  authStep: string;
  resetEmail: string;
  resetToken: string;
  setView: (view: string) => void;
  setAuthStep: (step: string) => void;
  handleReserve: (service: any) => void;
  handleToggleValidate: (id: string) => void;
  handleDeletePurchase: (id: string) => void;
  handleEditPurchase: (purchase: any) => void;
  handleReminderPurchase: (purchase: any) => void;
  handleLogin: (userData: any) => void;
  handleAdminLogin: (success: boolean) => void;
  handleAdminLogout: () => void;
  handleForgotPassword: (email: string, token: string) => void;
  handleCodeVerified: (token: string) => void;
  handlePasswordReset: () => void;
  setAdminRegisterPurchaseOpen: (open: boolean) => void;
  handleExportCSV: () => void;
  refreshAllStats?: () => void;
  adminEmails: string[];
}

export function MainContent({
  view,
  isDark,
  user,
  adminLogged,
  purchases,
  pendingPurchases,
  userActivePurchases,
  expiringServices,
  renewalStats,
  services,
  combos,
  loading,
  error,
  adminUsers,
  setAdminUsers,
  authStep,
  resetEmail,
  resetToken,
  setView,
  setAuthStep,
  handleReserve,
  handleToggleValidate,
  handleDeletePurchase,
  handleEditPurchase,
  handleReminderPurchase,
  handleLogin,
  handleAdminLogin,
  handleAdminLogout,
  handleForgotPassword,
  handleCodeVerified,
  handlePasswordReset,
  setAdminRegisterPurchaseOpen,
  handleExportCSV,
  refreshAllStats,
  adminEmails
}: MainContentProps) {
  const renderMainContent = () => {
    switch (view) {
      case 'home':
        return <Home isDark={isDark} onReserve={handleReserve} user={user} setView={setView} services={services || []} />;
      case 'combos':
        return <Combos isDark={isDark} onReserve={handleReserve} combos={combos || []} />;
      case 'profile':
        return user ? (
          <UserProfile
            isDark={isDark}
            user={user}
            purchases={purchases || []}
            onToggleValidate={handleToggleValidate}
            onDeletePurchase={handleDeletePurchase}
            onEditPurchase={handleEditPurchase}
            onSetView={setView}
            loading={loading}
          />
        ) : null;
      case 'admin':
        return adminLogged ? (
          <AdminDashboard
            isDark={isDark}
            purchases={purchases}
            pendingPurchases={pendingPurchases || []}
            expiringServices={expiringServices || []}
            renewalStats={renewalStats}
            services={services || []}
            combos={combos || []}
            loading={loading}
            error={error}
            adminUsers={adminUsers}
            setAdminUsers={setAdminUsers}
            onToggleValidate={handleToggleValidate}
            onDeletePurchase={handleDeletePurchase}
            onEditPurchase={handleEditPurchase}
            onReminderPurchase={handleReminderPurchase}
            onRegisterPurchase={() => setAdminRegisterPurchaseOpen(true)}
            onExportCSV={handleExportCSV}
            refreshAllStats={refreshAllStats}
            onLogout={handleAdminLogout}
            onSetView={setView}
          />
        ) : (
          <section className="min-h-[80vh] relative">
            <div className="absolute inset-0 -z-10" style={{ backgroundImage: "url(/img/bg-cinema.jpg)", backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="absolute inset-0 -z-0 bg-black/60" />
            <div className="relative z-10 min-h-[80vh] grid place-items-center">
              <div className={tv(isDark, 'w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl border border-gray-200', 'w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl border border-gray-200')}>
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl text-white">🔐</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Acceso Administrador</h3>
                  <p className="text-sm text-gray-600">Ingresa tus credenciales para acceder al panel</p>
                </div>
                <AdminLoginForm
                  isDark={isDark}
                  onLogin={handleAdminLogin}
                  adminEmails={adminEmails}
                />
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setView('home')}
                    className="text-gray-600 hover:text-gray-800 text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <span>←</span> Volver al inicio
                  </button>
                </div>
              </div>
            </div>
          </section>
        );
      case 'auth':
        return (
          <section className="min-h-screen relative flex items-center justify-center">
            {/* Fondo mejorado */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
              <div className="absolute inset-0 bg-[url('/img/bg-cinema.jpg')] bg-cover bg-center opacity-20"></div>
              <div className="absolute inset-0 bg-black/50"></div>
            </div>

            {/* Efectos decorativos */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>

            <div className="relative z-10 mx-auto max-w-md px-4 py-8">
              <div className={`rounded-3xl p-8 shadow-2xl backdrop-blur-md border ${tv(isDark, 'bg-white/95 border-gray-200', 'bg-gray-900/95 border-gray-700')}`}>
                <div className="text-center mb-8">
                  {authStep === 'login' && (
                    <>
                      <div className="relative mb-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-3xl shadow-xl">
                          🔐
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
                      </div>
                      <h3 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Iniciar Sesión
                      </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-300">Accede a tu cuenta de StreamZone</p>
                    </>
                  )}
                  {authStep === 'register' && (
                    <>
                      <div className="relative mb-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center text-3xl shadow-xl">
                          🚀
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                      </div>
                      <h3 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        Crear Cuenta
                      </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-300">Únete a StreamZone y disfruta del mejor entretenimiento</p>
                    </>
                  )}
                  {authStep === 'email' && (
                    <>
                      <div className="relative mb-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-3xl shadow-xl">
                          📧
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
                      </div>
                      <h3 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Recuperar Contraseña
                      </h3>
                      <p className="text-lg text-gray-600 dark:text-gray-300">Paso 1: Ingresa tu email para recibir el código</p>
                    </>
                  )}
                </div>

                {authStep === 'login' && (
                  <UserLoginForm
                    isDark={isDark}
                    onLogin={handleLogin}
                    onForgotPassword={() => setAuthStep('email')}
                    setView={setView}
                  />
                )}
                {authStep === 'register' && (
                  <UserRegisterForm
                    isDark={isDark}
                    onSubmit={handleLogin}
                    setView={setView}
                    setAuthStep={setAuthStep}
                  />
                )}
                {authStep === 'email' && (
                  <ForgotPasswordForm
                    isDark={isDark}
                    onBack={() => setAuthStep('login')}
                    onTokenSent={handleForgotPassword}
                    onRegister={() => setAuthStep('register')}
                  />
                )}
                {authStep === 'code' && (
                  <CodeVerificationForm
                    isDark={isDark}
                    email={resetEmail}
                    onBack={() => setAuthStep('email')}
                    onCodeVerified={handleCodeVerified}
                  />
                )}
                {authStep === 'newpassword' && (
                  <ResetPasswordForm
                    isDark={isDark}
                    email={resetEmail}
                    token={resetToken}
                    onSuccess={handlePasswordReset}
                  />
                )}
              </div>
            </div>
          </section>
        );
      case 'register':
        return (
          <section className="min-h-screen relative flex items-center justify-center">
            {/* Fondo mejorado */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-blue-900 to-purple-900"></div>
              <div className="absolute inset-0 bg-[url('/img/bg-cinema.jpg')] bg-cover bg-center opacity-20"></div>
              <div className="absolute inset-0 bg-black/50"></div>
            </div>

            {/* Efectos decorativos */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>

            <div className="relative z-10 mx-auto max-w-md px-4 py-8">
              <div className={`rounded-3xl p-8 shadow-2xl backdrop-blur-md border ${tv(isDark, 'bg-white/95 border-gray-200', 'bg-gray-900/95 border-gray-700')}`}>
                <div className="text-center mb-8">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center text-3xl shadow-xl">
                      🚀
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-4xl font-bold mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Crear Cuenta
                  </h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300">Únete a StreamZone y disfruta del mejor entretenimiento</p>
                </div>

                <UserRegisterForm
                  isDark={isDark}
                  onSubmit={handleLogin}
                />

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setView('auth')}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${tv(isDark, 'text-gray-600 hover:text-gray-800', 'text-gray-400 hover:text-gray-200')}`}
                  >
                    ← Volver a login
                  </button>
                </div>
              </div>
            </div>
          </section>
        );
      default:
        return <Home isDark={isDark} onReserve={handleReserve} user={user} setView={setView} services={services || []} />;
    }
  };

  return renderMainContent();
}

