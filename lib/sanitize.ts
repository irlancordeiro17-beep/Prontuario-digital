/**
 * lib/sanitize.ts
 * Input sanitization utilities for the Prontuário Social MVP.
 * Prevents XSS and injection via user-supplied query strings.
 */

/** Strip HTML tags and dangerous characters from a string */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return ''
  return input
    .trim()
    .replace(/<[^>]*>/g, '')          // strip HTML tags
    .replace(/[<>"'`\\]/g, '')         // strip dangerous chars
    .replace(/\s+/g, ' ')              // collapse whitespace
    .slice(0, 200)                     // hard limit — never allow huge strings
}

/** Sanitize a CPF — allow only digits and dots/dashes */
export function sanitizeCPF(input: string): string {
  if (!input || typeof input !== 'string') return ''
  return input.replace(/[^0-9.\-]/g, '').slice(0, 14)
}

/** Sanitize a CNS — allow only digits */
export function sanitizeCNS(input: string): string {
  if (!input || typeof input !== 'string') return ''
  return input.replace(/[^0-9]/g, '').slice(0, 15)
}

/** Detect if a string looks like a CPF query */
export function isCPFQuery(q: string): boolean {
  return /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(q.trim())
}

/** Detect if a string looks like a CNS query */
export function isCNSQuery(q: string): boolean {
  return /^\d{15}$/.test(q.trim())
}

/** General search query sanitizer — returns safe search term */
export function sanitizeSearchQuery(raw: string): string {
  if (!raw) return ''
  const s = sanitizeText(raw)
  if (isCPFQuery(s)) return sanitizeCPF(s)
  if (isCNSQuery(s)) return sanitizeCNS(s)
  return s
}
