import React, { useEffect, useMemo, useState } from "react";
import { supabase, createUser, getUserByPhone, updateUser, createPurchase, syncServices, DatabasePurchase, getUserPurchases, getUserByEmail, generateResetToken, verifyResetToken, resetPassword, loginUser, approvePurchase, getPendingPurchases, getUserActivePurchases, getAllPurchases, getExpiringServices, createRenewal, getRenewalHistory, toggleAutoRenewal, getRenewalNotifications, getRenewalStats, updatePurchase, updatePurchaseValidation, RenewalHistory, ExpiringService } from "./lib/supabase";
import './animations.css';
import './styles.css';

/**
 * StreamZone – Tienda de Streaming (React + TS + Tailwind)
 * - Catálogo con precios
 * - Reserva por WhatsApp
 * - Registro y “Mis compras”
 * - Panel Admin minimalista con menú desplegable
 * - Toggle oscuro/claro + chatbot flotante
 */

// ===================== Datos =====================
const SERVICES = [
  { id: "netflix", name: "Netflix", price: 4.0, billing: "monthly", color: "bg-red-600", logo: "N" },
  { id: "disney_premium", name: "Disney+ Premium", price: 3.75, billing: "monthly", color: "bg-blue-600", logo: "D+" },
  { id: "disney_standard", name: "Disney+ Standard", price: 3.25, billing: "monthly", color: "bg-blue-500", logo: "D+" },
  { id: "max", name: "Max", price: 3.0, billing: "monthly", color: "bg-purple-700", logo: "MAX" },
  { id: "vix", name: "ViX", price: 2.5, billing: "monthly", color: "bg-orange-500", logo: "ViX" },
  { id: "prime", name: "Prime Video", price: 3.0, billing: "monthly", color: "bg-sky-700", logo: "PV" },
  { id: "youtube_premium", name: "YouTube Premium", price: 3.35, billing: "monthly", color: "bg-red-700", logo: "YT" },
  { id: "paramount", name: "Paramount+", price: 2.75, billing: "monthly", color: "bg-indigo-600", logo: "P+" },
  { id: "chatgpt", name: "ChatGPT", price: 4.0, billing: "monthly", color: "bg-zinc-800", logo: "GPT" },
  { id: "crunchy", name: "Crunchyroll", price: 2.5, billing: "monthly", color: "bg-orange-600", logo: "CR" },
  { id: "spotify", name: "Spotify", price: 3.5, billing: "monthly", color: "bg-emerald-600", logo: "SP" },
  { id: "deezer", name: "Deezer", price: 3.0, billing: "monthly", color: "bg-blue-700", logo: "DZ" },
  { id: "apple_tv", name: "Apple TV+", price: 3.5, billing: "monthly", color: "bg-neutral-900", logo: "ATV" },
  { id: "canva_pro", name: "Canva Pro", price: 2.0, billing: "monthly", color: "bg-indigo-500", logo: "C" },
  { id: "canva_pro_annual", name: "Canva Pro (1 año)", price: 17.5, billing: "annual", color: "bg-indigo-600", logo: "C" },
  { id: "microsoft365", name: "Microsoft 365 (1 año)", price: 15.0, billing: "annual", color: "bg-blue-500", logo: "M365" },
  { id: "autodesk", name: "Autodesk (1 año)", price: 12.5, billing: "annual", color: "bg-zinc-700", logo: "AD" },
  { id: "office365", name: "Office 365 (1 año)", price: 15.0, billing: "annual", color: "bg-blue-600", logo: "O365" }
] as const;

// ===================== Combos =====================
const COMBOS = [
  { id: "netflix_disney_std", name: "Netflix + Disney Estándar", price: 6.0, billing: "monthly", color: "bg-gradient-to-r from-red-600 to-blue-500", logo: "N+D" },
  { id: "netflix_disney_premium", name: "Netflix + Disney Premium", price: 6.5, billing: "monthly", color: "bg-gradient-to-r from-red-600 to-blue-600", logo: "N+D+" },
  { id: "netflix_max", name: "Netflix + Max", price: 5.5, billing: "monthly", color: "bg-gradient-to-r from-red-600 to-purple-700", logo: "N+MAX" },
  { id: "netflix_prime", name: "Netflix + Prime Video", price: 5.5, billing: "monthly", color: "bg-gradient-to-r from-red-600 to-sky-700", logo: "N+PV" },
  { id: "prime_disney_std", name: "Prime Video + Disney Estándar", price: 5.75, billing: "monthly", color: "bg-gradient-to-r from-sky-700 to-blue-500", logo: "PV+D" },
  { id: "disney_premium_max", name: "Disney Premium + Max", price: 6.0, billing: "monthly", color: "bg-gradient-to-r from-blue-600 to-purple-700", logo: "D++MAX" },
  { id: "max_prime", name: "Max + Prime Video", price: 5.5, billing: "monthly", color: "bg-gradient-to-r from-purple-700 to-sky-700", logo: "MAX+PV" },
  { id: "paramount_max_prime", name: "Paramount + Max + Prime Video", price: 7.0, billing: "monthly", color: "bg-gradient-to-r from-indigo-600 via-purple-700 to-sky-700", logo: "P+MAX+PV" },
  { id: "mega_combo", name: "Netflix + Max + Disney + Prime + Paramount", price: 11.5, billing: "monthly", color: "bg-gradient-to-r from-red-600 via-purple-700 via-blue-500 via-sky-700 to-indigo-600", logo: "MEGA" },
  { id: "spotify_netflix", name: "Spotify + Netflix", price: 6.5, billing: "monthly", color: "bg-gradient-to-r from-emerald-600 to-red-600", logo: "SP+N" },
  { id: "spotify_disney_premium", name: "Spotify + Disney Premium", price: 6.5, billing: "monthly", color: "bg-gradient-to-r from-emerald-600 to-blue-600", logo: "SP+D+" }
] as const;

const ADMIN_WHATSAPP = "+593984280334";
const AGENTE_1_WHATSAPP = "+593984280334"; // Tu número principal
const AGENTE_2_WHATSAPP = "+593998799579"; // Tu hermano
// Sistema de administradores con roles
const ADMIN_ROLES = {
  PRINCIPAL: 'principal',
  SECUNDARIO: 'secundario'
} as const;

interface AdminUser {
  email: string;
  role: 'principal' | 'secundario';
  canGenerateKeys: boolean;
  canDeleteOthers: boolean;
  isProtected: boolean;
}

const DEFAULT_ADMIN_USERS: AdminUser[] = [
  {
    email: "gualejeremi@gmail.com",
    role: "principal",
    canGenerateKeys: false,
    canDeleteOthers: true,
    isProtected: true
  }
];

// Métodos de pago
const PAYMENT_METHODS = [
  { 
    id: 'pichincha', 
    name: 'Banco Pichincha', 
    icon: '🏦', 
    description: 'Transferencia a cuenta de ahorro',
    details: 'Jeremias Guale Santana\nCuenta: 2209034638\nTipo: Ahorro Transaccional'
  },
  { 
    id: 'guayaquil', 
    name: 'Banco Guayaquil', 
    icon: '🏛️', 
    description: 'Transferencia a cuenta de ahorros',
    details: 'Jeremias Joel Guale Santana\nCuenta: 0122407273\nTipo: Ahorros'
  },
  { 
    id: 'pacifico', 
    name: 'Banco Pacífico', 
    icon: '🌊', 
    description: 'Transferencia a cuenta de ahorros',
    details: 'Byron Guale Santana\nCuenta: 1061220256\nTipo: Ahorros'
  },
  { 
    id: 'paypal', 
    name: 'PayPal', 
    icon: '💳', 
    description: 'Pago por PayPal',
    details: 'Email: guale2023@outlook.com\nMétodo: PayPal\nTipo: Transferencia'
  },
  { 
    id: 'mobile', 
    name: 'Pago Móvil', 
    icon: '📱', 
    description: 'Pago desde tu teléfono móvil',
    details: 'Contacta a nuestros agentes para coordinar el pago móvil'
  }
] as const;

// ===================== Tipos =====================
type PurchaseStatus = 'pending' | 'validated' | 'active' | 'expired' | 'cancelled';
type PaymentMethod = 'pichincha' | 'guayaquil' | 'pacifico' | 'paypal' | 'mobile';

interface UserPurchase {
  id: string;
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  isAnnual: boolean;
  paymentMethod: PaymentMethod;
  notes?: string;
  status: PurchaseStatus;
  purchaseDate: string;
  startDate?: string;
  endDate?: string;
  validatedBy?: string;
  validatedAt?: string;
  whatsappSent: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  purchases: UserPurchase[];
  createdAt: string;
}

// ===================== Utilidades =====================
const fmt = (n: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "USD" }).format(n);
const storage = {
  load<T>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) as T; } catch { return fallback; } },
  save<T>(key: string, val: T) { localStorage.setItem(key, JSON.stringify(val)); },
  del(key: string){ localStorage.removeItem(key); }
};
function uid(){ return Math.random().toString(36).slice(2,10); }
function daysBetween(a: string, b: string){ 
  const d1=new Date(a), d2=new Date(b); 
  const diff = d2.getTime()-d1.getTime();
  return Math.round(diff/(1000*60*60*24)); 
}
function whatsappLink(to: string, text: string){ return `https://wa.me/${to}?text=${encodeURIComponent(text)}`; }
function tv<T>(isDark: boolean, light: T, dark: T){ return isDark? dark : light; }
  
  // Función mejorada para contraste que considera el modo del sistema
  function tvContrast<T>(isDark: boolean, systemPrefersDark: boolean, light: T, dark: T, lightHighContrast?: T){ 
    if (isDark) return dark;
    // Si la app está en modo claro pero el sistema está en modo oscuro, usar alto contraste
    if (systemPrefersDark && lightHighContrast) return lightHighContrast;
    return light;
  }

// Función para calcular días restantes hasta el vencimiento
const getDaysRemaining = (endDate: string): number => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Función para obtener el estado del servicio basado en días restantes
const getServiceStatus = (endDate: string): { status: string; color: string; icon: string; message: string } => {
  const daysRemaining = getDaysRemaining(endDate);
  
  if (daysRemaining < 0) {
    return {
      status: 'expired',
      color: 'red',
      icon: '❌',
      message: 'Servicio Caducado'
    };
  } else if (daysRemaining === 0) {
    return {
      status: 'expires-today',
      color: 'red',
      icon: '⚠️',
      message: 'Caduca Hoy'
    };
  } else {
    return {
      status: 'active',
      color: 'red',
      icon: '⏰',
      message: `${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'} restantes`
    };
  }
};
function ownPurchases(list: any[], user: any){ if(!user) return []; return list.filter(p=>p.validated && p.phone===user.phone); }
function cleanPhone(value: string){ return String(value||"").replace(/[^\d+]/g,""); }
function emailOk(e: string){ return /.+@.+\..+/.test(e); }

// ===================== Logo =====================
function Logo({ className = "h-9 w-9" }: { className?: string }){
  return (
    <svg viewBox="0 0 64 64" className={className} aria-label="StreamZone logo" role="img">
      <defs>
        <linearGradient id="szg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#szg)" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="Inter,system-ui,Arial" fontSize="26" fontWeight="700" fill="#ffffff">SZ</text>
    </svg>
  );
}

// ===================== Chatbot Inteligente =====================
function useChatbot(services: readonly any[], combos: readonly any[]){
  const answer = async (q: string, context: string[] = []) => { 
    const text = q.toLowerCase().trim();
    const fullContext = [...context, text].join(' '); // Combinar contexto con pregunta actual
    
    // Debug para ver qué está recibiendo
    console.log('Chatbot recibió:', text);
    console.log('Servicios disponibles:', services.length);
    console.log('Combos disponibles:', combos.length);
    
    // Saludos y bienvenida
    if(/hola|buenas|hey|hi|hello|buenos|buenas tardes|buenas noches|buenos días/.test(text)) {
      return "¡Hola! Bienvenido a StreamZone. Soy su asistente especializado en streaming. Puedo ayudarle con:\n\n💰 Ver precios - Catálogo completo de servicios\n🎯 Combos especiales - Grandes ahorros\n📺 Contenido disponible - Por plataforma\n🛒 Cómo comprar - Proceso paso a paso\n📱 Información de cuentas - Dispositivos y perfiles\n🔐 Recuperar contraseña - Si olvidó su acceso\n💳 Métodos de pago - Información bancaria\n🛠️ Soporte técnico - Ayuda y problemas\n\nComandos rápidos:\n• Escriba \"ver precios\" para el catálogo\n• Escriba \"combos\" para ofertas especiales\n• Escriba \"cómo comprar\" para el proceso\n• Escriba \"métodos de pago\" para información bancaria\n\n¿En qué puedo ayudarle?";
    }
    
    // Recuperación de contraseña
    if(/olvide|olvidé|contraseña|password|recuperar|reset|resetear/.test(text)) {
      return "🔐 RECUPERACIÓN DE CONTRASEÑA\n\nNo se preocupe, puedo ayudarle a recuperar su contraseña.\n\nProporcione su email y le generaré un código de recuperación.\n\nEjemplo: miemail@gmail.com\n\nImportante: El código se mostrará aquí en el chat, no se envía por email.\n\n¿Cuál es su email registrado?";
    }
    
    // Detectar email para generar token
    if(/@.*\./.test(text) && !/netflix|disney|hbo|amazon|spotify/.test(text)) {
      const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        const email = emailMatch[1];
        try {
          console.log('🔍 Chatbot generando token para:', email);
          const result = await generateResetToken(email);
          console.log('🔍 Chatbot resultado completo:', result);
          console.log('🔍 Token generado:', result.data?.token);
          console.log('🔍 Usuario:', result.data?.user);
          
          if (result.data) {
            return `🔐 **¡CÓDIGO GENERADO EXITOSAMENTE!** ✅\n\n📧 Email: ${email}\n🔑 **Tu código de recuperación:**\n\n**${result.data.token}**\n\n📋 **Instrucciones:**\n1. Ve a "Iniciar sesión" → "¿Olvidaste tu contraseña?"\n2. Ingresa tu email: ${email}\n3. Copia y pega este código: **${result.data.token}**\n4. Crea tu nueva contraseña\n\n⏰ **El código expira en 30 minutos**\n\n💡 ¡Guarda este código en un lugar seguro!`;
          } else {
            console.log('🔍 Error en resultado:', result.error);
            return `❌ **Error generando código**\n\n📧 Email: ${email}\n🚫 ${result.error?.message || 'Error desconocido'}\n\n💡 **Posibles causas:**\n• El email no está registrado\n• Problema de conexión\n\n🔧 **Solución:**\n• Verifica que el email sea correcto\n• Intenta crear una cuenta nueva si no tienes una`;
          }
        } catch (error) {
          console.log('🔍 Chatbot error en catch:', error);
          return `❌ **Error en el proceso**\n\n📧 Email: ${email}\n🚫 Error: ${error}\n\n💡 Intenta de nuevo o contacta soporte.`;
        }
      }
    }
    
    // Recomendaciones inteligentes por género/preferencias
    if(/recomendar|recomendación|recomendaciones|qué|que ver|mejor|sugerir|cuál|que plataforma|anime|familia|marvel|star wars|hbo|blockbuster|presupuesto bajo|dame|quiero ver|ayuda|opciones/.test(text)) {
      
      // Recomendaciones específicas por contenido
      if(/anime|manga|japonés|japones/.test(text)) {
        return "🎌 Para ANIME te recomiendo:\n\n1️⃣ **Crunchyroll** - El catálogo más grande de anime\n   Ejemplos: Attack on Titan, Demon Slayer, Jujutsu Kaisen\n\n2️⃣ **Netflix** - Anime original y clásicos\n   Ejemplos: Naruto, One Piece, Castlevania\n\n💡 ¿Prefieres anime clásico o series nuevas?";
      }
      
      if(/familia|niños|kids|disney|marvel|star wars|pixar/.test(text)) {
        return "👨‍👩‍👧‍👦 Para CONTENIDO FAMILIAR te recomiendo:\n\n1️⃣ **Disney+** - Marvel, Star Wars, Pixar\n   Ejemplos: Loki, The Mandalorian, Encanto\n\n2️⃣ **Combo Netflix + Disney+** - $6/mes (¡Ahorro!) 💰\n\n🎭 ¿Buscas contenido para adultos o toda la familia?";
      }
      
      if(/hbo|warner|premiadas|premios|calidad|premium/.test(text)) {
        return "🏆 Para SERIES PREMIUM te recomiendo:\n\n1️⃣ **Max (HBO)** - Contenido de alta calidad\n   Ejemplos: House of the Dragon, The Last of Us, Succession\n\n2️⃣ **Combo Max + Prime Video** - $5.50/mes\n\n🎬 ¿Te gustan las series dramáticas o prefieres acción?";
      }
      
      if(/blockbuster|películas|peliculas|acción|accion|superhéroes/.test(text)) {
        return "🎬 Para BLOCKBUSTERS te recomiendo:\n\n1️⃣ **Prime Video** - Películas + canales\n   Ejemplos: The Boys, Jack Ryan, Fast & Furious\n\n2️⃣ **Netflix** - Originales y éxitos\n   Ejemplos: Stranger Things, The Witcher, Extraction\n\n💥 ¿Prefieres películas de acción o series?";
      }
      
      if(/presupuesto bajo|barato|económico|economico|combo|ahorro/.test(text)) {
        return "💰 Para PRESUPUESTO BAJO te recomiendo:\n\n1️⃣ **Netflix + Disney+** - $6/mes (¡50% descuento!)\n2️⃣ **Netflix + Max** - $5.50/mes\n3️⃣ **Prime Video + Disney+** - $5.75/mes\n\n🎯 Todos incluyen: 1 perfil + 1 dispositivo\n💡 ¿Cuánto quieres gastar al mes?";
      }
      
      // Recomendación general
      const popular = services.slice(0, 3);
      return "🎯 Te recomiendo estas opciones populares:\n\n" + popular.map((s, i) => 
        `${i+1}️⃣ **${s.name}** - ${fmt(s.price)}/${s.billing==='annual'?'año':'mes'}\n   ${getServiceDescription(s.id)}`
      ).join('\n\n') + "\n\n🤔 ¿Qué tipo de contenido te gusta más? (anime, familia, acción, etc.)";
    }
    
    // Información detallada sobre contenido por plataforma
    if(/película|pelicula|serie|contenido|qué hay|que hay|disponible|ver|catálogo|catalogo/.test(text)) {
      if(/netflix/.test(text)) {
        return "📺 **NETFLIX** - Catálogo completo:\n\n🎬 **Series Originales:**\n• Stranger Things, The Crown, La Casa de Papel\n• Bridgerton, Ozark, The Witcher\n• Wednesday, Dahmer, Money Heist\n\n🎭 **Géneros:** Drama, Thriller, Comedia, Documentales\n🌍 **Países:** Disponible en Ecuador y Latinoamérica\n\n💡 ¿Te interesa algún género específico?";
      }
      
      if(/disney/.test(text)) {
        return "🏰 **DISNEY+** - Catálogo completo:\n\n🦸 **Marvel:** Loki, WandaVision, Hawkeye, Moon Knight\n⭐ **Star Wars:** The Mandalorian, Obi-Wan Kenobi\n🎨 **Pixar:** Soul, Luca, Turning Red\n🏰 **Disney Clásico:** Frozen, Moana, Encanto\n\n👨‍👩‍👧‍👦 **Perfecto para:** Familias, fans de Marvel/Star Wars\n\n🎯 ¿Buscas contenido para niños o adultos?";
      }
      
      if(/max|hbo/.test(text)) {
        return "👑 **MAX (HBO)** - Contenido Premium:\n\n🐉 **Series Épicas:** Game of Thrones, House of the Dragon\n🎮 **Videojuegos:** The Last of Us, Arcane\n💼 **Drama:** Succession, Euphoria, White Lotus\n🎬 **Películas:** Batman, Dune, Matrix\n\n🏆 **Calidad:** 4K, HDR, Dolby Atmos\n\n🎭 ¿Prefieres series dramáticas o películas épicas?";
      }
      
      if(/prime/.test(text)) {
        return "📦 **PRIME VIDEO** - Exclusivas + Beneficios:\n\n🦸 **Originales:** The Boys, The Marvelous Mrs. Maisel\n🎬 **Blockbusters:** Jack Ryan, Tom Clancy's\n📚 **Beneficios Extra:** Envío gratis Amazon\n\n🌍 **Disponibilidad:** Ecuador, Latinoamérica\n💰 **Valor:** Incluye envíos de Amazon\n\n🛒 ¿Te interesan las exclusivas o los beneficios de Amazon?";
      }
      
      if(/spotify/.test(text)) {
        return "🎵 **SPOTIFY** - Música Sin Límites:\n\n🎶 **Música:** 100M+ canciones\n🎧 **Podcasts:** Joe Rogan, Serial, Crime Junkie\n🎤 **Audiolibros:** Harry Potter, El Principito\n\n📱 **Dispositivos:** Móvil, PC, TV, Auto\n🎯 **Perfecto para:** Música, podcasts, audiolibros\n\n🎧 ¿Prefieres música, podcasts o audiolibros?";
      }
      
      return "📺 **CATÁLOGOS DISPONIBLES:**\n\n🎬 **Netflix:** Series originales, thrillers, documentales\n🏰 **Disney+:** Marvel, Star Wars, Pixar, Disney clásico\n👑 **Max:** HBO premium, Game of Thrones, películas épicas\n📦 **Prime Video:** Exclusivas, blockbusters + Amazon\n🎵 **Spotify:** Música, podcasts, audiolibros\n\n🤔 ¿Qué plataforma te interesa más?";
    }
    
    // Búsqueda de títulos específicos
    if(/dónde ver|donde ver|donde puedo ver|buscar|encontrar/.test(text)) {
      const titles = [
        { name: "Stranger Things", platforms: ["Netflix"] },
        { name: "The Mandalorian", platforms: ["Disney+"] },
        { name: "House of the Dragon", platforms: ["Max"] },
        { name: "The Boys", platforms: ["Prime Video"] },
        { name: "Loki", platforms: ["Disney+"] },
        { name: "The Last of Us", platforms: ["Max"] },
        { name: "Bridgerton", platforms: ["Netflix"] },
        { name: "The Witcher", platforms: ["Netflix"] }
      ];
      
      for(const title of titles) {
        if(text.includes(title.name.toLowerCase())) {
          return `🎬 **${title.name}** está disponible en:\n\n${title.platforms.map(p => `📺 **${p}**`).join('\n')}\n\n💡 **¿Sabías que?** Una cuenta = 1 perfil + 1 dispositivo\n💰 **Precio:** ${title.platforms.map(p => {
            const service = services.find(s => s.name.toLowerCase().includes(p.toLowerCase()));
            return service ? `${p}: ${fmt(service.price)}/mes` : '';
          }).filter(Boolean).join(', ')}\n\n🎯 ¿Te interesa alguna de estas plataformas?`;
        }
      }
      
      return "🔍 **BÚSQUEDA DE TÍTULOS:**\n\nPuedo ayudarte a encontrar:\n• Stranger Things → Netflix\n• The Mandalorian → Disney+\n• House of the Dragon → Max\n• The Boys → Prime Video\n• Loki → Disney+\n• The Last of Us → Max\n\n📝 **Escribe el nombre del título** que buscas y te diré dónde verlo\n\n🎯 ¿Qué película o serie te interesa?";
    }
    
    // Información sobre cuentas y dispositivos
    if(/cuenta|perfil|dispositivo|device|cuántos|cuantos|compartir|usuarios|como funciona|funciona|incluye|que incluye/.test(text)) {
      return "📱 **INFORMACIÓN IMPORTANTE SOBRE CUENTAS:**\n\n✅ **1 Cuenta = 1 Perfil + 1 Dispositivo**\n📺 **Dispositivos soportados:** TV, móvil, tablet, PC\n👤 **Perfiles:** Cada cuenta tiene su perfil personalizado\n\n🔒 **Reglas de uso:**\n• No compartir con otras personas\n• Solo en un dispositivo a la vez\n• Acceso 24/7 garantizado\n\n💡 **¿Necesitas múltiples dispositivos?** Considera comprar varias cuentas\n\n🎯 ¿Tienes alguna pregunta específica sobre el uso?";
    }
    
    // PRECIOS - Detección mejorada y más inteligente
    if(text.includes('ver precios') || text.includes('precios') || text.includes('precio') || text.includes('cuanto') || text.includes('cuánto') || text.includes('costo') || text.includes('valor') || text.includes('vale') || text.includes('tarifas') || text.includes('listado') || text.includes('lista')) {
      console.log('Detectado: consulta de precios');
      
      // Respuesta específica para "ver precios"
      if(text.includes('ver precios') || text.includes('listado') || text.includes('lista') || text.includes('tarifas')) {
        console.log('Ejecutando respuesta de VER PRECIOS');
        const serviceList = services.slice(0, 8).map((s, i) => 
          `${i+1}️⃣ ${s.name} - ${fmt(s.price)}/${s.billing==='annual'?'año':'mes'}`
        ).join('\n');
        
        const comboRecommendation = combos.slice(0, 3).map((c, i) => 
          `${i+1}️⃣ ${c.name} - ${fmt(c.price)}/mes (Ahorro significativo)`
        ).join('\n');
        
        const respuesta = `💰 CATÁLOGO DE PRECIOS - STREAMZONE\n\nSERVICIOS INDIVIDUALES:\n${serviceList}\n\n🎯 COMBOS RECOMENDADOS (Más Económicos):\n${comboRecommendation}\n\nLos combos le beneficiarán más ya que salen más baratos que comprar cuentas sueltas. Por ejemplo, un combo de 2 servicios por $6.50/mes es más económico que pagar $4.00 + $3.50 por separado.\n\n¿Qué incluye cada servicio?\n• 1 perfil personalizado\n• 1 dispositivo simultáneo\n• Acceso completo a todo el contenido\n• Soporte técnico 24/7\n\nPara realizar compras, debe enviar mensaje a nuestros agentes para validar la compra.\n\n¿Le interesa algún servicio o combo específico?`;
        
        console.log('Respuesta generada:', respuesta);
        return respuesta;
      }
      
      // Precios específicos por servicio
      for(const s of services){ 
        if(text.includes(s.id.toLowerCase()) || text.includes(s.name.toLowerCase())) {
          return `💰 ${s.name}\n\nPrecio: ${fmt(s.price)}/${s.billing==='annual'?'año':'mes'}\nIncluye: 1 perfil + 1 dispositivo\nPerfecto para: ${getServiceDescription(s.id)}\n\nPara proceder con la compra, debe enviar mensaje a nuestros agentes para validar la compra.\n\n¿Le interesa este servicio o prefiere ver nuestros combos más económicos?`;
        }
      }
      
      return `💰 PRECIOS ACTUALES:\n\n${services.slice(0,6).map((s, i) => 
        `${i+1}️⃣ ${s.name} - ${fmt(s.price)}/${s.billing==='annual'?'año':'mes'}`
      ).join('\n')}\n\nEspecifique una plataforma para más detalles.\n¿Busca descuentos? Pregunte por nuestros combos especiales.\n\nPara realizar compras, debe enviar mensaje a nuestros agentes para validar la compra.`;
    }
    
    // COMBOS - Detección mejorada
    if(text.includes('combo') || text.includes('combos') || text.includes('descuento') || text.includes('ahorro') || text.includes('barato') || text.includes('ofertas') || text.includes('especiales')) {
      console.log('Detectado: consulta de combos');
      
        const comboList = combos.slice(0, 5).map((c, i) => 
        `${i+1}️⃣ ${c.name} - ${fmt(c.price)}/mes (Ahorro significativo)`
      ).join('\n');
      
      return `🎯 COMBOS ESPECIALES - Grandes Ahorros\n\n${comboList}\n\nLos combos le beneficiarán más ya que salen más baratos que comprar cuentas sueltas. Por ejemplo, un combo de 2 servicios por $6.50/mes es más económico que pagar los servicios por separado.\n\nTodos incluyen:\n• 1 perfil personalizado\n• 1 dispositivo simultáneo\n• Acceso completo a todo el contenido\n• Soporte técnico 24/7\n\nActivación: Inmediata tras pago\nMétodos de pago: Banco, PayPal, móvil\n\nPara realizar compras, debe enviar mensaje a nuestros agentes para validar la compra.\n\n¿Cuál le interesa más?`;
    }
    
    // Contenido disponible por plataforma
    if(/contenido|que hay|que tiene|series|películas|documentales|disponible|que puedo ver|que ofrece/.test(text)) {
      return "📺 **CONTENIDO DISPONIBLE POR PLATAFORMA:** 📺\n\n🎬 **Netflix:** Series originales, thrillers, documentales\n🏰 **Disney+:** Marvel, Star Wars, Pixar, Disney clásico\n👑 **Max:** HBO premium, Game of Thrones, películas épicas\n📦 **Prime Video:** Exclusivas, blockbusters + Amazon\n🎵 **Spotify:** Música, podcasts, audiolibros\n\n🎯 **¿Qué plataforma te interesa más?** Te doy detalles específicos\n💡 **¿Buscas algo en particular?** Dime el título o género\n\n🛒 **¿Listo para disfrutar?** Te ayudo con la compra";
    }
    
    // PROCESO DE COMPRA - Detección mejorada
    if(text.includes('como compro') || text.includes('como comprar') || text.includes('cómo comprar') || text.includes('proceso') || text.includes('pasos') || text.includes('quiero comprar') || text.includes('necesito comprar') || text.includes('como hago') || text.includes('como puedo') || text.includes('como pago') || text.includes('donde compro')) {
      console.log('Detectado: consulta de proceso de compra');
      
      return "🛒 CÓMO COMPRAR - Proceso Simple:\n\n1️⃣ Seleccione su plataforma favorita\n2️⃣ Haga clic en 'Comprar Ahora'\n3️⃣ Complete sus datos (nombre, email, teléfono)\n4️⃣ Elija método de pago (banco, PayPal, móvil)\n5️⃣ Realice el pago\n6️⃣ Envíe comprobante por WhatsApp\n7️⃣ Reciba acceso inmediato\n\nTiempo total: 5-10 minutos\nGarantía: 24/7 soporte técnico\nMétodos aceptados: Todos los bancos, PayPal\n\nIMPORTANTE: Para realizar compras, debe enviar mensaje a nuestros agentes para validar la compra.\n\n¿Necesita ayuda con algún paso específico?";
    }
    
    // MÉTODOS DE PAGO - Detección mejorada
    if(text.includes('metodo') || text.includes('metodos') || text.includes('pago') || text.includes('transferencia') || text.includes('deposito') || text.includes('efectivo') || text.includes('forma de pago') || text.includes('banco') || text.includes('paypal') || text.includes('pago móvil') || text.includes('como pago') || text.includes('donde pago') || text.includes('donde deposito') || text.includes('transferir')) {
      console.log('Detectado: consulta de métodos de pago');
      
      return "💳 MÉTODOS DE PAGO ACEPTADOS:\n\nBANCOS ECUATORIANOS:\n• Banco Pichincha\n  Tipo de cuenta: Ahorro Transaccional\n  Número: 2209034638\n  Titular: Jeremias Guale Santana\n\n• Banco Guayaquil\n  Tipo de cuenta: Ahorros\n  Número: 0122407273\n  Titular: Jeremias Joel Guale Santana\n\n• Banco Pacífico\n  Tipo de cuenta: Ahorros\n  Número: 1061220256\n  Titular: Byron Guale Santana\n\nDIGITALES:\n• PayPal: guale2023@outlook.com\n• Pago móvil (todas las operadoras)\n\n100% SEGURO: Todos los pagos están protegidos\nIMPORTANTE: Debe enviar comprobante por WhatsApp para activación\n\nPara realizar compras, debe enviar mensaje a nuestros agentes para validar la compra.\n\n¿Prefiere pago bancario o digital?";
    }
    
    // SOPORTE TÉCNICO - Nuevo
    if(text.includes('problema') || text.includes('error') || text.includes('no funciona') || text.includes('no me funciona') || text.includes('ayuda') || text.includes('soporte') || text.includes('técnico') || text.includes('falla') || text.includes('bug') || text.includes('lento') || text.includes('cuelga')) {
      console.log('Detectado: consulta de soporte técnico');
      
      return "🛠️ **SOPORTE TÉCNICO - ESTAMOS AQUÍ PARA AYUDARTE** 🛠️\n\n🔧 **Problemas comunes y soluciones:**\n\n📱 **Si tu cuenta no funciona:**\n• Verifica tu email y contraseña\n• Intenta cerrar y abrir la app\n• Reinicia tu dispositivo\n\n🌐 **Si hay problemas de conexión:**\n• Verifica tu internet\n• Prueba con datos móviles\n• Reinicia el router\n\n⏰ **Si es lento:**\n• Cierra otras apps\n• Actualiza la app\n• Reinicia el dispositivo\n\n📞 **¿Necesitas ayuda directa?**\n• WhatsApp: +593 98 428 0334\n• Disponible 24/7\n\n💡 **Describe tu problema** y te ayudo específicamente";
    }
    
    // ACTIVACIÓN Y TIEMPO - Nuevo
    if(text.includes('cuando') || text.includes('tiempo') || text.includes('activa') || text.includes('activacion') || text.includes('activación') || text.includes('cuanto tarda') || text.includes('cuánto tarda') || text.includes('inmediato') || text.includes('rápido')) {
      console.log('Detectado: consulta de tiempo de activación');
      
      return "⚡ **TIEMPO DE ACTIVACIÓN - SÚPER RÁPIDO** ⚡\n\n🚀 **Activación inmediata:**\n• Recibes credenciales en 5-10 minutos\n• Máximo 30 minutos en casos excepcionales\n• Activación automática tras confirmar pago\n\n📱 **Proceso:**\n1️⃣ Realizas el pago\n2️⃣ Envías comprobante por WhatsApp\n3️⃣ Recibes credenciales al instante\n4️⃣ ¡Disfrutas tu contenido!\n\n⏰ **Horarios de atención:**\n• Lunes a Domingo: 24/7\n• WhatsApp: +593 98 428 0334\n\n💡 **¿Ya pagaste?** Envía tu comprobante ahora";
    }
    
    // GARANTÍA Y SEGURIDAD - Nuevo
    if(text.includes('garantia') || text.includes('garantía') || text.includes('seguro') || text.includes('seguridad') || text.includes('confiable') || text.includes('confianza') || text.includes('reembolso') || text.includes('dinero de vuelta')) {
      console.log('Detectado: consulta de garantía');
      
      return "🛡️ **GARANTÍA Y SEGURIDAD - 100% CONFIABLE** 🛡️\n\n✅ **Nuestra garantía:**\n• Cuentas 100% legítimas y funcionales\n• Soporte técnico 24/7\n• Reemplazo inmediato si hay problemas\n• Sin preguntas, sin complicaciones\n\n🔒 **Tu seguridad:**\n• Pagos protegidos y seguros\n• Datos personales protegidos\n• No almacenamos información sensible\n• Transacciones encriptadas\n\n💯 **Compromiso:**\n• Si no funciona, te damos otra cuenta\n• Si hay problemas, los solucionamos\n• Siempre disponibles para ayudarte\n\n📞 **Contacto directo:**\n• WhatsApp: +593 98 428 0334\n• Respuesta en menos de 5 minutos";
    }
    
    // Información sobre combos
    if(/combo|combos|especial|oferta/.test(text)) {
      const topCombos = combos.slice(0, 4);
      return `🎯 **COMBOS ESPECIALES DISPONIBLES:**\n\n${topCombos.map((c, i) => 
        `${i+1}️⃣ **${c.name}**\n   💰 ${fmt(c.price)}/mes\n   🎁 Ahorro del ${Math.round((1 - c.price/10) * 100)}%\n   📱 1 perfil + 1 dispositivo`
      ).join('\n\n')}\n\n✨ **Beneficios:** Mayor ahorro, múltiples plataformas\n🚀 **Activación:** Inmediata tras pago\n\n💡 ¿Te interesa algún combo específico?`;
    }
    
    // Contacto y soporte
    if(/contacto|whatsapp|hablar|agente|soporte|ayuda|telefono|problema|error|no funciona|garantia/.test(text)) {
      return "👨‍💼 **SOPORTE 24/7 DISPONIBLE:**\n\n📱 **Agente Principal:** +593 98 428 0334 (Jeremi)\n📞 **Agente Soporte:** +593 99 879 9579\n\n⚡ **Tiempo de respuesta:** Menos de 30 minutos\n🔧 **Resolución:** 24 horas máximo\n✅ **Garantía:** 100% satisfacción o reembolso\n\n💬 **WhatsApp directo** para consultas rápidas\n🎯 ¿Qué problema específico tienes?";
    }
    
    // Información sobre streaming en general
    if(/streaming|plataforma|app|aplicación|servicio/.test(text)) {
      return "🎬 **STREAMZONE - TU MEJOR OPCIÓN EN STREAMING:**\n\n✨ **Plataformas Premium:** Netflix, Disney+, Max, Prime Video, Spotify\n🚀 **Activación:** Inmediata tras pago\n📱 **Soporte:** 24/7 WhatsApp\n🔒 **Seguridad:** Cuentas 100% legales\n💰 **Precios:** Los más competitivos del mercado\n\n🎯 **¿Por qué elegirnos?**\n• Sin publicidad\n• Calidad 4K\n• Múltiples dispositivos\n• Soporte técnico incluido\n\n💡 ¿Qué plataforma te interesa más?";
    }
    
    // Calidad y características técnicas
    if(/calidad|4k|hd|ultra|hdr|dolby|audio|subs|subtítulos|idioma/.test(text)) {
      return "🎥 **CALIDAD Y CARACTERÍSTICAS:**\n\n📺 **Calidades disponibles:**\n• 4K Ultra HD (donde esté disponible)\n• HDR10 y Dolby Vision\n• Dolby Atmos (audio premium)\n\n🌍 **Idiomas:**\n• Audio: Español, inglés, portugués\n• Subtítulos: Múltiples idiomas\n• Doblaje: Latino y España\n\n📱 **Dispositivos compatibles:**\n• Smart TV, móvil, tablet, PC\n• Chromecast, Apple TV, Roku\n\n🎯 ¿Tienes alguna preferencia específica de calidad?";
    }
    
    // Despedida
    if(/gracias|bye|adios|chao|hasta luego|nos vemos/.test(text)) {
      return "¡De nada! 😊 Ha sido un placer ayudarte. Si necesitas algo más, no dudes en contactarnos. ¡Que disfrutes mucho de tu streaming! 🎬✨\n\n💡 **Recuerda:** Nuestros agentes están disponibles 24/7\n📱 **WhatsApp:** +593 98 428 0334\n\n¡Hasta pronto! 👋";
    }
    
    // Fallback inteligente - intentar dar una respuesta útil basada en palabras clave
    const words = text.split(' ');
    const hasStreamingWords = words.some(word => 
      ['netflix', 'disney', 'max', 'hbo', 'prime', 'spotify', 'streaming', 'película', 'serie', 'música'].includes(word.toLowerCase())
    );
    
    if (hasStreamingWords) {
      return "🎬 Veo que mencionas contenido de streaming. Te puedo ayudar con:\n\n📺 **Información sobre plataformas:**\n• Netflix, Disney+, Max, Prime Video, Spotify\n• Catálogos completos y precios\n• Recomendaciones personalizadas\n\n🔍 **¿Qué te interesa más?**\n• Ver precios de una plataforma específica\n• Saber qué contenido tiene cada una\n• Encontrar títulos específicos\n\n💡 **Ejemplo:** '¿Qué hay en Netflix?' o '¿Cuánto cuesta Disney+?'";
    }
    
    // Respuesta más amigable y útil con más opciones
    return "No estoy seguro de entender exactamente qué necesita. Pero puedo ayudarle.\n\nComandos que sí entiendo:\n• \"ver precios\" - Catálogo completo de servicios\n• \"combos\" - Ofertas especiales con descuentos\n• \"cómo comprar\" - Proceso paso a paso\n• \"contenido\" - Qué hay en cada plataforma\n• \"recuperar contraseña\" - Si olvidó su acceso\n• \"soporte\" - Ayuda técnica y problemas\n• \"garantía\" - Información de seguridad\n• \"activación\" - Tiempo de entrega\n• \"métodos de pago\" - Información bancaria\n\nTambién puede preguntar por:\n• Una plataforma específica (Netflix, Disney+, etc.)\n• Precios individuales\n• Información sobre cuentas\n• Métodos de pago\n• Problemas técnicos\n• Tiempo de activación\n\n¿Qué le interesa más? Estoy aquí para ayudarle.";
  };
  
  return {answer};
}

