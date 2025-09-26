import React from "react";
import { tv } from "../utils/helpers_original";

// ===================== Badge =====================
export function Badge({ children, isDark }: { children: React.ReactNode; isDark: boolean; }){ 
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tv(isDark,'bg-zinc-100 text-zinc-700 ring-zinc-200','bg-zinc-800 text-zinc-200 ring-zinc-700')}`}>{children}</span>; 
}