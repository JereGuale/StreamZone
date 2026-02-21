import React from 'react';

// ==================== Image-based logos (real platform logos) ====================
const IMAGE_LOGOS: Record<string, string> = {
  netflix: '/logos/netflix.png',
  disney_premium: '/logos/disney_premium.png',
  disney_standard: '/logos/disney_standard.jpeg',
  max: '/logos/max.jpeg',
  spotify: '/logos/spotify.jpeg',
  chatgpt: '/logos/chatgpt.png',
  deezer: '/logos/deezer.png',
  crunchy: '/logos/crunchyroll.png',
  paramount: '/logos/paramount.png',
  youtube_premium: '/logos/youtube_premium.png',
  office365: '/logos/office365.jpeg',
  microsoft365: '/logos/office365.jpeg',
};

// ==================== SVG fallback logos for platforms without images ====================

interface LogoProps {
  size?: number;
  className?: string;
}

function VixLogo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      <defs>
        <linearGradient id="vix-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="10" fill="url(#vix-grad)" />
      <text x="24" y="31" fontFamily="Arial,sans-serif" fontSize="16" fontWeight="800" fill="#fff" textAnchor="middle">ViX</text>
    </svg>
  );
}

function PrimeVideoLogo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      <defs>
        <linearGradient id="prime-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00a8e1" />
          <stop offset="100%" stopColor="#1a73e8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="10" fill="#232f3e" />
      <text x="24" y="28" fontFamily="Arial,sans-serif" fontSize="11" fontWeight="700" fill="#fff" textAnchor="middle">prime</text>
      <path d="M12 34 C20 30, 28 30, 36 34" stroke="url(#prime-grad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M33 32 l3 2 l1 -4" stroke="url(#prime-grad)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AppleTVLogo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      <rect width="48" height="48" rx="10" fill="#1c1c1e" />
      <path d="M24 12c1-3 4-4.5 4-4.5s.2 2.2-1 3.8c-1.3 1.7-2.7 1.4-2.7 1.4s-.3-1.3.7-2.7z" fill="#a8a8a8" transform="translate(-2,2) scale(0.8)" />
      <path d="M18 22c1.5-3 5-3 5-3s.5 2-1 4.5-3.5 3-5 3 .5-3.5 1-4.5z" fill="#a8a8a8" transform="translate(4,4) scale(0.7)" />
      <text x="24" y="38" fontFamily="Arial,sans-serif" fontSize="9" fontWeight="600" fill="#a8a8a8" textAnchor="middle">tv+</text>
    </svg>
  );
}

function CanvaLogo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      <defs>
        <linearGradient id="canva-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#00c4cc" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="10" fill="url(#canva-grad)" />
      <circle cx="24" cy="24" r="12" fill="rgba(255,255,255,0.2)" />
      <text x="24" y="30" fontFamily="Arial,sans-serif" fontSize="18" fontWeight="700" fill="#fff" textAnchor="middle">C</text>
    </svg>
  );
}

function AutodeskLogo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className}>
      <defs>
        <linearGradient id="autodesk-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3c3c3c" />
          <stop offset="100%" stopColor="#1a1a1a" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="10" fill="url(#autodesk-grad)" />
      <polygon points="24,10 38,38 10,38" fill="none" stroke="#00bfff" strokeWidth="2.5" />
      <polygon points="24,18 28,28 20,28" fill="#00bfff" opacity="0.3" />
      <text x="24" y="32" fontFamily="Arial,sans-serif" fontSize="9" fontWeight="700" fill="#fff" textAnchor="middle">A</text>
    </svg>
  );
}

const SVG_LOGOS: Record<string, React.FC<LogoProps>> = {
  vix: VixLogo,
  prime: PrimeVideoLogo,
  apple_tv: AppleTVLogo,
  canva_pro: CanvaLogo,
  canva_pro_annual: CanvaLogo,
  autodesk: AutodeskLogo,
};

// ==================== Public API ====================

/**
 * Returns a React element for the platform logo.
 * Uses real images when available, SVG fallback otherwise.
 * Returns null if no logo is found (caller should render text fallback).
 */
