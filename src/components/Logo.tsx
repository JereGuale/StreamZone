import React from "react";

// ===================== Logo =====================
export function Logo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <img
      src="/logo_app.png"
      alt="StreamZone logo"
      className={`object-contain transition-transform hover:scale-105 ${className}`}
    />
  );
}