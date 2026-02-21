// ===================== Utilidades Originales =====================

// Formateo de moneda
export const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD" }).format(n);

// Storage helper
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

// Generar ID único
export function uid() { 
  return Math.random().toString(36).slice(2,10); 
}

// Calcular días entre fechas
export function daysBetween(a: string, b: string) { 
  return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)); 
}

// Generar enlace de WhatsApp
export function whatsappLink(to: string, text: string) { 
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`; 
}

// Toggle de tema
export function tv<T>(isDark: boolean, light: T, dark: T) { 
  return isDark ? dark : light; 
}

// Función mejorada para contraste que considera el modo del sistema
export function tvContrast<T>(
  isDark: boolean, 
  systemPrefersDark: boolean, 
  light: T, 
  dark: T, 
  lightHighContrast?: T
) { 
  if (systemPrefersDark && !isDark) {
    return lightHighContrast || light;
  }
  return isDark ? dark : light; 
}

// Calcular días restantes
export const getDaysRemaining = (endDate: string): number => {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Obtener estado del servicio
export const getServiceStatus = (endDate: string): { status: string; color: string; icon: string; message: string } => {
  const days = getDaysRemaining(endDate);
  
  if (days < 0) {
    return {
      status: 'expired',
      color: 'text-red-500',
      icon: '❌',
      message: 'Expirado'
    };
  } else if (days <= 3) {
    return {
      status: 'expiring',
      color: 'text-orange-500',
      icon: '⚠️',
      message: `Expira en ${days} días`
    };
  } else if (days <= 7) {
    return {
      status: 'warning',
      color: 'text-yellow-500',
      icon: '⏰',
      message: `Expira en ${days} días`
    };
  } else {
    return {
      status: 'active',
      color: 'text-green-500',
      icon: '✅',
      message: `Activo (${days} días restantes)`
    };
  }
};

// Filtrar compras del usuario
export function ownPurchases(list: any[], user: any) { 
  if (!user) return []; 
  return list.filter(p => p.validated && p.phone === user.phone); 
}

// Limpiar número de teléfono
export function cleanPhone(value: string) { 
  // Remover todos los caracteres no numéricos
  const cleaned = value.replace(/\D/g, '');
  
  // Si empieza con 593, removerlo
  if (cleaned.startsWith('593')) {
    return cleaned.substring(3);
  }
  
  // Si empieza con 0, removerlo
  if (cleaned.startsWith('0')) {
    return cleaned.substring(1);
  }
  
  return cleaned;
}

// Validar email
export function emailOk(e: string) { 
  return /.+@.+\..+/.test(e); 
}

// Obtener descripción del servicio
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

