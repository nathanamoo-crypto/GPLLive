// Stricter than a bare "something@something.something" check: validates
// each domain label (no leading/trailing hyphens, no empty labels from
// double dots) and requires a plausible, alphabetic-only TLD of 2+ chars
// (e.g. .com, .co.uk) so things like "a@b", "a@b.c1", or "a@b..com" are
// rejected. Still format-only - "gmail.con" satisfies this just fine since
// "con" is 3 alphabetic characters, which is why COMMON_TLDS/TLD_TYPOS
// below exist to catch that specific class of typo.
export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
export const MIN_PASSWORD_LENGTH = 8;
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// The last dot-separated label of the domain (e.g. "com" out of
// "gmail.com", "uk" out of "outlook.co.uk") has to be one of these -
// otherwise EMAIL_REGEX alone would happily accept "gmail.con",
// "yahoo.cmo", etc. Covers the generic TLDs real users actually type plus
// the ccTLDs most relevant here (Ghana and neighbours) - not exhaustive of
// every TLD that has ever existed, but exhaustive enough that a genuine,
// uncommon TLD is far less likely than a typo of a common one.
const COMMON_TLDS = new Set([
  'com', 'net', 'org', 'edu', 'gov', 'mil', 'int', 'co', 'io', 'info', 'biz',
  'me', 'app', 'dev', 'xyz', 'name', 'pro',
  'gh', 'ng', 'ke', 'za', 'ug', 'tz', 'rw',
  'uk', 'us', 'ca', 'au', 'nz', 'ie', 'in', 'de', 'fr', 'es', 'it', 'nl',
]);

// Common one/two-character slips on the most-typed TLDs - "con"/"cim" for
// "com" (adjacent keys), "ne" for "net", etc. Only used to produce a
// friendlier "did you mean" message; anything not in here still just gets
// the generic rejection.
const TLD_TYPOS: Record<string, string> = {
  con: 'com', cim: 'com', comm: 'com', cm: 'com', vom: 'com', ocm: 'com',
  ney: 'net', nte: 'net',
  ogr: 'org', orgg: 'org',
};

function extractTld(email: string): string | null {
  const domain = email.trim().split('@')[1];
  if (!domain) return null;
  const parts = domain.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : null;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return 'Email is required.';
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  const tld = extractTld(email);
  if (tld && !COMMON_TLDS.has(tld)) {
    const suggestion = TLD_TYPOS[tld];
    return suggestion
      ? `Did you mean ".${suggestion}" instead of ".${tld}"?`
      : `".${tld}" doesn't look like a valid domain ending - please check your email.`;
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
