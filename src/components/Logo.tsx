import React from "react";

// ===================== Logo =====================
export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <img
      src="/logo_app.png"
      alt="StreamZone logo"
      className={`object-contain ${className}`}
    />
  );
}