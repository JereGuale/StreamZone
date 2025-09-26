import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { tv, cleanPhone } from '../../utils/helpers';
import { CountryCodeSelector } from '../../components/CountryCodeSelector';

interface RegisterProps {
  isDark: boolean;
  onSubmit: (profile: any) => void;
}

export function UserRegisterForm({ isDark, onSubmit }: RegisterProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+593'); // Ecuador por defecto
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    // Validaciones
    if (!name || !phone || !email || !password) {
      setMsg('Todos los campos son obligatorios');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMsg('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMsg('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Crear usuario en Supabase
      const fullPhone = countryCode + phone.replace(/[^\d]/g, ''); // Combinar código de país con número
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          name,
          phone: fullPhone,
          email: email.toLowerCase().trim(),
          password
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Código de violación de constraint único
          setMsg('Ya existe un usuario con este email o teléfono');
        } else {
          setMsg('Error al crear la cuenta');
        }
        setLoading(false);
        return;
      }

      setMsg('✅ Cuenta creada exitosamente');
      onSubmit({ name, phone: cleanPhone(phone), email, password });
    } catch (error) {
      setMsg('Error al crear la cuenta');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className={tv(isDark, 'text-sm text-zinc-800', 'text-sm text-zinc-300')}>Nombre completo</label>
        <input
          required
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200', 'border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Tu nombre completo"
          disabled={loading}
        />
      </div>

      <div>
        <label className={tv(isDark, 'text-sm text-zinc-800', 'text-sm text-zinc-300')}>WhatsApp</label>
        <div className="flex gap-2">
          {/* Selector de código de país mejorado */}
          <CountryCodeSelector
            value={countryCode}
            onChange={setCountryCode}
            isDark={isDark}
            disabled={loading}
          />

          {/* Campo de número de teléfono */}
          <input
            required
            className={`flex-1 rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200', 'border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`}
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="99 999 9999"
            disabled={loading}
          />
        </div>
        <div className={`text-xs mt-1 ${tv(isDark, 'text-gray-500', 'text-gray-400')}`}>
          Número completo: {countryCode} {phone}
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

      <div>
        <label className={tv(isDark, 'text-sm text-zinc-800', 'text-sm text-zinc-300')}>Contraseña</label>
        <input
          required
          type={showPassword ? 'text' : 'password'}
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200', 'border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          minLength={6}
          disabled={loading}
        />
      </div>

      <div>
        <label className={tv(isDark, 'text-sm text-zinc-800', 'text-sm text-zinc-300')}>Confirmar contraseña</label>
        <input
          required
          type={showPassword ? 'text' : 'password'}
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark, 'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200', 'border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`}
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          minLength={6}
          disabled={loading}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showPassword"
          checked={showPassword}
          onChange={e => setShowPassword(e.target.checked)}
          className="rounded"
          disabled={loading}
        />
        <label htmlFor="showPassword" className={tv(isDark, 'text-sm text-zinc-700', 'text-sm text-zinc-300')}>
          Mostrar contraseña
        </label>
      </div>

      {msg && (
        <div className={`text-sm ${msg.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {msg}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-xl px-4 py-3 font-semibold transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${tv(isDark, 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700', 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700')}`}
      >
        {loading ? '⏳ Creando cuenta...' : '🚀 Crear cuenta'}
      </button>
    </form>
  );
}