// ===================== Tipos e Interfaces =====================

export type PurchaseStatus = 'pending' | 'validated' | 'active' | 'expired' | 'cancelled';
export type PaymentMethod = 'pichincha' | 'guayaquil' | 'pacifico' | 'paypal' | 'mobile';

export interface UserPurchase {
  id: string;
  service: string;
  price: number;
  months: number;
  phone: string;
  email: string;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
  createdAt: string;
  validated: boolean;
  validatedAt?: string;
  expiresAt?: string;
  serviceEmail?: string;
  servicePassword?: string;
  notes?: string;
}

export interface UserProfile {
  phone: string;
  email: string;
  name: string;
  country: string;
  createdAt: string;
}

// Sistema de administradores con roles
export const ADMIN_ROLES = {
  PRINCIPAL: 'principal',
  SECUNDARIO: 'secundario'
} as const;

export interface AdminUser {
  email: string;
  role: 'principal' | 'secundario';
  canGenerateKeys: boolean;
  canDeleteOthers: boolean;
  isProtected: boolean;
}

export const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    email: "gualejeremi@gmail.com",
    role: "principal",
    canGenerateKeys: true,
    canDeleteOthers: true,
    isProtected: true
  },
  {
    email: "admin@streamzone.com",
    role: "secundario",
    canGenerateKeys: false,
    canDeleteOthers: false,
    isProtected: false
  }
];

export const PAYMENT_METHODS = [
  { id: 'pichincha', name: 'Banco Pichincha', icon: '🏦', description: 'Transferencia bancaria' },
  { id: 'guayaquil', name: 'Banco de Guayaquil', icon: '🏦', description: 'Transferencia bancaria' },
  { id: 'pacifico', name: 'Banco del Pacífico', icon: '🏦', description: 'Transferencia bancaria' },
  { id: 'paypal', name: 'PayPal', icon: '💳', description: 'Pago digital internacional' },
  { id: 'mobile', name: 'Pago Móvil', icon: '📱', description: 'Pago desde tu celular' }
];

// Constantes de WhatsApp
export const ADMIN_WHATSAPP = "+593984280334";
export const AGENTE_1_WHATSAPP = "+593984280334"; // Tu número principal
export const AGENTE_2_WHATSAPP = "+593998799579"; // Tu hermano

