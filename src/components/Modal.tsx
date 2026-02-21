import React from "react";
import { tv } from "../utils/helpers_original";

// ===================== Modal =====================
export function Modal({ open, onClose, children, title, isDark, className }:{ 
  open:boolean; 
  onClose:()=>void; 
  children:React.ReactNode; 
  title:string; 
  isDark:boolean; 
  className?:string; 
}){
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