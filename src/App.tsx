import React, { useEffect, useMemo, useState } from "react";

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

const ADMIN_WHATSAPP = "+593984280334";
const AGENTE_1_WHATSAPP = "+593984280334"; // Tu número principal
const AGENTE_2_WHATSAPP = "+59399879579"; // Tu hermano
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
function daysBetween(a: string, b: string){ const d1=new Date(a), d2=new Date(b); return Math.ceil((d2.getTime()-d1.getTime())/(1000*60*60*24)); }
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

// ===================== Chatbot =====================
function useChatbot(services: readonly any[]){
  const answer = (q: string) => { const text=q.toLowerCase();
    
    // Saludos
    if(/hola|buenas|hey|hi|hello|buenos|buenas tardes|buenas noches/.test(text)) return "¡Hola! Bienvenido a StreamZone. Soy su asistente virtual especializado en streaming. ¿En qué puedo asistirle hoy? Puedo ayudarle con recomendaciones, precios, contenido disponible y métodos de pago.";
    
    // Recomendaciones de servicios
    if(/recomendar|recomendación|qué|que ver|mejor|sugerir|cuál|que plataforma/.test(text)) {
      const popular = services.slice(0, 3);
      return `Te recomiendo estos servicios populares: ${popular.map(s => `${s.name} (${fmt(s.price)}/${s.billing==='annual'?'año':'mes'})`).join(', ')}. ¿Te interesa alguno en particular o quieres saber qué contenido tienen?`;
    }
    
    // Información sobre contenido
    if(/película|pelicula|serie|contenido|qué hay|que hay|disponible|ver/.test(text)) {
      if(/netflix/.test(text)) return "Netflix tiene: Stranger Things, The Crown, La Casa de Papel, Bridgerton, Ozark, The Witcher, y miles de películas y series originales. ¿Te interesa algún género específico?";
      if(/disney/.test(text)) return "Disney+ incluye: Marvel (Loki, WandaVision), Star Wars (The Mandalorian), Pixar, National Geographic, y todo el catálogo de Disney clásico. ¡Perfecto para toda la familia!";
      if(/max|hbo/.test(text)) return "Max (HBO) tiene: Game of Thrones, House of the Dragon, The Last of Us, Succession, Euphoria, y películas de Warner Bros. Contenido premium de alta calidad.";
      if(/prime/.test(text)) return "Prime Video incluye: The Boys, The Marvelous Mrs. Maisel, Jack Ryan, y películas exclusivas. Además, tienes envío gratis en Amazon.";
      return "Cada plataforma tiene contenido único. Netflix para series originales, Disney+ para Marvel/Star Wars, Max para HBO, Prime para exclusivas. ¿Qué tipo de contenido te gusta más?";
    }
    
    // Precios
    if(/precio|cuanto|cuánto|costo|valor|vale/.test(text)){ 
      for(const s of services){ 
        if(text.includes(s.id)||text.includes(s.name.toLowerCase())) 
          return `El precio de ${s.name} es ${fmt(s.price)} ${s.billing==='annual'?'al año':'al mes'}. ¿Te interesa proceder con la reserva?`; 
      }
      return `Ejemplos de precios: ${services.slice(0,4).map((s:any)=>`${s.name} ${fmt(s.price)}`).join(", ")}. Especifica una plataforma para el precio exacto.`; 
    }
    
    // Proceso de compra
    if(/como (compro|comprar|pago|pagar|reservar|adquirir)/.test(text)) return "Para comprar: 1) Selecciona una plataforma, 2) Haz clic en 'Reservar', 3) Completa tus datos, 4) Elige método de pago, 5) Recibe acceso inmediato. ¡Es súper fácil! ¿Quieres que te guíe paso a paso?";
    
    // Métodos de pago
    if(/metodo|metodos|pago|transferencia|deposito|efectivo|forma de pago|banco|paypal/.test(text)) return "Aceptamos: 🏦 Banco Pichincha (2209034638), 🏛️ Banco Guayaquil (0122407273), 🌊 Banco Pacífico (1061220256), 💳 PayPal (guale2023@outlook.com), y 📱 Pago móvil. Todos los pagos son 100% seguros. Recuerda enviar el comprobante por WhatsApp para activar tu servicio.";
    
    // Contacto y agentes
    if(/contacto|whatsapp|hablar|agente|soporte|ayuda|telefono/.test(text)) return "Puedes contactar a nuestros agentes especializados: 👨‍💼 Agente 1: +593 98 428 0334 (Jeremi) 👨‍💼 Agente 2: +593 99 879 9579 (Soporte). Están disponibles para ayudarte con cualquier consulta.";
    
    // Información sobre streaming
    if(/streaming|plataforma|app|aplicación/.test(text)) return "StreamZone ofrece acceso a las mejores plataformas: Netflix, Disney+, Max, Prime Video, Spotify, y más. Todas con cuentas premium, sin publicidad, y soporte 24/7. ¿Cuál te interesa más?";
    
    // Calidad y características
    if(/calidad|hd|4k|ultra|premium|características/.test(text)) return "Todas nuestras cuentas son premium con máxima calidad: 4K Ultra HD, sin anuncios, descarga offline, múltiples dispositivos simultáneos. ¡Experiencia de streaming completa!";
    
    // Soporte técnico
    if(/problema|error|no funciona|ayuda|soporte|garantia/.test(text)) return "Si tienes algún problema, contacta inmediatamente a nuestros agentes. Resolvemos cualquier inconveniente en menos de 24 horas. ¿Qué problema específico tienes?";
    
    // Despedida
    if(/gracias|bye|adios|chao|hasta luego/.test(text)) return "¡De nada! Ha sido un placer ayudarte. Si necesitas algo más, no dudes en contactarnos. ¡Que disfrutes mucho de tu streaming! 🎬✨";
    
    // Fallback
    return "No entendí tu consulta. Puedo ayudarte con: recomendaciones de servicios, precios, contenido disponible, métodos de pago, o contactar a nuestros agentes. ¿Qué necesitas saber?"; 
  };
  return {answer};
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
          Reservar Ahora
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
function FloatingChatbot({ answerFn, isDark }:{ answerFn:(q:string)=>string; isDark:boolean; }){
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: "¡Hola! Bienvenido a StreamZone. ¿En qué puedo asistirle hoy?" }]);
  const [input, setInput] = useState("");
  const send = () => { const q=input.trim(); if(!q) return; const a=answerFn(q); setMessages(m=>[...m,{role:'user',text:q},{role:'bot',text:a}]); setInput(""); };
  return (<>
    <button onClick={()=>setOpen(!open)} className={tv(isDark,'fixed bottom-5 right-5 z-40 rounded-full bg-zinc-900 text-white px-4 py-3 shadow-lg','fixed bottom-5 right-5 z-40 rounded-full bg-white text-zinc-900 px-4 py-3 shadow-lg')}>Chat</button>
    {open&&(
      <div className={`fixed bottom-20 right-5 z-40 w-80 rounded-2xl border shadow-xl ${tv(isDark,'border-zinc-200 bg-white','border-zinc-800 bg-zinc-900')}`}>
        <div className={`rounded-t-2xl border-b p-3 font-semibold ${tv(isDark,'bg-zinc-50 border-zinc-200','bg-zinc-900 border-zinc-800')}`}>Asistente</div>
        <div className="p-3 h-80 overflow-y-auto flex flex-col gap-2">{messages.map((m,i)=>(<div key={i} className={m.role==='bot'?'self-start':'self-end'}><div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role==='bot'? tv(isDark,'bg-zinc-100','bg-zinc-800'): tv(isDark,'bg-zinc-900 text-white','bg-white text-zinc-900')}`}>{m.text}</div></div>))}</div>
        <div className="p-3 flex gap-2">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Escribe tu pregunta" className={`flex-1 rounded-xl border px-3 py-2 text-sm ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`}/>
          <button onClick={send} className={tv(isDark,'rounded-xl bg-zinc-900 px-3 text-sm text-white','rounded-xl bg-white px-3 text-sm text-zinc-900')}>Enviar</button>
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
  const[view,setView]=useState<'home'|'purchases'|'admin'|'register'|'adminLogin'|'auth'|'profile'>('home');

  // Sesiones
  const[user,setUser]=useState<any>(()=> storage.load('userProfile', null));
  const[adminLogged,setAdminLogged]=useState<boolean>(()=> !!storage.load('adminLogged', false));
  const[userProfile,setUserProfile]=useState<UserProfile | null>(()=> storage.load('userProfileData', null));
  const[allPurchases,setAllPurchases]=useState<UserPurchase[]>(()=> storage.load('allPurchases', []));
  
  useEffect(()=>{ storage.save('userProfile', user); },[user]);
  useEffect(()=>{ storage.save('userProfileData', userProfile); },[userProfile]);
  useEffect(()=>{ storage.save('allPurchases', allPurchases); },[allPurchases]);
  useEffect(()=>{ storage.save('adminLogged', adminLogged); },[adminLogged]);

  // Lista dinámica de administradores
  const [adminEmails, setAdminEmails] = useState<string[]>(()=> storage.load('admin_emails', DEFAULT_ADMIN_EMAILS).map((e:string)=>e.toLowerCase()));
  useEffect(()=>{ storage.save('admin_emails', adminEmails); },[adminEmails]);

  // Drawers
  const [drawerOpen, setDrawerOpen] = useState(false); // admins
  const [menuOpen, setMenuOpen] = useState(false);    // menú

  // Reservas
  const[reserveOpen,setReserveOpen]=useState(false); const[selected,setSelected]=useState<any|null>(null);
  const[purchases,setPurchases]=useState<any[]>(()=> storage.load('purchases', []));
  const{answer}=useChatbot(SERVICES);
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
  const addPurchase=(rec:any)=> setPurchases(p=>[{...rec,id:uid(),validated:false},...p]);

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

    // Actualizar lista global de compras
    setAllPurchases(prev => [...prev, purchase]);

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

    // Actualizar en la lista global
    setAllPurchases(prev => prev.map(p => p.id === purchaseId ? updatedPurchase : p));

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
  
  // Panel desplegable de agentes
  const [agentsDropdownOpen, setAgentsDropdownOpen] = useState(false);
  
  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (agentsDropdownOpen) {
        setAgentsDropdownOpen(false);
      }
    };
    
    if (agentsDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [agentsDropdownOpen]);

  const todayISO=new Date().toISOString().slice(0,10);
  const dueToday=purchases.filter(p=>p.end===todayISO);

  // Navegación con auth
  const goAdmin=()=>{ if(adminLogged) setView('admin'); else setView('adminLogin'); };
  const goPurchases=()=>{ if(user) setView('purchases'); else setView('register'); };
  const logoutUser=()=>{ 
    setUser(null); 
    setUserProfile(null);
    storage.del('userProfile'); 
    storage.del('userProfileData');
    if(view==='purchases' || view==='profile') setView('home'); 
  };
  const logoutAdmin=()=>{ setAdminLogged(false); storage.del('adminLogged'); if(view==='admin') setView('home'); };

  // ======= Admin =======
  const [adminSub, setAdminSub] = useState<'dashboard'|'purchases'>('dashboard');
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
                onClick={goPurchases}
                className={tv(
                  isDark,
                  'rounded-xl bg-zinc-100 px-3 py-1.5 text-sm hover:bg-zinc-200',
                  'rounded-xl bg-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-700'
                )}
              >
                Mis Compras
              </button>
              <button
                onClick={() => setView('profile')}
                className={tv(
                  isDark,
                  'rounded-xl bg-green-100 text-green-700 px-3 py-1.5 text-sm hover:bg-green-200',
                  'rounded-xl bg-green-800 text-green-100 px-3 py-1.5 text-sm hover:bg-green-700'
                )}
              >
                Mi Perfil
              </button>
              <div className="relative">
                <button
                  onClick={() => setAgentsDropdownOpen(!agentsDropdownOpen)}
                  className={tv(
                    isDark,
                    'rounded-xl bg-blue-100 text-blue-700 px-3 py-1.5 text-sm hover:bg-blue-200 flex items-center gap-1',
                    'rounded-xl bg-blue-800 text-blue-100 px-3 py-1.5 text-sm hover:bg-blue-700 flex items-center gap-1'
                  )}
                >
                  👥 Agentes
                  <span className={`transition-transform ${agentsDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
                
                {agentsDropdownOpen && (
                  <div className={`absolute top-full right-0 mt-1 w-56 rounded-xl shadow-lg border z-50 ${tv(isDark,'bg-white border-gray-200','bg-zinc-800 border-zinc-700')}`}>
                    <div className="p-2 space-y-1">
                      <a
                        href={whatsappLink(AGENTE_1_WHATSAPP,'¡Hola! Me interesa conocer más información sobre los servicios de streaming disponibles en StreamZone. ¿Podrían brindarme detalles sobre precios y disponibilidad?')}
                        target="_blank"
                        rel="noreferrer"
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${tv(isDark,'hover:bg-orange-50 text-orange-700','hover:bg-orange-900/20 text-orange-300')}`}
                        onClick={() => setAgentsDropdownOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <span>👨‍💼</span>
                          <div>
                            <div className="font-medium">Agente 1</div>
                            <div className="text-xs opacity-70">+593 98 428 0334</div>
                          </div>
                        </div>
                      </a>
                      <a
                        href={whatsappLink(AGENTE_2_WHATSAPP,'¡Hola! Me interesa conocer más información sobre los servicios de streaming disponibles en StreamZone. ¿Podrían brindarme detalles sobre precios y disponibilidad?')}
                        target="_blank"
                        rel="noreferrer"
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${tv(isDark,'hover:bg-purple-50 text-purple-700','hover:bg-purple-900/20 text-purple-300')}`}
                        onClick={() => setAgentsDropdownOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <span>👨‍💼</span>
                          <div>
                            <div className="font-medium">Agente 2</div>
                            <div className="text-xs opacity-70">+593 99 879 9579</div>
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>
                )}
              </div>
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
                onClick={goPurchases}
                className={tv(
                  isDark,
                  'rounded-lg bg-zinc-100 px-3 py-1.5 text-xs whitespace-nowrap',
                  'rounded-lg bg-zinc-800 px-3 py-1.5 text-xs whitespace-nowrap'
                )}
              >
                Mis Compras
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
              {SERVICES.map(s=> <ServiceCard key={s.id} s={s} onReserve={onReserve} isDark={isDark}/>) }
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
                <h3 className="text-3xl font-bold mb-2">¡Bienvenido!</h3>
                <p className="text-sm opacity-80">Inicia sesión o regístrate para acceder a tus servicios</p>
              </div>
              
              <div className="space-y-4">
                {/* Botón de Registro */}
                <button
                  onClick={() => setView('register')}
                  className={`w-full rounded-2xl p-4 text-center font-semibold transition-all duration-200 hover:scale-105 ${tv(
                    isDark,
                    'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:from-blue-600 hover:to-purple-700',
                    'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:from-blue-600 hover:to-purple-700'
                  )}`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xl">✨</span>
                    <div>
                      <div className="text-lg">Crear cuenta nueva</div>
                      <div className="text-sm opacity-90">Regístrate para guardar tus compras</div>
                    </div>
                  </div>
                </button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-300 dark:border-zinc-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className={tv(isDark,'bg-white px-2 text-zinc-500','bg-zinc-900 px-2 text-zinc-400')}>o</span>
                  </div>
                </div>

                {/* Botón de Login */}
                <button
                  onClick={() => setView('adminLogin')}
                  className={`w-full rounded-2xl p-4 text-center font-semibold transition-all duration-200 hover:scale-105 ${tv(
                    isDark,
                    'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-2 border-zinc-200',
                    'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border-2 border-zinc-600'
                  )}`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xl">🔑</span>
                    <div>
                      <div className="text-lg">Ya tengo cuenta</div>
                      <div className="text-sm opacity-70">Iniciar sesión con mis datos</div>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mt-8 text-center">
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
              <UserRegisterForm isDark={isDark} onSubmit={(profile)=>{ 
                setUser(profile); 
                const userProfile = createUserProfile(profile.name, profile.phone, profile.email);
                setUserProfile(userProfile);
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

      {/* MIS COMPRAS */}
      {view==='purchases' && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-8">
            <h3 className="text-3xl font-bold mb-2">Mis Compras</h3>
            <p className={tv(isDark,'text-zinc-600','text-zinc-300')}>Gestiona y revisa el estado de tus servicios</p>
          </div>
          
          {ownPurchases(purchases,user).length===0 ? (
            <div className={`text-center py-16 rounded-2xl border-2 border-dashed ${tv(isDark,'border-zinc-200 bg-zinc-50','border-zinc-700 bg-zinc-800')}`}>
              <div className="text-6xl mb-4">📦</div>
              <h4 className="text-xl font-semibold mb-2">No tienes compras aún</h4>
              <p className={tv(isDark,'text-zinc-600','text-zinc-400')}>Explora nuestro catálogo y reserva tu primer servicio</p>
              <button 
                onClick={() => setView('home')}
                className={tv(isDark,'mt-4 rounded-xl bg-zinc-900 text-white px-6 py-3','mt-4 rounded-xl bg-white text-zinc-900 px-6 py-3')}
              >
                Ver Catálogo
              </button>
            </div>
          ) : (
            <div className={`overflow-x-auto rounded-2xl border ${tv(isDark,'border-zinc-200 bg-white','border-zinc-700 bg-zinc-800')}`}> 
              <table className="w-full text-sm">
                <thead className={tv(isDark,'bg-zinc-50 text-zinc-700','bg-zinc-900 text-zinc-300')}>
                  <tr>
                    <th className="p-4 text-left font-semibold">Servicio</th>
                    <th className="p-4 text-left font-semibold">Inicio</th>
                    <th className="p-4 text-left font-semibold">Fin</th>
                    <th className="p-4 text-left font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ownPurchases(purchases,user).map(p=>{ 
                    const days=daysBetween(new Date().toISOString().slice(0,10),p.end); 
                    const status=days<0?'Vencido':days===0?'Vence hoy':`${days} días restantes`; 
                    return (
                      <tr key={p.id} className={tv(isDark,'border-t border-zinc-200','border-t border-zinc-700')}>
                        <td className="p-4 font-medium">{p.service}</td>
                        <td className="p-4">{p.start}</td>
                        <td className="p-4">{p.end}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            days < 0 ? 'bg-red-100 text-red-800' : 
                            days === 0 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {status}
                          </span>
                        </td>
                      </tr> 
                    ); 
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* MI PERFIL */}
      {view==='profile' && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-8">
            <h3 className="text-3xl font-bold mb-2">Mi Perfil</h3>
            <p className={tv(isDark,'text-zinc-600','text-zinc-300')}>Gestiona tu cuenta y compras</p>
          </div>
          
          {!userProfile ? (
            <div className={`text-center py-16 rounded-2xl border-2 border-dashed ${tv(isDark,'border-zinc-200 bg-zinc-50','border-zinc-700 bg-zinc-800')}`}>
              <div className="text-6xl mb-4">👤</div>
              <h4 className="text-xl font-semibold mb-2">No tienes perfil creado</h4>
              <p className={tv(isDark,'text-zinc-600','text-zinc-400')}>Crea tu perfil para gestionar tus compras</p>
              <button 
                onClick={() => setView('register')}
                className={tv(isDark,'mt-4 rounded-xl bg-zinc-900 text-white px-6 py-3','mt-4 rounded-xl bg-white text-zinc-900 px-6 py-3')}
              >
                Crear perfil
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {/* Información del perfil */}
              <div className={`p-6 rounded-2xl border ${tv(isDark,'bg-white border-zinc-200','bg-zinc-800 border-zinc-700')}`}>
                <h3 className="text-xl font-semibold mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-zinc-600 dark:text-zinc-400">Nombre</label>
                    <p className="font-medium">{userProfile.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-zinc-600 dark:text-zinc-400">WhatsApp</label>
                    <p className="font-medium">{userProfile.whatsapp}</p>
                  </div>
                  {userProfile.email && (
                    <div>
                      <label className="text-sm text-zinc-600 dark:text-zinc-400">Email</label>
                      <p className="font-medium">{userProfile.email}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-zinc-600 dark:text-zinc-400">Miembro desde</label>
                    <p className="font-medium">{new Date(userProfile.createdAt).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
              </div>

              {/* Estadísticas */}
              <div className={`p-6 rounded-2xl border ${tv(isDark,'bg-white border-zinc-200','bg-zinc-800 border-zinc-700')}`}>
                <h3 className="text-xl font-semibold mb-4">Estadísticas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{userProfile.purchases.length}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Compras</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {userProfile.purchases.filter(p => p.status === 'active').length}
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Activas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {userProfile.purchases.filter(p => p.status === 'pending').length}
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Pendientes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {userProfile.purchases.filter(p => p.status === 'expired').length}
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">Expiradas</div>
                  </div>
                </div>
              </div>

              {/* Compras recientes */}
              <div className={`p-6 rounded-2xl border ${tv(isDark,'bg-white border-zinc-200','bg-zinc-800 border-zinc-700')}`}>
                <h3 className="text-xl font-semibold mb-4">Compras Recientes</h3>
                {userProfile.purchases.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🛍️</div>
                    <p className={tv(isDark,'text-zinc-600','text-zinc-400')}>No tienes compras aún</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userProfile.purchases.slice(0, 5).map(purchase => (
                      <div key={purchase.id} className={`p-4 rounded-xl border ${tv(isDark,'bg-zinc-50 border-zinc-100','bg-zinc-700 border-zinc-600')}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${SERVICES.find(s => s.id === purchase.serviceId)?.color || 'bg-zinc-500'}`}>
                              {SERVICES.find(s => s.id === purchase.serviceId)?.logo || '?'}
                            </div>
                            <div>
                              <h4 className="font-medium">{purchase.serviceName}</h4>
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {purchase.duration} {purchase.isAnnual ? 'años' : 'meses'} • {fmt(purchase.price)}
                              </p>
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            purchase.status === 'active' ? 'bg-green-100 text-green-700' :
                            purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            purchase.status === 'expired' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {purchase.status === 'active' ? 'Activo' :
                             purchase.status === 'pending' ? 'Pendiente' :
                             purchase.status === 'expired' ? 'Expirado' :
                             purchase.status === 'cancelled' ? 'Cancelado' : 'Desconocido'}
                          </div>
                        </div>
                        {purchase.startDate && purchase.endDate && (
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">
                            <span>Inicio: {new Date(purchase.startDate).toLocaleDateString('es-ES')}</span>
                            <span className="mx-2">•</span>
                            <span>Fin: {new Date(purchase.endDate).toLocaleDateString('es-ES')}</span>
                          </div>
                        )}
                        {purchase.validatedBy && (
                          <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                            Validado por: {purchase.validatedBy}
                          </div>
                        )}
                      </div>
                    ))}
                    {userProfile.purchases.length > 5 && (
                      <button
                        onClick={() => setView('purchases')}
                        className={tv(isDark,'w-full py-2 text-sm text-blue-600 hover:text-blue-700','w-full py-2 text-sm text-blue-400 hover:text-blue-300')}
                      >
                        Ver todas las compras ({userProfile.purchases.length})
                      </button>
                    )}
                  </div>
                )}
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
                <h3 className="text-3xl font-bold">Panel Administrador</h3>
                <p className={tv(isDark,'text-zinc-600','text-zinc-300')}>Gestiona compras, administradores y configuración</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge isDark={isDark}>
                  {dueToday.length} vencen hoy
                </Badge>
                <button 
                  onClick={()=>setMenuOpen(true)} 
                  className={tv(isDark,'rounded-xl bg-zinc-900 text-white px-4 py-2 text-sm hover:bg-zinc-800','rounded-xl bg-white text-zinc-900 px-4 py-2 text-sm hover:bg-zinc-100')}
                >
                  ☰ Menú
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

          {/* DASHBOARD mejorado */}
          {adminSub==='dashboard' && (
            <>
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
                      <div className="text-3xl font-bold text-amber-600">{purchases.filter(p=>!p.validated).length}</div>
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
                      <div className="text-3xl font-bold text-red-600">{dueToday.length}</div>
                    </div>
                    <div className="text-3xl">⚠️</div>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <button 
                  onClick={()=>setAdminSub('purchases')} 
                  className={`rounded-2xl p-6 text-left transition-all hover:scale-105 ${tv(isDark,'bg-zinc-900 text-white shadow-lg','bg-white text-zinc-900 shadow-lg')}`}
                >
                  <div className="text-2xl mb-2">🛒</div>
                  <div className="text-xl font-bold mb-2">Gestionar Compras</div>
                  <div className="text-sm opacity-70">Revisa, valida y notifica por WhatsApp</div>
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
            </>
          )}

          {/* COMPRAS */}
          {adminSub==='purchases' && (
            <>
              <AdminPurchases
                isDark={isDark}
                purchases={purchases}
                setPurchases={setPurchases}
                onBack={()=>setAdminSub('dashboard')}
                exportCSV={exportCSV}
              />
            </>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className={`border-t py-8 text-center text-sm ${tv(isDark,'text-zinc-500 border-zinc-200','text-zinc-400 border-zinc-800')}`}>© {new Date().getFullYear()} StreamZone</footer>

      {/* Reserva */}
      <Modal open={reserveOpen} onClose={()=>setReserveOpen(false)} title={`Reservar ${selected?.name||''}`} isDark={isDark}>
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

      {/* Drawers y flotantes */}
      <AdminDrawer open={drawerOpen} onClose={()=>setDrawerOpen(false)} isDark={isDark} adminEmails={adminEmails} setAdminEmails={setAdminEmails} />
      <AdminMenuDrawer open={menuOpen} onClose={()=>setMenuOpen(false)} isDark={isDark} setSubView={setAdminSub} openAdmins={()=>setDrawerOpen(true)} onExportCSV={exportCSV} onLogout={logoutAdmin} />
      <FloatingChatbot answerFn={(q)=>useChatbot(SERVICES).answer(q)} isDark={isDark}/>
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
            key={p.id}
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
function AdminMenuDrawer({ open, onClose, isDark, setSubView, openAdmins, onExportCSV, onLogout }:{
  open:boolean; onClose:()=>void; isDark:boolean; setSubView:(v:'dashboard'|'purchases')=>void; openAdmins:()=>void; onExportCSV:()=>void; onLogout:()=>void;
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
  const[name,setName]=useState(''); const[phone,setPhone]=useState(''); const[email,setEmail]=useState('');
  const submit=(e:React.FormEvent)=>{ e.preventDefault(); if(!name||!phone) return; onSubmit({name,phone: cleanPhone(phone),email}); };
  return (
    <form onSubmit={submit} className="space-y-3">
      <div><label className={tv(isDark,'text-xs text-zinc-700','text-xs text-zinc-300')}>Nombre</label><input className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre"/></div>
      <div><label className={tv(isDark,'text-xs text-zinc-700','text-xs text-zinc-300')}>WhatsApp</label><input className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+593..."/></div>
      <div><label className={tv(isDark,'text-xs text-zinc-700','text-xs text-zinc-300')}>Correo (opcional)</label><input className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@correo.com"/></div>
      <button type="submit" className={tv(isDark,'rounded-xl bg-zinc-900 text-white px-4 py-2','rounded-xl bg-white text-zinc-900 px-4 py-2')}>Crear cuenta</button>
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
      months: isAnnual ? 12*Number(years) : Number(months)
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
    if (selectedMethod && onPurchase) {
      const purchaseData = {
        service: service.name,
        price: service.price,
        duration: duration,
        total: total,
        paymentMethod: selectedMethod,
        notes: notes,
        customer: user.name,
        phone: user.phone,
        email: user.email,
        start: new Date().toISOString().slice(0, 10),
        end: new Date(Date.now() + (isAnnual ? duration * 365 : duration * 30) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      };
      
      onPurchase(purchaseData);
    }
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
            <div className={`mt-4 p-4 rounded-lg ${tv(isDark,'bg-yellow-50 border border-yellow-200','bg-yellow-900/20 border border-yellow-500')}`}>
              <div className="flex items-start gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <h5 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">Instrucciones Importantes:</h5>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Una vez que hayas realizado el pago, <strong>debes confirmar tu compra</strong> enviando una captura del comprobante por WhatsApp a nuestros agentes:
                  </p>
                  <div className="mt-2 text-sm">
                    <div>📱 <strong>Agente 1:</strong> +593 98 428 0334</div>
                    <div>📱 <strong>Agente 2:</strong> +593 99 879 9579</div>
                  </div>
                  <p className="text-xs mt-2 text-yellow-600 dark:text-yellow-400">
                    Sin el comprobante, tu servicio no será activado.
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
              disabled={!selectedMethod}
              className={`flex-1 rounded-xl px-4 py-3 font-medium ${selectedMethod 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700' 
                : 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
              }`}
            >
              Completar Compra
            </button>
          </div>
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
  console.assert(daysBetween(d3,dneg)===-4,'daysBetween negativo');
  console.assert(whatsappLink('123','hola')==='https://wa.me/123?text=hola','wa link');
}catch(e){ console.warn('Self-tests failed:',e); }})();