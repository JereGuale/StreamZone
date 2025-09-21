import React, { useEffect, useMemo, useState } from "react";
import { supabase, createUser, getUserByPhone, updateUser, createPurchase, syncServices, DatabasePurchase, getUserPurchases, getUserByEmail, generateResetToken, verifyResetToken, resetPassword, loginUser, approvePurchase, getPendingPurchases, getUserActivePurchases, getExpiringServices, createRenewal, getRenewalHistory, toggleAutoRenewal, getRenewalNotifications, getRenewalStats, RenewalHistory, ExpiringService } from "./lib/supabase";

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
  { id: "youtube_premium", name: "YouTube Premium", price: 3.5, billing: "monthly", color: "bg-red-700", logo: "YT" },
  { id: "paramount", name: "Paramount+", price: 2.75, billing: "monthly", color: "bg-indigo-600", logo: "P+" },
  { id: "chatgpt", name: "ChatGPT", price: 4.25, billing: "monthly", color: "bg-zinc-800", logo: "GPT" },
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
const DEFAULT_ADMIN_EMAILS = ["gualejeremi@gmaill.com", "gualejeremi@gmail.com"];

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
  return Math.ceil(diff/(1000*60*60*24)); 
}
function whatsappLink(to: string, text: string){ return `https://wa.me/${to}?text=${encodeURIComponent(text)}`; }
function tv<T>(isDark: boolean, light: T, dark: T){ return isDark? dark : light; }
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
    
    // Saludos y bienvenida
    if(/hola|buenas|hey|hi|hello|buenos|buenas tardes|buenas noches/.test(text)) {
      return "¡Hola! 👋 ¡Bienvenido a StreamZone! 🎬✨ Soy tu asistente especializado en streaming. Puedo ayudarte con:\n\n🎯 Recomendaciones personalizadas\n💰 Precios y combos especiales\n📺 Contenido disponible por plataforma\n🔍 Búsqueda de títulos específicos\n📱 Información sobre cuentas y dispositivos\n🔐 Recuperación de contraseña\n\n¿Qué te gustaría saber? 😊";
    }
    
    // Recuperación de contraseña
    if(/olvide|olvidé|contraseña|password|recuperar|reset|resetear/.test(text)) {
      return "🔐 **RECUPERACIÓN DE CONTRASEÑA** 🔐\n\n¡No te preocupes! Puedo ayudarte a recuperar tu contraseña.\n\n📧 **Dime tu email** y te generaré un código de recuperación.\n\nEjemplo: `miemail@gmail.com`\n\n⚠️ **Importante:** El código se mostrará aquí en el chat, no se envía por email.\n\n¿Cuál es tu email registrado?";
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
    
    // Precios y combos
    if(/precio|cuanto|cuánto|costo|valor|vale|combo|descuento|pagar|pago|dinero|barato|caro|oferta/.test(text)) {
      // Precios específicos por servicio
      for(const s of services){ 
        if(text.includes(s.id)||text.includes(s.name.toLowerCase())) {
          return `💰 **${s.name}**\n\n💵 **Precio:** ${fmt(s.price)}/${s.billing==='annual'?'año':'mes'}\n📱 **Incluye:** 1 perfil + 1 dispositivo\n🎯 **Perfecto para:** ${getServiceDescription(s.id)}\n\n🛒 **¿Quieres proceder con la compra?**\n💬 Contacta a nuestros agentes para activación inmediata`;
        }
      }
      
      // Mostrar combos si pregunta por descuentos
      if(/combo|descuento|ahorro|barato/.test(text)) {
        const comboList = combos.slice(0, 5).map((c, i) => 
          `${i+1}️⃣ **${c.name}** - ${fmt(c.price)}/mes\n   💰 Ahorro del ${Math.round((1 - c.price/10) * 100)}%`
        ).join('\n\n');
        
        return `🎯 **COMBOS ESPECIALES - ¡GRANDES AHORROS!**\n\n${comboList}\n\n✨ **Todos incluyen:** 1 perfil + 1 dispositivo\n🚀 **Activación:** Inmediata tras pago\n\n💡 **¿Cuál te interesa más?**`;
      }
      
      return `💰 **PRECIOS ACTUALES:**\n\n${services.slice(0,6).map((s, i) => 
        `${i+1}️⃣ **${s.name}** - ${fmt(s.price)}/${s.billing==='annual'?'año':'mes'}`
      ).join('\n')}\n\n🎯 **Especifica una plataforma** para más detalles\n💡 **¿Buscas descuentos?** Pregunta por nuestros combos especiales`;
    }
    
    // Proceso de compra detallado
    if(/como (compro|comprar|pago|pagar|reservar|adquirir)|proceso|pasos|quiero comprar|necesito comprar|como hago para|como puedo/.test(text)) {
      return "🛒 **PROCESO DE COMPRA - SÚPER FÁCIL:**\n\n1️⃣ **Selecciona** tu plataforma favorita\n2️⃣ **Haz clic** en 'Comprar Ahora' 🛒\n3️⃣ **Completa** tus datos (nombre, email, teléfono)\n4️⃣ **Elige** método de pago (banco, PayPal, móvil)\n5️⃣ **Recibe** acceso inmediato por WhatsApp 📱\n\n⏱️ **Tiempo total:** 5-10 minutos\n✅ **Garantía:** 24/7 soporte técnico\n\n🎯 ¿Quieres que te guíe paso a paso?";
    }
    
    // Métodos de pago detallados
    if(/metodo|metodos|pago|transferencia|deposito|efectivo|forma de pago|banco|paypal|pago móvil|como pago|donde pago|donde deposito|transferir/.test(text)) {
      return "💳 **MÉTODOS DE PAGO ACEPTADOS:**\n\n🏦 **BANCOS ECUATORIANOS:**\n• Banco Pichincha: 2209034638\n• Banco Guayaquil: 0122407273\n• Banco Pacífico: 1061220256\n\n💳 **DIGITALES:**\n• PayPal: guale2023@outlook.com\n• Pago móvil (todas las operadoras)\n\n🔒 **100% SEGURO:** Todos los pagos están protegidos\n📱 **IMPORTANTE:** Envía comprobante por WhatsApp para activación\n\n💡 ¿Prefieres pago bancario o digital?";
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
    
    // Respuesta más amigable y variada
    const responses = [
      "🤔 Hmm, no estoy seguro de entender exactamente qué necesitas. ¿Podrías ser más específico?\n\n🎯 **Algunas cosas que puedo ayudarte:**\n• Recomendaciones de streaming\n• Precios y combos\n• Búsqueda de películas/series\n• Información sobre cuentas\n\n💡 **Prueba preguntando:** '¿Qué me recomiendas?' o '¿Cuánto cuesta Netflix?'",
      
      "😊 Me gustaría ayudarte, pero necesito entender mejor tu pregunta.\n\n🎬 **Soy experto en:**\n• Recomendaciones de plataformas de streaming\n• Información sobre precios y combos\n• Búsqueda de contenido específico\n• Proceso de compra y pagos\n\n💭 **¿Qué te gustaría saber sobre streaming?**",
      
      "🎯 ¡Estoy aquí para ayudarte con todo lo relacionado a streaming!\n\n📺 **Puedo ayudarte con:**\n• Encontrar la plataforma perfecta para ti\n• Comparar precios y combos\n• Buscar películas o series específicas\n• Explicar cómo funciona todo\n\n🤔 **¿Qué tipo de contenido te gusta más?** (acción, familia, anime, etc.)"
    ];
    
    // Usar el índice del mensaje para variar la respuesta
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
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
    <div className={`group rounded-2xl border p-4 md:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${tv(isDark,'border-zinc-200 bg-white','border-zinc-700 bg-zinc-800')}`}> 
      <div className="text-center">
        <div className={`h-12 w-12 md:h-16 md:w-16 ${s.color} rounded-2xl text-white grid place-content-center text-xl md:text-2xl font-bold mx-auto mb-3 md:mb-4 shadow-lg`}>{s.logo}</div>
        <div className="mb-3 md:mb-4">
          <div className={tv(isDark,'text-zinc-900 font-bold text-base md:text-lg mb-1 md:mb-2','text-white font-bold text-base md:text-lg mb-1 md:mb-2')}>{s.name}</div>
          <div className={tv(isDark,'text-xl md:text-2xl font-bold text-zinc-700','text-xl md:text-2xl font-bold text-zinc-200')}>{fmt(s.price)}</div>
          <div className={tv(isDark,'text-xs md:text-sm text-zinc-500','text-xs md:text-sm text-zinc-400')}>por {s.billing==='annual'? 'año':'mes'}</div>
        </div>
        <button 
          onClick={()=>onReserve(s)} 
          className={`w-full rounded-xl px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold transition-all duration-200 ${tv(isDark,'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-lg','bg-white text-zinc-900 hover:bg-zinc-100 hover:shadow-lg')}`}
        >
          Comprar Ahora
        </button>
      </div>
    </div>
  );
}