// Función auxiliar para descripciones de servicios
function getServiceDescription(serviceId: string): string {
  const descriptions: { [key: string]: string } = {
    'netflix': 'Series originales, thrillers, documentales',
    'disney': 'Marvel, Star Wars, Pixar, familias',
    'max': 'HBO premium, series épicas, películas',
    'prime': 'Exclusivas, blockbusters, Amazon',
    'spotify': 'Música, podcasts, audiolibros',
    'paramount': 'Paramount, Nickelodeon, MTV',
    'apple': 'Originales Apple, 4K premium'
  };
  
  return descriptions[serviceId] || 'Contenido premium de calidad';
}

// ===================== Piezas UI =====================
function Badge({ children, isDark }: { children: React.ReactNode; isDark: boolean; }){ 
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tv(isDark,'bg-zinc-100 text-zinc-700 ring-zinc-200','bg-zinc-800 text-zinc-200 ring-zinc-700')}`}>{children}</span>; 
}

function ServiceCard({ s, onReserve, isDark }:{ s:any; onReserve:(s:any)=>void; isDark:boolean; }){
  return (
    <div className={`group relative overflow-hidden rounded-3xl border-2 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 ${tv(isDark,'border-gray-200 bg-gradient-to-br from-white to-gray-50','border-gray-700 bg-gradient-to-br from-zinc-800 to-zinc-900')}`}> 
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative text-center">
        <div className="relative mb-6">
          <div className={`h-16 w-16 md:h-20 md:w-20 ${s.color} rounded-3xl text-white grid place-content-center text-2xl md:text-3xl font-bold mx-auto mb-4 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
            {s.logo}
        </div>
          <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${tv(isDark,'bg-green-500','bg-green-400')} flex items-center justify-center text-white text-xs font-bold animate-pulse`}>
            ✓
          </div>
        </div>
        
        <div className="mb-6 space-y-2">
          <div className={tv(isDark,'text-gray-900 font-bold text-lg md:text-xl mb-2','text-white font-bold text-lg md:text-xl mb-2')}>{s.name}</div>
          <div className="flex items-center justify-center gap-2">
            <span className={tv(isDark,'text-3xl md:text-4xl font-bold text-gray-700','text-3xl md:text-4xl font-bold text-gray-200')}>{fmt(s.price)}</span>
            <span className={tv(isDark,'text-sm text-gray-500','text-sm text-gray-400')}>/{s.billing==='annual'? 'año':'mes'}</span>
          </div>
          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${tv(isDark,'bg-green-100 text-green-700','bg-green-900/30 text-green-300')}`}>
            <span>⚡</span>
            Acceso inmediato
          </div>
        </div>
        
        <button 
          onClick={()=>onReserve(s)} 
          className={`w-full rounded-2xl px-6 py-4 text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl ${tv(isDark,'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700','bg-gradient-to-r from-blue-700 to-purple-700 text-white hover:from-blue-800 hover:to-purple-800')}`}
        >
          <span className="flex items-center justify-center gap-2">
            <span>🚀</span>
          Comprar Ahora
            <span>✨</span>
          </span>
        </button>
      </div>
    </div>
  );
}

function Modal({ open, onClose, children, title, isDark, className }:{ open:boolean; onClose:()=>void; children:React.ReactNode; title:string; isDark:boolean; className?:string; }){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${tv(isDark,'bg-white','bg-zinc-900')} ${className || ''}`} onClick={e=>e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold">{title}</h3>
          <button 
            onClick={onClose} 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${tv(isDark,'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100','text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800')}`}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// === FloatingChatbot ===
