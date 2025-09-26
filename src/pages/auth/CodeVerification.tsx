import React, { useState } from 'react';
import { verifyResetToken } from '../../lib/supabase';
import { tv } from '../../utils/helpers';

interface CodeVerificationFormProps {
  isDark: boolean;
  email: string;
  onBack: () => void;
  onCodeVerified: (token: string) => void;
}

export function CodeVerificationForm({ isDark, email, onBack, onCodeVerified }: CodeVerificationFormProps) {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const submit = async (e: React.FormEvent) => { 
    e.preventDefault();
    setLoading(true);
    setMsg('');
    
    try {
      // Verificar el código (token) con Supabase
      const result = await verifyResetToken(code);
      if (result.data) {
        setMsg('✅ Código verificado correctamente');
        onCodeVerified(code);
      } else {
        setMsg('❌ Código inválido o expirado');
      }
    } catch (error) {
      setMsg('Error verificando código');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">🔐 Verificar Código</h3>
        <p className="text-sm opacity-80">Paso 2: Ingresa el código que enviamos a {email}</p>
      </div>
      
      <div className={`p-4 rounded-xl mb-4 ${tv(isDark,'bg-green-50 border border-green-200','bg-green-900/20 border border-green-400/30')}`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔑</div>
          <div>
            <h4 className="font-semibold mb-2">💡 ¿No tienes el código?</h4>
            <p className="text-sm mb-2">El código se obtiene del chatbot en el paso anterior.</p>
            <p className="text-sm text-green-600 dark:text-green-400">
              <strong>Tip:</strong> Si no lo tienes, vuelve al paso anterior y sigue las instrucciones.
            </p>
          </div>
        </div>
      </div>
      
      <div className="text-center mb-4">
        <button 
          type="button"
          onClick={() => {
            const chatButton = document.querySelector('[data-chat-button]') as HTMLButtonElement;
            if (chatButton) chatButton.click();
          }}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tv(isDark,'bg-blue-100 text-blue-700 hover:bg-blue-200','bg-blue-900/30 text-blue-300 hover:bg-blue-900/50')}`}
        >
          💬 Abrir Chatbot
        </button>
      </div>
      
      <div>
        <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>Código de verificación</label>
        <input 
          required 
          type="text"
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`} 
          value={code} 
          onChange={e=>setCode(e.target.value)} 
          placeholder="Ingresa el código de 6 dígitos"
          disabled={loading}
          maxLength={6}
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
        className={`w-full rounded-xl px-4 py-3 font-semibold transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${tv(isDark,'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700','bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700')}`}
      >
        {loading ? '⏳ Verificando código...' : '✅ Verificar Código'}
      </button>
      
      <div className="text-center">
        <button 
          type="button"
          onClick={onBack}
          className={`text-sm ${tv(isDark,'text-zinc-600 hover:text-zinc-800','text-zinc-400 hover:text-zinc-200')}`}
          disabled={loading}
        >
          ← Volver a ingresar email
        </button>
      </div>
    </form>
  );
}