export function getPlatformLogo(id: string, size: number = 48, className: string = ''): React.ReactNode | null {
  // Check for image-based logo first
  const imagePath = IMAGE_LOGOS[id];
  if (imagePath) {
    return (
      <img
        src={imagePath}
        alt={id}
        width={size || undefined}
        height={size || undefined}
        className={`object-cover ${className}`}
        loading="lazy"
      />
    );
  }

  // Check for SVG fallback
  const SvgLogo = SVG_LOGOS[id];
  if (SvgLogo) {
    return <SvgLogo size={size} className={className} />;
  }

  return null;
}

/**
 * For combos — extracts the individual service IDs from a combo ID and returns an array of logo elements.
 * E.g. "netflix_disney_std" → logos for netflix + disney_standard
 */
const COMBO_SERVICE_MAP: Record<string, string[]> = {
  netflix_disney_std: ['netflix', 'disney_standard'],
  netflix_disney_premium: ['netflix', 'disney_premium'],
  netflix_max: ['netflix', 'max'],
  netflix_prime: ['netflix', 'prime'],
  prime_disney_std: ['prime', 'disney_standard'],
  disney_premium_max: ['disney_premium', 'max'],
  max_prime: ['max', 'prime'],
  paramount_max_prime: ['paramount', 'max', 'prime'],
  mega_combo: ['netflix', 'max', 'disney_premium', 'prime', 'paramount'],
  spotify_netflix: ['spotify', 'netflix'],
  spotify_disney_premium: ['spotify', 'disney_premium'],
  spotify_prime: ['spotify', 'prime'],
  netflix_spotify_disney_std: ['netflix', 'spotify', 'disney_standard'],
  netflix_spotify_prime: ['netflix', 'spotify', 'prime'],
  disney_max: ['disney_premium', 'max'],
  spotify_disney: ['spotify', 'disney_premium'],
  hbomax_disney: ['max', 'disney_premium'],
  netflix_hbomax: ['netflix', 'max'],
  vix_prime: ['vix', 'prime'],
  canva_autodesk: ['canva_pro', 'autodesk'],
};

// Helper to sanitize and match service IDs from random strings
function findServiceIdInString(str: string): string | null {
  const s = str.toLowerCase();
  if (s.includes('netflix')) return 'netflix';
  if (s.includes('disney') && s.includes('premium')) return 'disney_premium';
  if (s.includes('disney') && s.includes('standard')) return 'disney_standard';
  if (s.includes('disney')) return 'disney_premium'; // Default
  if (s.includes('max') || s.includes('hbo')) return 'max';
  if (s.includes('spotify')) return 'spotify';
  if (s.includes('prime')) return 'prime';
  if (s.includes('chatgpt')) return 'chatgpt';
  if (s.includes('deezer')) return 'deezer';
  if (s.includes('crunchy')) return 'crunchy';
  if (s.includes('paramount')) return 'paramount';
  if (s.includes('vix')) return 'vix';
  if (s.includes('youtube')) return 'youtube_premium';
  if (s.includes('canva')) return 'canva_pro';
  if (s.includes('autodesk')) return 'autodesk';
  if (s.includes('apple')) return 'apple_tv';
  return null;
}

export function getComboLogos(comboId: string, size: number = 32, comboName?: string): React.ReactNode[] {
  let serviceIds = COMBO_SERVICE_MAP[comboId];

  // Smart detection fallback
  if (!serviceIds) {
    const textToParse = (comboName || comboId).toLowerCase();
    // Try splitting by common delimiters
    const parts = textToParse.split(/[\s+_]+/).filter(Boolean);
    const detected = parts.map(findServiceIdInString).filter(Boolean) as string[];

    // Unique IDs only
    serviceIds = Array.from(new Set(detected));
  }

  if (!serviceIds || serviceIds.length === 0) return [];

  return serviceIds
    .map((id) => getPlatformLogo(id, size, 'rounded-lg'))
    .filter(Boolean) as React.ReactNode[];
}
