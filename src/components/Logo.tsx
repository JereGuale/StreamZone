import React from "react";

// ===================== Logo =====================
export function Logo({ className = "h-9 w-9" }: { className?: string }){
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