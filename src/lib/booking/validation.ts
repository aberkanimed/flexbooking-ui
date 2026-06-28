// ponytail: simple RFC-5321 surface check; upgrade to a full parser if bounce rates surface edge cases
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}
