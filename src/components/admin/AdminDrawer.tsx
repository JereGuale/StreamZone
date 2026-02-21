import React, { useState } from 'react';
import { tv } from '../../utils/helpers';

interface AdminUser {
  email: string;
  role: 'principal' | 'secundario';
  canGenerateKeys: boolean;
  canDeleteOthers: boolean;
  isProtected: boolean;
}

interface AdminDrawerProps {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
  adminUsers: AdminUser[];
  setAdminUsers: (users: AdminUser[]) => void;
}

export function AdminDrawer({ open, onClose, isDark, adminUsers, setAdminUsers }: AdminDrawerProps) {
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'principal' | 'secundario'>('secundario');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  if (!open) return null;

  const generateAccessKey = (user: AdminUser) => {
    const key = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    navigator.clipboard.writeText(key);
    setMsg(`Clave copiada: ${key}`);
    setTimeout(() => setMsg(''), 3000);
  };

  const addSecondaryAdmin = () => {
    if (!newAdminEmail) {
      setMsg('Email requerido');
      return;
    }

    if (adminUsers.some(admin => admin.email === newAdminEmail)) {
      setMsg('Este administrador ya existe');
      return;
    }

    const newAdmin: AdminUser = {
      email: newAdminEmail,
      role: newAdminRole,
      canGenerateKeys: newAdminRole === 'principal',
      canDeleteOthers: newAdminRole === 'principal',
      isProtected: newAdminRole === 'principal'
    };

    setAdminUsers([...adminUsers, newAdmin]);
    setNewAdminEmail('');
    setMsg('✅ Administrador agregado');
    setTimeout(() => setMsg(''), 3000);
  };

  const removeAdmin = (userToRemove: AdminUser) => {
    if (userToRemove.isProtected) {
      setMsg('No se puede eliminar el administrador principal');
      return;
    }

    setAdminUsers(adminUsers.filter(admin => admin.email !== userToRemove.email));
    setMsg('✅ Administrador eliminado');
    setTimeout(() => setMsg(''), 3000);
  };

  const principalAdmin = adminUsers.find(admin => admin.role === 'principal');
  const secondaryAdmins = adminUsers.filter(admin => admin.role === 'secundario');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50"/>
      <aside className={`absolute right-0 top-0 h-full w-full sm:w-[450px] p-3 sm:p-6 shadow-2xl ${tv(isDark,'bg-white','bg-zinc-900 text-zinc-100')}`} onClick={e=>e.stopPropagation()}>
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <h4 className="text-lg sm:text-xl font-bold">👥 Gestión de Administradores</h4>
          <button 
            onClick={onClose} 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${tv(isDark,'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100','text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800')}`}
          >
            ×
          </button>
        </div>
        
        {/* Información del sistema */}
        <div className={`p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 ${tv(isDark,'bg-blue-50 border border-blue-200','bg-blue-900/20 border border-blue-700')}`}>
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="text-xl sm:text-2xl">🔒</div>
            <div>
              <h5 className={`font-semibold text-xs sm:text-sm mb-1 ${tv(isDark,'text-blue-800','text-blue-200')}`}>Sistema de Roles</h5>
              <p className={`text-xs ${tv(isDark,'text-blue-600','text-blue-300')}`}>
                <strong>Principal:</strong> Acceso completo, protegido. <strong>Secundarios:</strong> Pueden generar claves, limitados.
              </p>
            </div>
          </div>
        </div>
        
        {/* Administrador Principal */}
        {principalAdmin && (
          <div className="mb-4 sm:mb-6">
            <h5 className="font-semibold mb-3 text-sm sm:text-base">👑 Administrador Principal</h5>
            <div className={`p-3 sm:p-4 rounded-xl ${tv(isDark,'bg-yellow-50 border border-yellow-200','bg-yellow-900/20 border border-yellow-700')}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm sm:text-base">{principalAdmin.email}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-200 text-yellow-800">Principal</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => generateAccessKey(principalAdmin)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${tv(isDark,'bg-blue-100 text-blue-700 hover:bg-blue-200','bg-blue-900/30 text-blue-300 hover:bg-blue-900/50')}`}
                >
                  🔑 Generar Clave
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Agregar nuevo administrador */}
        <div className="mb-4 sm:mb-6">
          <h5 className="font-semibold mb-3 text-sm sm:text-base">➕ Agregar Administrador</h5>
          <div className="space-y-3">
            <div>
              <input
                type="email"
                placeholder="admin@correo.com"
                className={`w-full rounded-xl border-2 px-3 py-2 text-sm ${tv(isDark,'border-gray-300 bg-white text-gray-900','border-gray-600 bg-gray-700 text-white')}`}
                value={newAdminEmail}
                onChange={e => setNewAdminEmail(e.target.value)}
              />
            </div>
            <div>
              <select
                className={`w-full rounded-xl border-2 px-3 py-2 text-sm ${tv(isDark,'border-gray-300 bg-white text-gray-900','border-gray-600 bg-gray-700 text-white')}`}
                value={newAdminRole}
                onChange={e => setNewAdminRole(e.target.value as 'principal' | 'secundario')}
              >
                <option value="secundario">Secundario</option>
                <option value="principal">Principal</option>
              </select>
            </div>
            <button
              onClick={addSecondaryAdmin}
              className={`w-full px-4 py-2 rounded-xl font-medium transition-all ${tv(isDark,'bg-green-600 text-white hover:bg-green-700','bg-green-500 text-white hover:bg-green-600')}`}
            >
              ➕ Agregar
            </button>
          </div>
        </div>

        {/* Lista de administradores secundarios */}
        <div className="mb-4 sm:mb-6">
          <h5 className="font-semibold mb-3 text-sm sm:text-base">👥 Administradores Secundarios</h5>
          <div className="space-y-2">
            {secondaryAdmins.map((admin, index) => (
              <div key={index} className={`p-3 rounded-xl ${tv(isDark,'bg-gray-50 border border-gray-200','bg-gray-800 border border-gray-700')}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{admin.email}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">Secundario</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateAccessKey(admin)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${tv(isDark,'bg-blue-100 text-blue-700 hover:bg-blue-200','bg-blue-900/30 text-blue-300 hover:bg-blue-900/50')}`}
                  >
                    🔑 Clave
                  </button>
                  <button
                    onClick={() => removeAdmin(admin)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${tv(isDark,'bg-red-100 text-red-700 hover:bg-red-200','bg-red-900/30 text-red-300 hover:bg-red-900/50')}`}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {msg && (
          <div className={`p-3 rounded-xl text-sm ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {msg}
          </div>
        )}
      </aside>
    </div>
  );
}


