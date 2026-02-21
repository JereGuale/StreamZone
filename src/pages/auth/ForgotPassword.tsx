import React, { useState } from 'react';
import { generateResetToken } from '../../lib/supabase';
import { tv } from '../../utils/helpers';

interface ForgotPasswordProps {
  isDark: boolean;
  onBack: () => void;
  onTokenSent: (email: string, token: string) => void;
  onRegister: () => void;
}

export function ForgotPasswordForm({ isDark, onBack, onTokenSent, onRegister }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      console.log('🔍 Generando token para:', email);
      const result = await generateResetToken(email);
      console.log('🔍 Resultado:', result);

      if (result.data) {
        const tokenMessage = `✅ Token generado: ${result.data.token}. Usa este código para continuar.`;
        console.log('🔍 Mensaje:', tokenMessage);
        setMsg(tokenMessage);
        onTokenSent(email, result.data.token);
      } else {
        console.log('🔍 Error:', result.error);
        setMsg(result.error?.message || 'Error generando token');
      }
    } catch (error) {
      console.log('🔍 Error en catch:', error);
      setMsg('Error en el proceso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">🔐 Recuperar Contraseña</h3>
        <p className="text-sm opacity-80">Para recuperar tu contraseña, necesitas un código de verificación</p>
      </div>

      <div className={`p-4 rounded-xl mb-4 ${tv(isDark, 'bg-blue-50 border border-blue-200', 'bg-blue-900/20 border border-blue-400/30')}`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl">💬</div>
          <div>
            <h4 className={`font-semibold mb-2 ${tv(isDark, 'text-zinc-800', 'text-zinc-200')}`}>📋 Instrucciones:</h4>
            <ol className={`text-sm space-y-1 list-decimal list-inside ${tv(isDark, 'text-zinc-700', 'text-zinc-300')}`}>
              <li>Haz clic en el botón <span className="font-semibold">"Chat"</span> (esquina inferior derecha)</li>
              <li>Escribe: <span className={`font-mono px-1 rounded ${tv(isDark, 'bg-gray-200 text-zinc-800', 'bg-gray-700 text-zinc-200')}`}>"olvidé mi contraseña"</span></li>
              <li>Envía tu email: <span className="font-semibold">ejemplo@gmail.com</span></li>
              <li>Copia el código que te dé el chatbot</li>
              <li>Regresa aquí y pega el código</li>
            </ol>
          </div>
        </div>
      </div>

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

      {msg && (
        <div className={`text-sm ${msg.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {msg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-xl px-4 py-3 font-semibold transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${tv(isDark, 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700', 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700')}`}
      >
        {loading ? '⏳ Generando código...' : '🔑 Generar Código'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className={`text-sm ${tv(isDark, 'text-zinc-600 hover:text-zinc-800', 'text-zinc-400 hover:text-zinc-200')}`}
          disabled={loading}
        >
          ← Volver a login
        </button>
      </div>

      {msg && msg.includes('No existe un usuario') && (
        <div className="text-center">
          <button 
            type="button"
            onClick={onRegister}
            className={`text-sm ${tv(isDark,'text-blue-600 hover:text-blue-700','text-blue-400 hover:text-blue-300')}`}
          >
            ✨ Crear cuenta nueva
          </button>
        </div>
      )}
    </form>
  );
}