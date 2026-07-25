// Stricter than a bare "something@something.something" check: validates
// each domain label (no leading/trailing hyphens, no empty labels from
// double dots) and requires a plausible, alphabetic-only TLD of 2+ chars
// (e.g. .com, .co.uk) so things like "a@b", "a@b.c1", or "a@b..com" are
// rejected. Still format-only - this can't confirm the address actually
// exists/receives mail, just that it's shaped like a real one.
export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
export const MIN_PASSWORD_LENGTH = 8;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return 'Email is required.';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return null;
}

// Format-only check (length + allowed characters) - actual uniqueness is
// enforced server-side and surfaced as a 409 from the register request.
export function validateUsername(username: string): string | null {
  if (!username.trim()) {
    return 'Username is required.';
  }
  if (!USERNAME_REGEX.test(username.trim())) {
    return '3-20 characters: letters, numbers, and underscores only.';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
