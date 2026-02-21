import { useState, useEffect } from 'react';
import { storage } from '../utils/helpers';

interface UserProfile {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  purchases: any[];
  createdAt: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<any>(() => storage.load('userProfile', null));
  const [adminLogged, setAdminLogged] = useState<boolean>(() => !!storage.load('adminLogged', false));
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => storage.load('userProfileData', null));
  const [allPurchases, setAllPurchases] = useState<any[]>(() => storage.load('allPurchases', []));
  
  // Estados para autenticación
  const [authStep, setAuthStep] = useState<'login'|'email'|'code'|'newpassword'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetCode, setResetCode] = useState('');
  
  useEffect(() => { storage.save('userProfile', user); }, [user]);
  useEffect(() => { storage.save('userProfileData', userProfile); }, [userProfile]);
  useEffect(() => { storage.save('allPurchases', allPurchases); }, [allPurchases]);
  useEffect(() => { storage.save('adminLogged', adminLogged); }, [adminLogged]);
  
  const handleLogin = (userData: any) => {
    setUser(userData);
  };
  
  const handleLogout = () => {
    setUser(null);
    setUserProfile(null);
  };
  
  const handleAdminLogin = (success: boolean) => {
    if (success) {
      setAdminLogged(true);
    }
  };
  
  const handleAdminLogout = () => {
    setAdminLogged(false);
  };
  
  const handleForgotPassword = (email: string, token: string) => {
    setResetEmail(email);
    setResetToken(token);
    setAuthStep('code');
  };
  
  const handleCodeVerified = (token: string) => {
    setResetToken(token);
    setAuthStep('newpassword');
  };
  
  const handlePasswordReset = () => {
    setAuthStep('login');
  };
  
  return {
    user,
    setUser,
    adminLogged,
    setAdminLogged,
    userProfile,
    setUserProfile,
    allPurchases,
    setAllPurchases,
    authStep,
    setAuthStep,
    resetEmail,
    setResetEmail,
    resetToken,
    setResetToken,
    resetCode,
    setResetCode,
    handleLogin,
    handleLogout,
    handleAdminLogin,
    handleAdminLogout,
    handleForgotPassword,
    handleCodeVerified,
    handlePasswordReset
  };
};














