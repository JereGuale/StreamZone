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
const DEFAULT_ADMIN_EMAILS = ["gualejeremi@gmaill.com", "gualejeremi@gmail.com"];

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
    if(/hola|buenas|hey/.test(text)) return "Hola! Soy tu asistente. Puedo darte precios, resolver dudas y ayudarte a reservar.";
    if(/precio|cuanto|cuánto/.test(text)){ for(const s of services){ if(text.includes(s.id)||text.includes(s.name.toLowerCase())) return `El precio de ${s.name} es ${fmt(s.price)} ${s.billing==='annual'?'al año':'al mes'}. ¿Deseas reservar?`; }
      return `Ejemplos de precios: ${services.slice(0,4).map((s:any)=>`${s.name} ${fmt(s.price)}`).join(", ")}. Dime una plataforma específica y te digo el precio exacto.`; }
    if(/como (compro|comprar|pago|pagar|reservar)/.test(text)) return "Elige una plataforma, pulsa Reservar, completa tus datos y se abrirá WhatsApp con el pedido listo.";
    if(/metodo|metodos|pago/.test(text)) return "Aceptamos transferencia/deposito/efectivo (personalizable).";
    if(/garantia|soporte/.test(text)) return "Brindamos soporte durante tu periodo activo. Escríbenos por WhatsApp si tienes inconvenientes.";
    return "Puedo conectarte con soporte por WhatsApp. Pregúntame por precios o cómo reservar.";
  };
  return {answer};
}