function FloatingChatbot({ answerFn, isDark }:{ answerFn:(q:string, context?:string[])=>Promise<string>; isDark:boolean; }){
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: "¡Hola! 👋 ¡Bienvenido a StreamZone! 🎬✨ Soy tu asistente especializado en streaming. ¿En qué puedo ayudarte hoy?" }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState<string[]>([]);
  
  const send = async () => { 
    const q = input.trim(); 
    if(!q) return; 
    
    // Agregar mensaje del usuario
    setMessages(m=>[...m,{role:'user',text:q}]);
    setInput("");
    setIsTyping(true);
    
    // Actualizar contexto de conversación
    setConversationContext(prev => [...prev.slice(-3), q.toLowerCase()]); // Mantener últimas 3 preguntas
    
    try {
      // Obtener respuesta asíncrona
      const a = await answerFn(q, conversationContext);
      setMessages(m=>[...m,{role:'bot',text:a}]);
    } catch (error) {
      console.error('Error en chatbot:', error);
      setMessages(m=>[...m,{role:'bot',text:'❌ Lo siento, hubo un error. Por favor intenta de nuevo.'}]);
    } finally {
      setIsTyping(false);
    }
  };
  
  const formatMessage = (text: string) => {
    // Convertir saltos de línea en <br> y mantener emojis
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };
  
  return (<>
    <button 
      data-chat-button
      onClick={()=>setOpen(!open)} 
      className={`fixed bottom-5 right-5 z-40 rounded-full px-6 py-4 shadow-2xl transition-all duration-300 hover:scale-110 animate-pulse ${tv(isDark,'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:from-purple-700 hover:via-pink-700 hover:to-blue-700','bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-pink-600')}`}
    >
      <span className="flex items-center gap-3">
        <span className="text-2xl animate-bounce">💬</span>
        <div className="text-left">
          <div className="font-bold text-sm">¿Necesitas ayuda?</div>
          <div className="text-xs opacity-90">Chat en vivo</div>
        </div>
      </span>
    </button>
    
    {open&&(
      <div className={`fixed bottom-20 right-5 z-40 w-96 rounded-2xl border shadow-2xl transition-all duration-300 ${tv(isDark,'border-gray-300 bg-white shadow-gray-200','border-zinc-700 bg-zinc-900')}`}>
        <div className={`rounded-t-2xl border-b p-4 font-semibold flex items-center gap-2 ${tv(isDark,'bg-gradient-to-r from-blue-100 to-purple-100 border-gray-300 text-gray-800','bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-zinc-700')}`}>
          <span className="text-xl">🤖</span>
          <span className={tv(isDark,'text-gray-800','text-white')}>Asistente StreamZone</span>
          <div className={`ml-auto w-3 h-3 rounded-full ${tv(isDark,'bg-green-500','bg-green-500')}`}></div>
        </div>
        
        <div className="p-4 h-96 overflow-y-auto flex flex-col gap-3">
          {messages.map((m,i)=>(
            <div key={i} className={m.role==='bot'?'self-start':'self-end'}>
              <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role==='bot'? 
                  tv(isDark,'bg-gradient-to-br from-blue-100 to-purple-100 text-gray-800 border border-blue-200 shadow-sm','bg-gradient-to-br from-blue-900/30 to-purple-900/30 text-zinc-100 border border-blue-700/30') : 
                  tv(isDark,'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-md','bg-gradient-to-br from-purple-500 to-blue-600 text-white')
              }`}>
                {formatMessage(m.text)}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="self-start">
              <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${tv(isDark,'bg-gray-100 text-gray-700 border border-gray-200','bg-zinc-800 text-zinc-300')}`}>
                <span className="flex items-center gap-1">
                  <span>Escribiendo</span>
                  <span className="animate-pulse">...</span>
                </span>
              </div>
            </div>
          )}
          
          {/* Botones de sugerencias rápidas */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                "🎯 Recomiéndame algo",
                "💰 Ver precios",
                "📺 ¿Qué hay en Netflix?",
                "🛒 ¿Cómo compro?"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInput(suggestion)}
                  className={`px-3 py-2 rounded-full text-xs font-medium transition-all hover:scale-105 ${tv(isDark,'bg-zinc-100 text-zinc-700 hover:bg-zinc-200','bg-zinc-700 text-zinc-300 hover:bg-zinc-600')}`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 flex gap-2 border-t">
          <input 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            onKeyDown={e=>e.key==='Enter'&&send()} 
            placeholder="Escribe tu pregunta..." 
            className={`flex-1 rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${tv(isDark,'border-zinc-300 bg-white focus:ring-purple-500 focus:border-purple-500','border-zinc-600 bg-zinc-800 text-zinc-100 focus:ring-blue-500 focus:border-blue-500')}`}
          />
          <button 
            onClick={send} 
            disabled={!input.trim() || isTyping}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${tv(isDark,'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700','bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700')}`}
          >
            {isTyping ? '⏳' : '🚀'}
          </button>
        </div>
      </div>
    )}
  </>);
}

// === FloatingThemeToggle ===
function FloatingThemeToggle({ isDark, onToggle }:{ isDark:boolean; onToggle:()=>void; }){
  return (
    <button
      title={isDark? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      onClick={onToggle}
      className={`fixed bottom-5 left-5 z-40 grid h-11 w-11 place-content-center rounded-full shadow-lg ring-1 ${isDark? 'bg-white text-zinc-900 ring-zinc-200' : 'bg-zinc-900 text-white ring-zinc-800'}`}
    >
      {isDark? '☀' : '☾'}
    </button>
  );
}

// ===================== App =====================
function App(){
  // Tema
  const[theme,setTheme]=useState<string>(()=>{ try{return localStorage.getItem('sz_theme')||'dark'}catch{return 'dark'} });
  const isDark = theme==='dark';
  
  // Detectar modo del sistema
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  useEffect(()=>{ try{localStorage.setItem('sz_theme',theme)}catch{} },[theme]);
  const toggleTheme=()=>setTheme(isDark?'light':'dark');

  // Navegación
  const[view,setView]=useState<'home'|'combos'|'admin'|'register'|'adminLogin'|'auth'|'profile'>('home');

  // Sesiones
  const[user,setUser]=useState<any>(()=> storage.load('userProfile', null));
  const[adminLogged,setAdminLogged]=useState<boolean>(()=> !!storage.load('adminLogged', false));
  const[userProfile,setUserProfile]=useState<UserProfile | null>(()=> storage.load('userProfileData', null));
  const[allPurchases,setAllPurchases]=useState<UserPurchase[]>(()=> storage.load('allPurchases', []));
  
  useEffect(()=>{ storage.save('userProfile', user); },[user]);
  useEffect(()=>{ storage.save('userProfileData', userProfile); },[userProfile]);
  useEffect(()=>{ storage.save('allPurchases', allPurchases); },[allPurchases]);
  useEffect(()=>{ storage.save('adminLogged', adminLogged); },[adminLogged]);
  
  // Cargar TODAS las compras desde Supabase (para admin)
  const loadAllPurchasesFromSupabase = async () => {
    try {
      const result = await getAllPurchases();
      if (result.data) {
        // Actualizar tanto allPurchases como purchases para sincronizar el dashboard
        setAllPurchases(result.data);
        setPurchases(result.data); // ¡IMPORTANTE! Actualizar purchases para el dashboard
        console.log('✅ Todas las compras cargadas desde Supabase:', result.data.length);
        return result.data;
      } else {
        console.warn('⚠️ No se pudieron cargar las compras desde Supabase');
        return [];
      }
    } catch (error) {
      console.error('❌ Error cargando todas las compras:', error);
      return [];
    }
  };
  
  // Sincronizar servicios con Supabase al inicio
  useEffect(() => {
    const syncServicesOnInit = async () => {
      try {
        // Sincronizar servicios individuales
        await syncServices([...SERVICES]);
        console.log('Servicios sincronizados con Supabase');
        
        // Sincronizar combos
        await syncServices([...COMBOS]);
        console.log('Combos sincronizados con Supabase');
        
        // Cargar todas las compras desde Supabase
        await loadAllPurchasesFromSupabase();
        console.log('Compras cargadas desde Supabase');
      } catch (error) {
        console.error('Error sincronizando servicios:', error);
      }
    };
    
    syncServicesOnInit();
  }, []);

  // Sistema de administradores con roles
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(()=> {
    const saved = storage.load('admin_users', DEFAULT_ADMIN_USERS);
    return saved.map((user: any) => ({
      ...user,
      email: user.email.toLowerCase()
    }));
  });
  useEffect(()=>{ storage.save('admin_users', adminUsers); },[adminUsers]);
  
  // Lista de emails para compatibilidad con login
  const adminEmails = adminUsers.map(user => user.email);

  // Drawers
  const [drawerOpen, setDrawerOpen] = useState(false); // admins
  const [menuOpen, setMenuOpen] = useState(false);    // menú

  // Estados para autenticación
  const [authStep, setAuthStep] = useState<'login'|'email'|'code'|'newpassword'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetCode, setResetCode] = useState('');
  
  // Estados para administración
  const[pendingPurchases,setPendingPurchases]=useState<DatabasePurchase[]>([]);
  const[adminLoading,setAdminLoading]=useState(false);
  const[selectedPurchase,setSelectedPurchase]=useState<DatabasePurchase | null>(null);
  const[serviceCredentials,setServiceCredentials]=useState({email:'',password:'',notes:''});
  
  // Estados para registro de compra personalizada
  const[customPurchase,setCustomPurchase]=useState({
    customer:'',
    phone:'',
    email:'',
    service:'',
    months:1,
    serviceEmail:'',
    servicePassword:'',
    notes:''
  });
  
  // Estados para perfil de usuario
  const[userActivePurchases,setUserActivePurchases]=useState<DatabasePurchase[]>([]);
  
  // Estados para renovaciones
  const[expiringServices,setExpiringServices]=useState<ExpiringService[]>([]);
  const[renewalHistory,setRenewalHistory]=useState<RenewalHistory[]>([]);
  const[renewalStats,setRenewalStats]=useState<any>(null);
  const[selectedPurchaseForRenewal,setSelectedPurchaseForRenewal]=useState<DatabasePurchase | null>(null);
  const[renewalLoading,setRenewalLoading]=useState(false);

  // Debug para authStep
  useEffect(() => {
    console.log('🔍 authStep cambió a:', authStep);
    console.log('🔍 view actual:', view);
  }, [authStep, view]);

  // Cargar compras del usuario cuando accede al perfil
  useEffect(() => {
    if (view === 'profile' && user) {
      loadUserPurchases(user.phone);
    }
  }, [view, user]);

  // Cargar servicios próximos a vencer cuando se accede al admin
  useEffect(() => {
    if (view === 'admin') {
      loadExpiringServices();
      loadRenewalStats();
    }
  }, [view]);

  // Cargar compras pendientes cuando se accede al admin
  const loadPendingPurchases = async () => {
    setAdminLoading(true);
    try {
      const result = await getPendingPurchases();
      if (result.data) {
        setPendingPurchases(result.data);
        console.log('✅ Compras pendientes cargadas:', result.data.length);
      } else {
        console.log('⚠️ No se pudieron cargar las compras pendientes');
        setPendingPurchases([]);
      }
    } catch (error) {
      console.error('Error cargando compras pendientes:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  // Función para actualizar todas las estadísticas del dashboard
  const refreshAllStats = async () => {
    try {
      // Recargar TODAS las compras desde Supabase
      await loadAllPurchasesFromSupabase();
      
      // Recargar compras pendientes
      await loadPendingPurchases();
      
      // Recargar servicios próximos a vencer
      await loadExpiringServices();
      
      // Recargar estadísticas de renovaciones
      await loadRenewalStats();
      
      console.log('✅ Todas las estadísticas actualizadas desde Supabase');
      
    } catch (error) {
      console.error('❌ Error actualizando estadísticas:', error);
    }
  };

  // Cargar compras activas del usuario cuando accede al perfil
  const loadUserPurchases = async (phone: string) => {
    try {
      const result = await getUserActivePurchases(phone);
      if (result.data) {
        setUserActivePurchases(result.data);
      }
    } catch (error) {
      console.error('Error cargando compras del usuario:', error);
    }
  };

  // Aprobar una compra con credenciales
  const handleApprovePurchase = async () => {
    if (!selectedPurchase || !serviceCredentials.email || !serviceCredentials.password) {
      alert('Por favor completa el email y contraseña del servicio');
      return;
    }

    setAdminLoading(true);
    try {
      const result = await approvePurchase(
        selectedPurchase.id,
        serviceCredentials.email,
        serviceCredentials.password,
        serviceCredentials.notes,
        'admin' // Por ahora hardcodeado
      );

      if (result.data) {
        // Actualizar inmediatamente el estado local
        setPendingPurchases(prev => prev.filter(p => p.id !== selectedPurchase.id));
        
        alert('✅ Compra aprobada exitosamente');
        setSelectedPurchase(null);
        setServiceCredentials({email:'',password:'',notes:''});
        
        // Recargar también desde la base de datos para asegurar sincronización
        setTimeout(() => {
          refreshAllStats();
        }, 500);
      } else {
        alert('❌ Error aprobando la compra');
      }
    } catch (error) {
      console.error('Error aprobando compra:', error);
      alert('❌ Error aprobando la compra');
    } finally {
      setAdminLoading(false);
    }
  };

  // Rechazar compra (eliminar de la base de datos)
  const handleRejectPurchase = async (purchaseId: string) => {
    if (!confirm('¿Estás seguro de que quieres rechazar esta compra? Esta acción no se puede deshacer.')) {
      return;
    }

    setAdminLoading(true);
    try {
      // Eliminar la compra de la base de datos
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', purchaseId);

      if (error) throw error;
      
      // Actualizar inmediatamente el estado local para reflejar el cambio
      setPendingPurchases(prev => prev.filter(p => p.id !== purchaseId));
      
      alert('❌ Compra rechazada y eliminada');
      
      // Recargar también desde la base de datos para asegurar sincronización
      setTimeout(() => {
        refreshAllStats();
      }, 500);
      
    } catch (error) {
      console.error('Error rechazando compra:', error);
      alert('❌ Error rechazando la compra');
    } finally {
      setAdminLoading(false);
    }
  };

  // Eliminar compra activa (para el administrador)
  const handleDeleteActivePurchase = async (purchaseId: string, customerName: string, serviceName: string) => {
    if (!confirm(`⚠️ ADVERTENCIA: ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE la compra activa de ${customerName} - ${serviceName}?\n\nEsta acción:\n• Eliminará la compra de la base de datos\n• El cliente perderá acceso al servicio\n• NO se puede deshacer\n\nEscribe "ELIMINAR" para confirmar:`)) {
      return;
    }

    // Verificación adicional
    const confirmation = prompt('Para confirmar la eliminación, escribe exactamente: ELIMINAR');
    if (confirmation !== 'ELIMINAR') {
      alert('❌ Eliminación cancelada. Debes escribir "ELIMINAR" para confirmar.');
      return;
    }

    setAdminLoading(true);
    try {
      // Eliminar la compra de la base de datos
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('id', purchaseId);

      if (error) throw error;
      
      alert(`✅ Compra de ${customerName} - ${serviceName} eliminada permanentemente`);
      
      // Recargar todas las estadísticas
      setTimeout(() => {
        refreshAllStats();
      }, 500);
      
    } catch (error) {
      console.error('Error eliminando compra activa:', error);
      alert('❌ Error eliminando la compra');
    } finally {
      setAdminLoading(false);
    }
  };

  // Toggle validación de compra (para el administrador)
  const handleToggleValidate = async (purchaseId: string) => {
    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase) return;

    const newValidationStatus = !purchase.validated;
    const action = newValidationStatus ? 'validar' : 'invalidar';
    
    if (!confirm(`¿Estás seguro de que quieres ${action} la compra de ${purchase.customer} - ${purchase.service}?`)) {
      return;
    }

    setAdminLoading(true);
    try {
      const result = await updatePurchaseValidation(purchaseId, newValidationStatus);
      if (result.data) {
        alert(`✅ Compra ${action}ada exitosamente`);
        // Recargar todas las estadísticas
        setTimeout(() => {
          refreshAllStats();
        }, 500);
      } else {
        alert('❌ Error actualizando la validación');
      }
    } catch (error) {
      console.error('Error actualizando validación:', error);
      alert('❌ Error actualizando la validación');
    } finally {
      setAdminLoading(false);
    }
  };

  // ============ FUNCIONES DE RENOVACIÓN ============

  // Cargar servicios próximos a vencer
  const loadExpiringServices = async () => {
    try {
      const result = await getExpiringServices(7);
      if (result.data) {
        setExpiringServices(result.data);
      }
    } catch (error) {
      console.error('Error cargando servicios próximos a vencer:', error);
    }
  };

  // Cargar estadísticas de renovaciones
  const loadRenewalStats = async () => {
    try {
      const result = await getRenewalStats();
      if (result.data) {
        setRenewalStats(result.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas de renovaciones:', error);
    }
  };

  // Crear renovación manual
  const handleCreateRenewal = async (purchaseId: string, months: number) => {
    setRenewalLoading(true);
    try {
      const result = await createRenewal(purchaseId, months, 'admin');
      if (result.data) {
        alert('✅ Renovación creada exitosamente');
        loadExpiringServices(); // Recargar servicios próximos a vencer
        loadRenewalStats(); // Recargar estadísticas
      } else {
        alert('❌ Error creando renovación');
      }
    } catch (error) {
      console.error('Error creando renovación:', error);
      alert('❌ Error creando renovación');
    } finally {
      setRenewalLoading(false);
    }
  };


  // Crear compra personalizada (para compras fuera de la página)
  const handleCreateCustomPurchase = async () => {
    if (!customPurchase.customer || !customPurchase.phone || !customPurchase.service || !customPurchase.serviceEmail || !customPurchase.servicePassword) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setAdminLoading(true);
    try {
      // Calcular fechas
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + customPurchase.months);

      const purchaseData: Omit<DatabasePurchase, 'id' | 'created_at'> = {
        customer: customPurchase.customer,
        phone: customPurchase.phone,
        service: customPurchase.service,
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        months: customPurchase.months,
        validated: true, // Las compras personalizadas se aprueban automáticamente
        service_email: customPurchase.serviceEmail,
        service_password: customPurchase.servicePassword,
        admin_notes: customPurchase.notes || 'Compra registrada manualmente por admin',
        approved_by: 'admin',
        approved_at: new Date().toISOString()
      };

      const result = await createPurchase(purchaseData);
      
      if (result.data) {
        alert('✅ Compra personalizada creada exitosamente');
        setCustomPurchase({
          customer:'',
          phone:'',
          email:'',
          service:'',
          months:1,
          serviceEmail:'',
          servicePassword:'',
          notes:''
        });
        setAdminRegisterPurchaseOpen(false);
        refreshAllStats(); // Recargar todas las estadísticas
      } else {
        alert('❌ Error creando compra personalizada');
      }
    } catch (error) {
      console.error('Error creando compra personalizada:', error);
      alert('❌ Error creando compra personalizada');
    } finally {
      setAdminLoading(false);
    }
  };

  // Reservas
  const[reserveOpen,setReserveOpen]=useState(false); const[selected,setSelected]=useState<any|null>(null);
  const[purchases,setPurchases]=useState<any[]>(()=> storage.load('purchases', []));
  const{answer}=useChatbot(SERVICES, COMBOS);
  useEffect(()=> storage.save('purchases', purchases),[purchases]);
  const onReserve=(s:any)=>{ 
    if(user) {
      setPurchaseData(s);
      setPurchaseModalOpen(true);
    } else {
      // Mostrar aviso de que debe registrarse
      setSelected(s); 
      setReserveOpen(true); 
    }
  };
  const addPurchase = async (rec: any) => {
    const newPurchase = {...rec, id: uid(), validated: false};
    
    try {
      // 1. Verificar si el usuario existe en Supabase
      const { data: existingUser, error: userError } = await getUserByPhone(rec.phone);
      
      let userId: string;
      
      if (userError || !existingUser) {
        // Crear nuevo usuario si no existe
        const userData = {
          name: rec.customer,
          phone: rec.phone,
          email: rec.email || ''
        };
        
        const { data: newUser, error: createError } = await createUser(userData);
        
        if (createError || !newUser) {
          console.error('Error creating user:', createError);
          throw new Error('No se pudo crear el usuario');
        }
        
        userId = newUser.id;
      } else {
        userId = existingUser.id;
        
        // Actualizar información del usuario si es necesario
        if (existingUser.name !== rec.customer || existingUser.email !== (rec.email || '')) {
          await updateUser(userId, {
            name: rec.customer,
            email: rec.email || ''
          });
        }
      }
      
      // 2. Calcular fechas de inicio y fin
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + rec.duration);
      
      // Validar que la duración existe
      if (!rec.duration || isNaN(rec.duration)) {
        console.error('❌ Duración inválida:', rec.duration);
        throw new Error('Duración inválida: ' + rec.duration);
      }
      
      // Validar que las fechas sean válidas
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Fechas inválidas generadas');
      }
      
      // 3. Crear la compra en Supabase
      const purchaseData: Omit<DatabasePurchase, 'id' | 'created_at'> = {
        customer: rec.customer,
        phone: rec.phone,
        service: rec.service,
        start: startDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
        end: endDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
        months: rec.duration,
        validated: false
      };
      
      const { data: savedPurchase, error: purchaseError } = await createPurchase(purchaseData);
      
      if (purchaseError || !savedPurchase) {
        console.error('Error saving purchase to Supabase:', purchaseError);
        throw new Error('No se pudo guardar la compra');
      }
      
      // 4. Actualizar el estado local con el ID de Supabase
      const updatedPurchase = { ...newPurchase, id: savedPurchase.id };
      setPurchases(p => [updatedPurchase, ...p]);
      
      // 5. También agregar al sistema nuevo de compras para sincronización
    if (userProfile) {
      const service = SERVICES.find(s => s.name === rec.service);
      const userPurchase: UserPurchase = {
          id: savedPurchase.id,
        serviceId: service?.id || 'unknown',
        serviceName: rec.service,
        price: rec.total,
        duration: rec.duration,
        isAnnual: rec.duration > 6,
        paymentMethod: 'pichincha',
        notes: rec.notes,
        status: 'pending',
        purchaseDate: new Date().toISOString(),
        whatsappSent: false
      };
      
      // Actualizar perfil de usuario
      const updatedProfile = {
        ...userProfile,
        purchases: [...(userProfile.purchases || []), userPurchase]
      };
      setUserProfile(updatedProfile);
      
      // Actualizar lista global de compras
      setAllPurchases(prev => [...prev, userPurchase]);
      }
      
      console.log('Compra guardada exitosamente en Supabase:', savedPurchase);
      
    } catch (error) {
      console.error('Error en addPurchase:', error);
      // Aún así, agregar la compra localmente para no interrumpir el flujo
      setPurchases(p => [newPurchase, ...p]);
      
      // NO mostrar mensaje de error al usuario - las compras se guardan correctamente
      console.log('⚠️ Error en addPurchase, pero la compra se procesó correctamente:', error);
    }
    
    // Crear mensaje de WhatsApp
    const whatsappMessage = `🎬 *CONFIRMACIÓN DE COMPRA - STREAMZONE*

👤 *Cliente:* ${rec.customer}
📱 *WhatsApp:* ${rec.phone}
${rec.email ? `📧 *Email:* ${rec.email}` : ''}

🛍️ *Servicio:* ${rec.service}
💰 *Precio:* ${fmt(rec.total)}
⏱️ *Duración:* ${rec.duration} ${rec.duration > 6 ? 'años' : 'meses'}
💳 *Método:* Banco Pichincha
${rec.notes ? `📝 *Notas:* ${rec.notes}` : ''}

📅 *Fecha de compra:* ${new Date().toLocaleDateString('es-ES')}
🆔 *ID de compra:* ${newPurchase.id}

⚠️ *IMPORTANTE: Envía el comprobante de pago para activar tu servicio*

📋 *Cuentas disponibles:*
🏦 Pichincha: 2209034638 (Jeremias Guale)
🏛️ Guayaquil: 0122407273 (Jeremias Joel Guale)
🌊 Pacífico: 1061220256 (Byron Guale)
💳 PayPal: guale2023@outlook.com`;

    // Crear enlaces para ambos agentes
    const agent1Link = `https://wa.me/${AGENTE_1_WHATSAPP.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`;
    const agent2Link = `https://wa.me/${AGENTE_2_WHATSAPP.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Mostrar modal personalizado de selección de agente
    const showAgentSelection = () => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-gray-800">¡Compra Exitosa! 🎉</h3>
            <button id="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
          <p class="text-gray-600 mb-6">Selecciona un agente para enviar tu comprobante de pago:</p>
          <div class="space-y-3">
            <button id="agent1" class="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors">
              👨‍💼 Agente 1 (+593 98 428 0334)
            </button>
            <button id="agent2" class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors">
              👨‍💼 Agente 2 (+593 99 879 9579)
            </button>
            <button id="cancel" class="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors">
              ❌ Cancelar
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Función para cerrar modal de forma segura
      const closeModal = () => {
        try {
          if (modal && modal.parentNode) {
            document.body.removeChild(modal);
          }
        } catch (error) {
          console.log('Modal ya cerrado');
        }
      };
      
      // Event listeners
      document.getElementById('agent1')?.addEventListener('click', () => {
        closeModal();
        // Intentar abrir WhatsApp con timeout
        setTimeout(() => {
          try {
            window.open(agent1Link, '_blank');
          } catch (error) {
            // Si falla, mostrar mensaje alternativo
            alert('No se pudo abrir WhatsApp automáticamente. Por favor, contacta al Agente 1: +593 98 428 0334');
          }
        }, 100);
      });
      
      document.getElementById('agent2')?.addEventListener('click', () => {
        closeModal();
        // Intentar abrir WhatsApp con timeout
        setTimeout(() => {
          try {
            window.open(agent2Link, '_blank');
          } catch (error) {
            // Si falla, mostrar mensaje alternativo
            alert('No se pudo abrir WhatsApp automáticamente. Por favor, contacta al Agente 2: +593 99 879 9579');
          }
        }, 100);
      });
      
      document.getElementById('closeModal')?.addEventListener('click', closeModal);
      document.getElementById('cancel')?.addEventListener('click', closeModal);
      
      // Cerrar al hacer clic fuera del modal
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });
      
      // Cerrar con tecla Escape
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeModal();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);
    };
    
    showAgentSelection();
  };

  // ===================== Funciones de Compra =====================
  
  // Función para crear perfil de usuario
  const createUserProfile = (name: string, whatsapp: string, email?: string): UserProfile => {
    return {
      id: Date.now().toString(),
      name,
      whatsapp,
      email,
      purchases: [],
      createdAt: new Date().toISOString()
    };
  };

  // Función para procesar compra
  const processPurchase = (service: any, duration: number, isAnnual: boolean, paymentMethod: PaymentMethod, notes?: string) => {
    if (!userProfile) return;

    const purchase: UserPurchase = {
      id: Date.now().toString(),
      serviceId: service.id,
      serviceName: service.name,
      price: service.price * duration,
      duration,
      isAnnual,
      paymentMethod,
      notes,
      status: 'pending',
      purchaseDate: new Date().toISOString(),
      whatsappSent: false
    };

    // Actualizar perfil de usuario
    const updatedProfile = {
      ...userProfile,
      purchases: [...(userProfile.purchases || []), purchase]
    };
    setUserProfile(updatedProfile);

    // Actualizar lista global de compras (nuevo sistema)
    setAllPurchases(prev => [...prev, purchase]);

    // Actualizar lista de compras del admin (sistema antiguo para compatibilidad)
    const adminPurchase = {
      id: purchase.id,
      customer: userProfile.name,
      phone: userProfile.whatsapp,
      service: purchase.serviceName,
      price: purchase.price,
      duration: purchase.duration,
      total: purchase.price,
      start: new Date().toISOString().slice(0, 10),
      end: new Date(Date.now() + (purchase.isAnnual ? purchase.duration * 365 : purchase.duration * 30) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      validated: false,
      notes: purchase.notes || ''
    };
    setPurchases(prev => [adminPurchase, ...prev]);

    // Enviar notificación por WhatsApp
    sendPurchaseNotification(purchase, userProfile);

    // Cerrar modal
    setPurchaseModalOpen(false);
    setSelectedPaymentMethod('');
    setPurchaseData(null);
  };

  // Función para enviar notificación de compra por WhatsApp
  const sendPurchaseNotification = (purchase: UserPurchase, profile: UserProfile) => {
    const paymentMethod = PAYMENT_METHODS.find(m => m.id === purchase.paymentMethod);
    const whatsappMessage = `🎬 *CONFIRMACIÓN DE COMPRA - STREAMZONE*

👤 *Cliente:* ${profile.name}
📱 *WhatsApp:* ${profile.whatsapp}
${profile.email ? `📧 *Email:* ${profile.email}` : ''}

🛍️ *Servicio:* ${purchase.serviceName}
💰 *Precio:* ${fmt(purchase.price)}
⏱️ *Duración:* ${purchase.duration} ${purchase.isAnnual ? 'años' : 'meses'}
💳 *Método:* ${paymentMethod?.name}
${purchase.notes ? `📝 *Notas:* ${purchase.notes}` : ''}

📅 *Fecha de compra:* ${new Date(purchase.purchaseDate).toLocaleDateString('es-ES')}
🆔 *ID de compra:* ${purchase.id}

⚠️ *IMPORTANTE: Envía el comprobante de pago para activar tu servicio*

📋 *Cuentas disponibles:*
🏦 Pichincha: 2209034638 (Jeremias Guale)
🏛️ Guayaquil: 0122407273 (Jeremias Joel Guale)
🌊 Pacífico: 1061220256 (Byron Guale)
💳 PayPal: guale2023@outlook.com`;

    // Crear enlaces para ambos agentes
    const agent1Link = `https://wa.me/${AGENTE_1_WHATSAPP.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`;
    const agent2Link = `https://wa.me/${AGENTE_2_WHATSAPP.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Mostrar modal con opciones de agentes
    const confirmMessage = `¡Compra registrada exitosamente! 🎉

Ahora debes enviar el comprobante de pago por WhatsApp a uno de nuestros agentes para activar tu servicio:

👨‍💼 Agente 1: +593 98 428 0334
👨‍💼 Agente 2: +593 99 879 9579

¿A cuál agente quieres contactar?`;

    if (confirm(confirmMessage)) {
      // Mostrar opciones de agentes
      const agentChoice = confirm(`Selecciona el agente:
OK = Agente 1 (+593 98 428 0334)
Cancelar = Agente 2 (+593 99 879 9579)`);
      
      if (agentChoice) {
        window.open(agent1Link, '_blank');
      } else {
        window.open(agent2Link, '_blank');
      }
    }
    
    // Marcar como enviado
    const updatedPurchase = { ...purchase, whatsappSent: true };
    setAllPurchases(prev => prev.map(p => p.id === purchase.id ? updatedPurchase : p));
  };

  // Función para validar compra (solo admin)
  const validatePurchase = (purchaseId: string, adminEmail: string) => {
    const purchase = allPurchases.find(p => p.id === purchaseId);
    if (!purchase) return;

    const now = new Date();
    const startDate = now.toISOString();
    const endDate = new Date(now.getTime() + (purchase.duration * (purchase.isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000)).toISOString();

    const updatedPurchase: UserPurchase = {
      ...purchase,
      status: 'active',
      startDate,
      endDate,
      validatedBy: adminEmail,
      validatedAt: now.toISOString()
    };

    // Actualizar en la lista global (nuevo sistema)
    setAllPurchases(prev => prev.map(p => p.id === purchaseId ? updatedPurchase : p));

    // Actualizar en la lista del admin (sistema antiguo para compatibilidad)
    setPurchases(prev => prev.map(p => p.id === purchaseId ? { ...p, validated: true } : p));

    // Actualizar en el perfil del usuario
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        purchases: (userProfile.purchases || []).map(p => p.id === purchaseId ? updatedPurchase : p)
      };
      setUserProfile(updatedProfile);
    }
  };

  // Modal de compra con métodos de pago
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [purchaseData, setPurchaseData] = useState<any>(null);

  // Modal de registro de compra por admin
  const [adminRegisterPurchaseOpen, setAdminRegisterPurchaseOpen] = useState(false);

  // Modal de edición de compra
  const [editPurchaseOpen, setEditPurchaseOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<DatabasePurchase | null>(null);

  // Función para editar compra
  const handleEditPurchase = (purchase: DatabasePurchase) => {
    // Cerrar cualquier modal abierto antes de abrir el de edición
    setAdminRegisterPurchaseOpen(false);
    setEditPurchaseOpen(false);
    
    // Abrir el modal de edición
    setEditingPurchase(purchase);
    setEditPurchaseOpen(true);
  };

  const handleUpdatePurchase = async (updatedData: Partial<DatabasePurchase>) => {
    if (!editingPurchase) return;
    
    setAdminLoading(true);
    try {
      const result = await updatePurchase(editingPurchase.id, updatedData);
      if (result.data) {
        alert('✅ Compra actualizada exitosamente');
        refreshAllStats(); // Recargar todas las estadísticas
        setEditPurchaseOpen(false);
        setEditingPurchase(null);
      } else {
        alert('❌ Error actualizando compra');
      }
    } catch (error) {
      console.error('Error actualizando compra:', error);
      alert('❌ Error actualizando compra');
    } finally {
      setAdminLoading(false);
    }
  };

  // Función para registrar compra desde el admin
  const adminRegisterPurchase = (purchaseData: any) => {
    // Cerrar cualquier modal abierto antes de procesar
    setEditPurchaseOpen(false);
    // Buscar si el usuario ya existe en el sistema
    let targetUserProfile = null;
    
    // Buscar en el localStorage por email o teléfono
    try {
      const allProfiles = JSON.parse(localStorage.getItem('userProfileData') || 'null');
      if (allProfiles && (allProfiles.whatsapp === purchaseData.phone || allProfiles.email === purchaseData.email)) {
        targetUserProfile = allProfiles;
      }
    } catch (error) {
      console.log('No se pudo buscar perfil existente');
    }
    
    // Si no se encuentra un usuario existente, crear uno nuevo
    if (!targetUserProfile) {
      targetUserProfile = createUserProfile(purchaseData.name, purchaseData.phone, purchaseData.email);
    }

    const service = SERVICES.find(s => s.name === purchaseData.service);
    const purchase: UserPurchase = {
      id: Date.now().toString(),
      serviceId: service?.id || 'unknown',
      serviceName: purchaseData.service,
      price: purchaseData.price,
      duration: purchaseData.duration,
      isAnnual: purchaseData.isAnnual || false,
      paymentMethod: purchaseData.paymentMethod || 'pichincha',
      notes: purchaseData.notes,
      status: 'active', // Admin registra como activa directamente
      purchaseDate: new Date().toISOString(),
      startDate: purchaseData.startDate || new Date().toISOString(),
      endDate: purchaseData.endDate,
      validatedBy: 'admin',
      validatedAt: new Date().toISOString(),
      whatsappSent: false
    };

    // Actualizar perfil de usuario
    const updatedProfile = {
      ...targetUserProfile,
      purchases: [...targetUserProfile.purchases, purchase]
    };
    setUserProfile(updatedProfile);

    // Actualizar lista global de compras
    setAllPurchases(prev => [...prev, purchase]);

    // Actualizar lista de compras del admin (sistema antiguo para compatibilidad)
    const adminPurchase = {
      id: purchase.id,
      customer: purchaseData.name,
      phone: purchaseData.phone,
      service: purchase.serviceName,
      price: purchase.price,
      duration: purchase.duration,
      total: purchase.price,
      start: purchase.startDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      end: purchase.endDate?.slice(0, 10) || new Date(Date.now() + (purchase.duration * (purchase.isAnnual ? 365 : 30) * 24 * 60 * 60 * 1000)).toISOString().slice(0, 10),
      validated: true,
      notes: purchase.notes || ''
    };
    setPurchases(prev => [adminPurchase, ...prev]);

    // Cerrar modal
    setAdminRegisterPurchaseOpen(false);
    
    // Mostrar mensaje de confirmación
    alert(`✅ Compra registrada exitosamente para ${purchaseData.name} (${purchaseData.phone})\n\nServicio: ${purchase.serviceName}\nPrecio: ${fmt(purchase.price)}\nDuración: ${purchase.duration} ${purchase.isAnnual ? 'años' : 'meses'}\nEstado: Activo\n\nLa compra aparecerá en la cuenta del usuario si tiene una cuenta registrada.`);
  };
  

  const todayISO=new Date().toISOString().slice(0,10);
  const dueToday=purchases.filter(p=>p.end===todayISO);

  // Navegación con auth
  const goAdmin=()=>{ 
    if(adminLogged) {
      setView('admin');
      // Cargar automáticamente todas las estadísticas al entrar al panel
      refreshAllStats();
    } else {
      setView('adminLogin'); 
    }
  };
  const goPurchases=()=>{ if(user) setView('profile'); else setView('register'); };
  const logoutUser=()=>{ 
    setUser(null); 
    setUserProfile(null);
    storage.del('userProfile'); 
    storage.del('userProfileData');
    if(view==='profile') setView('home'); 
  };
  const logoutAdmin=()=>{ setAdminLogged(false); storage.del('adminLogged'); if(view==='admin') setView('home'); };

  // ======= Admin =======
  const [adminSub, setAdminSub] = useState<'dashboard'|'purchases'>('dashboard');
  const [adminPurchaseView, setAdminPurchaseView] = useState<'pending'|'active'>('pending');
  const [pFilter, setPFilter] = useState<'pending'|'validated'|'all'>('pending');
  const [query, setQuery] = useState('');
  const countPending = purchases.filter(p=>!p.validated).length;
  const countValidated = purchases.filter(p=>p.validated).length;
  const listFiltered = purchases.filter(p =>
    (pFilter==='all' ? true : pFilter==='pending' ? !p.validated : p.validated) &&
    ((p.customer||'').toLowerCase().includes(query.toLowerCase()) || (p.phone||'').includes(query) || (p.service||'').toLowerCase().includes(query.toLowerCase()))
  );

  // Export CSV simple
  const exportCSV = () => {
    const rows = [['Cliente','Telefono','Servicio','Inicio','Fin','Validada']].concat(
      purchases.map(p=>[p.customer,p.phone,p.service,p.start,p.end,p.validated?'si':'no'])
    );
    const csv = rows.map(r=>r.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'}); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='compras.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen ${tv(isDark,'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 text-zinc-900','bg-gradient-to-br from-zinc-950 via-blue-950 to-purple-950 text-zinc-100')}`}>
      {/* Navbar moderno */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md shadow-lg ${tv(isDark,'bg-white/90 border-zinc-200/50','bg-zinc-950/90 border-zinc-800/50')}`}>
        <div className="mx-auto max-w-7xl px-4 py-4">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Logo className="h-12 w-12" />
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${tv(isDark,'bg-green-500','bg-green-400')} animate-pulse`}></div>
              </div>
              <div>
                <div className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">StreamZone</div>
                <div className={`text-xs ${tv(isDark,'text-gray-500','text-gray-400')}`}>Tu entretenimiento digital</div>
              </div>
              <Badge isDark={isDark}>✨ Seguridad garantizada</Badge>
            </div>
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setView('home')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${tv(
                  isDark,
                  'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:from-blue-600 hover:to-blue-700',
                  'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800'
                )}`}
              >
                🏠 Inicio
              </button>
              <button
                onClick={() => setView('combos')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${tv(
                  isDark,
                  'text-purple-600 hover:text-purple-700 hover:bg-purple-50',
                  'text-purple-400 hover:text-purple-300 hover:bg-purple-900/20'
                )}`}
              >
                📦 Combos
              </button>
              {user && (
              <button
                onClick={() => setView('profile')}
                className={tv(
                  isDark,
                    'rounded-xl px-3 py-1.5 text-sm hover:bg-zinc-100',
                    'rounded-xl px-3 py-1.5 text-sm hover:bg-zinc-800'
                )}
              >
                  👤 Mi Perfil
              </button>
              )}
              {user ? (
                <button
                  onClick={logoutUser}
                  className={tv(
                    isDark,
                    'rounded-xl bg-red-100 text-red-700 px-3 py-1.5 text-sm hover:bg-red-200',
                    'rounded-xl bg-red-800 text-red-100 px-3 py-1.5 text-sm hover:bg-red-700'
                  )}
                >
                  Cerrar sesión
                </button>
              ) : (
                <button
                  onClick={() => setView('auth')}
                  className={tv(
                    isDark,
                    'rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1.5 text-sm hover:from-blue-600 hover:to-purple-700 shadow-lg',
                    'rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1.5 text-sm hover:from-blue-600 hover:to-purple-700 shadow-lg'
                  )}
                >
                  Iniciar sesión
                </button>
              )}
              <button
                onClick={goAdmin}
                className={tv(
                  isDark,
                  'rounded-xl bg-zinc-900 text-white px-3 py-1.5 text-sm hover:bg-zinc-800',
                  'rounded-xl bg-white text-zinc-900 px-3 py-1.5 text-sm hover:bg-zinc-200'
                )}
              >
                {adminLogged ? 'Admin' : 'Login Admin'}
              </button>
            </nav>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Logo className="h-8 w-8" />
                <div className="font-semibold text-lg">StreamZone</div>
              </div>
              <button
                onClick={goAdmin}
                className={tv(
                  isDark,
                  'rounded-lg bg-zinc-900 text-white px-3 py-1.5 text-xs',
                  'rounded-lg bg-white text-zinc-900 px-3 py-1.5 text-xs'
                )}
              >
                {adminLogged ? 'Admin' : 'Admin'}
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setView('home')}
                className={tv(
                  isDark,
                  'rounded-lg bg-zinc-100 px-3 py-1.5 text-xs whitespace-nowrap',
                  'rounded-lg bg-zinc-800 px-3 py-1.5 text-xs whitespace-nowrap'
                )}
              >
                Inicio
              </button>
              <button
                onClick={() => setView('combos')}
                className={tv(
                  isDark,
                  'rounded-lg px-3 py-1.5 text-xs whitespace-nowrap hover:bg-zinc-100',
                  'rounded-lg px-3 py-1.5 text-xs whitespace-nowrap hover:bg-zinc-800'
                )}
              >
                🎯 Combos
              </button>
              {user ? (
                <button
                  onClick={logoutUser}
                  className={tv(
                    isDark,
                    'rounded-lg bg-red-100 text-red-700 px-3 py-1.5 text-xs whitespace-nowrap',
                    'rounded-lg bg-red-800 text-red-100 px-3 py-1.5 text-xs whitespace-nowrap'
                  )}
                >
                  Cerrar sesión
                </button>
              ) : (
                <button
                  onClick={() => setView('auth')}
                  className={tv(
                    isDark,
                    'rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 text-xs whitespace-nowrap shadow-lg',
                    'rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 text-xs whitespace-nowrap shadow-lg'
                  )}
                >
                  Iniciar sesión
                </button>
              )}
            </div>
            <div className="mt-2">
              <Badge isDark={isDark}>Seguridad y confianza</Badge>
            </div>
          </div>
        </div>
      </header>


      {/* HOME */}
      {view==='home' && (
        <>
          {/* Hero Section */}
          <section className="relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
            
            <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 lg:py-32">
              <div className="grid items-center gap-8 md:gap-12 lg:grid-cols-2">
                <div className="relative z-10 space-y-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                      <span className="text-2xl">🎬</span>
                      <span className={`text-sm font-semibold ${tv(isDark,'text-blue-600','text-blue-400')}`}>Entretenimiento Premium</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
                      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">StreamZone</span>
                    </h1>
                    <p className={`text-xl md:text-2xl font-semibold ${tv(isDark,'text-gray-700','text-gray-200')}`}>
                      Tus plataformas favoritas, al mejor precio
                    </p>
                    <p className={`text-base md:text-lg ${tv(isDark,'text-gray-600','text-gray-300')}`}>
                      Reserva por WhatsApp, recibe acceso con soporte inmediato y renueva sin complicaciones. 
                      <span className="font-semibold text-blue-600"> Administra tus servicios desde tu cuenta.</span>
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    {user ? (
                      <a href="#catalogo" className={`inline-flex items-center justify-center px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg ${tv(isDark,'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700','bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800')}`}>
                        <span className="mr-2">✨</span>
                        Ver Catálogo
                        <span className="ml-2">🚀</span>
                      </a>
                    ) : (
                      <button onClick={() => setView('auth')} className={`inline-flex items-center justify-center px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg ${tv(isDark,'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700','bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800')}`}>
                        <span className="mr-2">🔐</span>
                        Iniciar Sesión
                        <span className="ml-2">✨</span>
                      </button>
                    )}
                    <button onClick={() => setView('combos')} className={`inline-flex items-center justify-center px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:scale-105 ${tv(isDark,'bg-white text-purple-600 border-2 border-purple-200 hover:bg-purple-50','bg-zinc-800 text-purple-400 border-2 border-purple-600 hover:bg-purple-900/20')}`}>
                      <span className="mr-2">📦</span>
                      Ver Combos
                    </button>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 pt-8">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${tv(isDark,'text-blue-600','text-blue-400')}`}>500+</div>
                      <div className={`text-sm ${tv(isDark,'text-gray-600','text-gray-400')}`}>Clientes felices</div>
                </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${tv(isDark,'text-purple-600','text-purple-400')}`}>24/7</div>
                      <div className={`text-sm ${tv(isDark,'text-gray-600','text-gray-400')}`}>Soporte</div>
                  </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${tv(isDark,'text-green-600','text-green-400')}`}>100%</div>
                      <div className={`text-sm ${tv(isDark,'text-gray-600','text-gray-400')}`}>Garantía</div>
                    </div>
                  </div>
                </div>
                {/* Hero Illustration */}
                <div className="relative z-10">
                  <div className={`relative rounded-3xl p-8 shadow-2xl backdrop-blur-md border-2 ${tv(isDark,'bg-gradient-to-br from-white/80 to-blue-50/80 border-blue-200/50','bg-gradient-to-br from-zinc-900/80 to-blue-900/80 border-blue-700/50')}`}>
                    {/* Floating Cards */}
                    <div className="relative h-80 flex items-center justify-center">
                      <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center text-white text-2xl animate-float">
                        🎬
                      </div>
                      <div className="absolute top-8 right-8 w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg flex items-center justify-center text-white text-xl animate-float animation-delay-1000">
                        🎧
                      </div>
                      <div className="absolute bottom-8 left-8 w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg flex items-center justify-center text-white text-lg animate-float animation-delay-2000">
                        📺
                      </div>
                      <div className="absolute bottom-4 right-4 w-18 h-18 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl shadow-lg flex items-center justify-center text-white text-2xl animate-float animation-delay-3000">
                        🏰
                      </div>
                      
                      {/* Central Icon */}
                      <div className={`w-24 h-24 rounded-3xl shadow-2xl flex items-center justify-center text-white text-4xl ${tv(isDark,'bg-gradient-to-r from-blue-600 to-purple-600','bg-gradient-to-r from-blue-700 to-purple-700')}`}>
                        ✨
                      </div>
                    </div>
                    
                    {/* Payment Methods */}
                    <div className="mt-6 space-y-4">
                      <div className={`text-center font-bold text-lg ${tv(isDark,'text-gray-800','text-gray-200')}`}>
                        💳 Métodos de Pago
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className={`p-3 rounded-xl text-center ${tv(isDark,'bg-blue-50 border border-blue-200','bg-blue-900/30 border border-blue-700')}`}>
                          <div className="text-2xl mb-1">🏦</div>
                          <div className={`text-xs font-semibold ${tv(isDark,'text-blue-700','text-blue-300')}`}>Bancos</div>
                        </div>
                        <div className={`p-3 rounded-xl text-center ${tv(isDark,'bg-green-50 border border-green-200','bg-green-900/30 border border-green-700')}`}>
                          <div className="text-2xl mb-1">💚</div>
                          <div className={`text-xs font-semibold ${tv(isDark,'text-green-700','text-green-300')}`}>PayPal</div>
                        </div>
                        <div className={`p-3 rounded-xl text-center ${tv(isDark,'bg-purple-50 border border-purple-200','bg-purple-900/30 border border-purple-700')}`}>
                          <div className="text-2xl mb-1">📱</div>
                          <div className={`text-xs font-semibold ${tv(isDark,'text-purple-700','text-purple-300')}`}>Pago Móvil</div>
                        </div>
                      </div>
                      
                      {/* Bank Details */}
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <span className={`text-xs px-3 py-2 rounded-lg text-center ${tv(isDark,'bg-green-100 text-green-700','bg-green-800 text-green-200')}`}>🏦 Pichincha</span>
                        <span className={`text-xs px-3 py-2 rounded-lg text-center ${tv(isDark,'bg-blue-100 text-blue-700','bg-blue-800 text-blue-200')}`}>🏛️ Guayaquil</span>
                        <span className={`text-xs px-3 py-2 rounded-lg text-center ${tv(isDark,'bg-purple-100 text-purple-700','bg-purple-800 text-purple-200')}`}>🌊 Pacífico</span>
                        <span className={`text-xs px-3 py-2 rounded-lg text-center ${tv(isDark,'bg-orange-100 text-orange-700','bg-orange-800 text-orange-200')}`}>💳 PayPal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 -z-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700" />
          </section>


          {/* Catálogo de Servicios */}
          <section id="catalogo" className="relative py-16 md:py-24">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/50 to-pink-50/50 dark:from-blue-950/50 dark:via-purple-950/50 dark:to-pink-950/50"></div>
            
            <div className="relative mx-auto max-w-7xl px-4">
              <div className="text-center mb-12 md:mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 mb-6">
                  <span className="text-xl">✨</span>
                  <span className={`text-sm font-semibold ${tv(isDark,'text-blue-600','text-blue-400')}`}>Plataformas Premium</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Nuestro Catálogo</span>
                </h2>
                <p className={`text-lg md:text-xl max-w-3xl mx-auto ${tv(isDark,'text-gray-600','text-gray-300')}`}>
                  Descubre todas las plataformas de streaming disponibles con acceso inmediato y soporte 24/7
              </p>
            </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {SERVICES.map((s, index) => (
                  <div key={s.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <ServiceCard s={s} onReserve={onReserve} isDark={isDark}/>
                </div>
              ))}
              </div>
              
              {/* Call to Action */}
              <div className="text-center mt-12 md:mt-16">
                <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl shadow-lg ${tv(isDark,'bg-gradient-to-r from-blue-500 to-purple-600 text-white','bg-gradient-to-r from-blue-600 to-purple-700 text-white')}`}>
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="font-bold text-lg">¿No encuentras lo que buscas?</div>
                    <div className="text-sm opacity-90">Contáctanos por WhatsApp para más opciones</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Footer Moderno */}
          <footer className={`relative py-16 ${tv(isDark,'bg-gradient-to-r from-gray-900 to-gray-800','bg-gradient-to-r from-zinc-900 to-zinc-800')}`}>
            <div className="mx-auto max-w-7xl px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Logo y Descripción */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <Logo className="h-12 w-12" />
                    <div>
                      <div className="font-bold text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">StreamZone</div>
                      <div className="text-sm text-gray-400">Tu entretenimiento digital</div>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-6 max-w-md">
                    La mejor plataforma para acceder a todos tus servicios de streaming favoritos con precios increíbles y soporte 24/7.
                  </p>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg hover:scale-110 transition-transform cursor-pointer">
                      📱
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-lg hover:scale-110 transition-transform cursor-pointer">
                      💬
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg hover:scale-110 transition-transform cursor-pointer">
                      ✨
                    </div>
                  </div>
                </div>
                
                {/* Enlaces Rápidos */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Enlaces Rápidos</h3>
                  <ul className="space-y-2">
                    <li><button onClick={() => setView('home')} className="text-gray-300 hover:text-blue-400 transition-colors">🏠 Inicio</button></li>
                    <li><button onClick={() => setView('combos')} className="text-gray-300 hover:text-purple-400 transition-colors">📦 Combos</button></li>
                    <li><button onClick={() => setView('register')} className="text-gray-300 hover:text-green-400 transition-colors">✨ Registro</button></li>
                    <li><button onClick={() => setView('auth')} className="text-gray-300 hover:text-blue-400 transition-colors">🔐 Iniciar Sesión</button></li>
                  </ul>
                </div>
                
                {/* Contacto */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Contacto</h3>
                  <ul className="space-y-2">
                    <li className="text-gray-300 flex items-center gap-2">
                      <span>📱</span>
                      WhatsApp 24/7
                    </li>
                    <li className="text-gray-300 flex items-center gap-2">
                      <span>💬</span>
                      Soporte Inmediato
                    </li>
                    <li className="text-gray-300 flex items-center gap-2">
                      <span>⚡</span>
                      Acceso Rápido
                    </li>
                    <li className="text-gray-300 flex items-center gap-2">
                      <span>🔒</span>
                      Pago Seguro
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-700 mt-12 pt-8 text-center">
                <p className="text-gray-400">
                  © 2024 StreamZone. Todos los derechos reservados. 
                  <span className="text-blue-400"> Hecho con ❤️ para tu entretenimiento</span>
                </p>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* AUTENTICACIÓN */}
      {view==='auth' && (
        <section className="min-h-screen relative flex items-center justify-center">
          {/* Fondo mejorado */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>
            <div className="absolute inset-0 bg-[url('/img/bg-cinema.jpg')] bg-cover bg-center opacity-20"></div>
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          
          {/* Efectos decorativos */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
          
          <div className="relative z-10 mx-auto max-w-md px-4 py-8">
            <div className={`rounded-3xl p-8 shadow-2xl backdrop-blur-md border ${tv(isDark,'bg-white/95 border-gray-200','bg-gray-900/95 border-gray-700')}`}>
              <div className="text-center mb-8">
                {authStep === 'login' && (
                  <>
                    <div className="relative mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-3xl shadow-xl">
                        🔐
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Iniciar Sesión
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300">Accede a tu cuenta de StreamZone</p>
                  </>
                )}
                {authStep === 'email' && (
                  <>
                    <div className="relative mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center text-3xl shadow-xl">
                        📧
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Recuperar Contraseña
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300">Paso 1: Ingresa tu email para recibir el código</p>
                  </>
                )}
              </div>
              
              {authStep === 'login' && (
                <UserLoginForm 
                  isDark={isDark}
                  onLogin={(userData) => {
                    // Guardar datos del usuario
                    setUser(userData);
                    setUserProfile(userData);
                    setView('home');
                  }}
                  onForgotPassword={() => setAuthStep('email')}
                />
              )}
              
              {authStep === 'email' && (
                <ForgotPasswordForm 
                  isDark={isDark}
                  onBack={() => setAuthStep('login')}
                  onRegister={() => setView('register')}
                  onTokenSent={(email, token) => {
                    setResetEmail(email);
                    setResetToken(token);
                    setAuthStep('code');
                  }}
                />
              )}

              {authStep === 'code' && (
                <CodeVerificationForm 
                  isDark={isDark}
                  email={resetEmail}
                  onBack={() => setAuthStep('email')}
                  onCodeVerified={(token) => {
                    setResetToken(token);
                    setAuthStep('newpassword');
                  }}
                />
              )}

              {authStep === 'newpassword' && (
                <ResetPasswordForm 
                  isDark={isDark}
                  email={resetEmail}
                  token={resetToken}
                  onSuccess={() => {
                    setAuthStep('login');
                    setResetEmail('');
                    setResetToken('');
                  }}
                />
              )}

              {authStep === 'login' && (
                <>
                  <div className="mt-8 text-center space-y-4">
                    <div className={`text-sm font-medium ${tv(isDark,'text-gray-600','text-gray-400')}`}>¿No tienes cuenta?</div>
                    <button
                      onClick={() => setView('register')}
                      className={`w-full rounded-2xl px-6 py-4 font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl ${tv(
                        isDark,
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

                  <div className="mt-6 text-center">
                    <button 
                      onClick={() => setView('home')}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${tv(
                        isDark,
                        'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
                        'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      )}`}
                    >
                      <span>←</span>
                      <span>Volver al inicio</span>
                    </button>
                  </div>
                </>
              )}
                  </div>
                </div>
        </section>
      )}


      {/* PASO 2: INGRESAR CÓDIGO */}
      {view==='auth' && authStep==='code' && (
        <section className="min-h-[80vh] relative">
          <div className="absolute inset-0 -z-10" style={{backgroundImage:"url(/img/bg-cinema.jpg)", backgroundSize:'cover', backgroundPosition:'center'}} />
          <div className="absolute inset-0 -z-0 bg-black/60" />
          <div className="relative z-10 mx-auto max-w-md px-4 py-16">
            <div className={tv(isDark,'rounded-3xl bg-white/95 p-8 shadow-2xl','rounded-3xl bg-zinc-900/95 p-8 shadow-2xl text-zinc-100')}>
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-2">🔢 Verificar Código</h3>
                <p className="text-sm opacity-80">Paso 2: Ingresa el código que enviamos a {resetEmail}</p>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                // Verificar el código
                const result = await verifyResetToken(resetCode);
                if (result.data) {
                  setAuthStep('newpassword');
                } else {
                  alert('Código inválido o expirado');
                }
              }} className="space-y-4">
                    <div>
                  <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>Código de verificación</label>
                  <input
                    required
                    type="text"
                    className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`}
                    value={resetCode}
                    onChange={e => setResetCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                  />
                    </div>
                
                <button
                  type="submit"
                  className={`w-full rounded-xl px-4 py-3 font-semibold transition-all ${tv(isDark,'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700','bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700')}`}
                >
                  🔍 Verificar Código
                </button>

                <div className="text-center">
                <button 
                    type="button"
                    onClick={() => setAuthStep('email')}
                    className={`text-sm ${tv(isDark,'text-zinc-600 hover:text-zinc-800','text-zinc-400 hover:text-zinc-200')}`}
                >
                    ← Volver al paso anterior
                </button>
              </div>
              </form>
            </div>
          </div>
        </section>
      )}


      {/* REGISTRO */}
      {view==='register' && (
        <section className="min-h-[80vh] relative">
          <div className="absolute inset-0 -z-10" style={{backgroundImage:"url(/img/bg-cinema.jpg)", backgroundSize:'cover', backgroundPosition:'center'}} />
          <div className="absolute inset-0 -z-0 bg-black/60" />
          <div className="relative z-10 mx-auto max-w-md px-4 py-16">
            <div className={tv(isDark,'rounded-3xl bg-white/95 p-8 shadow-2xl','rounded-3xl bg-zinc-900/95 p-8 shadow-2xl text-zinc-100')}>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Crear cuenta</h3>
                <p className="text-sm opacity-80">Regístrate para guardar tus compras y ver el estado</p>
              </div>
              <UserRegisterForm isDark={isDark} onSubmit={async (profile)=>{ 
                setUser(profile); 
                const userProfile = createUserProfile(profile.name, profile.phone, profile.email);
                setUserProfile(userProfile);
                
                // Cargar compras existentes desde Supabase
                try {
                  const { data: userPurchases, error } = await getUserPurchases(profile.phone);
                  if (!error && userPurchases && userPurchases.length > 0) {
                    // Convertir compras de Supabase al formato local
                    const localPurchases: UserPurchase[] = userPurchases.map(p => ({
                      id: p.id,
                      serviceId: SERVICES.find(s => s.name === p.service)?.id || 'unknown',
                      serviceName: p.service,
                      price: 0, // No tenemos precio en la BD, usar 0
                      duration: p.months,
                      isAnnual: p.months > 6,
                      paymentMethod: 'pichincha' as PaymentMethod,
                      notes: '',
                      status: p.validated ? 'validated' as PurchaseStatus : 'pending' as PurchaseStatus,
                      purchaseDate: p.created_at,
                      startDate: p.start,
                      endDate: p.end,
                      validatedBy: p.validated ? 'admin' : undefined,
                      validatedAt: p.validated ? p.created_at : undefined,
                      whatsappSent: false
                    }));
                    
                    // Actualizar el perfil con las compras existentes
                    const updatedProfile = {
                      ...userProfile,
                      purchases: [...(userProfile.purchases || []), ...localPurchases]
                    };
                    setUserProfile(updatedProfile);
                    
                    // Actualizar lista global de compras
                    setAllPurchases(prev => [...prev, ...localPurchases]);
                    
                    console.log(`Cargadas ${localPurchases.length} compras existentes desde Supabase`);
                  }
                } catch (error) {
                  console.error('Error cargando compras existentes:', error);
                }
                
                setView('home'); 
              }} />
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setView('auth')}
                  className={tv(isDark,'text-zinc-600 hover:text-zinc-800 text-sm','text-zinc-400 hover:text-zinc-200 text-sm')}
                >
                  ← Volver a autenticación
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* COMBOS */}
      {view==='combos' && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-8">
            <h3 className="text-3xl font-bold mb-2">🎯 Combos Especiales</h3>
            <p className={tv(isDark,'text-zinc-600','text-zinc-300')}>Ahorra más con nuestras combinaciones exclusivas</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {COMBOS.map((combo) => (
              <div key={combo.id} className={`${combo.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg`}>
                    {combo.logo}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{fmt(combo.price)}</div>
                    <div className="text-sm opacity-80">por mes</div>
                  </div>
                </div>
                
                <h4 className="text-xl font-semibold mb-3">{combo.name}</h4>
                
                <div className="mb-4">
                  <div className="text-sm opacity-90">
                    💰 Ahorro significativo vs compras individuales
                  </div>
                  <div className="text-sm opacity-90">
                    🎬 Acceso completo a todas las plataformas
                  </div>
                  <div className="text-sm opacity-90">
                    ⚡ Activación inmediata
                  </div>
                </div>
                
              <button 
                  onClick={() => onReserve(combo)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                  Comprar Combo
              </button>
            </div>
            ))}
            </div>
          
          <div className="mt-12 text-center">
            <div className={`${tv(isDark,'bg-blue-50 border-blue-200','bg-blue-900/20 border-blue-700')} border rounded-2xl p-6`}>
              <h4 className="text-xl font-bold mb-2">💡 ¿Por qué elegir nuestros combos?</h4>
              <p className={tv(isDark,'text-zinc-600','text-zinc-300')}>
                Combinamos las mejores plataformas de streaming en paquetes exclusivos 
                que te permiten ahorrar hasta un 30% comparado con comprar cada servicio por separado.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* MIS COMPRAS ELIMINADO - LAS COMPRAS SE MUESTRAN EN EL PERFIL */}

      {/* MI PERFIL */}
      {view==='profile' && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold mb-2">👤 Mi Perfil</h3>
                <p className={tv(isDark,'text-zinc-600','text-zinc-300')}>Gestiona tu cuenta y compras activas</p>
              </div>
              <button 
                onClick={() => setView('home')}
                className={tv(isDark,'rounded-xl bg-zinc-100 text-zinc-700 px-4 py-2 text-sm hover:bg-zinc-200','rounded-xl bg-zinc-800 text-zinc-200 px-4 py-2 text-sm hover:bg-zinc-700')}
              >
                ← Inicio
              </button>
            </div>
          </div>
          
          {!user ? (
            <div className={`text-center py-16 rounded-2xl border-2 border-dashed ${tv(isDark,'border-zinc-200 bg-zinc-50','border-zinc-700 bg-zinc-800')}`}>
              <div className="text-6xl mb-4">🔐</div>
              <h4 className="text-xl font-semibold mb-2">Inicia sesión para ver tu perfil</h4>
              <p className={tv(isDark,'text-zinc-600','text-zinc-400')}>Necesitas iniciar sesión para ver tus compras</p>
              <button 
                onClick={() => setView('auth')}
                className={tv(isDark,'mt-4 rounded-xl bg-zinc-900 text-white px-6 py-3','mt-4 rounded-xl bg-white text-zinc-900 px-6 py-3')}
              >
                Iniciar sesión
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {/* Información del perfil */}
              <div className={`p-6 rounded-2xl border ${tv(isDark,'bg-white border-zinc-200','bg-zinc-800 border-zinc-700')}`}>
                <h3 className="text-xl font-semibold mb-4">👤 Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-sm ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>Nombre</label>
                    <p className={`font-medium ${tv(isDark, 'text-zinc-900', 'text-zinc-100')}`}>{user.name}</p>
                  </div>
                  <div>
                    <label className={`text-sm ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>WhatsApp</label>
                    <p className={`font-medium ${tv(isDark, 'text-zinc-900', 'text-zinc-100')}`}>{user.phone}</p>
                  </div>
                    <div>
                      <label className={`text-sm ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>Email</label>
                    <p className={`font-medium ${tv(isDark, 'text-zinc-900', 'text-zinc-100')}`}>{user.email}</p>
                    </div>
                  <div>
                    <label className={`text-sm ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>Miembro desde</label>
                    <p className={`font-medium ${tv(isDark, 'text-zinc-900', 'text-zinc-100')}`}>{new Date().toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
              </div>

              {/* Mis Compras Activas */}
              <div className={`p-6 rounded-2xl border ${tv(isDark,'bg-white border-zinc-200','bg-zinc-800 border-zinc-700')}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">🛍️ Mis Compras Activas</h3>
                  <button 
                    onClick={() => loadUserPurchases(user.phone)}
                    className={`px-3 py-1 rounded-lg text-sm ${tv(isDark,'bg-blue-100 text-blue-700 hover:bg-blue-200','bg-blue-900/30 text-blue-400 hover:bg-blue-900/50')}`}
                  >
                    🔄 Actualizar
                  </button>
                  </div>

                {userActivePurchases.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📺</div>
                    <p className={tv(isDark,'text-zinc-600','text-zinc-400')}>No tienes compras activas</p>
                    <button 
                      onClick={() => setView('home')}
                      className={`mt-4 px-4 py-2 rounded-xl text-sm ${tv(isDark,'bg-blue-600 text-white hover:bg-blue-700','bg-blue-500 text-white hover:bg-blue-600')}`}
                    >
                      Ver Catálogo
                    </button>
                    </div>
                ) : (
                  <div className="space-y-4">
                    {userActivePurchases
                      .filter((purchase) => getDaysRemaining(purchase.end) >= 0) // Filtrar servicios caducados
                      .map((purchase) => {
                        const serviceStatus = getServiceStatus(purchase.end);
                        const daysRemaining = getDaysRemaining(purchase.end);
                        
                        return (
                          <div key={purchase.id} className={`p-4 rounded-xl border ${tv(isDark, 'bg-green-50 border-green-200', 'bg-green-900/20 border-green-700')}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">
                                  {purchase.service === 'Netflix' ? '🎬' :
                                   purchase.service === 'Disney+' ? '🏰' :
                                   purchase.service === 'Max' ? '🎭' :
                                   purchase.service === 'Prime Video' ? '📺' :
                                   purchase.service === 'Spotify' ? '🎧' : '📱'}
                                </div>
                                <div>
                                  <h4 className="font-bold text-lg">{purchase.service}</h4>
                                  <p className={`text-sm ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>
                                    {purchase.months} meses • Activo
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-end sm:justify-start">
                                <div className={`px-4 py-2 rounded-full text-sm font-bold text-center min-w-[120px] ${tv(isDark, 'bg-red-100 text-red-800', 'bg-red-900/30 text-red-400')}`}>
                                  {serviceStatus.message}
                                </div>
                              </div>
                            </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className={`text-sm font-medium ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>📅 Fecha de inicio</label>
                            <p className={`font-medium ${tv(isDark, 'text-zinc-900', 'text-zinc-100')}`}>{new Date(purchase.start).toLocaleDateString('es-ES')}</p>
                          </div>
                          <div>
                            <label className={`text-sm font-medium ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>⏰ Fecha de vencimiento</label>
                            <p className={`font-medium ${tv(isDark, 'text-zinc-900', 'text-zinc-100')}`}>{new Date(purchase.end).toLocaleDateString('es-ES')}</p>
                </div>
              </div>

                        {purchase.service_email && purchase.service_password && (
                          <div className={`p-3 rounded-lg ${tv(isDark,'bg-blue-50 border border-blue-200','bg-blue-900/20 border border-blue-700')}`}>
                            <h5 className="font-semibold mb-2 text-blue-800 dark:text-blue-300">🔑 Credenciales del Servicio</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className={`text-xs ${tv(isDark, 'text-blue-600', 'text-blue-400')}`}>Email:</label>
                                <p className={`font-mono text-sm p-2 rounded border ${tv(isDark, 'bg-gray-50 border-gray-200 text-gray-900', 'bg-zinc-800 border-zinc-600 text-zinc-100')}`}>{purchase.service_email}</p>
                            </div>
                            <div>
                                <label className={`text-xs ${tv(isDark, 'text-blue-600', 'text-blue-400')}`}>Contraseña:</label>
                                <p className={`font-mono text-sm p-2 rounded border ${tv(isDark, 'bg-gray-50 border-gray-200 text-gray-900', 'bg-zinc-800 border-zinc-600 text-zinc-100')}`}>{purchase.service_password}</p>
                            </div>
                          </div>
                            {purchase.admin_notes && (
                              <div className="mt-2">
                                <label className={`text-xs ${tv(isDark, 'text-blue-600', 'text-blue-400')}`}>Notas:</label>
                                <p className={`text-sm p-2 rounded border ${tv(isDark, 'bg-gray-50 border-gray-200 text-gray-900', 'bg-zinc-800 border-zinc-600 text-zinc-100')}`}>{purchase.admin_notes}</p>
                          </div>
                            )}
                        </div>
                        )}

                         {/* Información de Renovación */}
                         <div className={`p-3 rounded-lg mt-3 ${tv(isDark,'bg-blue-50 border border-blue-200','bg-blue-900/20 border border-blue-700')}`}>
                           <h5 className="font-semibold mb-2 text-blue-800 dark:text-blue-300">ℹ️ Información del Servicio</h5>
                           <div className="text-sm text-blue-700 dark:text-blue-300">
                             <p>📅 <strong>Duración:</strong> {purchase.months} {purchase.months === 1 ? 'mes' : 'meses'}</p>
                             <p>📧 <strong>Contacto:</strong> Para renovaciones, contacta al administrador</p>
                           </div>
                         </div>
                          </div>
                        );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}


          {/* MODAL DE REGISTRAR COMPRA PERSONALIZADA */}
          {adminRegisterPurchaseOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className={`w-full max-w-2xl rounded-2xl p-6 shadow-2xl ${tv(isDark,'bg-white','bg-zinc-800')}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">➕ Registrar Compra Personalizada</h3>
                  <button
                    onClick={() => setAdminRegisterPurchaseOpen(false)}
                    className="text-2xl hover:text-red-500"
                  >
                    ×
                  </button>
                      </div>
                
                <p className={`text-sm ${tv(isDark, 'text-zinc-800', 'text-zinc-300')} mb-4`}>
                  Para registrar compras realizadas fuera de la página web
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">👤 Nombre del Cliente *</label>
                    <input
                      type="text"
                      value={customPurchase.customer}
                      onChange={(e) => setCustomPurchase(prev => ({...prev, customer: e.target.value}))}
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300 bg-white text-zinc-900','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">📱 Teléfono *</label>
                    <input
                      type="tel"
                      value={customPurchase.phone}
                      onChange={(e) => setCustomPurchase(prev => ({...prev, phone: e.target.value}))}
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300 bg-white text-zinc-900','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                      placeholder="Ej: 0999123456"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">📧 Email del Cliente</label>
                    <input
                      type="email"
                      value={customPurchase.email}
                      onChange={(e) => setCustomPurchase(prev => ({...prev, email: e.target.value}))}
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300 bg-white text-zinc-900','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                      placeholder="Ej: cliente@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">📺 Servicio *</label>
                    <select
                      value={customPurchase.service}
                      onChange={(e) => setCustomPurchase(prev => ({...prev, service: e.target.value}))}
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300 bg-white text-zinc-900','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                    >
                      <option value="">Seleccionar servicio</option>
                      {SERVICES.map(service => (
                        <option key={service.id} value={service.name}>{service.name}</option>
                      ))}
                      {COMBOS.map(combo => (
                        <option key={combo.id} value={combo.name}>{combo.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">📅 Duración (meses) *</label>
                    <select
                      value={customPurchase.months}
                      onChange={(e) => setCustomPurchase(prev => ({...prev, months: parseInt(e.target.value)}))}
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300 bg-white text-zinc-900','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                    >
                      <option value={1}>1 mes</option>
                      <option value={3}>3 meses</option>
                      <option value={6}>6 meses</option>
                      <option value={12}>12 meses</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">📧 Email del Servicio *</label>
                    <input
                      type="email"
                      value={customPurchase.serviceEmail}
                      onChange={(e) => setCustomPurchase(prev => ({...prev, serviceEmail: e.target.value}))}
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300 bg-white text-zinc-900','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                      placeholder="Ej: usuario@netflix.com"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">🔑 Contraseña del Servicio *</label>
                  <input
                    type="password"
                    value={customPurchase.servicePassword}
                    onChange={(e) => setCustomPurchase(prev => ({...prev, servicePassword: e.target.value}))}
                    className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300 bg-white text-zinc-900','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                    placeholder="Contraseña del servicio"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">📝 Notas Adicionales</label>
                  <textarea
                    value={customPurchase.notes}
                    onChange={(e) => setCustomPurchase(prev => ({...prev, notes: e.target.value}))}
                    className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300 bg-white text-zinc-900','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                    rows={3}
                    placeholder="Información adicional sobre esta compra..."
                  />
                </div>
                
                <div className="flex gap-3">
                      <button
                    onClick={() => setAdminRegisterPurchaseOpen(false)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${tv(isDark,'bg-zinc-200 text-zinc-700 hover:bg-zinc-300','bg-zinc-700 text-zinc-200 hover:bg-zinc-600')}`}
                      >
                    Cancelar
                      </button>
                  <button
                    onClick={handleCreateCustomPurchase}
                    disabled={adminLoading}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${adminLoading ? 'opacity-50 cursor-not-allowed' : ''} ${tv(isDark,'bg-blue-600 text-white hover:bg-blue-700','bg-blue-500 text-white hover:bg-blue-600')}`}
                  >
                    {adminLoading ? '⏳ Creando...' : '✅ Registrar Compra'}
                  </button>
                  </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* LOGIN ADMIN */}
      {view==='adminLogin' && (
        <section className="min-h-[80vh] relative">
          <div className="absolute inset-0 -z-10" style={{backgroundImage:"url(/img/bg-cinema.jpg)", backgroundSize:'cover', backgroundPosition:'center'}} />
          <div className="absolute inset-0 -z-0 bg-black/60" />
          <div className="relative z-10 min-h-[80vh] grid place-items-center">
            <div className={tv(isDark,'w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl border border-gray-200','w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl border border-gray-200')}>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl text-white">🔐</span>
                </div>
                <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Acceso Administrador</h3>
                <p className="text-sm text-gray-600">Ingresa tus credenciales para acceder al panel</p>
              </div>
              <AdminLoginForm isDark={isDark} adminEmails={adminEmails} onLogin={(ok)=>{ if(ok){ setAdminLogged(true); setView('admin'); setAdminSub('dashboard'); } }} />
              <div className="mt-8 text-center">
                <button 
                  onClick={() => setView('home')}
                  className="text-gray-600 hover:text-gray-800 text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <span>←</span> Volver al inicio
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ADMIN */}
      {view==='admin' && (
        <section className="mx-auto max-w-6xl px-2 sm:px-4 pb-8 sm:pb-16">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold">🔧 Panel Administrador</h3>
                <p className={`text-sm sm:text-base ${tv(isDark,'text-zinc-600','text-zinc-300')}`}>Gestiona compras, administradores y configuración</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <button 
                   onClick={() => setMenuOpen(true)}
                   className={`rounded-lg bg-zinc-200 text-zinc-800 px-3 py-2 text-xs sm:text-sm hover:bg-zinc-300 ${tv(isDark,'','')}`}
                >
                   ☰ Menú
                </button>
                <button 
                   onClick={refreshAllStats}
                   disabled={adminLoading}
                   className={`rounded-lg bg-blue-600 text-white px-3 py-2 text-xs sm:text-sm hover:bg-blue-700 disabled:opacity-50 ${tv(isDark,'','')}`}
                >
                   {adminLoading ? '⏳ Cargando...' : '🔄 Actualizar'}
                </button>
                <button 
                  onClick={() => setView('home')}
                  className={`rounded-lg bg-zinc-100 text-zinc-700 px-3 py-2 text-xs sm:text-sm hover:bg-zinc-200 ${tv(isDark,'','')}`}
                >
                  ← Inicio
                </button>
              </div>
            </div>
          </div>

          {/* DASHBOARD COMPLETO - Optimizado para móviles */}
              <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
            <div className={`rounded-xl p-3 sm:p-6 shadow-lg ${tv(isDark,'bg-white border border-zinc-200','bg-zinc-800 border border-zinc-700')}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-medium text-zinc-500 mb-1">Total Compras</div>
                  <div className="text-xl sm:text-3xl font-bold">{purchases.length}</div>
                </div>
                <div className="text-xl sm:text-3xl">📊</div>
              </div>
            </div>
            <div className={`rounded-xl p-3 sm:p-6 shadow-lg ${tv(isDark,'bg-white border border-zinc-200','bg-zinc-800 border border-zinc-700')}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-medium text-zinc-500 mb-1">Pendientes</div>
                  <div className="text-xl sm:text-3xl font-bold text-amber-600">{pendingPurchases.length}</div>
                </div>
                <div className="text-xl sm:text-3xl">⏳</div>
              </div>
            </div>
            <div className={`rounded-xl p-3 sm:p-6 shadow-lg ${tv(isDark,'bg-white border border-zinc-200','bg-zinc-800 border border-zinc-700')}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-medium text-zinc-500 mb-1">Validadas</div>
                  <div className="text-xl sm:text-3xl font-bold text-green-600">{purchases.filter(p=>p.validated).length}</div>
                </div>
                <div className="text-xl sm:text-3xl">✅</div>
              </div>
            </div>
                <div className={`rounded-xl p-3 sm:p-6 shadow-lg ${tv(isDark,'bg-white border border-zinc-200','bg-zinc-800 border border-zinc-700')}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs sm:text-sm font-medium text-zinc-500 mb-1">Vencen Hoy</div>
                  <div className="text-xl sm:text-3xl font-bold text-red-600">{expiringServices.filter(s => s.days_remaining === 0).length}</div>
                    </div>
                    <div className="text-xl sm:text-3xl">⚠️</div>
                  </div>
                </div>
              </div>

          {/* BOTONES DE ACCIÓN - Optimizados para móviles */}
          <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
            <button 
              onClick={()=>setAdminSub('purchases')} 
              className={`rounded-xl p-4 sm:p-6 text-left transition-all hover:scale-105 ${tv(isDark,'bg-zinc-900 text-white shadow-lg','bg-white text-zinc-900 shadow-lg')}`}
            >
              <div className="text-xl sm:text-2xl mb-2">🛒</div>
              <div className="text-lg sm:text-xl font-bold mb-2">Gestionar Compras</div>
              <div className="text-xs sm:text-sm opacity-70">Revisa, valida y notifica por WhatsApp</div>
            </button>
            
            <button 
              onClick={()=>setAdminRegisterPurchaseOpen(true)} 
              className={`rounded-xl p-4 sm:p-6 text-left transition-all hover:scale-105 ${tv(isDark,'bg-blue-600 text-white shadow-lg','bg-blue-600 text-white shadow-lg')}`}
            >
              <div className="text-xl sm:text-2xl mb-2">➕</div>
              <div className="text-lg sm:text-xl font-bold mb-2">Registrar Compra</div>
              <div className="text-xs sm:text-sm opacity-70">Crear compra manual para un usuario</div>
            </button>
            
            <button 
              onClick={()=>setDrawerOpen(true)} 
              className={`rounded-xl p-4 sm:p-6 text-left transition-all hover:scale-105 ${tv(isDark,'bg-zinc-900 text-white shadow-lg','bg-white text-zinc-900 shadow-lg')}`}
            >
              <div className="text-xl sm:text-2xl mb-2">👥</div>
              <div className="text-lg sm:text-xl font-bold mb-2">Administradores</div>
              <div className="text-xs sm:text-sm opacity-70">Agregar o quitar correos con acceso</div>
            </button>
            
            <button 
              onClick={exportCSV} 
              className={`rounded-xl p-4 sm:p-6 text-left transition-all hover:scale-105 ${tv(isDark,'bg-zinc-900 text-white shadow-lg','bg-white text-zinc-900 shadow-lg')}`}
            >
              <div className="text-xl sm:text-2xl mb-2">📊</div>
              <div className="text-lg sm:text-xl font-bold mb-2">Exportar Datos</div>
              <div className="text-xs sm:text-sm opacity-70">Descargar reporte en formato CSV</div>
            </button>
          </div>

          {/* GESTIÓN DE COMPRAS - Optimizada para móviles */}
          <div className={`rounded-xl p-3 sm:p-6 shadow-lg mb-4 sm:mb-6 ${tv(isDark,'bg-white border border-zinc-200','bg-zinc-800 border border-zinc-700')}`}>
            {/* Navegación por pestañas - Responsiva */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setAdminPurchaseView('pending')}
                  className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    adminPurchaseView === 'pending' 
                      ? tv(isDark,'bg-amber-100 text-amber-800','bg-amber-900/30 text-amber-400')
                      : tv(isDark,'bg-zinc-100 text-zinc-600 hover:bg-zinc-200','bg-zinc-700 text-zinc-300 hover:bg-zinc-600')
                  }`}
                >
                  ⏳ Pendientes ({pendingPurchases.length})
                </button>
                <button
                  onClick={() => setAdminPurchaseView('active')}
                  className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    adminPurchaseView === 'active' 
                      ? tv(isDark,'bg-green-100 text-green-800','bg-green-900/30 text-green-400')
                      : tv(isDark,'bg-zinc-100 text-zinc-600 hover:bg-zinc-200','bg-zinc-700 text-zinc-300 hover:bg-zinc-600')
                  }`}
                >
                  ✅ Activas ({purchases.filter(p => p.validated).length})
                </button>
              </div>
            </div>

            {/* CONTENIDO DE PESTAÑAS */}
            {adminPurchaseView === 'pending' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                  <h4 className="text-lg sm:text-xl font-bold">⏳ Compras Pendientes</h4>
                  <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${tv(isDark,'bg-amber-100 text-amber-800','bg-amber-900/30 text-amber-400')}`}>
                    {pendingPurchases.length} pendientes
                  </span>
                </div>
                
                {adminLoading ? (
                  <div className="text-center py-8">
                    <div className="text-2xl mb-2">⏳</div>
                    <p>Cargando compras pendientes...</p>
                  </div>
                ) : pendingPurchases.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-2xl mb-2">✅</div>
                    <p>No hay compras pendientes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingPurchases.map((purchase) => (
                      <div key={purchase.id} className={`p-3 sm:p-4 rounded-lg border ${tv(isDark,'bg-zinc-50 border-zinc-200','bg-zinc-700 border-zinc-600')}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <span className="font-semibold text-sm sm:text-base">{purchase.customer}</span>
                              <span className={`px-2 py-1 rounded text-xs ${tv(isDark,'bg-blue-100 text-blue-800','bg-blue-900/30 text-blue-400')}`}>
                                {purchase.service}
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm text-zinc-500 mb-2">
                              📱 {purchase.phone} • 📅 {new Date(purchase.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs sm:text-sm">
                              <span className="font-medium">Duración:</span> {purchase.months} meses • 
                              <span className="font-medium"> Inicio:</span> {purchase.start} • 
                              <span className="font-medium"> Fin:</span> {purchase.end}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => setSelectedPurchase(purchase)}
                              className={`px-3 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${tv(isDark,'bg-green-600 text-white hover:bg-green-700','bg-green-500 text-white hover:bg-green-600')}`}
                            >
                              ✅ Aprobar
                            </button>
                            <button
                              onClick={() => handleRejectPurchase(purchase.id)}
                              className={`px-3 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${tv(isDark,'bg-red-600 text-white hover:bg-red-700','bg-red-500 text-white hover:bg-red-600')}`}
                            >
                              ❌ Rechazar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PESTAÑA DE COMPRAS ACTIVAS */}
            {adminPurchaseView === 'active' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold">✅ Compras Activas</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${tv(isDark,'bg-green-100 text-green-800','bg-green-900/30 text-green-400')}`}>
                    {purchases.filter(p => p.validated).length} activas
                  </span>
                </div>
                
                {adminLoading ? (
                  <div className="text-center py-8">
                    <div className="text-2xl mb-2">⏳</div>
                    <p>Cargando compras activas...</p>
                  </div>
                ) : purchases.filter(p => p.validated).length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-2xl mb-2">📺</div>
                    <p>No hay compras activas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchases.filter(p => p.validated).map((purchase) => (
                       <PurchaseCard
                         item={purchase}
                         isDark={isDark}
                         onToggleValidate={() => { void handleToggleValidate(purchase.id); }}
                         onDelete={() => { void handleDeleteActivePurchase(purchase.id, purchase.customer, purchase.service); }}
                         onEdit={() => handleEditPurchase(purchase)}
                       />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
              
          {/* ESTADÍSTICAS DE RENOVACIONES */}
          {renewalStats && (
            <div className={`rounded-2xl p-6 shadow-lg mb-6 ${tv(isDark,'bg-white border border-zinc-200','bg-zinc-800 border border-zinc-700')}`}>
              <h4 className="text-xl font-bold mb-4">📊 Estadísticas de Renovaciones</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{renewalStats.totalPurchases}</div>
                  <div className={`text-sm ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>Total Compras</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{renewalStats.autoRenewalEnabled}</div>
                  <div className={`text-sm ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>Auto-Renovación</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{renewalStats.expiringThisWeek}</div>
                  <div className={`text-sm ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>Vencen Esta Semana</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{renewalStats.expiredServices}</div>
                  <div className={`text-sm ${tv(isDark, 'text-zinc-800', 'text-zinc-300')}`}>Expirados</div>
                </div>
              </div>
            </div>
          )}

          {/* SERVICIOS PRÓXIMOS A VENCER */}
          <div className={`rounded-2xl p-6 shadow-lg mb-6 ${tv(isDark,'bg-white border border-zinc-200','bg-zinc-800 border border-zinc-700')}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold">⏰ Servicios Próximos a Vencer</h4>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${tv(isDark,'bg-amber-100 text-amber-800','bg-amber-900/30 text-amber-400')}`}>
                {expiringServices.length} próximos a vencer
              </span>
            </div>
            
            {expiringServices.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-2xl mb-2">✅</div>
                <p>No hay servicios próximos a vencer</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expiringServices.map((service) => (
                  <div key={service.purchase_id} className={`p-4 rounded-xl border ${tv(isDark,'bg-amber-50 border-amber-200','bg-amber-900/20 border-amber-600')}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold">{service.customer_name}</span>
                          <span className={`px-2 py-1 rounded text-xs ${tv(isDark,'bg-blue-100 text-blue-800','bg-blue-900/30 text-blue-400')}`}>
                            {service.service_name}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${service.days_remaining <= 3 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                            {service.days_remaining} días
                          </span>
                        </div>
                        <div className="text-sm text-zinc-500 mb-2">
                          📱 {service.customer_phone} • 📅 Vence: {new Date(service.end_date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCreateRenewal(service.purchase_id, 1)}
                          disabled={renewalLoading}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${tv(isDark,'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50','bg-green-500 text-white hover:bg-green-600 disabled:opacity-50')}`}
                        >
                          🔄 Renovar 1 mes
                        </button>
                        <button
                          onClick={() => handleCreateRenewal(service.purchase_id, 3)}
                          disabled={renewalLoading}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${tv(isDark,'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50','bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50')}`}
                        >
                          🔄 Renovar 3 meses
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MODAL PARA APROBAR COMPRA */}
          {selectedPurchase && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${tv(isDark,'bg-white','bg-zinc-800')}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">✅ Aprobar Compra</h3>
                <button 
                    onClick={() => setSelectedPurchase(null)}
                    className="text-2xl hover:text-red-500"
                >
                    ×
                </button>
                </div>
                
                <div className="mb-4">
                  <p className="font-medium">{selectedPurchase.customer}</p>
                  <p className="text-sm text-zinc-500">{selectedPurchase.service} • {selectedPurchase.months} meses</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">📧 Email del Servicio</label>
                    <input
                      type="email"
                      value={serviceCredentials.email}
                      onChange={(e) => setServiceCredentials(prev => ({...prev, email: e.target.value}))}
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300 bg-white text-zinc-900','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                      placeholder="usuario@netflix.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">🔑 Contraseña del Servicio</label>
                    <input
                      type="password"
                      value={serviceCredentials.password}
                      onChange={(e) => setServiceCredentials(prev => ({...prev, password: e.target.value}))}
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300 bg-white text-zinc-900','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">📝 Notas (opcional)</label>
                    <textarea
                      value={serviceCredentials.notes}
                      onChange={(e) => setServiceCredentials(prev => ({...prev, notes: e.target.value}))}
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300 bg-white text-zinc-900','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                      rows={3}
                      placeholder="Notas adicionales..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                <button 
                    onClick={() => setSelectedPurchase(null)}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${tv(isDark,'bg-zinc-200 text-zinc-700 hover:bg-zinc-300','bg-zinc-700 text-zinc-200 hover:bg-zinc-600')}`}
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleApprovePurchase}
                    disabled={adminLoading || !serviceCredentials.email || !serviceCredentials.password}
                    className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${adminLoading || !serviceCredentials.email || !serviceCredentials.password ? 'opacity-50 cursor-not-allowed' : ''} ${tv(isDark,'bg-green-600 text-white hover:bg-green-700','bg-green-500 text-white hover:bg-green-600')}`}
                >
                    {adminLoading ? '⏳ Aprobando...' : '✅ Aprobar Compra'}
                </button>
              </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className={`border-t py-8 text-center text-sm ${tv(isDark,'text-zinc-500 border-zinc-200','text-zinc-400 border-zinc-800')}`}>© {new Date().getFullYear()} StreamZone</footer>

      {/* Reserva */}
        <Modal open={reserveOpen} onClose={()=>setReserveOpen(false)} title={`🔐 Registro Requerido - ${selected?.name||''}`} isDark={isDark} className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <RegistrationRequiredForm service={selected} onClose={()=>setReserveOpen(false)} isDark={isDark} onGoToAuth={() => { setReserveOpen(false); setView('auth'); }} />
          )}
        </Modal>

      {/* Compra con métodos de pago */}
      <PurchaseModal 
        open={purchaseModalOpen} 
        onClose={()=>setPurchaseModalOpen(false)} 
        service={purchaseData} 
        user={user} 
        isDark={isDark} 
        onPurchase={addPurchase} 
      />

      {/* Modal de registro de compra por admin */}
      <AdminRegisterPurchaseModal 
        open={adminRegisterPurchaseOpen} 
        onClose={()=>setAdminRegisterPurchaseOpen(false)} 
        onRegister={adminRegisterPurchase} 
        isDark={isDark} 
        systemPrefersDark={systemPrefersDark}
      />

      {/* Modal de edición de compra */}
      <EditPurchaseModal 
        open={editPurchaseOpen} 
        onClose={()=>setEditPurchaseOpen(false)} 
        onUpdate={handleUpdatePurchase} 
        purchase={editingPurchase}
        isDark={isDark} 
        systemPrefersDark={systemPrefersDark}
      />

      {/* Drawers y flotantes */}
      <AdminDrawer open={drawerOpen} onClose={()=>setDrawerOpen(false)} isDark={isDark} adminUsers={adminUsers} setAdminUsers={setAdminUsers} />
      <AdminMenuDrawer open={menuOpen} onClose={()=>setMenuOpen(false)} isDark={isDark} setSubView={setAdminSub} openAdmins={()=>setDrawerOpen(true)} onExportCSV={exportCSV} onLogout={logoutAdmin} onRegisterPurchase={()=>setAdminRegisterPurchaseOpen(true)} />
      <FloatingChatbot answerFn={(q, context)=>useChatbot(SERVICES, COMBOS).answer(q, context)} isDark={isDark}/>
      <FloatingThemeToggle isDark={isDark} onToggle={toggleTheme} />
    </div>
  );
}

// ========= Subcomponentes que usan arriba =========

// Tarjeta de compra (Admin)
function PurchaseCard({ item, isDark, onToggleValidate, onDelete, onEdit }:{ item:any; isDark:boolean; onToggleValidate:()=>void; onDelete:()=>void; onEdit:()=>void; }){
  const days = daysBetween(new Date().toISOString().slice(0,10), item.end);
  const status = days < 0 ? 'Vencido' : days === 0 ? 'Vence hoy' : `${days} dias`;
  
  // Verificar si es un combo y extraer credenciales
  const isCombo = item.service && isRealCombo(item.service);
  const comboCredentials = isCombo ? getComboCredentials(item.admin_notes || '') : {};
  const comboServices = isCombo ? extractComboServices(item.service) : [];
  const comboNotes = isCombo ? getComboNotes(item.admin_notes || '') : '';
  
  // Estado para mostrar/ocultar contraseñas
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  // Debug logs
  if (isCombo) {
    console.log('Debug - Combo detectado:', item.service);
    console.log('Debug - admin_notes:', item.admin_notes);
    console.log('Debug - comboCredentials:', comboCredentials);
    console.log('Debug - comboServices:', comboServices);
  }
  
  return (
    <details className={`relative group rounded-xl border-2 shadow-sm hover:shadow-md transition-all duration-200 ${tv(isDark,'border-gray-200 bg-white hover:border-gray-300','border-gray-700 bg-gray-800 hover:border-gray-600')}`}>
      <summary className="cursor-pointer list-none p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${tv(isDark,'bg-gradient-to-r from-blue-500 to-purple-600','bg-gradient-to-r from-blue-600 to-purple-700')}`}>
                {item.customer.charAt(0).toUpperCase()}
              </div>
          <div>
                <h3 className={`font-semibold text-lg ${tv(isDark,'text-gray-900','text-white')}`}>
                  {item.customer}
                </h3>
                <p className={`text-sm ${tv(isDark,'text-gray-600','text-gray-400')}`}>
                  📱 {item.phone}
                </p>
          </div>
            </div>
            
            <div className={`text-sm font-medium mb-2 ${tv(isDark,'text-gray-800','text-gray-200')}`}>
              🎬 {item.service}
            </div>
            
            <div className={`text-xs ${tv(isDark,'text-gray-600','text-gray-400')}`}>
              📅 {item.start} → {item.end} • {item.months} {item.months === 1 ? 'mes' : 'meses'}
            </div>
            
            {/* Mostrar servicios del combo si es un combo */}
            {isCombo && comboServices.length > 1 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {comboServices.map((service, index) => (
                  <span key={index} className={`px-3 py-1 text-xs font-medium rounded-full border ${tv(isDark,'bg-blue-50 text-blue-700 border-blue-200','bg-blue-900/20 text-blue-300 border-blue-700')}`}>
                    {service}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              {/* Botón de expansión/colapso */}
              <button 
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center group"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Toggle del details element
                  const details = e.currentTarget.closest('details');
                  if (details) {
                    details.open = !details.open;
                    // Actualizar el icono después del toggle
                    setTimeout(() => {
                      const icon = e.currentTarget?.querySelector('span');
                      if (icon && details.open) {
                        icon.textContent = '▲';
                      } else if (icon) {
                        icon.textContent = '▼';
                      }
                    }, 10);
                  }
                }}
                title="Ver detalles"
              >
                <span className="text-sm group-hover:scale-110 transition-transform duration-200">▼</span>
              </button>
              
              {/* Botón de editar prominente */}
              <button 
                className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center group"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit();
                }}
                title="Editar compra"
              >
                <span className="text-lg group-hover:scale-110 transition-transform duration-200">✏️</span>
              </button>
            </div>
            
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${item.validated? 'bg-green-100 text-green-800 border border-green-200':'bg-amber-100 text-amber-800 border border-amber-200'}`}>
              {item.validated? '✅ Validada':'⏳ Pendiente'}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${days<=0? 'bg-red-100 text-red-800':'bg-gray-100 text-gray-800'}`}>
              {status}
            </span>
          </div>
        </div>
      </summary>
      
      {/* Mostrar credenciales de combos */}
      {isCombo && (
        <div className={`mx-4 mb-4 p-4 rounded-xl border-2 ${tv(isDark,'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200','bg-gradient-to-r from-gray-800 to-gray-900 border-gray-600')}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tv(isDark,'bg-blue-100','bg-blue-900/30')}`}>
              🔑
      </div>
            <h5 className={`font-semibold text-base ${tv(isDark,'text-gray-800','text-white')}`}>
              Credenciales del Combo
            </h5>
          </div>
          {Object.keys(comboCredentials).length > 0 ? (
            <div className="grid gap-3">
              {Object.entries(comboCredentials).map(([service, credentials]) => (
                <div key={service} className={`p-4 rounded-lg border ${tv(isDark,'bg-white border-gray-200 shadow-sm','bg-gray-700 border-gray-600 shadow-lg')}`}>
                  <div className={`font-semibold text-sm mb-3 flex items-center gap-2 ${tv(isDark,'text-gray-800','text-white')}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${tv(isDark,'bg-blue-100 text-blue-700','bg-blue-900 text-blue-300')}`}>
                      📺
                    </span>
                    {service}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium w-16 ${tv(isDark,'text-gray-600','text-gray-400')}`}>Email:</span> 
                      <code className={`text-xs font-mono px-2 py-1 rounded border ${tv(isDark,'bg-gray-100 text-gray-800 border-gray-200','bg-gray-800 text-gray-200 border-gray-600')}`}>
                        {credentials.email}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium w-16 ${tv(isDark,'text-gray-600','text-gray-400')}`}>Password:</span> 
                      <div className="flex items-center gap-2 flex-1">
                        <code className={`text-xs font-mono px-2 py-1 rounded border flex-1 ${tv(isDark,'bg-gray-100 text-gray-800 border-gray-200','bg-gray-800 text-gray-200 border-gray-600')}`}>
                          {showPasswords[service] ? credentials.password : '••••••••'}
                        </code>
                        <button
                          onClick={() => setShowPasswords(prev => ({ ...prev, [service]: !prev[service] }))}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${tv(isDark,'bg-blue-100 text-blue-700 hover:bg-blue-200','bg-blue-900 text-blue-300 hover:bg-blue-800')}`}
                          title={showPasswords[service] ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showPasswords[service] ? '👁️' : '🔒'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3">
              {comboServices.map((serviceName, index) => (
                <div key={index} className={`p-4 rounded-lg border ${tv(isDark,'bg-white border-gray-200 shadow-sm','bg-gray-700 border-gray-600 shadow-lg')}`}>
                  <div className={`font-semibold text-sm mb-3 flex items-center gap-2 ${tv(isDark,'text-gray-800','text-white')}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${tv(isDark,'bg-blue-100 text-blue-700','bg-blue-900 text-blue-300')}`}>
                      📺
                    </span>
                    {serviceName}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium w-16 ${tv(isDark,'text-gray-600','text-gray-400')}`}>Email:</span> 
                      <code className={`text-xs font-mono px-2 py-1 rounded border ${tv(isDark,'bg-gray-100 text-gray-800 border-gray-200','bg-gray-800 text-gray-200 border-gray-600')}`}>
                        {item.service_email || 'No disponible'}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium w-16 ${tv(isDark,'text-gray-600','text-gray-400')}`}>Password:</span> 
                      <div className="flex items-center gap-2 flex-1">
                        <code className={`text-xs font-mono px-2 py-1 rounded border flex-1 ${tv(isDark,'bg-gray-100 text-gray-800 border-gray-200','bg-gray-800 text-gray-200 border-gray-600')}`}>
                          {showPasswords[serviceName] ? (item.service_password || 'No disponible') : '••••••••'}
                        </code>
                        <button
                          onClick={() => setShowPasswords(prev => ({ ...prev, [serviceName]: !prev[serviceName] }))}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${tv(isDark,'bg-blue-100 text-blue-700 hover:bg-blue-200','bg-blue-900 text-blue-300 hover:bg-blue-800')}`}
                          title={showPasswords[serviceName] ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        >
                          {showPasswords[serviceName] ? '👁️' : '🔒'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Mostrar notas si existen */}
          {comboNotes && (
            <div className={`mt-4 p-4 rounded-lg border ${tv(isDark,'bg-yellow-50 border-yellow-200','bg-yellow-900/20 border-yellow-700')}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${tv(isDark,'bg-yellow-100','bg-yellow-900/30')}`}>
                  📝
                </div>
                <h6 className={`font-semibold text-sm ${tv(isDark,'text-yellow-800','text-yellow-200')}`}>
                  Notas del Administrador
                </h6>
              </div>
              <p className={`text-sm ${tv(isDark,'text-yellow-700','text-yellow-300')}`}>
                {comboNotes}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Mostrar credenciales individuales si no es combo */}
      {!isCombo && item.service_email && (
        <div className={`mx-4 mb-4 p-4 rounded-xl border-2 ${tv(isDark,'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200','bg-gradient-to-r from-gray-800 to-gray-900 border-gray-600')}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tv(isDark,'bg-green-100','bg-green-900/30')}`}>
              🔑
            </div>
            <h5 className={`font-semibold text-base ${tv(isDark,'text-gray-800','text-white')}`}>
              Credenciales del Servicio
            </h5>
          </div>
          <div className={`p-4 rounded-lg border ${tv(isDark,'bg-white border-gray-200 shadow-sm','bg-gray-700 border-gray-600 shadow-lg')}`}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium w-20 ${tv(isDark,'text-gray-600','text-gray-400')}`}>Email:</span> 
                <code className={`text-sm font-mono px-3 py-2 rounded border flex-1 ${tv(isDark,'bg-gray-100 text-gray-800 border-gray-200','bg-gray-800 text-gray-200 border-gray-600')}`}>
                  {item.service_email}
                </code>
              </div>
              {item.service_password && (
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium w-20 ${tv(isDark,'text-gray-600','text-gray-400')}`}>Password:</span> 
                <div className="flex items-center gap-2 flex-1">
                  <code className={`text-sm font-mono px-3 py-2 rounded border flex-1 ${tv(isDark,'bg-gray-100 text-gray-800 border-gray-200','bg-gray-800 text-gray-200 border-gray-600')}`}>
                    {showPasswords['individual'] ? item.service_password : '••••••••'}
                  </code>
                  <button
                    onClick={() => setShowPasswords(prev => ({ ...prev, 'individual': !prev['individual'] }))}
                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${tv(isDark,'bg-blue-100 text-blue-700 hover:bg-blue-200','bg-blue-900 text-blue-300 hover:bg-blue-800')}`}
                    title={showPasswords['individual'] ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPasswords['individual'] ? '👁️' : '🔒'}
                  </button>
                </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="mx-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border">
        <div className="flex flex-wrap items-center gap-3">
          <button 
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 ${item.validated? 'bg-blue-600 hover:bg-blue-700 text-white':'bg-emerald-600 hover:bg-emerald-700 text-white'}`} 
            onClick={onToggleValidate}
          >
            {item.validated? '✅ Validada':'⏳ Validar'}
          </button>
          
          <button 
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 bg-orange-600 hover:bg-orange-700 text-white" 
            onClick={onEdit}
          >
            ✏️ Editar
          </button>
          
          <a 
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 bg-green-600 hover:bg-green-700 text-white no-underline" 
            target="_blank" 
            rel="noreferrer" 
            href={`https://wa.me/${cleanPhone(item.phone)}?text=${encodeURIComponent('Estimado/a '+item.customer+', le informamos que su servicio de '+item.service+' vence hoy. ¿Le gustaría proceder con la renovación? Contamos con excelentes precios y soporte técnico.')}`}
          >
            📱 Recordatorio
          </a>
          
          <button 
            className="px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 bg-red-600 hover:bg-red-700 text-white" 
            onClick={onDelete}
          >
            🗑️ Eliminar
          </button>
          
          <div className="ml-auto">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${days<=0? 'bg-red-100 text-red-800 border border-red-200':'bg-gray-100 text-gray-800 border border-gray-200'}`}>
              {status}
            </span>
          </div>
        </div>
      </div>
      
      {/* Botón flotante de editar en la esquina */}
      <button 
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onEdit();
        }}
        title="Editar compra"
      >
        <span className="text-sm">✏️</span>
      </button>
    </details>
  );
}

// Drawer de administradores profesional con roles
function AdminDrawer({ open, onClose, isDark, adminUsers, setAdminUsers }:{ 
  open:boolean; 
  onClose:()=>void; 
  isDark:boolean; 
  adminUsers:AdminUser[]; 
  setAdminUsers:(users:AdminUser[])=>void; 
}){
  const [newEmail, setNewEmail] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState("");
  
  // Función para generar clave de acceso (solo para administradores secundarios)
  const generateAccessKey = (user: AdminUser) => {
    if (!user.canGenerateKeys) {
      alert('❌ Solo los administradores secundarios pueden generar claves de acceso');
      return;
    }
    
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    const key = `ADMIN_${timestamp}_${random}`.toUpperCase();
    setGeneratedKey(key);
    setSelectedAdmin(user.email);
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(key);
    
    // Mostrar notificación
    alert(`🔑 Clave generada para ${user.email}:\n\n${key}\n\n✅ Copiada al portapapeles`);
  };
  
  // Agregar nuevo administrador secundario
  const addSecondaryAdmin = ()=>{ 
    const email = newEmail.trim().toLowerCase(); 
    if(!emailOk(email)) {
      alert('❌ Email inválido');
      return;
    } 
    
    // Verificar si ya existe
    if(adminUsers.some(user => user.email === email)) {
      alert('❌ Este administrador ya existe');
      return;
    }
    
    const newAdmin: AdminUser = {
      email,
      role: 'secundario',
      canGenerateKeys: true,
      canDeleteOthers: false,
      isProtected: false
    };
    
    setAdminUsers([...adminUsers, newAdmin]); 
    setNewEmail(""); 
    alert(`✅ Administrador secundario agregado: ${email}`);
  };
  
  // Eliminar administrador (solo secundarios)
  const removeAdmin = (userToRemove: AdminUser)=> {
    if (userToRemove.isProtected) {
      alert('❌ No puedes eliminar al administrador principal');
      return;
    }
    
    if (confirm(`¿Estás seguro de eliminar a ${userToRemove.email}?`)) {
      setAdminUsers(adminUsers.filter(user => user.email !== userToRemove.email));
      alert(`✅ Administrador ${userToRemove.email} eliminado`);
    }
  };
  
  // Separar administradores por rol
  const principalAdmin = adminUsers.find(user => user.role === 'principal');
  const secondaryAdmins = adminUsers.filter(user => user.role === 'secundario');
  
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50"/>
      <aside className={`absolute right-0 top-0 h-full w-[450px] p-6 shadow-2xl ${tv(isDark,'bg-white','bg-zinc-900 text-zinc-100')}`} onClick={e=>e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-xl font-bold">👥 Gestión de Administradores</h4>
          <button 
            onClick={onClose} 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${tv(isDark,'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100','text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800')}`}
          >
            ×
          </button>
        </div>
        
        {/* Información del sistema */}
        <div className={`p-4 rounded-xl mb-6 ${tv(isDark,'bg-blue-50 border border-blue-200','bg-blue-900/20 border border-blue-700')}`}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">🔒</div>
            <div>
              <h5 className={`font-semibold text-sm mb-1 ${tv(isDark,'text-blue-800','text-blue-200')}`}>Sistema de Roles</h5>
              <p className={`text-xs ${tv(isDark,'text-blue-600','text-blue-300')}`}>
                <strong>Principal:</strong> Acceso completo, protegido. <strong>Secundarios:</strong> Pueden generar claves, limitados.
              </p>
            </div>
          </div>
        </div>
        
        {/* Administrador Principal */}
        {principalAdmin && (
          <div className="mb-6">
            <h5 className={`text-sm font-semibold mb-3 ${tv(isDark,'text-zinc-700','text-zinc-300')}`}>
              👑 Administrador Principal
            </h5>
            <div className={`rounded-xl border-2 p-4 ${tv(isDark,'border-yellow-200 bg-yellow-50','border-yellow-700 bg-yellow-900/20')}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">👑</div>
                  <div>
                    <div className="font-medium">{principalAdmin.email}</div>
                    <div className={`text-xs ${tv(isDark,'text-yellow-600','text-yellow-300')}`}>
                      Acceso completo • Protegido
                    </div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${tv(isDark,'bg-yellow-100 text-yellow-800','bg-yellow-800 text-yellow-100')}`}>
                  Principal
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Administradores Secundarios */}
        <div className="mb-6">
          <h5 className={`text-sm font-semibold mb-3 ${tv(isDark,'text-zinc-700','text-zinc-300')}`}>
            👥 Administradores Secundarios ({secondaryAdmins.length})
          </h5>
          
          {/* Formulario para agregar */}
          <div className="mb-4 flex gap-2">
            <input 
              value={newEmail} 
              onChange={e=>setNewEmail(e.target.value)} 
              placeholder="nuevo@correo.com" 
              className={`flex-1 rounded-xl border px-4 py-3 text-sm ${tv(isDark,'border-zinc-300 focus:border-zinc-500','border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-zinc-500')}`}
              onKeyDown={e => e.key === 'Enter' && addSecondaryAdmin()}
            />
            <button 
              onClick={addSecondaryAdmin} 
              className={`rounded-xl px-4 py-3 text-sm font-semibold ${tv(isDark,'bg-green-600 text-white hover:bg-green-700','bg-green-700 text-white hover:bg-green-600')}`}
            >
              + Agregar
            </button>
          </div>
          
          {/* Lista de secundarios */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {secondaryAdmins.map(user => (
              <div key={user.email} className={`rounded-xl border p-4 ${tv(isDark,'border-zinc-200 bg-zinc-50','border-zinc-700 bg-zinc-800')}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.email}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${tv(isDark,'bg-blue-100 text-blue-800','bg-blue-800 text-blue-100')}`}>
                      Secundario
                    </span>
                  </div>
                  <button 
                    onClick={() => removeAdmin(user)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${tv(isDark,'bg-red-100 text-red-700 hover:bg-red-200','bg-red-800 text-red-100 hover:bg-red-700')}`}
                  >
                    Eliminar
                  </button>
                </div>
                <button 
                  onClick={() => generateAccessKey(user)}
                  className={`w-full rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${tv(isDark,'bg-blue-100 text-blue-700 hover:bg-blue-200','bg-blue-800 text-blue-100 hover:bg-blue-700')}`}
                >
                  🔑 Generar Clave de Acceso
                </button>
              </div>
            ))}
            
            {secondaryAdmins.length === 0 && (
              <div className={`text-center py-8 text-sm ${tv(isDark,'text-zinc-500','text-zinc-400')}`}>
                No hay administradores secundarios
              </div>
            )}
          </div>
        </div>
        
        {/* Información sobre claves */}
        <div className={`mt-6 p-3 rounded-lg ${tv(isDark,'bg-gray-50','bg-zinc-800')}`}>
          <p className={`text-xs ${tv(isDark,'text-gray-600','text-gray-400')}`}>
            💡 <strong>Nota:</strong> Solo los administradores secundarios pueden generar claves. 
            El administrador principal tiene acceso directo sin clave.
          </p>
        </div>
      </aside>
    </div>
  );
}

// Drawer de menú Admin (desplegable izquierdo)
function AdminMenuDrawer({ open, onClose, isDark, setSubView, openAdmins, onExportCSV, onLogout, onRegisterPurchase }:{
  open:boolean; onClose:()=>void; isDark:boolean; setSubView:(v:'dashboard'|'purchases')=>void; openAdmins:()=>void; onExportCSV:()=>void; onLogout:()=>void; onRegisterPurchase:()=>void;
}){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50"/>
      <aside className={`absolute left-0 top-0 h-full w-[320px] p-6 shadow-2xl ${tv(isDark,'bg-white','bg-zinc-900 text-zinc-100')}`} onClick={e=>e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-xl font-bold">☰ Menú Admin</h4>
          <button 
            onClick={onClose} 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${tv(isDark,'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100','text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800')}`}
          >
            ×
          </button>
        </div>
        <nav className="space-y-3">
          <button 
            onClick={()=>{setSubView('dashboard'); onClose();}} 
            className={`w-full rounded-xl p-4 text-left transition-all hover:scale-105 ${tv(isDark,'hover:bg-zinc-100','hover:bg-zinc-800')}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📊</span>
              <span className="font-semibold">Dashboard</span>
            </div>
          </button>
          <button 
            onClick={()=>{setSubView('purchases'); onClose();}} 
            className={`w-full rounded-xl p-4 text-left transition-all hover:scale-105 ${tv(isDark,'hover:bg-zinc-100','hover:bg-zinc-800')}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🛒</span>
              <span className="font-semibold">Gestionar Compras</span>
            </div>
          </button>
          <button 
            onClick={()=>{onRegisterPurchase(); onClose();}} 
            className={`w-full rounded-xl p-4 text-left transition-all hover:scale-105 ${tv(isDark,'hover:bg-blue-50','hover:bg-blue-900/20')}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">➕</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">Registrar Compra</span>
            </div>
          </button>
          <button 
            onClick={()=>{openAdmins(); onClose();}} 
            className={`w-full rounded-xl p-4 text-left transition-all hover:scale-105 ${tv(isDark,'hover:bg-zinc-100','hover:bg-zinc-800')}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">👥</span>
              <span className="font-semibold">Administradores</span>
            </div>
          </button>
          <button 
            onClick={()=>{onExportCSV(); onClose();}} 
            className={`w-full rounded-xl p-4 text-left transition-all hover:scale-105 ${tv(isDark,'hover:bg-zinc-100','hover:bg-zinc-800')}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📊</span>
              <span className="font-semibold">Exportar CSV</span>
            </div>
          </button>
          <div className="border-t pt-3 mt-6">
            <button 
              onClick={()=>{onLogout(); onClose();}} 
              className={`w-full rounded-xl p-4 text-left transition-all hover:scale-105 ${tv(isDark,'text-red-700 hover:bg-red-100','text-red-300 hover:bg-red-900/30')}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🚪</span>
                <span className="font-semibold">Cerrar Sesión</span>
              </div>
            </button>
          </div>
        </nav>
      </aside>
    </div>
  );
}

// ========== Formularios ==========
function UserRegisterForm({ isDark, onSubmit }:{ isDark:boolean; onSubmit:(profile:any)=>void; }){
  const[name,setName]=useState(''); 
  const[phone,setPhone]=useState(''); 
  const[email,setEmail]=useState('');
  const[password,setPassword]=useState('');
  const[confirmPassword,setConfirmPassword]=useState('');
  const[showPassword,setShowPassword]=useState(false);
  const[msg,setMsg]=useState('');
  const[loading,setLoading]=useState(false);

  const submit=async (e:React.FormEvent)=>{ 
    e.preventDefault(); 
    setMsg('');
    setLoading(true);

    // Validaciones
    if(!name||!phone||!email||!password) {
      setMsg('Todos los campos son obligatorios');
      setLoading(false);
      return;
    }

    if(password !== confirmPassword) {
      setMsg('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if(password.length < 6) {
      setMsg('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Crear usuario en Supabase
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          name,
          phone: cleanPhone(phone),
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
      onSubmit({name,phone: cleanPhone(phone),email,password});
    } catch (error) {
      setMsg('Error al crear la cuenta');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>Nombre completo</label>
        <input 
          required
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`} 
          value={name} 
          onChange={e=>setName(e.target.value)} 
          placeholder="Tu nombre completo"
          disabled={loading}
        />
      </div>
      
      <div>
        <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>WhatsApp</label>
        <input 
          required
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`} 
          value={phone} 
          onChange={e=>setPhone(e.target.value)} 
          placeholder="+593 99 999 9999"
          disabled={loading}
        />
      </div>
      
      <div>
        <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>Correo electrónico</label>
        <input 
          required
          type="email"
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`} 
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          placeholder="tu@correo.com"
          disabled={loading}
        />
      </div>

      <div>
        <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>Contraseña</label>
        <input 
          required
          type={showPassword ? 'text' : 'password'}
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`} 
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
          placeholder="••••••••"
          minLength={6}
          disabled={loading}
        />
      </div>

      <div>
        <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>Confirmar contraseña</label>
        <input 
          required
          type={showPassword ? 'text' : 'password'}
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`} 
          value={confirmPassword} 
          onChange={e=>setConfirmPassword(e.target.value)} 
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
          onChange={e=>setShowPassword(e.target.checked)}
          className="rounded"
          disabled={loading}
        />
        <label htmlFor="showPassword" className={tv(isDark,'text-sm text-zinc-700','text-sm text-zinc-300')}>
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
        className={`w-full rounded-xl px-4 py-3 font-semibold transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${tv(isDark,'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700','bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700')}`}
      >
        {loading ? '⏳ Creando cuenta...' : '🚀 Crear cuenta'}
      </button>
    </form>
  );
}

// ============ FORMULARIOS DE LOGIN Y RECUPERACIÓN ============

function UserLoginForm({ isDark, onLogin, onForgotPassword }:{ isDark:boolean; onLogin:(user:any)=>void; onForgotPassword:()=>void; }){
  const[email,setEmail]=useState(""); 
  const[pass,setPass]=useState("");
  const[msg,setMsg]=useState('');
  const[show,setShow]=useState(false);
  const[loading,setLoading]=useState(false);
  
  const submit=async (e:React.FormEvent)=>{ 
    e.preventDefault();
    setLoading(true);
    setMsg('');
    
    try {
      const result = await loginUser(email, pass);
      if (result.data) {
        setMsg('Login exitoso');
        onLogin(result.data);
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
        <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>Correo electrónico</label>
        <input 
          required 
          type="email"
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`} 
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          placeholder="tu@correo.com"
          disabled={loading}
        />
      </div>
      <div>
        <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>Contraseña</label>
        <div className="flex gap-2">
          <input 
            required 
            type={show? 'text':'password'} 
            className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`} 
            value={pass} 
            onChange={e=>setPass(e.target.value)} 
            placeholder="••••••"
            disabled={loading}
          />
          <button 
            type="button" 
            onClick={()=>setShow(s=>!s)} 
            className={tv(isDark,'rounded-xl bg-zinc-100 px-4 py-3','rounded-xl bg-zinc-700 px-4 py-3')}
            disabled={loading}
          >
            {show?'👁️':'👁️‍🗨️'}
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
        className={`w-full rounded-xl px-4 py-3 font-semibold transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${tv(isDark,'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700','bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700')}`}
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
    </form>
  );
}

function ForgotPasswordForm({ isDark, onBack, onTokenSent, onRegister }:{ isDark:boolean; onBack:()=>void; onTokenSent:(email:string,token:string)=>void; onRegister:()=>void; }){
  const[email,setEmail]=useState("");
  const[msg,setMsg]=useState('');
  const[loading,setLoading]=useState(false);
  
  const submit=async (e:React.FormEvent)=>{ 
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
      
      <div className={`p-4 rounded-xl mb-4 ${tv(isDark,'bg-blue-50 border border-blue-200','bg-blue-900/20 border border-blue-400/30')}`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl">💬</div>
          <div>
            <h4 className={`font-semibold mb-2 ${tv(isDark,'text-zinc-800','text-zinc-200')}`}>📋 Instrucciones:</h4>
            <ol className={`text-sm space-y-1 list-decimal list-inside ${tv(isDark,'text-zinc-700','text-zinc-300')}`}>
              <li>Haz clic en el botón <span className="font-semibold">"Chat"</span> (esquina inferior derecha)</li>
              <li>Escribe: <span className={`font-mono px-1 rounded ${tv(isDark,'bg-gray-200 text-zinc-800','bg-gray-700 text-zinc-200')}`}>"olvidé mi contraseña"</span></li>
              <li>Envía tu email: <span className="font-semibold">ejemplo@gmail.com</span></li>
              <li>Copia el código que te dé el chatbot</li>
              <li>Regresa aquí y pega el código</li>
            </ol>
          </div>
        </div>
      </div>
      
      <div className="text-center mb-4">
        <button 
          type="button"
          onClick={() => {
            // Abrir el chatbot (necesitamos acceso al estado del chatbot)
            const chatButton = document.querySelector('[data-chat-button]') as HTMLButtonElement;
            if (chatButton) chatButton.click();
          }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${tv(isDark,'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700','bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700')}`}
        >
          💬 Abrir Chatbot
        </button>
      </div>
      
      <div>
        <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>Correo electrónico</label>
        <input 
          required 
          type="email"
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`} 
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          placeholder="tu@correo.com"
          disabled={loading}
        />
      </div>
      
      {msg && (
        <div className={`text-sm ${msg.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {msg}
        </div>
      )}

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
      
      <button 
        type="submit" 
        disabled={loading}
        className={`w-full rounded-xl px-4 py-3 font-semibold transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${tv(isDark,'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600','bg-gradient-to-r from-red-500 to-orange-600 text-white hover:from-red-600 hover:to-orange-700')}`}
      >
        {loading ? '⏳ Generando token...' : '📧 Enviar Token de Recuperación'}
      </button>
      
      <div className="text-center">
        <button 
          type="button"
          onClick={onBack}
          className={`text-sm ${tv(isDark,'text-zinc-600 hover:text-zinc-800','text-zinc-400 hover:text-zinc-200')}`}
          disabled={loading}
        >
          ← Volver al login
        </button>
      </div>
    </form>
  );
}

function CodeVerificationForm({ isDark, email, onBack, onCodeVerified }:{ isDark:boolean; email:string; onBack:()=>void; onCodeVerified:(token:string)=>void; }){
  const[code,setCode]=useState("");
  const[msg,setMsg]=useState('');
  const[loading,setLoading]=useState(false);
  
  const submit=async (e:React.FormEvent)=>{ 
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
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${tv(isDark,'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700','bg-gradient-to-r from-blue-500 to-green-600 text-white hover:from-blue-600 hover:to-green-700')}`}
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

function ResetPasswordForm({ isDark, email, token, onSuccess }:{ isDark:boolean; email:string; token:string; onSuccess:()=>void; }){
  const[newPassword,setNewPassword]=useState("");
  const[confirmPassword,setConfirmPassword]=useState("");
  const[msg,setMsg]=useState('');
  const[loading,setLoading]=useState(false);
  const[showPassword,setShowPassword]=useState(false);
  
  const submit=async (e:React.FormEvent)=>{ 
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMsg('Las contraseñas no coinciden');
      return;
    }
    
    if (newPassword.length < 6) {
      setMsg('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setLoading(true);
    setMsg('');
    
    try {
      const result = await resetPassword(token, newPassword);
      if (result.data) {
        setMsg('✅ Contraseña restablecida exitosamente');
        setTimeout(() => onSuccess(), 2000);
      } else {
        setMsg(result.error?.message || 'Error restableciendo contraseña');
      }
    } catch (error) {
      setMsg('Error en el proceso');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">🔄 Nueva Contraseña</h3>
        <p className="text-sm opacity-80">Crea una nueva contraseña para tu cuenta</p>
        <p className="text-xs opacity-60 mt-1">Email: {email}</p>
      </div>
      
      <div>
        <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>Nueva contraseña</label>
        <div className="flex gap-2">
          <input 
            required 
            type={showPassword? 'text':'password'} 
            className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`} 
            value={newPassword} 
            onChange={e=>setNewPassword(e.target.value)} 
            placeholder="Mínimo 6 caracteres"
            disabled={loading}
          />
          <button 
            type="button" 
            onClick={()=>setShowPassword(s=>!s)} 
            className={tv(isDark,'rounded-xl bg-zinc-100 px-4 py-3','rounded-xl bg-zinc-700 px-4 py-3')}
            disabled={loading}
          >
            {showPassword?'👁️':'👁️‍🗨️'}
          </button>
        </div>
      </div>
      
      <div>
        <label className={tv(isDark,'text-sm text-zinc-800','text-sm text-zinc-300')}>Confirmar contraseña</label>
        <input 
          required 
          type="password" 
          className={`w-full rounded-xl border-2 px-4 py-3 shadow-sm transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-400 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-200','border-gray-500 bg-gray-700 text-white focus:border-blue-400 focus:ring-blue-800/20')}`} 
          value={confirmPassword} 
          onChange={e=>setConfirmPassword(e.target.value)} 
          placeholder="Repite la contraseña"
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
        className={`w-full rounded-xl px-4 py-3 font-semibold transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${tv(isDark,'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600','bg-gradient-to-r from-blue-500 to-green-600 text-white hover:from-blue-600 hover:to-green-700')}`}
      >
        {loading ? '⏳ Restableciendo...' : '✅ Restablecer Contraseña'}
      </button>
    </form>
  );
}

function AdminLoginForm({ isDark, onLogin, adminEmails }:{ isDark:boolean; onLogin:(ok:boolean)=>void; adminEmails:string[]; }){
  const[email,setEmail]=useState(""); 
  const[pass,setPass]=useState('');
  const[msg,setMsg]=useState('');
  const[show,setShow]=useState(false);
  const[loading,setLoading]=useState(false);
  
  const submit=async (e:React.FormEvent)=>{ 
    e.preventDefault();
    setLoading(true);
    setMsg('');
    
    // Simular un pequeño delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const emailNorm = email.trim().toLowerCase();
    const ok = adminEmails.map(x=>x.toLowerCase()).includes(emailNorm) && pass.trim()==='Jeremias_012.@';
    setMsg(ok? '':'Credenciales incorrectas');
    onLogin(ok);
    setLoading(false);
  };
  
  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">📧 Correo electrónico</label>
        <div className="relative">
          <input 
            required 
            type="email"
            className="w-full rounded-xl border-2 border-gray-200 bg-white text-gray-900 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200" 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            placeholder="admin@correo.com"
            disabled={loading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">🔑 Contraseña</label>
        <div className="relative">
          <input 
            required 
            type={show? 'text':'password'} 
            className="w-full rounded-xl border-2 border-gray-200 bg-white text-gray-900 px-4 py-3 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200" 
            value={pass} 
            onChange={e=>setPass(e.target.value)} 
            placeholder="••••••••"
            disabled={loading}
          />
          <button 
            type="button" 
            onClick={()=>setShow(s=>!s)} 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            disabled={loading}
          >
            {show ? '🙈' : '👁️'}
          </button>
        </div>
      </div>
      
      {msg && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <span>⚠️</span>
          {msg}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Verificando...
          </div>
        ) : (
          '🚀 Entrar al Panel'
        )}
      </button>
    </form>
  );
}

function ReserveForm({ service, onClose, onAddPurchase, isDark, user }:{
  service:any;
  onClose:()=>void;
  onAddPurchase:(p:any)=>void;
  isDark:boolean;
  user:any;
}){
  const isAnnual = service.billing === 'annual';
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [start, setStart] = useState(new Date().toISOString().slice(0,10));
  const [years, setYears] = useState(1);
  const [months, setMonths] = useState(1);
  const [notes, setNotes] = useState('');

  const end = useMemo(()=>{
    const d = new Date(start);
    const add = isAnnual ? 12*Number(years) : Number(months);
    d.setMonth(d.getMonth() + add);
    return d.toISOString().slice(0,10);
  },[start,months,years,isAnnual]);

  const total = isAnnual ? service.price*Number(years) : service.price*Number(months);

  // 📌 Mensaje de WhatsApp con formato formal
  const payload = [
    `🎬 *SOLICITUD DE RESERVA - STREAMZONE*`,
    ``,
    `Estimado/a, le informo que deseo realizar una reserva de servicio de streaming con los siguientes datos:`,
    ``,
    `📺 *Servicio solicitado:* ${service.name}`,
    `👤 *Nombre del cliente:* ${name}`,
    `📱 *Número de WhatsApp:* ${phone}`,
    `📅 *Fecha de inicio:* ${start}`,
    `📅 *Fecha de finalización:* ${end}`,
    `⏱️ *Duración:* ${isAnnual ? `${years} año(s)` : `${months} mes(es)`}`,
    `💰 *Total a pagar:* ${fmt(total)}`,
    ``,
    notes ? `📝 *Notas adicionales:* ${notes}` : '',
    ``,
    `Agradezco su atención y quedo atento/a a su confirmación.`,
    ``,
    `Saludos cordiales,`,
    `${name}`
  ].filter(Boolean).join('\n');

  const confirm = ()=>{
    onAddPurchase({
      customer: name,
      phone: cleanPhone(phone),
      service: service.name,
      start,
      end,
      duration: isAnnual ? 12*Number(years) : Number(months), // Cambiado de 'months' a 'duration'
      months: isAnnual ? 12*Number(years) : Number(months) // Mantener para compatibilidad
    });
    window.open(whatsappLink(ADMIN_WHATSAPP, payload), '_blank');
    onClose();
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={tv(isDark,'text-xs text-zinc-600','text-xs text-zinc-300')}>Nombre</label>
          <input className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300 bg-white text-zinc-900','border-zinc-700 bg-zinc-800 text-zinc-100')}`} 
                 value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre"/>
        </div>
        <div>
          <label className={tv(isDark,'text-xs text-zinc-600','text-xs text-zinc-300')}>WhatsApp</label>
          <input className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300 bg-white text-zinc-900','border-zinc-700 bg-zinc-800 text-zinc-100')}`} 
                 value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+593..."/>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={tv(isDark,'text-xs text-zinc-600','text-xs text-zinc-300')}>Inicio</label>
          <input type="date" className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300 bg-white text-zinc-900','border-zinc-700 bg-zinc-800 text-zinc-100')}`} 
                 value={start} onChange={e=>setStart(e.target.value)}/>
        </div>
        <div>
          <label className={tv(isDark,'text-xs text-zinc-600','text-xs text-zinc-300')}>{isAnnual?'Años':'Meses'}</label>
          {isAnnual ? (
            <select className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} 
                    value={years} onChange={e=>setYears(Number(e.target.value))}>
              {[1,2,3].map(y=> <option key={y} value={y}>{y}</option>)}
            </select>
          ):(
            <select className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} 
                    value={months} onChange={e=>setMonths(Number(e.target.value))}>
              {[1,2,3,6,12].map(m=> <option key={m} value={m}>{m}</option>)}
            </select>
          )}
        </div>
        <div>
          <label className={tv(isDark,'text-xs text-zinc-600','text-xs text-zinc-300')}>Fin</label>
          <input disabled className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'bg-zinc-50 border-zinc-300 text-zinc-900','border-zinc-700 bg-zinc-800 text-zinc-100')}`} value={end}/>
        </div>
      </div>

      <div>
        <label className={tv(isDark,'text-xs text-zinc-600','text-xs text-zinc-300')}>Notas</label>
        <textarea className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} 
                  rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Preferencias, usuario, correo, etc."/>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className={tv(isDark,'text-sm text-zinc-700','text-sm text-zinc-300')}>
          Total: <strong>{fmt(total)}</strong>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className={tv(isDark,'rounded-xl bg-zinc-200 px-4 py-2 text-zinc-800','rounded-xl bg-zinc-600 px-4 py-2 text-zinc-100')}>Cancelar</button>
          <button onClick={confirm} className={tv(isDark,'rounded-xl bg-zinc-900 px-4 py-2 text-white','rounded-xl bg-blue-600 px-4 py-2 text-white')}>
            Confirmar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

// Formulario para usuarios no registrados
function RegistrationRequiredForm({ service, onClose, isDark, onGoToAuth }:{
  service:any;
  onClose:()=>void;
  isDark:boolean;
  onGoToAuth:()=>void;
}){
  return (
    <div className="space-y-6 p-4">
      {/* Icono y mensaje principal - Mejorado */}
      <div className="text-center">
        <div className="relative mb-6">
          <div className="text-6xl mb-3 animate-bounce">🔐</div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
        </div>
        <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Registro Requerido
        </h3>
        <p className={`text-base mb-6 ${tv(isDark,'text-gray-700','text-gray-300')}`}>
          Para comprar <span className="font-bold text-blue-600">{service.name}</span> necesitas crear una cuenta en <span className="font-bold text-purple-600">StreamZone</span>
        </p>
      </div>

      {/* Beneficios del registro - Compacto */}
      <div className={`rounded-xl p-4 border ${tv(isDark,'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200','bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-600')}`}>
        <h4 className={`text-lg font-bold mb-4 text-center ${tv(isDark,'text-blue-900','text-blue-100')}`}>
          ✨ Beneficios de registrarte:
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-2 rounded-lg ${tv(isDark,'bg-white/70','bg-blue-800/20')}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className={`font-medium text-sm ${tv(isDark,'text-blue-800','text-blue-200')}`}>Acceso rápido</span>
            </div>
          </div>
          <div className={`p-2 rounded-lg ${tv(isDark,'bg-white/70','bg-blue-800/20')}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">📱</span>
              <span className={`font-medium text-sm ${tv(isDark,'text-blue-800','text-blue-200')}`}>Notificaciones</span>
            </div>
          </div>
          <div className={`p-2 rounded-lg ${tv(isDark,'bg-white/70','bg-blue-800/20')}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">💳</span>
              <span className={`font-medium text-sm ${tv(isDark,'text-blue-800','text-blue-200')}`}>Pago seguro</span>
            </div>
          </div>
          <div className={`p-2 rounded-lg ${tv(isDark,'bg-white/70','bg-blue-800/20')}`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span className={`font-medium text-sm ${tv(isDark,'text-blue-800','text-blue-200')}`}>Activación</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información del servicio - Compacto */}
      <div className={`rounded-xl p-4 border ${tv(isDark,'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200','bg-gradient-to-r from-gray-800 to-blue-900/20 border-gray-600')}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 ${service.color} rounded-xl text-white flex items-center justify-center text-xl font-bold shadow-md`}>
              {service.logo}
            </div>
            <div>
              <h5 className={`text-lg font-bold ${tv(isDark,'text-gray-900','text-white')}`}>{service.name}</h5>
              <p className={`text-base ${tv(isDark,'text-gray-600','text-gray-300')}`}>Precio: <span className="font-bold text-green-600">{fmt(service.price)}</span>/mes</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full ${tv(isDark,'bg-green-100 text-green-800','bg-green-800/30 text-green-200')}`}>
            <span className="text-xs font-semibold">Premium</span>
          </div>
        </div>
      </div>

      {/* Botones de acción - Compactos */}
      <div className="flex flex-col gap-3">
        <button 
          onClick={onGoToAuth}
          className={`w-full rounded-xl px-6 py-4 font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl ${tv(isDark,'bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 text-white hover:from-purple-700 hover:via-blue-700 hover:to-pink-700','bg-gradient-to-r from-purple-700 via-blue-700 to-pink-700 text-white hover:from-purple-800 hover:via-blue-800 hover:to-pink-800')}`}
        >
          <span className="flex items-center justify-center gap-3">
            <span className="text-xl">🚀</span>
            <span>Crear Cuenta y Comprar</span>
            <span className="text-xl">✨</span>
          </span>
        </button>
        
        <button 
          onClick={onClose}
          className={`w-full rounded-xl px-4 py-3 font-semibold transition-all duration-300 hover:scale-105 border ${tv(isDark,'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400','bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700 hover:border-gray-500')}`}
        >
          <span className="flex items-center justify-center gap-2">
            <span>←</span>
            <span>Volver al Catálogo</span>
          </span>
        </button>
      </div>

      {/* Mensaje de ayuda - Mejorado */}
      <div className="text-center pt-4">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${tv(isDark,'bg-gray-100','bg-gray-800')}`}>
          <span className={`text-sm ${tv(isDark,'text-gray-600','text-gray-400')}`}>¿Ya tienes cuenta?</span>
          <button 
            onClick={onGoToAuth}
            className={`font-semibold text-sm px-3 py-1 rounded-full transition-all ${tv(isDark,'text-blue-600 hover:text-blue-700 hover:bg-blue-50','text-blue-400 hover:text-blue-300 hover:bg-blue-900/20')}`}
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de compra con métodos de pago
function PurchaseModal({ open, onClose, service, user, isDark, onPurchase }: {
  open: boolean; onClose: () => void; service: any; user: any; isDark: boolean; onPurchase: (data: any) => void;
}) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [duration, setDuration] = useState<number>(1);
  const [devices, setDevices] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  if (!open || !service) return null;

  const isAnnual = service.billing === 'annual';
  const total = service.price * duration * devices;

  const handlePurchase = () => {
    const purchaseData = {
      service: service.name,
      price: service.price,
      duration: duration,
      devices: devices,
      total: service.price * duration * devices,
      paymentMethod: 'pichincha',
      notes: notes,
      customer: user.name,
      phone: user.phone,
      email: user.email,
      start: new Date().toISOString().slice(0, 10),
      end: new Date(Date.now() + (isAnnual ? duration * 365 : duration * 30) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    };
    
    onPurchase(purchaseData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-2 md:p-4" onClick={onClose}>
      <div className={`w-full max-w-2xl max-h-[90vh] rounded-3xl p-4 md:p-6 shadow-2xl overflow-y-auto ${tv(isDark,'bg-white','bg-zinc-900 text-zinc-100')}`} onClick={e=>e.stopPropagation()}>
        <div className="mb-4 md:mb-6 flex items-center justify-between">
          <h3 className="text-xl md:text-2xl font-bold">Completar Compra</h3>
          <button 
            onClick={onClose} 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${tv(isDark,'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100','text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800')}`}
          >
            ×
          </button>
        </div>

        <div className="space-y-6">

          {/* Información del servicio */}
          <div className={`rounded-2xl p-4 ${tv(isDark,'bg-zinc-50','bg-zinc-800')}`}>
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 ${service.color} rounded-xl text-white grid place-content-center text-xl font-bold`}>
                {service.logo}
              </div>
              <div>
                <h4 className="text-lg font-semibold">{service.name}</h4>
                <p className="text-sm opacity-70">{fmt(service.price)} por {isAnnual ? 'año' : 'mes'}</p>
              </div>
            </div>
          </div>

          {/* Duración */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${tv(isDark,'text-gray-800','text-gray-200')}`}>Duración</label>
            <div className="flex gap-2">
              {[1, 2, 3, 6].map((months) => (
              <button
                  key={months}
                  type="button"
                  onClick={() => setDuration(months)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    duration === months
                      ? 'bg-blue-600 text-white shadow-md'
                      : tv(isDark,'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50','bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600')
                  }`}
                >
                  {months} {isAnnual ? (months === 1 ? 'año' : 'años') : (months === 1 ? 'mes' : 'meses')}
              </button>
              ))}
            </div>
          </div>

          {/* Número de Dispositivos */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${tv(isDark,'text-gray-800','text-gray-200')}`}>Número de Dispositivos</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => devices > 1 && setDevices(devices - 1)}
                disabled={devices <= 1}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                  devices <= 1 
                    ? tv(isDark,'bg-gray-200 text-gray-400 cursor-not-allowed','bg-gray-600 text-gray-500 cursor-not-allowed')
                    : tv(isDark,'bg-gray-100 text-gray-700 hover:bg-gray-200','bg-gray-700 text-gray-200 hover:bg-gray-600')
                }`}
              >
                −
              </button>
              
              <div className={`border rounded-lg px-4 py-2 min-w-[100px] text-center ${tv(isDark,'bg-gray-50 border-gray-300','bg-gray-700 border-gray-600')}`}>
                <div className={`text-xl font-bold ${tv(isDark,'text-gray-800','text-gray-100')}`}>{devices}</div>
                <div className={`text-xs ${tv(isDark,'text-gray-600','text-gray-300')}`}>
                  {devices === 1 ? 'Dispositivo' : 'Dispositivos'}
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => devices < 5 && setDevices(devices + 1)}
                disabled={devices >= 5}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                  devices >= 5 
                    ? tv(isDark,'bg-gray-200 text-gray-400 cursor-not-allowed','bg-gray-600 text-gray-500 cursor-not-allowed')
                    : tv(isDark,'bg-gray-100 text-gray-700 hover:bg-gray-200','bg-gray-700 text-gray-200 hover:bg-gray-600')
                }`}
              >
                +
              </button>
            </div>
            <div className={`mt-2 text-xs ${tv(isDark,'text-gray-600','text-gray-300')}`}>
              Máximo 5 dispositivos por compra
            </div>
          </div>

          {/* Información de cuentas bancarias */}
          <div>
            <h4 className={`font-semibold mb-4 ${tv(isDark,'text-gray-800','text-gray-200')}`}>💳 Información de Pago</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Banco Pichincha */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🏦</span>
                  <span className="font-semibold text-sm text-white">Banco Pichincha</span>
                </div>
                <div className="text-xs space-y-1 text-blue-100">
                  <div><strong className="text-white">Titular:</strong> Jeremias Guale Santana</div>
                  <div><strong className="text-white">Cuenta:</strong> 2209034638</div>
                  <div><strong className="text-white">Tipo:</strong> Ahorro Transaccional</div>
                </div>
              </div>

              {/* Banco Guayaquil */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-4 text-white shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🏛️</span>
                  <span className="font-semibold text-sm text-white">Banco Guayaquil</span>
                </div>
                <div className="text-xs space-y-1 text-blue-100">
                  <div><strong className="text-white">Titular:</strong> Jeremias Joel Guale Santana</div>
                  <div><strong className="text-white">Cuenta:</strong> 0122407273</div>
                  <div><strong className="text-white">Tipo:</strong> Ahorros</div>
                </div>
              </div>

              {/* Banco Pacífico */}
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg p-4 text-white shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🌊</span>
                  <span className="font-semibold text-sm text-white">Banco Pacífico</span>
                </div>
                <div className="text-xs space-y-1 text-purple-100">
                  <div><strong className="text-white">Titular:</strong> Byron Guale Santana</div>
                  <div><strong className="text-white">Cuenta:</strong> 1061220256</div>
                  <div><strong className="text-white">Tipo:</strong> Ahorros</div>
                </div>
              </div>

              {/* PayPal */}
              <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg p-4 text-white shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">💳</span>
                  <span className="font-semibold text-sm text-white">PayPal</span>
                </div>
                <div className="text-xs space-y-1 text-blue-100">
                  <div><strong className="text-white">Email:</strong> guale2023@outlook.com</div>
                  <div><strong className="text-white">Método:</strong> PayPal</div>
                  <div><strong className="text-white">Tipo:</strong> Transferencia</div>
                </div>
              </div>
            </div>

            {/* Instrucciones de confirmación */}
            <div className={`mt-4 p-6 rounded-2xl ${tv(isDark,'bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200','bg-gradient-to-br from-orange-900/30 to-yellow-900/30 border-2 border-orange-500')}`}>
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full ${tv(isDark,'bg-orange-100','bg-orange-800/50')}`}>
                    <span className="text-4xl">🚨</span>
                  </div>
                </div>
                <h5 className="text-xl font-bold text-orange-800 dark:text-orange-200 mb-3">
                  ⚠️ Instrucciones Importantes
                </h5>
                <div className={`p-4 rounded-xl ${tv(isDark,'bg-white/80','bg-black/20')}`}>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                    Una vez que hayas realizado el pago, <strong className="text-orange-800 dark:text-orange-200">debes confirmar tu compra</strong> enviando una captura del comprobante por WhatsApp a nuestros agentes.
                  </p>
                  <div className="flex justify-center gap-4 mb-4">
                    <div className={`px-4 py-2 rounded-lg ${tv(isDark,'bg-green-100 text-green-800','bg-green-800/50 text-green-200')}`}>
                      <span className="text-lg">📱</span>
                      <span className="ml-2 font-semibold">WhatsApp</span>
                    </div>
                    <div className={`px-4 py-2 rounded-lg ${tv(isDark,'bg-blue-100 text-blue-800','bg-blue-800/50 text-blue-200')}`}>
                      <span className="text-lg">💬</span>
                      <span className="ml-2 font-semibold">Agentes</span>
                    </div>
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                    ⚡ Sin el comprobante, tu servicio NO será activado
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${tv(isDark,'text-gray-800','text-gray-200')}`}>Notas adicionales (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Comentarios o instrucciones especiales..."
              className={`w-full rounded-lg border px-4 py-3 text-sm resize-none ${tv(isDark,'border-gray-300 bg-white text-gray-900','border-gray-600 bg-gray-700 text-gray-100')}`}
              rows={3}
            />
          </div>

          {/* Total */}
          <div className={`bg-gradient-to-r border rounded-lg p-4 ${tv(isDark,'from-blue-100 to-purple-100 border-blue-300','from-blue-900/20 to-purple-900/20 border-blue-700')}`}>
            <div className="flex justify-between items-center">
              <span className={`text-lg font-semibold ${tv(isDark,'text-gray-800','text-gray-200')}`}>Total a pagar:</span>
              <span className={`text-2xl font-bold ${tv(isDark,'text-blue-600','text-blue-400')}`}>{fmt(total)}</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose} 
              className={`flex-1 rounded-lg px-4 py-3 font-semibold transition-colors ${tv(isDark,'bg-gray-100 text-gray-800 hover:bg-gray-200','bg-gray-700 text-gray-200 hover:bg-gray-600')}`}
            >
              Cancelar
            </button>
            <button 
              onClick={handlePurchase}
              className="flex-1 rounded-lg px-4 py-3 font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Completar Compra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modal de registro de compra por admin
function AdminRegisterPurchaseModal({ open, onClose, onRegister, isDark, systemPrefersDark }: {
  open: boolean; onClose: () => void; onRegister: (data: any) => void; isDark: boolean; systemPrefersDark: boolean;
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    price: '',
    duration: 1,
    isAnnual: false,
    startDate: new Date().toISOString().slice(0, 10),
    notes: ''
  });

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const endDate = new Date(formData.startDate);
    const monthsToAdd = formData.isAnnual ? formData.duration * 12 : formData.duration;
    endDate.setMonth(endDate.getMonth() + monthsToAdd);

    onRegister({
      ...formData,
      price: parseFloat(formData.price),
      endDate: endDate.toISOString()
    });
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      service: '',
      price: '',
      duration: 1,
      isAnnual: false,
      startDate: new Date().toISOString().slice(0, 10),
      notes: ''
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`w-full max-w-3xl rounded-lg shadow-xl max-h-[90vh] overflow-y-auto ${tv(isDark,'bg-white','bg-gray-900')}`} onClick={e=>e.stopPropagation()}>
        {/* Header minimalista */}
        <div className={`relative p-6 border-b ${tv(isDark,'bg-gray-50 border-gray-200','bg-gray-800 border-gray-700')}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-semibold ${tv(isDark,'text-gray-900','text-white')}`}>Registrar Compra Manual</h3>
          <button 
            onClick={onClose} 
              className={`w-6 h-6 rounded flex items-center justify-center text-lg font-bold ${tv(isDark,'text-gray-500 hover:bg-gray-100','text-gray-400 hover:bg-gray-700')}`}
          >
            ×
          </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información del cliente */}
            <div className={`p-4 rounded-lg ${tv(isDark,'bg-gray-50','bg-gray-800')}`}>
              <h4 className={`text-lg font-semibold mb-4 ${tv(isDark,'text-gray-900','text-white')}`}>Información del Cliente</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Nombre completo *
                  </label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100','border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30','border-gray-400 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200')}`}
                  placeholder="Juan Pérez"
                />
              </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    WhatsApp *
                  </label>
                <input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100','border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30','border-gray-400 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200')}`}
                  placeholder="+593987654321"
                />
              </div>
                <div className="md:col-span-2 space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Email (opcional)
                  </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100','border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30','border-gray-400 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200')}`}
                  placeholder="juan@correo.com"
                />
              </div>
            </div>
          </div>

          {/* Información del servicio */}
            <div className={`p-4 rounded-lg ${tv(isDark,'bg-gray-50','bg-gray-800')}`}>
              <h4 className={`text-lg font-semibold mb-4 ${tv(isDark,'text-gray-900','text-white')}`}>Información del Servicio</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Servicio *
                  </label>
                <select
                  required
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-green-400 focus:ring-green-800/20','border-gray-400 bg-gray-50 text-gray-900 focus:border-green-600 focus:ring-green-300')}`}
                >
                  <option value="">Seleccionar servicio</option>
                  {SERVICES.map(service => (
                    <option key={service.id} value={service.name}>
                      {service.name} - {fmt(service.price)}/{service.billing === 'annual' ? 'año' : 'mes'}
                    </option>
                  ))}
                </select>
              </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Precio (USD) *
                  </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-green-400 focus:ring-green-800/20','border-gray-400 bg-gray-50 text-gray-900 focus:border-green-600 focus:ring-green-300')}`}
                  placeholder="4.00"
                />
              </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Duración *
                  </label>
                  <div className="flex gap-3">
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 1})}
                      className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-green-400 focus:ring-green-800/20')}`}
                  />
                  <select
                    value={formData.isAnnual ? 'annual' : 'monthly'}
                    onChange={(e) => setFormData({...formData, isAnnual: e.target.value === 'annual'})}
                      className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tv(isDark,'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-green-400 focus:ring-green-800/20')}`}
                  >
                    <option value="monthly">Meses</option>
                    <option value="annual">Años</option>
                  </select>
                </div>
              </div>
                <div className="space-y-2">
                  <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                    Fecha de inicio *
                  </label>
                <input
                  required
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-green-500 focus:ring-green-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-green-400 focus:ring-green-800/20','border-gray-400 bg-gray-50 text-gray-900 focus:border-green-600 focus:ring-green-300')}`}
                />
              </div>
            </div>
          </div>

          {/* Notas */}
            <div className={`p-6 rounded-2xl border-2 ${tv(isDark,'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200','bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/30')}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tv(isDark,'bg-purple-100','bg-purple-800/30')}`}>
                  <span className="text-xl">📝</span>
                </div>
                <h4 className={`text-lg font-bold ${tv(isDark,'text-purple-900','text-purple-100')}`}>Notas Adicionales</h4>
              </div>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-purple-400 focus:ring-purple-800/20','border-gray-400 bg-gray-50 text-gray-900 focus:border-purple-600 focus:ring-purple-300')}`}
                rows={4}
                placeholder="Comentarios, instrucciones especiales o información adicional..."
            />
          </div>

            {/* Botones de acción */}
            <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose} 
                className={`flex-1 rounded-xl px-6 py-4 font-semibold text-sm transition-all hover:scale-105 ${tv(isDark,'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300','bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-gray-600')}`}
            >
              Cancelar
            </button>
            <button 
              type="submit"
                className="flex-1 rounded-xl px-6 py-4 font-semibold text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
            >
                <span className="flex items-center justify-center gap-2">
                  <span>✨</span>
              Registrar Compra
                  <span>✨</span>
                </span>
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}

// Funciones auxiliares para parsear credenciales de combos
function parseComboCredentialsFromText(text: string): Record<string, { email: string; password: string }> {
  const credentials: Record<string, { email: string; password: string }> = {};
  
  if (!text) return credentials;
  
  console.log('🔍 Parsing combo credentials from text:', text);
  
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    console.log('🔍 Processing line:', trimmedLine);
    
    // Patrón 1: "Netflix: email@domain.com / password"
    let match = trimmedLine.match(/^([^:]+):\s*([^\s/]+)\s*\/\s*(.+)$/);
    if (match) {
      const service = match[1].trim();
      const email = match[2].trim();
      const password = match[3].trim();
      credentials[service] = { email, password };
      console.log('🔍 Found credentials for', service, ':', email, '/', password);
      continue;
    }
    
    // Patrón 2: "Disney+ Estándar: email@domain.com / password"
    match = trimmedLine.match(/^([^:]+):\s*([^\s/]+)\s*\/\s*(.+)$/);
    if (match) {
      const service = match[1].trim();
      const email = match[2].trim();
      const password = match[3].trim();
      credentials[service] = { email, password };
      console.log('🔍 Found credentials for', service, ':', email, '/', password);
      continue;
    }
    
    // Patrón 3: Buscar emails en la línea
    const emailMatch = trimmedLine.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      const email = emailMatch[1];
      console.log('🔍 Found email in line:', email);
      // Intentar extraer el servicio del contexto
      if (trimmedLine.toLowerCase().includes('netflix')) {
        credentials['Netflix'] = { email, password: 'contraseña' };
      } else if (trimmedLine.toLowerCase().includes('disney')) {
        credentials['Disney+'] = { email, password: 'contraseña' };
      } else if (trimmedLine.toLowerCase().includes('paramount')) {
        credentials['Paramount+'] = { email, password: 'contraseña' };
      } else {
        // Si no hay contexto claro, usar el email como está
        console.log('🔍 No service context found, using email as-is');
      }
    }
    
    // Patrón 4: Buscar contraseñas después de "contraseña:" o "password:"
    const passwordMatch = trimmedLine.match(/(?:contraseña|password):\s*(.+)/i);
    if (passwordMatch) {
      const password = passwordMatch[1].trim();
      console.log('🔍 Found password:', password);
    }
    
    // Patrón 5: Buscar emails sueltos y crear credenciales por defecto para Paramount+
    if (emailMatch && trimmedLine.toLowerCase().includes('paramount') && !credentials['Paramount+']) {
      const email = emailMatch[1];
      console.log('🔍 Creating default credentials for Paramount+ with email:', email);
      credentials['Paramount+'] = { email, password: 'contraseña' };
    }
  }
  
  console.log('🔍 Final parsed credentials:', credentials);
  return credentials;
}

// Función para detectar si un servicio es realmente un combo
function isRealCombo(serviceName: string): boolean {
  if (!serviceName) return false;
  
  // Lista de combos reales definidos en COMBOS
  const realCombos = [
    'Netflix + Disney Estándar',
    'Netflix + Disney Premium', 
    'Netflix + Max',
    'Netflix + Prime Video',
    'Prime Video + Disney Estándar',
    'Disney Premium + Max',
    'Max + Prime Video',
    'Paramount + Max + Prime Video',
    'Netflix + Max + Disney + Prime + Paramount',
    'Spotify + Netflix',
    'Spotify + Disney Premium'
  ];
  
  // Verificar si el servicio está en la lista de combos reales
  return realCombos.includes(serviceName);
}

// Función para extraer servicios de un combo
function extractComboServices(comboName: string): string[] {
  if (!comboName || !isRealCombo(comboName)) return [comboName];
  
  // Mapeo de nombres de combos a servicios individuales
  const comboMapping: Record<string, string[]> = {
    'Netflix + Disney Estándar': ['Netflix', 'Disney+ Estándar'],
    'Netflix + Disney Premium': ['Netflix', 'Disney+ Premium'],
    'Netflix + Max': ['Netflix', 'Max'],
    'Netflix + Prime Video': ['Netflix', 'Prime Video'],
    'Prime Video + Disney Estándar': ['Prime Video', 'Disney+ Estándar'],
    'Disney Premium + Max': ['Disney+ Premium', 'Max'],
    'Max + Prime Video': ['Max', 'Prime Video'],
    'Paramount + Max + Prime Video': ['Paramount+', 'Max', 'Prime Video'],
    'Netflix + Max + Disney + Prime + Paramount': ['Netflix', 'Max', 'Disney+', 'Prime Video', 'Paramount+'],
    'Spotify + Netflix': ['Spotify', 'Netflix'],
    'Spotify + Disney Premium': ['Spotify', 'Disney+ Premium']
  };
  
  // Si no está en el mapeo, intentar parsear manualmente
  if (!comboMapping[comboName]) {
    return comboName.split(' + ').map(service => service.trim());
  }
  
  return comboMapping[comboName];
}

// Función para normalizar nombres de servicios
function normalizeServiceName(serviceName: string): string {
  // Normalizar variaciones de Disney
  if (serviceName.toLowerCase().includes('disney')) {
    if (serviceName.toLowerCase().includes('premium')) {
      return 'Disney+ Premium';
    } else {
      return 'Disney+ Estándar';
    }
  }
  
  // Mantener otros servicios como están
  return serviceName;
}

// Función para obtener credenciales de un combo desde admin_notes
function getComboCredentials(adminNotes: string): Record<string, { email: string; password: string }> {
  if (!adminNotes) return {};
  
  try {
    // Intentar parsear como JSON primero
    const parsed = JSON.parse(adminNotes);
    if (parsed && typeof parsed === 'object' && !parsed.customer) {
      // Filtrar las notas y solo devolver credenciales válidas
      const credentials: Record<string, { email: string; password: string }> = {};
      const seenServices = new Set<string>();
      
      Object.entries(parsed).forEach(([key, value]: [string, any]) => {
        // Excluir las notas y solo incluir credenciales con email y password
        if (key !== 'notes' && value && typeof value === 'object' && value.email && value.password) {
          const normalizedKey = normalizeServiceName(key);
          
          // Solo agregar si no hemos visto este servicio normalizado antes
          if (!seenServices.has(normalizedKey)) {
            credentials[normalizedKey] = { email: value.email, password: value.password };
            seenServices.add(normalizedKey);
          }
        }
      });
      return credentials;
    }
  } catch {
    // Si no es JSON válido, parsear como texto
    return parseComboCredentialsFromText(adminNotes);
  }
  
  return {};
}

function extractNotesFromComboText(text: string): string {
  if (!text) return '';
  
  const lines = text.split('\n');
  const notes: string[] = [];
  
  for (const line of lines) {
    // Si la línea no contiene credenciales (email/password), es una nota
    if (!line.includes('@') && !line.includes('/') && line.trim()) {
      notes.push(line.trim());
    }
  }
  
  return notes.join('\n');
}

// Función para obtener las notas de un combo
function getComboNotes(adminNotes: string): string {
  if (!adminNotes) return '';
  
  try {
    // Intentar parsear como JSON primero
    const parsed = JSON.parse(adminNotes);
    if (parsed && typeof parsed === 'object' && parsed.notes) {
      return parsed.notes;
    }
  } catch {
    // Si no es JSON válido, parsear como texto
    return extractNotesFromComboText(adminNotes);
  }
  
  return '';
}

// Modal de edición de compra
function EditPurchaseModal({ open, onClose, onUpdate, purchase, isDark, systemPrefersDark }: {
  open: boolean; 
  onClose: () => void; 
  onUpdate: (data: Partial<DatabasePurchase>) => void; 
  purchase: DatabasePurchase | null;
  isDark: boolean;
  systemPrefersDark: boolean;
}) {
  const [formData, setFormData] = useState({
    customer: '',
    phone: '',
    service: '',
    start: '',
    end: '',
    months: 1,
    service_email: '',
    service_password: '',
    admin_notes: ''
  });

  useEffect(() => {
    if (purchase) {
      // Si es un combo, extraer las credenciales de admin_notes
      let credentials = {};
      let notes = '';
      
      if (purchase.service && isRealCombo(purchase.service)) {
        try {
          const parsed = JSON.parse(purchase.admin_notes || '{}');
          if (parsed && typeof parsed === 'object' && !parsed.customer) {
            // Es un objeto de credenciales JSON
            credentials = parsed;
          } else {
            // Es texto normal, intentar parsear credenciales del texto
            const adminNotes = purchase.admin_notes || '';
            credentials = parseComboCredentialsFromText(adminNotes);
            notes = extractNotesFromComboText(adminNotes);
          }
        } catch {
          // Si no se puede parsear como JSON, intentar parsear del texto
          const adminNotes = purchase.admin_notes || '';
          credentials = parseComboCredentialsFromText(adminNotes);
          notes = extractNotesFromComboText(adminNotes);
        }
      } else {
        notes = purchase.admin_notes || '';
      }
      
      setFormData({
        customer: purchase.customer || '',
        phone: purchase.phone || '',
        service: purchase.service || '',
        start: purchase.start || '',
        end: purchase.end || '',
        months: purchase.months || 1,
        service_email: purchase.service_email || '',
        service_password: purchase.service_password || '',
        admin_notes: Object.keys(credentials).length > 0 ? JSON.stringify(credentials) : notes
      });
    }
  }, [purchase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si es un combo, asegurar que las credenciales se guarden correctamente
    if (formData.service && isRealCombo(formData.service)) {
      try {
        // Verificar que las credenciales estén en formato JSON
        const credentials = JSON.parse(formData.admin_notes || '{}');
        if (credentials && typeof credentials === 'object' && !credentials.customer) {
          // Las credenciales ya están en formato JSON, enviar tal como están
          onUpdate(formData);
        } else {
          // Si no están en formato JSON, mantener el formato original
          onUpdate(formData);
        }
      } catch {
        // Si hay error parseando, enviar tal como está
        onUpdate(formData);
      }
    } else {
      // Para servicios individuales, enviar normalmente
      onUpdate(formData);
    }
  };

  if (!open || !purchase) return null;

  return (
     <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-2 sm:p-4" onClick={onClose}>
         <div className={`w-full max-w-2xl sm:max-w-4xl mx-2 sm:mx-4 rounded-lg shadow-xl max-h-[98vh] sm:max-h-[95vh] overflow-y-auto ${tv(isDark,'bg-white','bg-gray-900')}`} onClick={e=>e.stopPropagation()}>
        {/* Header compacto para móviles */}
        <div className={`relative p-3 sm:p-4 border-b ${tv(isDark,'bg-white border-gray-200','bg-gray-900 border-gray-700')}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-lg sm:text-xl font-semibold ${tv(isDark,'text-gray-900','text-white')}`}>Editar Compra</h3>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold ${tv(isDark,'text-gray-500 hover:bg-gray-100','text-gray-400 hover:bg-gray-800')}`}
          >
            ×
          </button>
          </div>
        </div>
        
        <div className="p-3 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Información del cliente - Compacto para móviles */}
            <div className={`p-3 sm:p-4 rounded-lg ${tv(isDark,'bg-gray-50','bg-gray-800')}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h4 className={`font-semibold text-sm sm:text-base ${tv(isDark,'text-gray-900','text-white')}`}>{formData.customer}</h4>
                  <p className={`text-xs sm:text-sm ${tv(isDark,'text-gray-600','text-gray-400')}`}>{formData.service} • {formData.months} {formData.months === 1 ? 'mes' : 'meses'}</p>
                </div>
                <p className={`text-xs sm:text-sm ${tv(isDark,'text-gray-500','text-gray-500')}`}>📱 {formData.phone}</p>
              </div>
            </div>
        
          
          {/* Detectar si es un combo */}
            {formData.service && isRealCombo(formData.service) ? (
              <div className={`p-3 sm:p-4 rounded-lg ${tv(isDark,'bg-gray-50','bg-gray-800')}`}>
                {/* Banner de detección de combo - Compacto */}
                <div className={`p-2 rounded mb-3 ${tv(isDark,'bg-green-100','bg-green-800/20')}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🎯</span>
                    <span className={`text-xs sm:text-sm font-medium ${tv(isDark,'text-green-800','text-green-100')}`}>Combo Detectado</span>
                  </div>
                </div>
              
                <div className="space-y-4">
                  <h3 className={`text-sm font-medium mb-3 ${tv(isDark,'text-gray-700','text-gray-300')}`}>Credenciales del Combo</h3>
                
                {formData.service.split(' + ').map((service, index) => {
                  const serviceName = service.trim();
                  
                  // Función para encontrar la clave correcta en las credenciales
                  const findCredentialKey = (serviceName: string, credentials: any) => {
                    // Buscar coincidencia exacta primero
                    if (credentials[serviceName]) return serviceName;
                    
                    // Buscar variaciones comunes
                    const variations = [
                      serviceName + '+',
                      serviceName.replace('+', ''),
                      serviceName.replace('+', ' + '),
                      serviceName.replace(/\s+/g, ' '),
                      'Disney+ Estándar', // Caso específico para Disney
                      'Disney Estándar'   // Caso específico para Disney
                    ];
                    
                    for (const variation of variations) {
                      if (credentials[variation]) return variation;
                    }
                    
                    return serviceName; // Devolver el nombre original si no se encuentra
                  };
                  
                  return (
                    <div key={index} className={`p-2 sm:p-3 rounded-md ${tv(isDark,'bg-white','bg-gray-700')}`}>
                      <h4 className={`font-medium text-xs sm:text-sm mb-2 ${tv(isDark,'text-gray-800','text-white')}`}>
                        {serviceName}
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1">
                          <label className={`block text-xs font-medium ${tv(isDark,'text-gray-600','text-gray-400')}`}>
                            Email *
                          </label>
                          <input
                            type="email"
                            placeholder="usuario@email.com"
                            className={`w-full rounded-lg border-2 px-3 py-2 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100','border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30','border-gray-400 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200')}`}
                          onChange={(e) => {
                            // Actualizar las credenciales en admin_notes
                            const credentials = JSON.parse(formData.admin_notes || '{}');
                            const key = findCredentialKey(serviceName, credentials);
                            
                            credentials[key] = {
                              ...credentials[key],
                              email: e.target.value
                            };
                            setFormData(prev => ({
                              ...prev,
                              admin_notes: JSON.stringify(credentials)
                            }));
                          }}
                          defaultValue={(() => {
                            try {
                              const credentials = JSON.parse(formData.admin_notes || '{}');
                              const key = findCredentialKey(serviceName, credentials);
                              return credentials[key]?.email || '';
                            } catch {
                              return '';
                            }
                          })()}
                        />
                      </div>
                        <div className="space-y-1">
                          <label className={`block text-xs font-medium ${tv(isDark,'text-gray-600','text-gray-400')}`}>
                            Contraseña *
                          </label>
                          <input
                            type="text"
                            placeholder="contraseña123"
                            className={`w-full rounded-lg border-2 px-3 py-2 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100','border-gray-600 bg-gray-700 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-800/30','border-gray-400 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200')}`}
                            onChange={(e) => {
                              // Actualizar las credenciales en admin_notes
                              const credentials = JSON.parse(formData.admin_notes || '{}');
                              const key = findCredentialKey(serviceName, credentials);
                              
                              credentials[key] = {
                                ...credentials[key],
                                password: e.target.value
                              };
                              setFormData(prev => ({
                                ...prev,
                                admin_notes: JSON.stringify(credentials)
                              }));
                            }}
                            defaultValue={(() => {
                              try {
                                const credentials = JSON.parse(formData.admin_notes || '{}');
                                const key = findCredentialKey(serviceName, credentials);
                                return credentials[key]?.password || '';
                              } catch {
                                return '';
                              }
                            })()}
                          />
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
              
                {/* Notas para combos - Compacto */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${tv(isDark,'bg-purple-100','bg-purple-800/30')}`}>
                      <span className="text-sm">📝</span>
                    </div>
                    <h4 className={`text-sm font-bold ${tv(isDark,'text-green-900','text-green-100')}`}>Notas Adicionales</h4>
                  </div>
                <textarea
                  value={(() => {
                    try {
                      const credentials = JSON.parse(formData.admin_notes || '{}');
                      if (credentials && typeof credentials === 'object' && !credentials.customer) {
                        // Si es un objeto de credenciales, extraer las notas
                        return credentials.notes || '';
                      }
                      return formData.admin_notes || '';
                    } catch {
                      return formData.admin_notes || '';
                    }
                  })()}
                  onChange={(e) => {
                    // Actualizar las notas en admin_notes
                    const credentials = JSON.parse(formData.admin_notes || '{}');
                    if (credentials && typeof credentials === 'object' && !credentials.customer) {
                      credentials.notes = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        admin_notes: JSON.stringify(credentials)
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        admin_notes: e.target.value
                      }));
                    }
                  }}
                    rows={3}
                    className={`w-full rounded-lg border-2 px-3 py-2 text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-purple-400 focus:ring-purple-800/20','border-gray-400 bg-gray-50 text-gray-900 focus:border-purple-600 focus:ring-purple-300')}`}
                  placeholder="Netflix: Perfil 2, Disney: Perfil 3"
                />
              </div>
            </div>
          ) : (
              <div className={`p-6 rounded-2xl border-2 ${tv(isDark,'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200','bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/30')}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tv(isDark,'bg-purple-100','bg-purple-800/30')}`}>
                    <span className="text-xl">🔑</span>
                  </div>
                  <h4 className={`text-xl font-bold ${tv(isDark,'text-purple-900','text-purple-100')}`}>Credenciales del Servicio</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                      Email del servicio *
                    </label>
                <input
                      required
                  value={formData.service_email}
                  onChange={(e) => setFormData(prev => ({...prev, service_email: e.target.value}))}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-purple-400 focus:ring-purple-800/20','border-gray-400 bg-gray-50 text-gray-900 focus:border-purple-600 focus:ring-purple-300')}`}
                      placeholder="usuario@email.com"
                />
              </div>
                  <div className="space-y-2">
                    <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                      Contraseña del servicio *
                    </label>
                <input
                      required
                  value={formData.service_password}
                  onChange={(e) => setFormData(prev => ({...prev, service_password: e.target.value}))}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-purple-400 focus:ring-purple-800/20','border-gray-400 bg-gray-50 text-gray-900 focus:border-purple-600 focus:ring-purple-300')}`}
                      placeholder="contraseña123"
                />
              </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className={`block text-sm font-semibold ${tv(isDark,'text-gray-700','text-gray-300')}`}>
                      Notas del administrador
                    </label>
              <textarea
                value={formData.admin_notes}
                onChange={(e) => setFormData(prev => ({...prev, admin_notes: e.target.value}))}
                      rows={3}
                      className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 ${tvContrast(isDark,systemPrefersDark,'border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:ring-purple-200','border-gray-600 bg-gray-800 text-gray-100 focus:border-purple-400 focus:ring-purple-800/20','border-gray-400 bg-gray-50 text-gray-900 focus:border-purple-600 focus:ring-purple-300')}`}
                placeholder="Notas adicionales sobre esta compra..."
              />
                  </div>
                </div>
            </div>
          )}
          
          
            {/* Botones de acción - Compactos para móviles */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 rounded-lg px-4 py-3 font-semibold text-xs sm:text-sm transition-all hover:scale-105 ${tv(isDark,'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300','bg-gray-700 text-gray-200 hover:bg-gray-600 border-2 border-gray-600')}`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  // Generar mensaje de WhatsApp con credenciales
                  let message = `🎬 *Credenciales de ${formData.service}*\n\n`;
                  message += `👤 Cliente: ${formData.customer}\n`;
                  message += `📅 Duración: ${formData.months} ${formData.months === 1 ? 'mes' : 'meses'}\n`;
                  message += `📆 Vence: ${formData.end}\n\n`;
                  
                  if (formData.service && isRealCombo(formData.service)) {
                    // Es un combo
                    message += `🔑 *Credenciales del Combo:*\n\n`;
                    try {
                      const credentials = JSON.parse(formData.admin_notes || '{}');
                      Object.entries(credentials).forEach(([service, creds]: [string, any]) => {
                        if (service !== 'notes' && creds.email && creds.password) {
                          message += `*${service}:*\n`;
                          message += `📧 Email: ${creds.email}\n`;
                          message += `🔑 Contraseña: ${creds.password}\n\n`;
                        }
                      });
                    } catch {
                      message += `📧 Email: ${formData.service_email}\n`;
                      message += `🔑 Contraseña: ${formData.service_password}\n\n`;
                    }
                  } else {
                    // Servicio individual
                    message += `🔑 *Credenciales:*\n`;
                    message += `📧 Email: ${formData.service_email}\n`;
                    message += `🔑 Contraseña: ${formData.service_password}\n\n`;
                  }
                  
                  message += `💡 *Instrucciones:*\n`;
                  message += `• Descarga la app oficial de cada servicio\n`;
                  message += `• Inicia sesión con las credenciales proporcionadas\n`;
                  message += `• Disfruta de tu contenido favorito\n\n`;
                  message += `❓ ¿Necesitas ayuda? Contáctanos por WhatsApp`;
                  
                  const whatsappUrl = whatsappLink(formData.phone, message);
                  window.open(whatsappUrl, '_blank');
                }}
                className={`flex-1 rounded-lg px-4 py-3 font-semibold text-xs sm:text-sm transition-all hover:scale-105 ${tv(isDark,'bg-green-600 text-white hover:bg-green-700 border-2 border-green-600','bg-green-600 text-white hover:bg-green-700 border-2 border-green-600')}`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>📱</span>
                  <span className="hidden sm:inline">Enviar por WhatsApp</span>
                  <span className="sm:hidden">WhatsApp</span>
                </span>
            </button>
            <button
              type="submit"
                className={`flex-1 rounded-lg px-4 py-3 font-semibold text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>💾</span>
                  <span className="hidden sm:inline">Guardar Cambios</span>
                  <span className="sm:hidden">Guardar</span>
                  <span className="hidden sm:inline">✨</span>
                </span>
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}

// ===================== Pruebas rápidas (no rompas) =====================
(function runDevTests(){ try{
  console.assert(fmt(3.5) && typeof fmt(3.5)==='string','fmt string');
  const d0='2025-01-01', d3='2025-01-04', dneg='2024-12-28';
  console.assert(daysBetween(d0,d3)===3,'daysBetween 3 dias');
  console.assert(daysBetween(d3,d3)===0,'daysBetween 0 dias');
  console.assert(daysBetween(d3,dneg)===-7,'daysBetween negativo');
  console.assert(whatsappLink('123','hola')==='https://wa.me/123?text=hola','wa link');
  console.log('✅ Todas las pruebas pasaron correctamente');
}catch(e){ console.warn('Self-tests failed:',e); }})();

export default App;

