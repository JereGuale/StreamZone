// ===================== Utilidades =====================
export const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD" }).format(n);

export const storage = {
  load<T>(key: string, fallback: T): T {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) as T;
    } catch {
      return fallback;
    }
  },
  save<T>(key: string, val: T) {
    localStorage.setItem(key, JSON.stringify(val));
  },
  del(key: string) {
    localStorage.removeItem(key);
  }
};

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function daysBetween(a: string, b: string) {
  const date1 = new Date(a);
  const date2 = new Date(b);
  const diffTime = date2.getTime() - date1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function whatsappLink(to: string, text: string) {
  return `https://api.whatsapp.com/send?phone=${to}&text=${encodeURIComponent(text)}`;
}

// Función mejorada para codificar mensajes de WhatsApp preservando emojis
export function whatsappLinkWithEmojis(to: string, text: string): string {
  // Usar encodeURIComponent pero con una codificación más específica
  const encodedText = encodeURIComponent(text);
  return `https://api.whatsapp.com/send?phone=${to}&text=${encodedText}`;
}

// Función simple que funciona mejor con WhatsApp
export function whatsappLinkSimple(to: string, text: string): string {
  // Crear URL directamente sin codificación excesiva
  const baseUrl = `https://api.whatsapp.com/send`;
  const params = new URLSearchParams();
  params.set('phone', to);
  params.set('text', text);
  return `${baseUrl}?${params.toString()}`;
}

export function tv<T>(isDark: boolean, light: T, dark: T) {
  return isDark ? dark : light;
}

// Función mejorada para contraste que considera el modo del sistema
export function tvContrast<T>(isDark: boolean, systemPrefersDark: boolean, light: T, dark: T, lightHighContrast?: T) {
  if (lightHighContrast && !systemPrefersDark && !isDark) {
    return lightHighContrast;
  }
  return isDark ? dark : light;
}

export const getDaysRemaining = (endDate: string): number => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Nueva función para calcular los días totales del servicio
export const getServiceDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getServiceStatus = (endDate: string): { status: string; color: string; icon: string; message: string } => {
  const daysRemaining = getDaysRemaining(endDate);

  if (daysRemaining < 0) {
    return {
      status: 'expired',
      color: 'text-red-600',
      icon: '❌',
      message: 'Servicio Caducado'
    };
  } else if (daysRemaining === 0) {
    return {
      status: 'expires-today',
      color: 'text-red-600',
      icon: '⚠️',
      message: 'Caduca Hoy'
    };
  } else {
    return {
      status: 'active',
      color: 'text-red-600',
      icon: '⏰',
      message: `${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'} restantes`
    };
  }
};

export function ownPurchases(list: any[], user: any) {
  if (!user) return [];
  return list.filter(p => p.validated && p.phone === user.phone);
}

export function cleanPhone(value: string) {
  return value.replace(/[^\d]/g, '');
}

export function formatPhoneNumber(phone: string, countryCode: string = '+593'): string {
  const cleaned = cleanPhone(phone);
  if (cleaned.length === 0) return '';

  // Si ya tiene código de país, no agregar otro
  if (cleaned.startsWith('593') && cleaned.length >= 9) {
    return `+${cleaned}`;
  }

  // Si es un número local (9 dígitos), agregar código de país
  if (cleaned.length === 9) {
    return `${countryCode}${cleaned}`;
  }

  // Si es un número con código de país pero sin el +
  if (cleaned.length === 12 && cleaned.startsWith('593')) {
    return `+${cleaned}`;
  }

  return cleaned;
}

export function formatPhoneForWhatsApp(phone: string, countryCode: string = '593'): string {
  const cleaned = cleanPhone(phone);
  if (cleaned.length === 0) return '';

  // Si ya tiene código de país, no agregar otro
  if (cleaned.startsWith('593') && cleaned.length >= 9) {
    return cleaned;
  }

  // Si es un número local (9 dígitos), agregar código de país
  if (cleaned.length === 9) {
    return `${countryCode}${cleaned}`;
  }

  return cleaned;
}

export function emailOk(e: string) {
  return /.+@.+\..+/.test(e);
}

export function getServiceDescription(serviceId: string): string {
  const descriptions: { [key: string]: string } = {
    'netflix': 'Series originales, thrillers, documentales',
    'disney': 'Marvel, Star Wars, Pixar, familias',
    'max': 'HBO premium, series épicas, películas',
    'prime': 'Exclusivas, blockbusters, Amazon',
    'spotify': 'Música, podcasts, audiolibros',
    'paramount': 'Paramount, Nickelodeon, MTV',
    'apple': 'Originales Apple, 4K premium'
  };

  return descriptions[serviceId] || 'Contenido premium de entretenimiento';
}