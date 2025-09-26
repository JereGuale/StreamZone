import React, { useState } from 'react';
import { resetPassword } from '../../lib/supabase';
import { tv } from '../../utils/helpers';

interface ResetPasswordFormProps {
  isDark: boolean;
  email: string;
  token: string;
  onSuccess: () => void;
}

export function ResetPasswordForm({ isDark, email, token, onSuccess }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const submit = async (e: React.FormEvent) => { 
    e.preventDefault();
    setLoading(true);
    setMsg('');
    
    // Validaciones
    if (!newPassword || !confirmPassword) {
      setMsg('Todos los campos son obligatorios');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMsg('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMsg('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }
    
    try {
      // Restablecer contraseña con Supabase
      const result = await resetPassword(email, token, newPassword);
      if (result.data) {
        setMsg('✅ Contraseña restablecida exitosamente');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        setMsg('❌ Error al restablecer la contraseña');
      }
    } catch (error) {
      setMsg('Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">🔐 Nueva Contraseña</h3>
        <p className="text-sm opacity-80">Paso 3: Crea tu nueva contraseña</p>
      </div>
      
      <div className={`p-4 rounded-xl mb-4 ${tv(isDark,'bg-blue-50 border border-blue-200','bg-blue-900/20 border border-blue-400/30')}`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔒</div>
          <div>
            <h4 className="font-semibold mb-2">💡 Requisitos de seguridad:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Mínimo 6 caracteres</li>
              <li>Usa una combinación de letras y números</li>
              <li>No uses contraseñas obvias</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div>
        <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>Nueva contraseña</label>
        <div className="flex gap-2">
          <input 
            required 
            type={showPassword ? 'text' : 'password'} 
            className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`} 
            value={newPassword} 
            onChange={e=>setNewPassword(e.target.value)} 
            placeholder="••••••••"
            disabled={loading}
          />
          <button 
            type="button" 
            onClick={()=>setShowPassword(s=>!s)} 
            className={tv(isDark,'rounded-xl bg-zinc-100 px-4 py-3','rounded-xl bg-zinc-700 px-4 py-3')}
            disabled={loading}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>
      
      <div>
        <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>Confirmar contraseña</label>
        <input 
          required 
          type="password" 
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`} 
          value={confirmPassword} 
          onChange={e=>setConfirmPassword(e.target.value)} 
          placeholder="••••••••"
          disabled={loading}
        />
      </div>
      
      {msg && (
        <div className={`text-sm ${msg.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {msg}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={loading}
        className={`w-full rounded-xl px-4 py-3 font-semibold transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${tv(isDark,'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700','bg-gradient-to-r from-blue-500 to-green-600 text-white hover:from-blue-600 hover:to-green-700')}`}
      >
        {loading ? '⏳ Restableciendo...' : '✅ Restablecer Contraseña'}
      </button>
      
      <div className="text-center">
        <button 
          type="button"
          onClick={onSuccess}
          className={`text-sm ${tv(isDark,'text-zinc-600 hover:text-zinc-800','text-zinc-400 hover:text-zinc-200')}`}
          disabled={loading}
        >
          ← Volver al login
        </button>
      </div>
    </form>
  );
}

