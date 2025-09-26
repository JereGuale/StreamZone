import React from 'react';
import { tv } from '../utils/helpers';

interface FloatingThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function FloatingThemeToggle({ isDark, onToggle }: FloatingThemeToggleProps) {
  return (
    <button
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      onClick={onToggle}
      className={`fixed bottom-5 left-5 z-40 grid h-11 w-11 place-content-center rounded-full shadow-lg ring-1 ${isDark ? 'bg-white text-zinc-900 ring-zinc-200' : 'bg-zinc-900 text-white ring-zinc-800'}`}
    >
      {isDark ? '☀' : '☾'}
    </button>
  );
}