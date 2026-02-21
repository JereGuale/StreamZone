// ===================== Servicios Originales =====================
export const SERVICES = [
  { id: "netflix", name: "Netflix", price: 4.0, billing: "monthly", color: "bg-red-600", logo: "N" },
  { id: "disney_premium", name: "Disney+ Premium", price: 3.75, billing: "monthly", color: "bg-blue-600", logo: "D+" },
  { id: "disney_standard", name: "Disney+ Standard", price: 3.25, billing: "monthly", color: "bg-blue-500", logo: "D+" },
  { id: "max", name: "Max", price: 3.0, billing: "monthly", color: "bg-purple-700", logo: "MAX" },
  { id: "vix", name: "ViX", price: 2.5, billing: "monthly", color: "bg-orange-500", logo: "ViX" },
  { id: "prime", name: "Prime Video", price: 3.0, billing: "monthly", color: "bg-sky-700", logo: "PV" },
  { id: "youtube_premium", name: "YouTube Premium", price: 3.35, billing: "monthly", color: "bg-red-700", logo: "YT" },
  { id: "paramount", name: "Paramount+", price: 2.75, billing: "monthly", color: "bg-indigo-600", logo: "P+" },
  { id: "chatgpt", name: "ChatGPT", price: 4.0, billing: "monthly", color: "bg-zinc-800", logo: "GPT" },
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

export const COMBOS = [
  { id: "netflix_disney_std", name: "Netflix + Disney Estándar", price: 6.0, billing: "monthly", color: "bg-gradient-to-r from-red-600 to-blue-500", logo: "N+D" },
  { id: "netflix_disney_premium", name: "Netflix + Disney Premium", price: 6.5, billing: "monthly", color: "bg-gradient-to-r from-red-600 to-blue-600", logo: "N+D+" },
  { id: "netflix_max", name: "Netflix + Max", price: 6.0, billing: "monthly", color: "bg-gradient-to-r from-red-600 to-purple-700", logo: "N+MAX" },
  { id: "disney_max", name: "Disney + Max", price: 5.5, billing: "monthly", color: "bg-gradient-to-r from-blue-600 to-purple-700", logo: "D+MAX" },
  { id: "spotify_disney", name: "Spotify + Disney", price: 5.0, billing: "monthly", color: "bg-gradient-to-r from-emerald-600 to-blue-500", logo: "SP+D+" },
  { id: "netflix_spotify_disney_std", name: "Netflix + Spotify + Disney Standar", price: 8.0, billing: "monthly", color: "bg-gradient-to-r from-red-600 via-emerald-600 to-blue-500", logo: "N+SP+D" },
  { id: "netflix_spotify_prime", name: "Netflix + Spotify + Prime Video", price: 8.0, billing: "monthly", color: "bg-gradient-to-r from-red-600 via-emerald-600 to-sky-700", logo: "N+SP+PV" }
] as const;