// ===================== Piezas UI =====================
function Badge({ children, isDark }: { children: React.ReactNode; isDark: boolean; }){ 
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tv(isDark,'bg-zinc-100 text-zinc-700 ring-zinc-200','bg-zinc-800 text-zinc-200 ring-zinc-700')}`}>{children}</span>; 
}

function ServiceCard({ s, onReserve, isDark }:{ s:any; onReserve:(s:any)=>void; isDark:boolean; }){
  return (
    <div className={`group rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${tv(isDark,'border-zinc-200 bg-white/70','border-zinc-800 bg-zinc-900/70')}`}> 
      <div className="flex items-center gap-3">
        <div className={`h-12 w-12 ${s.color} rounded-xl text-white grid place-content-center text-lg font-bold`}>{s.logo}</div>
        <div className="flex-1">
          <div className={tv(isDark,'text-zinc-900 font-semibold','text-white font-semibold')}>{s.name}</div>
          <div className={tv(isDark,'text-sm text-zinc-600','text-sm text-zinc-300')}>{fmt(s.price)} / {s.billing==='annual'? 'año':'mes'}</div>
        </div>
        <button onClick={()=>onReserve(s)} className={tv(isDark,'rounded-xl bg-zinc-900 text-white px-3 py-2 text-sm hover:bg-zinc-800','rounded-xl bg-white text-zinc-900 px-3 py-2 text-sm hover:bg-zinc-200')}>Reservar</button>
      </div>
    </div>
  );
}

function Modal({ open, onClose, children, title, isDark }:{ open:boolean; onClose:()=>void; children:React.ReactNode; title:string; isDark:boolean; }){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div className={`w-full max-w-lg rounded-2xl p-6 shadow-xl ${tv(isDark,'bg-white','bg-zinc-900')}`} onClick={e=>e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className={tv(isDark,'text-zinc-500 hover:text-zinc-700','text-zinc-300 hover:text-zinc-200')}>x</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// === FloatingChatbot ===
function FloatingChatbot({ answerFn, isDark }:{ answerFn:(q:string)=>string; isDark:boolean; }){
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "bot", text: "Hola! ¿En qué te ayudo hoy?" }]);
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
  const[view,setView]=useState<'home'|'purchases'|'admin'|'register'|'adminLogin'>('home');

  // Sesiones
  const[user,setUser]=useState<any>(()=> storage.load('userProfile', null));
  const[adminLogged,setAdminLogged]=useState<boolean>(()=> !!storage.load('adminLogged', false));
  useEffect(()=>{ storage.save('userProfile', user); },[user]);
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
  const onReserve=(s:any)=>{ setSelected(s); setReserveOpen(true); };
  const addPurchase=(rec:any)=> setPurchases(p=>[{...rec,id:uid(),validated:false},...p]);

  const todayISO=new Date().toISOString().slice(0,10);
  const dueToday=purchases.filter(p=>p.end===todayISO);

  // Navegación con auth
  const goAdmin=()=>{ if(adminLogged) setView('admin'); else setView('adminLogin'); };
  const goPurchases=()=>{ if(user) setView('purchases'); else setView('register'); };
  const logoutUser=()=>{ setUser(null); storage.del('userProfile'); if(view==='purchases') setView('home'); };
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
    const csv = rows.map(r=>r.map(x=>`"${String(x).replaceAll('"','""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv'}); const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='compras.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen ${tv(isDark,'bg-zinc-50 text-zinc-900','bg-zinc-950 text-zinc-100')}`}>
      {/* Navbar */}
      {/* Navbar */}
          <header className={`sticky top-0 z-30 border-b backdrop-blur ${tv(isDark,'bg-white/80 border-zinc-200','bg-zinc-950/70 border-zinc-800')}`}>
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo className="h-9 w-9" />
                <div className="font-semibold">StreamZone</div>
                <Badge isDark={isDark}>Seguridad y confianza</Badge>
              </div>
              <nav className="flex items-center gap-2">
                {/* tus botones */}
              </nav>
            </div>
            </header>

            <button onClick={()=>setView('home')} className={`${view==='home'? tv(isDark,'bg-zinc-900 text-white','bg-white text-zinc-900') : tv(isDark,'bg-zinc-100','bg-zinc-800')} rounded-xl px-3 py-1.5 text-sm`}>Inicio</button>
            <button onClick={goPurchases} className={`${view==='purchases'? tv(isDark,'bg-zinc-900 text-white','bg-white text-zinc-900') : tv(isDark,'bg-zinc-100','bg-zinc-800')} rounded-xl px-3 py-1.5 text-sm`}>Mis compras</button>
            <button onClick={goAdmin} className={`${view==='admin'||view==='adminLogin'? tv(isDark,'bg-zinc-900 text-white','bg-white text-zinc-900') : tv(isDark,'bg-zinc-100','bg-zinc-800')} rounded-xl px-3 py-1.5 text-sm`}>Admin</button>
            {user? <button onClick={logoutUser} className={tv(isDark,'rounded-xl bg-zinc-100 px-3 py-1.5 text-sm','rounded-xl bg-zinc-800 px-3 py-1.5 text-sm')}>Cerrar sesión</button> : <button onClick={()=>setView('register')} className={tv(isDark,'rounded-xl bg-zinc-100 px-3 py-1.5 text-sm','rounded-xl bg-zinc-800 px-3 py-1.5 text-sm')}>Registrarme</button>}
            {adminLogged && view!=='admin' && <button onClick={()=>setMenuOpen(true)} className={tv(isDark,'rounded-xl bg-zinc-900 text-white px-3 py-1.5 text-sm','rounded-xl bg-white text-zinc-900 px-3 py-1.5 text-sm')}>Menú</button>}
          </nav>
        </div>
      </header>

      {/* HOME */}
      {view==='home' && (
        <>
          <section className="relative">
            <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
              <div className="grid items-center gap-8 md:grid-cols-2">
                <div className="relative z-10">
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">StreamZone</h1>
                  <p className={tv(isDark,'mt-2 text-lg text-zinc-700','mt-2 text-lg text-zinc-200')}>Tus plataformas favoritas, al mejor precio.</p>
                  <p className={tv(isDark,'mt-3 text-zinc-600','mt-3 text-zinc-300')}>Reserva por WhatsApp, recibe acceso con soporte inmediato y renueva sin complicaciones. Administra tus servicios desde tu cuenta.</p>
                  <div className="mt-6 flex gap-3">
                    <a href="#catalogo" className={tv(isDark,'rounded-xl bg-zinc-900 text-white px-5 py-3 text-sm','rounded-xl bg-white text-zinc-900 px-5 py-3 text-sm')}>Ver catálogo</a>
                    <a href={whatsappLink(ADMIN_WHATSAPP,'Hola! Quiero informacion sobre las plataformas disponibles en StreamZone.')} className={tv(isDark,'rounded-xl bg-zinc-200 px-5 py-3 text-sm','rounded-xl bg-zinc-800 text-zinc-100 px-5 py-3 text-sm')} target="_blank" rel="noreferrer">WhatsApp</a>
                  </div>
                </div>
                <div className={`relative z-10 rounded-3xl p-6 shadow-sm backdrop-blur-md border ${tv(isDark,'bg-white/60 border-white/10','bg-zinc-900/50 border-zinc-800')}`}>
                  <div className={tv(isDark,'text-sm text-zinc-700','text-sm text-zinc-300')}>Mi perfil</div>
                  <p className={tv(isDark,'text-xs text-zinc-500 mt-1','text-xs text-zinc-400 mt-1')}>Completa tus datos al reservar: nombre y WhatsApp.</p>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 -z-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700" />
          </section>

          <section id="catalogo" className="mx-auto max-w-6xl px-4 pb-10">
            <h2 className="text-xl font-semibold mb-4">Catálogo</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SERVICES.map(s=> <ServiceCard key={s.id} s={s} onReserve={onReserve} isDark={isDark}/>) }
            </div>
          </section>
        </>
      )}

      {/* REGISTRO */}
      {view==='register' && (
        <section className="min-h-[80vh] relative">
          <div className="absolute inset-0 -z-10" style={{backgroundImage:"url(/img/bg-cinema.jpg)", backgroundSize:'cover', backgroundPosition:'center'}} />
          <div className="absolute inset-0 -z-0 bg-black/50" />
          <div className="mx-auto max-w-md px-4 py-16">
            <div className={tv(isDark,'rounded-2xl bg-white/90 p-6 shadow-xl','rounded-2xl bg-zinc-900/90 p-6 shadow-xl text-zinc-100')}>
              <h3 className="text-xl font-semibold mb-2">Crear cuenta</h3>
              <p className="text-sm opacity-80 mb-4">Regístrate para guardar tus compras y ver el estado.</p>
              <UserRegisterForm isDark={isDark} onSubmit={(profile)=>{ setUser(profile); setView('home'); }} />
            </div>
          </div>
        </section>
      )}

      {/* MIS COMPRAS */}
      {view==='purchases' && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h3 className="text-lg font-semibold mb-3">Mis compras</h3>
          <div className={`overflow-x-auto rounded-2xl border ${tv(isDark,'border-zinc-200','border-zinc-800')}`}> 
            <table className="w-full text-sm">
              <thead className={tv(isDark,'bg-zinc-50 text-zinc-700','bg-zinc-900 text-zinc-300')}>
                <tr><th className="p-3 text-left">Servicio</th><th className="p-3 text-left">Inicio</th><th className="p-3 text-left">Fin</th><th className="p-3 text-left">Estado</th></tr>
              </thead>
              <tbody>
                {ownPurchases(purchases,user).length===0 && (<tr><td className="p-4" colSpan={4}>Aún no tienes compras validadas asociadas a tu cuenta.</td></tr>)}
                {ownPurchases(purchases,user).map(p=>{ const days=daysBetween(new Date().toISOString().slice(0,10),p.end); const status=days<0?'Vencido':days===0?'Vence hoy':`${days} dias`; return (
                  <tr key={p.id} className={tv(isDark,'border-t','border-t border-zinc-800')}>
                    <td className="p-3">{p.service}</td><td className="p-3">{p.start}</td><td className="p-3">{p.end}</td><td className="p-3">{status}</td>
                  </tr> ); })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* LOGIN ADMIN */}
      {view==='adminLogin' && (
        <section className="min-h-[70vh] grid place-items-center">
          <div className={tv(isDark,'w-full max-w-md rounded-2xl bg-white p-6 shadow-xl','w-full max-w-md rounded-2xl bg-zinc-900 p-6 shadow-xl')}>
            <h3 className="text-xl font-semibold mb-2">Acceso administrador</h3>
            <AdminLoginForm isDark={isDark} adminEmails={adminEmails} onLogin={(ok)=>{ if(ok){ setAdminLogged(true); setView('admin'); setAdminSub('dashboard'); } }} />
          </div>
        </section>
      )}

      {/* ADMIN */}
      {view==='admin' && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Panel del administrador</h3>
            <div className="flex items-center gap-2">
              <Badge isDark={isDark}>{dueToday.length} vencen hoy</Badge>
              <button onClick={()=>setMenuOpen(true)} className={tv(isDark,'rounded-xl bg-zinc-900 text-white px-3 py-1.5 text-sm','rounded-xl bg-white text-zinc-900 px-3 py-1.5 text-sm')}>Menú</button>
            </div>
          </div>

          {/* DASHBOARD minimalista */}
          {adminSub==='dashboard' && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className={`rounded-2xl p-4 ${tv(isDark,'bg-white','bg-zinc-900')}`}><div className="text-xs opacity-60">Compras totales</div><div className="text-2xl font-bold">{purchases.length}</div></div>
                <div className={`rounded-2xl p-4 ${tv(isDark,'bg-white','bg-zinc-900')}`}><div className="text-xs opacity-60">Pendientes</div><div className="text-2xl font-bold">{purchases.filter(p=>!p.validated).length}</div></div>
                <div className={`rounded-2xl p-4 ${tv(isDark,'bg-white','bg-zinc-900')}`}><div className="text-xs opacity-60">Validadas</div><div className="text-2xl font-bold">{purchases.filter(p=>p.validated).length}</div></div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button onClick={()=>setAdminSub('purchases')} className={tv(isDark,'rounded-2xl bg-zinc-900 text-white p-5 text-left','rounded-2xl bg-white text-zinc-900 p-5 text-left')}>
                  <div className="text-lg font-semibold">Ver compras</div>
                  <div className="text-sm opacity-70">Revisa, valida y notifica por WhatsApp.</div>
                </button>
                <button onClick={()=>setDrawerOpen(true)} className={tv(isDark,'rounded-2xl bg-zinc-900 text-white p-5 text-left','rounded-2xl bg-white text-zinc-900 p-5 text-left')}>
                  <div className="text-lg font-semibold">Administradores</div>
                  <div className="text-sm opacity-70">Agregar o quitar correos con acceso.</div>
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
        <a className="rounded-md bg-green-600 text-white px-2 py-1 text-sm" target="_blank" rel="noreferrer" href={`https://wa.me/${cleanPhone(item.phone)}?text=${encodeURIComponent('Hola '+item.customer+', tu servicio de '+item.service+' vence hoy. ¿Deseas renovarlo?')}`}>Recordatorio</a>
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
      <div className="absolute inset-0 bg-black/40"/>
      <aside className={`absolute right-0 top-0 h-full w-[320px] p-5 shadow-xl ${tv(isDark,'bg-white','bg-zinc-900 text-zinc-100')}`} onClick={e=>e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold">Administradores</h4>
          <button onClick={onClose} className={tv(isDark,'text-zinc-600 hover:text-zinc-800','text-zinc-300 hover:text-zinc-100')}>✕</button>
        </div>
        <p className={tv(isDark,'text-sm text-zinc-600','text-sm text-zinc-300')}>Los correos aquí listados podrán iniciar sesión como admin.</p>
        <div className="mt-4 flex gap-2">
          <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="nuevo@correo.com" className={`flex-1 rounded-xl border px-3 py-2 text-sm ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`}/>
          <button onClick={add} className={`rounded-xl px-3 py-2 text-sm ${tv(isDark,'bg-zinc-900 text-white','bg-white text-zinc-900')}`}>Agregar</button>
        </div>
        <ul className="mt-4 space-y-2">
          {adminEmails.map(e=> (
            <li key={e} className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm ${tv(isDark,'border-zinc-200','border-zinc-800')}`}>
              <span>{e}</span>
              <button onClick={()=>remove(e)} className={tv(isDark,'rounded-md bg-zinc-200 px-2','rounded-md bg-zinc-700 px-2 text-white')}>Quitar</button>
            </li>
          ))}
          {adminEmails.length===0 && <li className={tv(isDark,'text-sm text-zinc-600','text-sm text-zinc-300')}>Sin administradores.</li>}
        </ul>
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
      <div className="absolute inset-0 bg-black/40"/>
      <aside className={`absolute left-0 top-0 h-full w-[280px] p-5 shadow-xl ${tv(isDark,'bg-white','bg-zinc-900 text-zinc-100')}`} onClick={e=>e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold">Menú</h4>
          <button onClick={onClose} className={tv(isDark,'text-zinc-600 hover:text-zinc-800','text-zinc-300 hover:text-zinc-100')}>✕</button>
        </div>
        <nav className="space-y-2">
          <button onClick={()=>{setSubView('dashboard'); onClose();}} className={`w-full rounded-xl px-3 py-2 text-left ${tv(isDark,'bg-zinc-100','bg-zinc-800')}`}>Dashboard</button>
          <button onClick={()=>{setSubView('purchases'); onClose();}} className={`w-full rounded-xl px-3 py-2 text-left ${tv(isDark,'bg-zinc-100','bg-zinc-800')}`}>Compras</button>
          <button onClick={()=>{openAdmins(); onClose();}} className={`w-full rounded-xl px-3 py-2 text-left ${tv(isDark,'bg-zinc-100','bg-zinc-800')}`}>Administradores</button>
          <button onClick={()=>{onExportCSV(); onClose();}} className={`w-full rounded-xl px-3 py-2 text-left ${tv(isDark,'bg-zinc-100','bg-zinc-800')}`}>Exportar CSV</button>
          <button onClick={()=>{onLogout(); onClose();}} className={`w-full rounded-xl px-3 py-2 text-left ${tv(isDark,'bg-red-100 text-red-700','bg-red-800 text-white')}`}>Salir Admin</button>
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
    `*Reserva de ${service.name}*`,
    `*Cliente:* ${name}`,
    `*WhatsApp:* ${phone}`,
    `*Inicio:* ${start}`,
    `*Fin:* ${end}`,
    isAnnual ? `*Años:* ${years}` : `*Meses:* ${months}`,
    `*Total:* ${fmt(total)}`,
    notes ? `*Notas:* ${notes}` : ''
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

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className={tv(isDark,'text-xs text-zinc-600','text-xs text-zinc-300')}>Nombre</label><input className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} value={name} onChange={e=>setName(e.target.value)} placeholder="Tu nombre"/></div>
        <div><label className={tv(isDark,'text-xs text-zinc-600','text-xs text-zinc-300')}>WhatsApp</label><input className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+593..."/></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className={tv(isDark,'text-xs text-zinc-600','text-xs text-zinc-300')}>Inicio</label><input type="date" className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} value={start} onChange={e=>setStart(e.target.value)}/></div>
        <div><label className={tv(isDark,'text-xs text-zinc-600','text-xs text-zinc-300')}>{isAnnual?'Años':'Meses'}</label>{isAnnual?(<select className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} value={years} onChange={e=>setYears(Number(e.target.value))}>{[1,2,3].map(y=> <option key={y} value={y}>{y}</option>)}</select>):(<select className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} value={months} onChange={e=>setMonths(Number(e.target.value))}>{[1,2,3,6,12].map(m=> <option key={m} value={m}>{m}</option>)}</select>)}</div>
        <div><label className={tv(isDark,'text-xs text-zinc-600','text-xs text-zinc-300')}>Fin</label><input disabled className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'bg-zinc-50 border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} value={end}/></div>
      </div>
      <div><label className={tv(isDark,'text-xs text-zinc-600','text-xs text-zinc-300')}>Notas</label><textarea className={`w-full rounded-xl border px-3 py-2 ${tv(isDark,'border-zinc-300','border-zinc-700 bg-zinc-800 text-zinc-100')}`} rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Preferencias, usuario, correo, etc."/></div>
      <div className="flex items-center justify-between pt-2">
        <div className={tv(isDark,'text-sm text-zinc-700','text-sm text-zinc-300')}>Total: <strong>{fmt(total)}</strong></div>
        <div className="flex gap-2"><button onClick={onClose} className={tv(isDark,'rounded-xl bg-zinc-100 px-4 py-2','rounded-xl bg-zinc-800 px-4 py-2 text-white')}>Cancelar</button><button onClick={confirm} className={tv(isDark,'rounded-xl bg-zinc-900 px-4 py-2 text-white','rounded-xl bg-white px-4 py-2 text-zinc-900')}>Confirmar por WhatsApp</button></div>
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

import React, { useEffect, useMemo, useState } from "react";

