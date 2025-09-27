import React, { useState } from 'react';
import { loginUser } from '../../lib/supabase';
import { tv } from '../../utils/helpers';

interface LoginProps {
  isDark: boolean;
  onLogin: (user: any) => void;
  onForgotPassword: () => void;
  setView?: (view: string) => void;
}

export function UserLoginForm({ isDark, onLogin, onForgotPassword, setView }: LoginProps) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const result = await loginUser(email, pass);
      if (result.data) {
        setMsg('Login exitoso');
        onLogin(result.data);
        // Redirigir automáticamente al perfil después del login exitoso
        if (setView) {
          setTimeout(() => {
            setView('profile');
          }, 500); // Reducir a 500ms para mayor velocidad
        }
      } else {
        setMsg('Credenciales incorrectas');
      }
    } catch (error) {
      setMsg('Error en el login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className={tv(isDark, 'text-sm text-zinc-800', 'text-sm text-zinc-300')}>Correo electrónico</label>
        <input
          required
          type="email"
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200', 'border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`}
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="tu@correo.com"
          disabled={loading}
        />
      </div>
      <div>
        <label className={tv(isDark, 'text-sm text-zinc-800', 'text-sm text-zinc-300')}>Contraseña</label>
        <div className="flex gap-2">
          <input
            required
            type={show ? 'text' : 'password'}
            className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200', 'border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`}
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="••••••"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className={tv(isDark, 'rounded-xl bg-zinc-100 px-4 py-3', 'rounded-xl bg-zinc-700 px-4 py-3')}
            disabled={loading}
          >
            {show ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>
      {msg && (
        <div className={`text-sm ${msg.includes('exitoso') ? 'text-green-600' : 'text-red-600'}`}>
          {msg}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-xl px-4 py-3 font-semibold transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${tv(isDark, 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700', 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700')}`}
      >
        {loading ? '⏳ Iniciando sesión...' : '🚀 Iniciar Sesión'}
      </button>

      <div className="text-center">
        <button 
          type="button"
          onClick={onForgotPassword}
          className={`text-sm ${tv(isDark,'text-zinc-600 hover:text-zinc-800','text-zinc-400 hover:text-zinc-200')}`}
          disabled={loading}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <div className="mt-8 text-center space-y-4">
        <div className={`text-sm font-medium ${tv(isDark,'text-gray-600','text-gray-400')}`}>¿No tienes cuenta?</div>
        <button
          onClick={() => setView && setView('register')}
          className={`w-full rounded-2xl px-6 py-4 font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl ${tv(isDark,
            'bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 text-white hover:from-green-600 hover:via-blue-600 hover:to-purple-700',
            'bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 text-white hover:from-green-700 hover:via-blue-700 hover:to-purple-800'
          )}`}
        >
          <span className="flex items-center justify-center gap-3">
            <span className="text-xl">✨</span>
            <span>Crear cuenta nueva</span>
            <span className="text-xl">🚀</span>
          </span>
        </button>
      </div>
    </form>
  );
}