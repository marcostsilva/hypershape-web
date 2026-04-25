/**
 * Sanitização de Input — Utilitário anti-XSS.
 * 
 * Aplicar em todos os campos de texto livre antes de persistir no banco.
 * Integra com Zod via `.transform(sanitizeString)`.
 */

// ─── Caracteres perigosos comuns em XSS ──────────────────────

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
}

/**
 * Escapa caracteres HTML perigosos em uma string.
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char)
}

/**
 * Remove tags HTML/script de uma string.
 */
export function stripTags(str: string): string {
  return str.replace(/<[^>]*>/g, "")
}

/**
 * Sanitiza uma string para armazenamento seguro.
 * Remove tags HTML e trim de espaços extras.
 */
export function sanitizeString(str: string): string {
  return stripTags(str).trim()
}

/**
 * Sanitiza campos de texto em um objeto (shallow, 1 nível).
 * Útil para sanitizar payloads completos de forms.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj }
  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      (sanitized as Record<string, unknown>)[key] = sanitizeString(sanitized[key] as string)
    }
  }
  return sanitized
}

/**
 * Transformador Zod: use em schemas para sanitizar automaticamente.
 * 
 * Exemplo:
 *   z.string().transform(zodSanitize)
 */
export function zodSanitize(val: string): string {
  return sanitizeString(val)
}
