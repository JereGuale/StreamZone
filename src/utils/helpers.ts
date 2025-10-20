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
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function whatsappLink(to: string, text: string){ 
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`; 
}

// Función para formatear número de teléfono para WhatsApp
export function formatPhoneForWhatsApp(phone: string): string {
  // Remover todos los caracteres no numéricos
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Si el número ya tiene el prefijo 593, verificar que tenga la longitud correcta
  if (cleanPhone.startsWith('593')) {
    // Un número ecuatoriano válido debe tener 12 dígitos: 593 + 9 dígitos
    if (cleanPhone.length === 12) {
      return cleanPhone;
    }
    // Si tiene más de 12 dígitos, tomar solo los primeros 12
    if (cleanPhone.length > 12) {
      return cleanPhone.substring(0, 12);
    }
    // Si tiene menos de 12 dígitos pero empieza con 593, es inválido
    console.warn('Número de teléfono ecuatoriano inválido:', phone);
    return cleanPhone;
  }
  
  // Si el número empieza con 0 (formato local ecuatoriano), remover el 0 y agregar 593
  if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    const withoutZero = cleanPhone.substring(1); // Remover el 0 inicial
    return `593${withoutZero}`;
  }
  
  // Si el número no tiene prefijo y no empieza con 0, agregar 593 (Ecuador por defecto)
  // Verificar que el número base tenga 9 dígitos (formato ecuatoriano)
  if (cleanPhone.length === 9) {
    return `593${cleanPhone}`;
  }
  
  // Si no tiene 9 dígitos, es inválido
  console.warn('Número de teléfono ecuatoriano inválido:', phone);
  return `593${cleanPhone}`;
}

// Función para validar y formatear número de teléfono completo
export function formatPhoneNumber(phone: string, countryCode: string): string {
  // Remover todos los caracteres no numéricos del número
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Remover el + del código de país
  const cleanCountryCode = countryCode.replace(/[^\d]/g, '');
  
  // Si el número ya incluye el código de país, verificar longitud
  if (cleanPhone.startsWith(cleanCountryCode)) {
    // Para Ecuador (593), el número debe tener 12 dígitos total
    if (cleanCountryCode === '593' && cleanPhone.length === 12) {
      return `+${cleanPhone}`;
    }
    // Si tiene más dígitos de los esperados, truncar
    if (cleanPhone.length > 12) {
      return `+${cleanPhone.substring(0, 12)}`;
    }
    return `+${cleanPhone}`;
  }
  
  // Para Ecuador, manejar el caso especial del 0 inicial
  if (cleanCountryCode === '593') {
    // Si el número empieza con 0 (formato local), remover el 0
    if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      const withoutZero = cleanPhone.substring(1); // Remover el 0 inicial
      return `+${cleanCountryCode}${withoutZero}`;
    }
    
    // Si el número tiene 9 dígitos (sin 0), agregar directamente
    if (cleanPhone.length === 9) {
      return `+${cleanCountryCode}${cleanPhone}`;
    }
  }
  
  // Combinar código de país con número
  const fullNumber = `${cleanCountryCode}${cleanPhone}`;
  
  // Para Ecuador, verificar que el resultado tenga 12 dígitos
  if (cleanCountryCode === '593' && fullNumber.length !== 12) {
    console.warn('Número de teléfono ecuatoriano inválido:', phone, 'Resultado:', fullNumber);
  }
  
  return `+${fullNumber}`;
}

// Función para validar números de teléfono ecuatorianos
export function validateEcuadorianPhone(phone: string): { isValid: boolean; formatted: string; error?: string } {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Un número ecuatoriano válido debe tener exactamente 12 dígitos: 593 + 9 dígitos
  if (cleanPhone.length === 12 && cleanPhone.startsWith('593')) {
    // Verificar que los 9 dígitos después del 593 sean válidos
    const baseNumber = cleanPhone.substring(3);
    if (baseNumber.length === 9 && baseNumber.startsWith('9')) {
      return { isValid: true, formatted: `+${cleanPhone}` };
    }
  }
  
  // Si empieza con 0 (formato local ecuatoriano), convertir a formato internacional
  if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
    const withoutZero = cleanPhone.substring(1);
    if (withoutZero.startsWith('9')) {
      const internationalFormat = `593${withoutZero}`;
      return { isValid: true, formatted: `+${internationalFormat}` };
    }
  }
  
  // Si tiene más de 12 dígitos, truncar
  if (cleanPhone.length > 12 && cleanPhone.startsWith('593')) {
    const truncated = cleanPhone.substring(0, 12);
    return { isValid: true, formatted: `+${truncated}`, error: 'Número truncado a 12 dígitos' };
  }
  
  // Si no es válido
  return { 
    isValid: false, 
    formatted: `+${cleanPhone}`, 
    error: 'Número ecuatoriano inválido. Debe tener formato: 098 160 8437 o 593 98 160 8437' 
  };
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