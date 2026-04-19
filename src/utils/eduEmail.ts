/**
 * Campus-only sign-in — enforced in this app only, not in Supabase.
 * Supabase Auth will accept any email unless you add a server hook / Edge Function.
 *
 * Rules: trimmed, lowercased domain must end with `.edu` (e.g. you@lsu.edu).
 */
export const EDU_EMAIL_REQUIRED_MESSAGE =
  'Use your school email address (must end in .edu).';

export function isEduEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes('@')) return false;
  return normalized.endsWith('.edu');
}

/** Call before signIn / signUp; throws Error with {@link EDU_EMAIL_REQUIRED_MESSAGE} if invalid. */
export function assertEduEmail(email: string): void {
  if (!isEduEmail(email)) {
    throw new Error(EDU_EMAIL_REQUIRED_MESSAGE);
  }
}

/**
 * Inline hint while typing: only show once the address looks like an email (`@` present).
 */
export function eduEmailInlineHint(email: string): string | undefined {
  const t = email.trim();
  if (!t.includes('@')) return undefined;
  if (!isEduEmail(t)) return EDU_EMAIL_REQUIRED_MESSAGE;
  return undefined;
}
