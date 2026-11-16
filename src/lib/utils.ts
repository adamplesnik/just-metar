export type Theme = 'light' | 'dark' | 'system'

export const isIcao = (c: unknown): c is string =>
  typeof c === 'string' && /^[A-Z]{4}$/.test(c)

export function load(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null // storage unavailable (private mode, SSR, blocked)
  }
}

export function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // storage unavailable (private mode / quota): keep in memory only
  }
}