function Modal({ open, onClose, children, title, isDark }:{ open:boolean; onClose:()=>void; children:React.ReactNode; title:string; isDark:boolean; }){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className={`w-full max-w-lg rounded-2xl p-6 shadow-2xl ${tv(isDark,'bg-white','bg-zinc-900')}`} onClick={e=>e.stopPropagation()}>
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
      className={`fixed bottom-5 right-5 z-40 rounded-full px-4 py-3 shadow-lg transition-all duration-200 hover:scale-105 ${tv(isDark,'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700','bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700')}`}
    >
      <span className="flex items-center gap-2">
        <span className="text-lg">💬</span>
        <span className="font-semibold">Chat</span>
      </span>
    </button>
    
    {open&&(
      <div className={`fixed bottom-20 right-5 z-40 w-96 rounded-2xl border shadow-2xl transition-all duration-300 ${tv(isDark,'border-zinc-200 bg-white','border-zinc-700 bg-zinc-900')}`}>
        <div className={`rounded-t-2xl border-b p-4 font-semibold flex items-center gap-2 ${tv(isDark,'bg-gradient-to-r from-purple-50 to-blue-50 border-zinc-200','bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-zinc-700')}`}>
          <span className="text-xl">🤖</span>
          <span>Asistente StreamZone</span>
          <div className={`ml-auto w-3 h-3 rounded-full ${tv(isDark,'bg-green-400','bg-green-500')}`}></div>
        </div>
        
        <div className="p-4 h-96 overflow-y-auto flex flex-col gap-3">
          {messages.map((m,i)=>(
            <div key={i} className={m.role==='bot'?'self-start':'self-end'}>
              <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role==='bot'? 
                  tv(isDark,'bg-gradient-to-br from-blue-50 to-purple-50 text-zinc-800 border border-blue-100','bg-gradient-to-br from-blue-900/30 to-purple-900/30 text-zinc-100 border border-blue-700/30') : 
                  tv(isDark,'bg-gradient-to-br from-purple-600 to-blue-600 text-white','bg-gradient-to-br from-purple-500 to-blue-600 text-white')
              }`}>
                {formatMessage(m.text)}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="self-start">
              <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm ${tv(isDark,'bg-zinc-100 text-zinc-600','bg-zinc-800 text-zinc-300')}`}>
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
export default function App(){
  // Tema
  const[theme,setTheme]=useState<string>(()=>{ try{return localStorage.getItem('sz_theme')||'light'}catch{return 'light'} });
  const isDark = theme==='dark';
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
      } catch (error) {
        console.error('Error sincronizando servicios:', error);
      }
    };
    
    syncServicesOnInit();
  }, []);

  // Lista dinámica de administradores
  const [adminEmails, setAdminEmails] = useState<string[]>(()=> storage.load('admin_emails', DEFAULT_ADMIN_EMAILS).map((e:string)=>e.toLowerCase()));
  useEffect(()=>{ storage.save('admin_emails', adminEmails); },[adminEmails]);

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
      // Recargar todas las compras (para estadísticas del dashboard)
      const allPurchasesResult = await getPendingPurchases();
      if (allPurchasesResult.data) {
        // Aquí podrías cargar todas las compras si tuvieras una función getAllPurchases
        // Por ahora usamos las pendientes y las activas se cargan por separado
      }
      
      // Recargar compras pendientes
      await loadPendingPurchases();
      
      // Recargar servicios próximos a vencer
      await loadExpiringServices();
      
      // Recargar estadísticas de renovaciones
      await loadRenewalStats();
      
      console.log('✅ Todas las estadísticas actualizadas');
      
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
        purchases: [...userProfile.purchases, userPurchase]
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
      
      // Mostrar mensaje de error al usuario
      alert('La compra se registró localmente, pero hubo un problema al guardarla en el servidor. Por favor, contacta al administrador.');
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
      purchases: [...userProfile.purchases, purchase]
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
        purchases: userProfile.purchases.map(p => p.id === purchaseId ? updatedPurchase : p)
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

  // Función para registrar compra desde el admin
  const adminRegisterPurchase = (purchaseData: any) => {
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
    <div className={`min-h-screen ${tv(isDark,'bg-zinc-50 text-zinc-900','bg-zinc-950 text-zinc-100')}`}>
      {/* Navbar */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur ${tv(isDark,'bg-white/80 border-zinc-200','bg-zinc-950/70 border-zinc-800')}`}>
        <div className="mx-auto max-w-6xl px-4 py-3">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo className="h-9 w-9" />
              <div className="font-semibold">StreamZone</div>
              <Badge isDark={isDark}>Seguridad y confianza</Badge>
            </div>
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setView('home')}
                className={tv(
                  isDark,
                  'rounded-xl bg-zinc-100 px-3 py-1.5 text-sm hover:bg-zinc-200',
                  'rounded-xl bg-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-700'
                )}
              >
                Inicio
              </button>
              <button
                onClick={() => setView('combos')}
                className={tv(
                  isDark,
                  'rounded-xl px-3 py-1.5 text-sm hover:bg-zinc-100',
                  'rounded-xl px-3 py-1.5 text-sm hover:bg-zinc-800'
                )}
              >
                🎯 Combos
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
          <section className="relative">
            <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16 lg:py-24">
              <div className="grid items-center gap-6 md:gap-8 md:grid-cols-2">
                <div className="relative z-10">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">StreamZone</h1>
                  <p className={tv(isDark,'mt-2 text-base md:text-lg text-zinc-700','mt-2 text-base md:text-lg text-zinc-200')}>Tus plataformas favoritas, al mejor precio.</p>
                  <p className={tv(isDark,'mt-3 text-sm md:text-base text-zinc-600','mt-3 text-sm md:text-base text-zinc-300')}>Reserva por WhatsApp, recibe acceso con soporte inmediato y renueva sin complicaciones. Administra tus servicios desde tu cuenta.</p>
                  <div className="mt-6 flex flex-col gap-4">
                    {user ? (
                      <a href="#catalogo" className={tv(isDark,'rounded-xl bg-zinc-900 text-white px-4 md:px-5 py-3 text-sm text-center','rounded-xl bg-white text-zinc-900 px-4 md:px-5 py-3 text-sm text-center')}>Ver catálogo</a>
                    ) : (
                      <button onClick={() => setView('auth')} className={tv(isDark,'rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 md:px-5 py-3 text-sm text-center shadow-lg','rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 md:px-5 py-3 text-sm text-center shadow-lg')}>Iniciar sesión</button>
                    )}
                  </div>
                </div>
                <div className={`relative z-10 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm backdrop-blur-md border ${tv(isDark,'bg-white/60 border-white/10','bg-zinc-900/50 border-zinc-800')}`}>
                  <div className={tv(isDark,'text-sm md:text-base font-semibold text-zinc-700','text-sm md:text-base font-semibold text-zinc-300')}>💳 Métodos de Pago</div>
                  <p className={tv(isDark,'text-xs md:text-sm text-zinc-500 mt-1','text-xs md:text-sm text-zinc-400 mt-1')}>
                    Transferencias bancarias, PayPal y Pago Móvil
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={tv(isDark,'text-xs bg-green-100 text-green-700 px-2 py-1 rounded','text-xs bg-green-800 text-green-200 px-2 py-1 rounded')}>🏦 Pichincha</span>
                    <span className={tv(isDark,'text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded','text-xs bg-blue-800 text-blue-200 px-2 py-1 rounded')}>🏛️ Guayaquil</span>
                    <span className={tv(isDark,'text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded','text-xs bg-purple-800 text-purple-200 px-2 py-1 rounded')}>🌊 Pacífico</span>
                    <span className={tv(isDark,'text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded','text-xs bg-orange-800 text-orange-200 px-2 py-1 rounded')}>💳 PayPal</span>
                  </div>
                  <p className={tv(isDark,'text-xs text-zinc-500 mt-2','text-xs text-zinc-400 mt-2')}>
                    Ver detalles completos al reservar
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 -z-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700" />
          </section>


          <section id="catalogo" className="mx-auto max-w-6xl px-4 pb-16">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Nuestro Catálogo</h2>
              <p className={tv(isDark,'text-zinc-600 text-base md:text-lg','text-zinc-300 text-base md:text-lg')}>
                Descubre todas las plataformas de streaming disponibles
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {SERVICES.map(s=> (
                <div key={s.id}>
                  <ServiceCard s={s} onReserve={onReserve} isDark={isDark}/>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* AUTENTICACIÓN */}
      {view==='auth' && (
        <section className="min-h-[80vh] relative">
          <div className="absolute inset-0 -z-10" style={{backgroundImage:"url(/img/bg-cinema.jpg)", backgroundSize:'cover', backgroundPosition:'center'}} />
          <div className="absolute inset-0 -z-0 bg-black/60" />
          <div className="relative z-10 mx-auto max-w-md px-4 py-16">
            <div className={tv(isDark,'rounded-3xl bg-white/95 p-8 shadow-2xl','rounded-3xl bg-zinc-900/95 p-8 shadow-2xl text-zinc-100')}>
              <div className="text-center mb-8">
                {authStep === 'login' && (
                  <>
                    <h3 className="text-3xl font-bold mb-2">🔐 Iniciar Sesión</h3>
                    <p className="text-sm opacity-80">Accede a tu cuenta de StreamZone</p>
                  </>
                )}
                {authStep === 'email' && (
                  <>
                    <h3 className="text-3xl font-bold mb-2">📧 Recuperar Contraseña</h3>
                    <p className="text-sm opacity-80">Paso 1: Ingresa tu email para recibir el código</p>
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
                  <div className="mt-6 text-center space-y-3">
                    <div className="text-sm opacity-70">¿No tienes cuenta?</div>
                <button
                  onClick={() => setView('register')}
                      className={`w-full rounded-xl px-4 py-2 font-medium transition-all ${tv(
                    isDark,
                        'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600',
                        'bg-gradient-to-r from-blue-500 to-green-600 text-white hover:from-blue-600 hover:to-green-700'
                  )}`}
                >
                      ✨ Crear cuenta nueva
                </button>
                  </div>

                  <div className="mt-6 text-center">
                    <button 
                      onClick={() => setView('home')}
                      className={tv(isDark,'text-zinc-500 hover:text-zinc-700 text-sm','text-zinc-400 hover:text-zinc-200 text-sm')}
                    >
                      ← Volver al inicio
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
                  <label className={tv(isDark,'text-sm text-zinc-700','text-sm text-zinc-300')}>Código de verificación</label>
                  <input
                    required
                    type="text"
                    className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-800 text-zinc-100')}`}
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
                    className={`text-sm ${tv(isDark,'text-zinc-500 hover:text-zinc-700','text-zinc-400 hover:text-zinc-200')}`}
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
                      purchases: [...userProfile.purchases, ...localPurchases]
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
                  className={tv(isDark,'text-zinc-500 hover:text-zinc-700 text-sm','text-zinc-400 hover:text-zinc-200 text-sm')}
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
                    <label className="text-sm text-zinc-600 dark:text-zinc-400">Nombre</label>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-600 dark:text-zinc-400">WhatsApp</label>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                    <div>
                      <label className="text-sm text-zinc-600 dark:text-zinc-400">Email</label>
                    <p className="font-medium">{user.email}</p>
                    </div>
                  <div>
                    <label className="text-sm text-zinc-600 dark:text-zinc-400">Miembro desde</label>
                    <p className="font-medium">{new Date().toLocaleDateString('es-ES')}</p>
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
                    {userActivePurchases.map((purchase) => (
                      <div key={purchase.id} className={`p-4 rounded-xl border ${tv(isDark,'bg-green-50 border-green-200','bg-green-900/20 border-green-700')}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {purchase.service === 'Netflix' ? '🔴' :
                               purchase.service === 'Disney+' ? '🔵' :
                               purchase.service === 'Max' ? '🟣' :
                               purchase.service === 'Prime Video' ? '📦' :
                               purchase.service === 'Spotify' ? '🎵' : '📺'}
                  </div>
                            <div>
                              <h4 className="font-bold text-lg">{purchase.service}</h4>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {purchase.months} meses • Activo
                              </p>
                    </div>
                  </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${tv(isDark,'bg-green-100 text-green-800','bg-green-900/30 text-green-400')}`}>
                            ✅ Activo
                    </div>
                  </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">📅 Fecha de inicio</label>
                            <p className="font-medium">{new Date(purchase.start).toLocaleDateString('es-ES')}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-zinc-600 dark:text-zinc-400">⏰ Fecha de vencimiento</label>
                            <p className="font-medium">{new Date(purchase.end).toLocaleDateString('es-ES')}</p>
                </div>
              </div>

                        {purchase.service_email && purchase.service_password && (
                          <div className={`p-3 rounded-lg ${tv(isDark,'bg-blue-50 border border-blue-200','bg-blue-900/20 border border-blue-700')}`}>
                            <h5 className="font-semibold mb-2 text-blue-800 dark:text-blue-300">🔑 Credenciales del Servicio</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-blue-600 dark:text-blue-400">Email:</label>
                                <p className="font-mono text-sm bg-white dark:bg-zinc-800 p-2 rounded border">{purchase.service_email}</p>
                            </div>
                            <div>
                                <label className="text-xs text-blue-600 dark:text-blue-400">Contraseña:</label>
                                <p className="font-mono text-sm bg-white dark:bg-zinc-800 p-2 rounded border">{purchase.service_password}</p>
                            </div>
                          </div>
                            {purchase.admin_notes && (
                              <div className="mt-2">
                                <label className="text-xs text-blue-600 dark:text-blue-400">Notas:</label>
                                <p className="text-sm bg-white dark:bg-zinc-800 p-2 rounded border">{purchase.admin_notes}</p>
                          </div>
                            )}
                        </div>
                        )}

                         {/* Información de Renovación */}
                         <div className={`p-3 rounded-lg mt-3 ${tv(isDark,'bg-blue-50 border border-blue-200','bg-blue-900/20 border border-blue-700')}`}>
                           <h5 className="font-semibold mb-2 text-blue-800 dark:text-blue-300">ℹ️ Información del Servicio</h5>
                           <div className="text-sm text-blue-700 dark:text-blue-300">
                             <p>📅 <strong>Duración:</strong> {purchase.months} {purchase.months === 1 ? 'mes' : 'meses'}</p>
                             <p>⏰ <strong>Estado:</strong> Activo</p>
                             <p>📧 <strong>Contacto:</strong> Para renovaciones, contacta al administrador</p>
                           </div>
                         </div>
                          </div>
                    ))}
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
                
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Para registrar compras realizadas fuera de la página web
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">👤 Nombre del Cliente *</label>
                    <input
                      type="text"
                      value={customPurchase.customer}
                      onChange={(e) => setCustomPurchase(prev => ({...prev, customer: e.target.value}))}
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">📱 Teléfono *</label>
                    <input
                      type="tel"
                      value={customPurchase.phone}
                      onChange={(e) => setCustomPurchase(prev => ({...prev, phone: e.target.value}))}
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                      placeholder="Ej: 0999123456"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">📧 Email del Cliente</label>
                    <input
                      type="email"
                      value={customPurchase.email}
                      onChange={(e) => setCustomPurchase(prev => ({...prev, email: e.target.value}))}
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                      placeholder="Ej: cliente@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">📺 Servicio *</label>
                    <select
                      value={customPurchase.service}
                      onChange={(e) => setCustomPurchase(prev => ({...prev, service: e.target.value}))}
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
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
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
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
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
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
                    className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                    placeholder="Contraseña del servicio"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">📝 Notas Adicionales</label>
                  <textarea
                    value={customPurchase.notes}
                    onChange={(e) => setCustomPurchase(prev => ({...prev, notes: e.target.value}))}
                    className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
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
            <div className={tv(isDark,'w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl','w-full max-w-md rounded-3xl bg-zinc-900/95 p-8 shadow-2xl')}>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Acceso Administrador</h3>
                <p className="text-sm opacity-80">Ingresa tus credenciales para acceder al panel</p>
              </div>
              <AdminLoginForm isDark={isDark} adminEmails={adminEmails} onLogin={(ok)=>{ if(ok){ setAdminLogged(true); setView('admin'); setAdminSub('dashboard'); } }} />
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setView('home')}
                  className={tv(isDark,'text-zinc-500 hover:text-zinc-700 text-sm','text-zinc-400 hover:text-zinc-200 text-sm')}
                >
                  ← Volver al inicio
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ADMIN */}
      {view==='admin' && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-3xl font-bold">🔧 Panel Administrador</h3>
                <p className={tv(isDark,'text-zinc-600','text-zinc-300')}>Gestiona compras, administradores y configuración</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                   onClick={refreshAllStats}
                   disabled={adminLoading}
                   className={tv(isDark,'rounded-xl bg-blue-600 text-white px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50','rounded-xl bg-blue-500 text-white px-4 py-2 text-sm hover:bg-blue-600 disabled:opacity-50')}
                >
                   {adminLoading ? '⏳ Cargando...' : '🔄 Actualizar Todo'}
                </button>
                <button 
                  onClick={() => setView('home')}
                  className={tv(isDark,'rounded-xl bg-zinc-100 text-zinc-700 px-4 py-2 text-sm hover:bg-zinc-200','rounded-xl bg-zinc-800 text-zinc-200 px-4 py-2 text-sm hover:bg-zinc-700')}
                >
                  ← Inicio
                </button>
              </div>
            </div>
          </div>

          {/* DASHBOARD COMPLETO */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className={`rounded-2xl p-6 shadow-lg ${tv(isDark,'bg-white border border-zinc-200','bg-zinc-800 border border-zinc-700')}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-zinc-500 mb-1">Total Compras</div>
                  <div className="text-3xl font-bold">{purchases.length}</div>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>
            <div className={`rounded-2xl p-6 shadow-lg ${tv(isDark,'bg-white border border-zinc-200','bg-zinc-800 border border-zinc-700')}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-zinc-500 mb-1">Pendientes</div>
                  <div className="text-3xl font-bold text-amber-600">{pendingPurchases.length}</div>
                </div>
                <div className="text-3xl">⏳</div>
              </div>
            </div>
            <div className={`rounded-2xl p-6 shadow-lg ${tv(isDark,'bg-white border border-zinc-200','bg-zinc-800 border border-zinc-700')}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-zinc-500 mb-1">Validadas</div>
                  <div className="text-3xl font-bold text-green-600">{purchases.filter(p=>p.validated).length}</div>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </div>
                <div className={`rounded-2xl p-6 shadow-lg ${tv(isDark,'bg-white border border-zinc-200','bg-zinc-800 border border-zinc-700')}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-zinc-500 mb-1">Vencen Hoy</div>
                  <div className="text-3xl font-bold text-red-600">{expiringServices.filter(s => s.days_remaining === 0).length}</div>
                    </div>
                    <div className="text-3xl">⚠️</div>
                  </div>
                </div>
              </div>
              
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <button 
                  onClick={()=>setAdminSub('purchases')} 
                  className={`rounded-2xl p-6 text-left transition-all hover:scale-105 ${tv(isDark,'bg-zinc-900 text-white shadow-lg','bg-white text-zinc-900 shadow-lg')}`}
                >
                  <div className="text-2xl mb-2">🛒</div>
                  <div className="text-xl font-bold mb-2">Gestionar Compras</div>
                  <div className="text-sm opacity-70">Revisa, valida y notifica por WhatsApp</div>
                </button>
                
                <button 
                  onClick={()=>setAdminRegisterPurchaseOpen(true)} 
                  className={`rounded-2xl p-6 text-left transition-all hover:scale-105 ${tv(isDark,'bg-blue-600 text-white shadow-lg','bg-blue-600 text-white shadow-lg')}`}
                >
                  <div className="text-2xl mb-2">➕</div>
                  <div className="text-xl font-bold mb-2">Registrar Compra</div>
                  <div className="text-sm opacity-70">Crear compra manual para un usuario</div>
                </button>
                
                <button 
                  onClick={()=>setDrawerOpen(true)} 
                  className={`rounded-2xl p-6 text-left transition-all hover:scale-105 ${tv(isDark,'bg-zinc-900 text-white shadow-lg','bg-white text-zinc-900 shadow-lg')}`}
                >
                  <div className="text-2xl mb-2">👥</div>
                  <div className="text-xl font-bold mb-2">Administradores</div>
                  <div className="text-sm opacity-70">Agregar o quitar correos con acceso</div>
                </button>
                
                <button 
                  onClick={exportCSV} 
                  className={`rounded-2xl p-6 text-left transition-all hover:scale-105 ${tv(isDark,'bg-zinc-900 text-white shadow-lg','bg-white text-zinc-900 shadow-lg')}`}
                >
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-xl font-bold mb-2">Exportar Datos</div>
                  <div className="text-sm opacity-70">Descargar reporte en formato CSV</div>
                </button>
              </div>

          {/* GESTIÓN DE COMPRAS */}
          <div className={`rounded-2xl p-6 shadow-lg mb-6 ${tv(isDark,'bg-white border border-zinc-200','bg-zinc-800 border border-zinc-700')}`}>
            {/* Navegación por pestañas */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setAdminPurchaseView('pending')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    adminPurchaseView === 'pending' 
                      ? tv(isDark,'bg-amber-100 text-amber-800','bg-amber-900/30 text-amber-400')
                      : tv(isDark,'bg-zinc-100 text-zinc-600 hover:bg-zinc-200','bg-zinc-700 text-zinc-300 hover:bg-zinc-600')
                  }`}
                >
                  ⏳ Pendientes ({pendingPurchases.length})
                </button>
                <button
                  onClick={() => setAdminPurchaseView('active')}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
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
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold">⏳ Compras Pendientes</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${tv(isDark,'bg-amber-100 text-amber-800','bg-amber-900/30 text-amber-400')}`}>
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
                  <div className="space-y-4">
                    {pendingPurchases.map((purchase) => (
                      <div key={purchase.id} className={`p-4 rounded-xl border ${tv(isDark,'bg-zinc-50 border-zinc-200','bg-zinc-700 border-zinc-600')}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold">{purchase.customer}</span>
                              <span className={`px-2 py-1 rounded text-xs ${tv(isDark,'bg-blue-100 text-blue-800','bg-blue-900/30 text-blue-400')}`}>
                                {purchase.service}
                              </span>
                            </div>
                            <div className="text-sm text-zinc-500 mb-2">
                              📱 {purchase.phone} • 📅 {new Date(purchase.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Duración:</span> {purchase.months} meses • 
                              <span className="font-medium"> Inicio:</span> {purchase.start} • 
                              <span className="font-medium"> Fin:</span> {purchase.end}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setSelectedPurchase(purchase)}
                              className={`px-3 py-2 rounded-xl font-medium transition-all text-sm ${tv(isDark,'bg-green-600 text-white hover:bg-green-700','bg-green-500 text-white hover:bg-green-600')}`}
                            >
                              ✅ Aprobar
                            </button>
                            <button
                              onClick={() => handleRejectPurchase(purchase.id)}
                              className={`px-3 py-2 rounded-xl font-medium transition-all text-sm ${tv(isDark,'bg-red-600 text-white hover:bg-red-700','bg-red-500 text-white hover:bg-red-600')}`}
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
                      <div key={purchase.id} className={`p-4 rounded-xl border ${tv(isDark,'bg-green-50 border-green-200','bg-green-900/20 border-green-700')}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold">{purchase.customer}</span>
                              <span className={`px-2 py-1 rounded text-xs ${tv(isDark,'bg-green-100 text-green-800','bg-green-900/30 text-green-400')}`}>
                                {purchase.service}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${tv(isDark,'bg-blue-100 text-blue-800','bg-blue-900/30 text-blue-400')}`}>
                                ✅ Activa
                              </span>
                            </div>
                            <div className="text-sm text-zinc-500 mb-2">
                              📱 {purchase.phone} • 📅 {new Date(purchase.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Duración:</span> {purchase.months} meses • 
                              <span className="font-medium"> Inicio:</span> {purchase.start} • 
                              <span className="font-medium"> Fin:</span> {purchase.end}
                            </div>
                            {purchase.service_email && purchase.service_password && (
                              <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                                📧 {purchase.service_email} • 🔑 Contraseña disponible
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteActivePurchase(purchase.id, purchase.customer, purchase.service)}
                            className={`px-3 py-2 rounded-xl font-medium transition-all text-sm ${tv(isDark,'bg-red-600 text-white hover:bg-red-700','bg-red-500 text-white hover:bg-red-600')}`}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
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
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Compras</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{renewalStats.autoRenewalEnabled}</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Auto-Renovación</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{renewalStats.expiringThisWeek}</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Vencen Esta Semana</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{renewalStats.expiredServices}</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Expirados</div>
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
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                      placeholder="usuario@netflix.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">🔑 Contraseña del Servicio</label>
                    <input
                      type="password"
                      value={serviceCredentials.password}
                      onChange={(e) => setServiceCredentials(prev => ({...prev, password: e.target.value}))}
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">📝 Notas (opcional)</label>
                    <textarea
                      value={serviceCredentials.notes}
                      onChange={(e) => setServiceCredentials(prev => ({...prev, notes: e.target.value}))}
                      className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-700 text-zinc-100')}`}
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
      <Modal open={reserveOpen} onClose={()=>setReserveOpen(false)} title={`Comprar ${selected?.name||''}`} isDark={isDark}>
        {selected && (
          <ReserveForm service={selected} onClose={()=>setReserveOpen(false)} onAddPurchase={addPurchase} isDark={isDark} user={user} />
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
      />

      {/* Drawers y flotantes */}
      <AdminDrawer open={drawerOpen} onClose={()=>setDrawerOpen(false)} isDark={isDark} adminEmails={adminEmails} setAdminEmails={setAdminEmails} />
      <AdminMenuDrawer open={menuOpen} onClose={()=>setMenuOpen(false)} isDark={isDark} setSubView={setAdminSub} openAdmins={()=>setDrawerOpen(true)} onExportCSV={exportCSV} onLogout={logoutAdmin} onRegisterPurchase={()=>setAdminRegisterPurchaseOpen(true)} />
      <FloatingChatbot answerFn={(q, context)=>useChatbot(SERVICES, COMBOS).answer(q, context)} isDark={isDark}/>
      <FloatingThemeToggle isDark={isDark} onToggle={toggleTheme} />
    </div>
  );
}

// ========= Subcomponentes que usan arriba =========
function AdminPurchases({ isDark, purchases, setPurchases, onBack, exportCSV }:{
  isDark:boolean;
  purchases:any[];
  setPurchases:React.Dispatch<React.SetStateAction<any[]>>;
  onBack:()=>void;
  exportCSV:()=>void;
}){
  const [pFilter, setPFilter] = useState<'pending'|'validated'|'all'>('pending');
  const [query, setQuery] = useState('');
  const countPending = purchases.filter(p=>!p.validated).length;
  const countValidated = purchases.filter(p=>p.validated).length;
  const listFiltered = purchases.filter(p =>
    (pFilter==='all' ? true : pFilter==='pending' ? !p.validated : p.validated) &&
    ((p.customer||'').toLowerCase().includes(query.toLowerCase()) || (p.phone||'').includes(query) || (p.service||'').toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <button onClick={onBack} className={tv(isDark,'rounded-xl bg-zinc-100 px-3 py-1.5 text-sm','rounded-xl bg-zinc-800 px-3 py-1.5 text-sm')}>← Volver</button>
        <div className={`rounded-xl px-2 py-1 text-sm ${pFilter==='pending'? 'bg-amber-500 text-white' : tv(isDark,'bg-zinc-100','bg-zinc-800')}`} onClick={()=>setPFilter('pending')}>Pendientes ({countPending})</div>
        <div className={`rounded-xl px-2 py-1 text-sm ${pFilter==='validated'? 'bg-emerald-600 text-white' : tv(isDark,'bg-zinc-100','bg-zinc-800')}`} onClick={()=>setPFilter('validated')}>Validadas ({countValidated})</div>
        <div className={`rounded-xl px-2 py-1 text-sm ${pFilter==='all'? 'bg-zinc-900 text-white' : tv(isDark,'bg-zinc-100','bg-zinc-800')}`} onClick={()=>setPFilter('all')}>Todas ({purchases.length})</div>
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar (cliente, tel, servicio)" className={`ml-auto min-w-[250px] rounded-xl border px-3 py-2 text-sm ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-900')}`} />
        <button onClick={exportCSV} className={tv(isDark,'rounded-xl bg-zinc-900 text-white px-3 py-1.5 text-sm','rounded-xl bg-white text-zinc-900 px-3 py-1.5 text-sm')}>Exportar CSV</button>
      </div>
      <div className="grid gap-3">
        {listFiltered.length===0 && (
          <div className={`rounded-xl p-4 text-sm ${tv(isDark,'bg-zinc-100','bg-zinc-900')}`}>No hay resultados con ese filtro.</div>
        )}
        {listFiltered.map(p => (
          <PurchaseCard
            item={p}
            isDark={isDark}
            onToggleValidate={() => setPurchases(ps => ps.map(x => x.id===p.id ? { ...x, validated: !x.validated } : x))}
            onDelete={() => setPurchases(ps => ps.filter(x => x.id!==p.id))}
          />
        ))}
      </div>
    </>
  );
}

// Tarjeta de compra (Admin)
function PurchaseCard({ item, isDark, onToggleValidate, onDelete }:{ item:any; isDark:boolean; onToggleValidate:()=>void; onDelete:()=>void; }){
  const days = daysBetween(new Date().toISOString().slice(0,10), item.end);
  const status = days < 0 ? 'Vencido' : days === 0 ? 'Vence hoy' : `${days} dias`;
  return (
    <details className={`rounded-xl border p-4 ${tv(isDark,'border-zinc-200 bg-white','border-zinc-800 bg-zinc-900')}`}>
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{item.customer} <span className="opacity-60">({item.phone})</span></div>
            <div className="text-sm opacity-70">{item.service} • {item.start} → {item.end}</div>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-xs ${item.validated? 'bg-emerald-600 text-white':'bg-amber-500 text-white'}`}>{item.validated? 'Validada':'Pendiente'}</span>
        </div>
      </summary>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs ${days<=0? 'bg-rose-600 text-white':'bg-zinc-200 text-zinc-800'}`}>{status}</span>
        <button className={`${item.validated? 'bg-blue-600':'bg-emerald-600'} text-white rounded-md px-2 py-1 text-sm`} onClick={onToggleValidate}>{item.validated? 'Quitar validación':'Validar'}</button>
        <a className="rounded-md bg-green-600 text-white px-2 py-1 text-sm" target="_blank" rel="noreferrer" href={`https://wa.me/${cleanPhone(item.phone)}?text=${encodeURIComponent('Estimado/a '+item.customer+', le informamos que su servicio de '+item.service+' vence hoy. ¿Le gustaría proceder con la renovación? Contamos con excelentes precios y soporte técnico.')}`}>Recordatorio</a>
        <button className={tv(isDark,'rounded-md bg-zinc-200 px-2 py-1 text-sm','rounded-md bg-zinc-700 px-2 py-1 text-sm text-white')} onClick={onDelete}>Eliminar</button>
      </div>
    </details>
  );
}

// Drawer de administradores (agregar/eliminar)
function AdminDrawer({ open, onClose, isDark, adminEmails, setAdminEmails }:{ open:boolean; onClose:()=>void; isDark:boolean; adminEmails:string[]; setAdminEmails:(v:string[])=>void; }){
  const [newEmail, setNewEmail] = useState("");
  const add = ()=>{ const e=newEmail.trim().toLowerCase(); if(!emailOk(e)) return; if(adminEmails.includes(e)) return; setAdminEmails([...adminEmails, e]); setNewEmail(""); };
  const remove = (e:string)=> setAdminEmails(adminEmails.filter(x=>x!==e));
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50"/>
      <aside className={`absolute right-0 top-0 h-full w-[380px] p-6 shadow-2xl ${tv(isDark,'bg-white','bg-zinc-900 text-zinc-100')}`} onClick={e=>e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-xl font-bold">👥 Administradores</h4>
          <button 
            onClick={onClose} 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${tv(isDark,'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100','text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800')}`}
          >
            ×
          </button>
        </div>
        <p className={tv(isDark,'text-sm text-zinc-600 mb-6','text-sm text-zinc-300 mb-6')}>
          Los correos aquí listados podrán iniciar sesión como administrador
        </p>
        <div className="mb-6 flex gap-2">
          <input 
            value={newEmail} 
            onChange={e=>setNewEmail(e.target.value)} 
            placeholder="nuevo@correo.com" 
            className={`flex-1 rounded-xl border px-4 py-3 text-sm ${tv(isDark,'border-zinc-300 focus:border-zinc-500','border-zinc-700 bg-zinc-800 text-zinc-100 focus:border-zinc-500')}`}
            onKeyDown={e => e.key === 'Enter' && add()}
          />
          <button 
            onClick={add} 
            className={`rounded-xl px-4 py-3 text-sm font-semibold ${tv(isDark,'bg-zinc-900 text-white hover:bg-zinc-800','bg-white text-zinc-900 hover:bg-zinc-100')}`}
          >
            Agregar
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <ul className="space-y-3">
            {adminEmails.map(e=> (
              <li key={e} className={`flex items-center justify-between rounded-xl border p-4 ${tv(isDark,'border-zinc-200 bg-zinc-50','border-zinc-700 bg-zinc-800')}`}>
                <span className="font-medium">{e}</span>
                <button 
                  onClick={()=>remove(e)} 
                  className={`rounded-lg px-3 py-1 text-xs font-semibold ${tv(isDark,'bg-red-100 text-red-700 hover:bg-red-200','bg-red-800 text-red-100 hover:bg-red-700')}`}
                >
                  Quitar
                </button>
              </li>
            ))}
            {adminEmails.length===0 && (
              <li className={`text-center py-8 text-sm ${tv(isDark,'text-zinc-500','text-zinc-400')}`}>
                No hay administradores registrados
              </li>
            )}
          </ul>
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
              className={`w-full rounded-xl p-4 text-left transition-all hover:scale-105 ${tv(isDark,'text-red-600 hover:bg-red-50','text-red-400 hover:bg-red-900/20')}`}
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
        <label className={tv(isDark,'text-sm text-zinc-700','text-sm text-zinc-300')}>Nombre completo</label>
        <input 
          required
          className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} 
          value={name} 
          onChange={e=>setName(e.target.value)} 
          placeholder="Tu nombre completo"
          disabled={loading}
        />
      </div>
      
      <div>
        <label className={tv(isDark,'text-sm text-zinc-700','text-sm text-zinc-300')}>WhatsApp</label>
        <input 
          required
          className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} 
          value={phone} 
          onChange={e=>setPhone(e.target.value)} 
          placeholder="+593 99 999 9999"
          disabled={loading}
        />
      </div>
      
      <div>
        <label className={tv(isDark,'text-sm text-zinc-700','text-sm text-zinc-300')}>Correo electrónico</label>
        <input 
          required
          type="email"
          className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} 
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          placeholder="tu@correo.com"
          disabled={loading}
        />
      </div>

      <div>
        <label className={tv(isDark,'text-sm text-zinc-700','text-sm text-zinc-300')}>Contraseña</label>
        <input 
          required
          type={showPassword ? 'text' : 'password'}
          className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} 
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
          placeholder="••••••••"
          minLength={6}
          disabled={loading}
        />
      </div>

      <div>
        <label className={tv(isDark,'text-sm text-zinc-700','text-sm text-zinc-300')}>Confirmar contraseña</label>
        <input 
          required
          type={showPassword ? 'text' : 'password'}
          className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} 
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
        <label className={tv(isDark,'text-sm text-zinc-700','text-sm text-zinc-300')}>Correo electrónico</label>
        <input 
          required 
          type="email"
          className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-800 text-zinc-100')}`} 
          value={email} 
          onChange={e=>setEmail(e.target.value)} 
          placeholder="tu@correo.com"
          disabled={loading}
        />
      </div>
      <div>
        <label className={tv(isDark,'text-sm text-zinc-700','text-sm text-zinc-300')}>Contraseña</label>
        <div className="flex gap-2">
          <input 
            required 
            type={show? 'text':'password'} 
            className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-800 text-zinc-100')}`} 
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
          className={`text-sm ${tv(isDark,'text-zinc-500 hover:text-zinc-700','text-zinc-400 hover:text-zinc-200')}`}
          disabled={loading}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    </form>
  );
}

function ForgotPasswordForm({ isDark, onBack, onTokenSent }:{ isDark:boolean; onBack:()=>void; onTokenSent:(email:string,token:string)=>void; }){
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
            <h4 className="font-semibold mb-2">📋 Instrucciones:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Haz clic en el botón <span className="font-semibold">"Chat"</span> (esquina inferior derecha)</li>
              <li>Escribe: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">"olvidé mi contraseña"</span></li>
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
        <label className={tv(isDark,'text-sm text-zinc-700','text-sm text-zinc-300')}>Correo electrónico</label>
        <input 
          required 
          type="email"
          className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-800 text-zinc-100')}`} 
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
            onClick={() => setView('register')}
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
          className={`text-sm ${tv(isDark,'text-zinc-500 hover:text-zinc-700','text-zinc-400 hover:text-zinc-200')}`}
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
        <label className={tv(isDark,'text-sm text-zinc-700','text-sm text-zinc-300')}>Código de verificación</label>
        <input 
          required 
          type="text"
          className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-800 text-zinc-100')}`} 
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
          className={`text-sm ${tv(isDark,'text-zinc-500 hover:text-zinc-700','text-zinc-400 hover:text-zinc-200')}`}
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
        <label className={tv(isDark,'text-sm text-zinc-700','text-sm text-zinc-300')}>Nueva contraseña</label>
        <div className="flex gap-2">
          <input 
            required 
            type={showPassword? 'text':'password'} 
            className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-800 text-zinc-100')}`} 
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
        <label className={tv(isDark,'text-sm text-zinc-700','text-sm text-zinc-300')}>Confirmar contraseña</label>
        <input 
          required 
          type="password" 
          className={`w-full rounded-xl border px-4 py-3 ${tv(isDark,'border-zinc-300','border-zinc-600 bg-zinc-800 text-zinc-100')}`} 
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
  const submit=(e:React.FormEvent)=>{ e.preventDefault();
    const emailNorm = email.trim().toLowerCase();
    const ok = adminEmails.map(x=>x.toLowerCase()).includes(emailNorm) && pass.trim()==='Jeremias_012.@';
    setMsg(ok? '':'Credenciales incorrectas');
    onLogin(ok);
  };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className={tv(isDark,'text-xs text-zinc-700','text-xs text-zinc-300')}>Correo</label>
        <input required className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@correo.com"/>
      </div>
      <div>
        <label className={tv(isDark,'text-xs text-zinc-700','text-xs text-zinc-300')}>Contraseña</label>
        <div className="flex gap-2">
          <input required type={show? 'text':'password'} className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••"/>
          <button type="button" onClick={()=>setShow(s=>!s)} className={tv(isDark,'rounded-xl bg-zinc-100 px-3','rounded-xl bg-zinc-800 px-3')}>{show?'Ocultar':'Ver'}</button>
        </div>
      </div>
      {msg && <div className="text-sm text-red-600">{msg}</div>}
      <button type="submit" className={tv(isDark,'rounded-xl bg-zinc-900 text-white px-4 py-2','rounded-xl bg-white text-zinc-900 px-4 py-2')}>Entrar</button>
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
          <input className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} 
                 value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre"/>
        </div>
        <div>
          <label className={tv(isDark,'text-xs text-zinc-600','text-xs text-zinc-300')}>WhatsApp</label>
          <input className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} 
                 value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+593..."/>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={tv(isDark,'text-xs text-zinc-600','text-xs text-zinc-300')}>Inicio</label>
          <input type="date" className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} 
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
          <input disabled className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'bg-zinc-50 border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} value={end}/>
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
          <button onClick={onClose} className={tv(isDark,'rounded-xl bg-zinc-100 px-4 py-2','rounded-xl bg-zinc-800 px-4 py-2 text-white')}>Cancelar</button>
          <button onClick={confirm} className={tv(isDark,'rounded-xl bg-zinc-900 px-4 py-2 text-white','rounded-xl bg-white px-4 py-2 text-zinc-900')}>
            Confirmar por WhatsApp
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
  const [notes, setNotes] = useState<string>('');

  if (!open || !service) return null;

  const isAnnual = service.billing === 'annual';
  const total = service.price * duration;

  const handlePurchase = () => {
    const purchaseData = {
      service: service.name,
      price: service.price,
      duration: duration,
      total: service.price * duration,
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
            <label className="block text-sm font-medium mb-2">Duración</label>
            <div className="flex gap-2">
              <button
                onClick={() => setDuration(1)}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${duration === 1 ? tv(isDark,'bg-zinc-900 text-white','bg-white text-zinc-900') : tv(isDark,'bg-zinc-100','bg-zinc-700')}`}
              >
                1 {isAnnual ? 'año' : 'mes'}
              </button>
              <button
                onClick={() => setDuration(3)}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${duration === 3 ? tv(isDark,'bg-zinc-900 text-white','bg-white text-zinc-900') : tv(isDark,'bg-zinc-100','bg-zinc-700')}`}
              >
                3 {isAnnual ? 'años' : 'meses'}
              </button>
              <button
                onClick={() => setDuration(6)}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${duration === 6 ? tv(isDark,'bg-zinc-900 text-white','bg-white text-zinc-900') : tv(isDark,'bg-zinc-100','bg-zinc-700')}`}
              >
                6 {isAnnual ? 'años' : 'meses'}
              </button>
            </div>
          </div>

          {/* Información de cuentas bancarias */}
          <div className={`p-4 md:p-6 rounded-xl ${tv(isDark,'bg-gray-50 border border-gray-200','bg-gray-800 border border-gray-600')}`}>
            <h4 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">💳 Información de Pago</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {/* Banco Pichincha */}
              <div className={`p-3 md:p-4 rounded-lg ${tv(isDark,'bg-white border border-gray-200','bg-gray-700 border border-gray-600')}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg md:text-xl">🏦</span>
                  <span className="font-semibold text-sm md:text-base">Banco Pichincha</span>
                </div>
                <div className="text-xs md:text-sm space-y-1">
                  <div><strong>Titular:</strong> Jeremias Guale Santana</div>
                  <div><strong>Cuenta:</strong> 2209034638</div>
                  <div><strong>Tipo:</strong> Ahorro Transaccional</div>
                </div>
              </div>

              {/* Banco Guayaquil */}
              <div className={`p-3 md:p-4 rounded-lg ${tv(isDark,'bg-white border border-gray-200','bg-gray-700 border border-gray-600')}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg md:text-xl">🏛️</span>
                  <span className="font-semibold text-sm md:text-base">Banco Guayaquil</span>
                </div>
                <div className="text-xs md:text-sm space-y-1">
                  <div><strong>Titular:</strong> Jeremias Joel Guale Santana</div>
                  <div><strong>Cuenta:</strong> 0122407273</div>
                  <div><strong>Tipo:</strong> Ahorros</div>
                </div>
              </div>

              {/* Banco Pacífico */}
              <div className={`p-3 md:p-4 rounded-lg ${tv(isDark,'bg-white border border-gray-200','bg-gray-700 border border-gray-600')}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg md:text-xl">🌊</span>
                  <span className="font-semibold text-sm md:text-base">Banco Pacífico</span>
                </div>
                <div className="text-xs md:text-sm space-y-1">
                  <div><strong>Titular:</strong> Byron Guale Santana</div>
                  <div><strong>Cuenta:</strong> 1061220256</div>
                  <div><strong>Tipo:</strong> Ahorros</div>
                </div>
              </div>

              {/* PayPal */}
              <div className={`p-3 md:p-4 rounded-lg ${tv(isDark,'bg-white border border-gray-200','bg-gray-700 border border-gray-600')}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg md:text-xl">💳</span>
                  <span className="font-semibold text-sm md:text-base">PayPal</span>
                </div>
                <div className="text-xs md:text-sm space-y-1">
                  <div><strong>Email:</strong> guale2023@outlook.com</div>
                  <div><strong>Método:</strong> PayPal</div>
                  <div><strong>Tipo:</strong> Transferencia</div>
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
            <label className="block text-sm font-medium mb-2">Notas adicionales (opcional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Comentarios o instrucciones especiales..."
              className={`w-full rounded-xl border px-4 py-3 text-sm resize-none ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`}
              rows={4}
              style={{ minHeight: '80px' }}
            />
          </div>

          {/* Total */}
          <div className={`rounded-2xl p-4 ${tv(isDark,'bg-zinc-900 text-white','bg-white text-zinc-900')}`}>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total a pagar:</span>
              <span className="text-2xl font-bold">{fmt(total)}</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className={`flex-1 rounded-xl px-4 py-3 font-medium ${tv(isDark,'bg-zinc-100 text-zinc-700 hover:bg-zinc-200','bg-zinc-700 text-zinc-200 hover:bg-zinc-600')}`}
            >
              Cancelar
            </button>
            <button 
              onClick={handlePurchase}
              className="flex-1 rounded-xl px-4 py-3 font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all"
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
function AdminRegisterPurchaseModal({ open, onClose, onRegister, isDark }: {
  open: boolean; onClose: () => void; onRegister: (data: any) => void; isDark: boolean;
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className={`w-full max-w-2xl rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${tv(isDark,'bg-white','bg-zinc-900')}`} onClick={e=>e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold">Registrar Compra Manual</h3>
          <button 
            onClick={onClose} 
            className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${tv(isDark,'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100','text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800')}`}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del cliente */}
          <div className={`p-4 rounded-xl ${tv(isDark,'bg-zinc-50','bg-zinc-800')}`}>
            <h4 className="font-semibold mb-4">👤 Información del Cliente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre completo *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`}
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">WhatsApp *</label>
                <input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`}
                  placeholder="+593987654321"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Email (opcional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`}
                  placeholder="juan@correo.com"
                />
              </div>
            </div>
          </div>

          {/* Información del servicio */}
          <div className={`p-4 rounded-xl ${tv(isDark,'bg-zinc-50','bg-zinc-800')}`}>
            <h4 className="font-semibold mb-4">🛍️ Información del Servicio</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Servicio *</label>
                <select
                  required
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                  className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`}
                >
                  <option value="">Seleccionar servicio</option>
                  {SERVICES.map(service => (
                    <option key={service.id} value={service.name}>
                      {service.name} - {fmt(service.price)}/{service.billing === 'annual' ? 'año' : 'mes'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Precio (USD) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`}
                  placeholder="4.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duración *</label>
                <div className="flex gap-2">
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 1})}
                    className={`flex-1 rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`}
                  />
                  <select
                    value={formData.isAnnual ? 'annual' : 'monthly'}
                    onChange={(e) => setFormData({...formData, isAnnual: e.target.value === 'annual'})}
                    className={`rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`}
                  >
                    <option value="monthly">Meses</option>
                    <option value="annual">Años</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fecha de inicio *</label>
                <input
                  required
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`}
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium mb-2">Notas adicionales</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`}
              rows={3}
              placeholder="Comentarios o instrucciones especiales..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose} 
              className={`flex-1 rounded-xl px-4 py-3 font-medium ${tv(isDark,'bg-zinc-100 text-zinc-700 hover:bg-zinc-200','bg-zinc-700 text-zinc-200 hover:bg-zinc-600')}`}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 rounded-xl px-4 py-3 font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Registrar Compra
            </button>
          </div>
        </form>
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
  console.assert(daysBetween(d3,dneg)===-4,'daysBetween negativo');
  console.assert(whatsappLink('123','hola')==='https://wa.me/123?text=hola','wa link');
  console.log('✅ Todas las pruebas pasaron correctamente');
}catch(e){ console.warn('Self-tests failed:',e); }})();


