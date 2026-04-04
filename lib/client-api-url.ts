/**
 * Build an absolute API URL when NEXT_PUBLIC_APP_URL is set (e.g. unusual hosting);
 * otherwise same-origin relative paths are used (normal Next.js on Vercel or localhost).
 */
export function apiPath(path: string): string {
  const base =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
      : ''
  const p = path.startsWith('/') ? path : `/${path}`
  return base ? `${base}${p}` : p
}
