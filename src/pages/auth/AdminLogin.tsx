import React, { useState } from 'react';
import { tv } from '../../utils/helpers';

interface AdminLoginFormProps {
  isDark: boolean;
  onLogin: (ok: boolean) => void;
  adminEmails: string[];
}

export function AdminLoginForm({ isDark, onLogin, adminEmails }: AdminLoginFormProps) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const submit = async (e: React.FormEvent) => { 
    e.preventDefault();
    setLoading(true);
    setMsg('');
    
    try {
      // Simular un pequeño delay para mejor UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const emailNorm = email.trim().toLowerCase();
      const ok = adminEmails.map(x=>x.toLowerCase()).includes(emailNorm) && pass.trim()==='Jeremias_012.@';
      setMsg(ok? '':'Credenciales incorrectas');
      onLogin(ok);
    } catch (error) {
      setMsg('Error en el login');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={submit} className="space-y-6">
      
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">📧 Correo electrónico</label>
        <div className="relative">
          <input 
            required 
            type="email"
            className="w-full rounded-xl border-2 border-gray-200 bg-white text-gray-900 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200" 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            placeholder="admin@correo.com"
            disabled={loading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">🔑 Contraseña</label>
        <div className="relative">
          <input 
            required 
            type={show ? 'text' : 'password'} 
            className="w-full rounded-xl border-2 border-gray-200 bg-white text-gray-900 px-4 py-3 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200" 
            value={pass} 
            onChange={e=>setPass(e.target.value)} 
            placeholder="••••••••"
            disabled={loading}
          />
          <button 
            type="button" 
            onClick={()=>setShow(s=>!s)} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            disabled={loading}
          >
            {show ? '🙈' : '👁️'}
          </button>
        </div>
      </div>
      
      {msg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <span>⚠️</span>
          {msg}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={loading}
        className={`w-full rounded-xl px-6 py-4 font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${tv(isDark,'bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white hover:from-purple-700 hover:via-blue-700 hover:to-pink-700','bg-gradient-to-r from-purple-700 via-blue-700 to-pink-700 text-white hover:from-purple-800 hover:via-blue-800 hover:to-pink-800')}`}
      >
        <span className="flex items-center justify-center gap-3">
          <span className="text-xl">🚀</span>
          <span>{loading ? '⏳ Verificando...' : 'Entrar al Panel'}</span>
          <span className="text-xl">✨</span>
        </span>
      </button>
      
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Solo administradores autorizados pueden acceder
        </p>
      </div>
    </form>
  );
}

