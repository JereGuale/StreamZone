import { useState } from 'react';

export const useNavigation = () => {
  const [view, setView] = useState<'home'|'combos'|'admin'|'register'|'adminLogin'|'auth'|'profile'>('home');
  
  const navigateToHome = () => setView('home');
  const navigateToCombos = () => setView('combos');
  const navigateToAdmin = () => setView('admin');
  const navigateToAuth = () => setView('auth');
  const navigateToProfile = () => setView('profile');
  const navigateToRegister = () => setView('register');
  
  return {
    view,
    setView,
    navigateToHome,
    navigateToCombos,
    navigateToAdmin,
    navigateToAuth,
    navigateToProfile,
    navigateToRegister
  };
};














