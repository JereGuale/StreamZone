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
  del(key: string){ 
    localStorage.removeItem(key); 
  }
};

export function uid(){ 
  return Math.random().toString(36).slice(2,10); 
}

export function daysBetween(a: string, b: string){ 
  const date1 = new Date(a);
  const date2 = new Date(b);
  const diffTime = date2.getTime() - date1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function whatsappLink(to: string, text: string){ 
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`; 
}

export function tv<T>(isDark: boolean, light: T, dark: T){ 
  return isDark? dark : light; 
}

// Función mejorada para contraste que considera el modo del sistema
export function tvContrast<T>(isDark: boolean, systemPrefersDark: boolean, light: T, dark: T, lightHighContrast?: T){ 
  if (lightHighContrast && !systemPrefersDark && !isDark) {
    return lightHighContrast;
  }
  return isDark ? dark : light;
}

export const getDaysRemaining = (endDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getServiceStatus = (endDate: string): { status: string; color: string; icon: string; message: string } => {
  const days = getDaysRemaining(endDate);
  if (days < 0) {
    return { status: 'Vencido', color: 'text-red-600', icon: '🔴', message: 'Tu servicio ha caducado.' };
  }
  if (days === 0) {
    return { status: 'Vence hoy', color: 'text-orange-600', icon: '🟠', message: 'Tu servicio vence hoy. ¡Renueva pronto!' };
  }
  if (days <= 7) {
    return { status: `Vence en ${days} días`, color: 'text-amber-600', icon: '🟡', message: `Tu servicio vence en ${days} días.` };
  }
  return { status: 'Activo', color: 'text-green-600', icon: '🟢', message: 'Tu servicio está activo.' };
};

export function ownPurchases(list: any[], user: any){ 
  if(!user) return []; 
  return list.filter(p=>p.validated && p.phone===user.phone); 
}

export function cleanPhone(value: string){ 
  return value.replace(/[^\d]/g, '');
}

export function emailOk(e: string){ 
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