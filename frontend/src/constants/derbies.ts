import { Club } from '../types';

// High-stakes GPL matchups that automatically carry the derby +2
// prediction-point bonus. Keyed by sorted club slugs (a,b / b,a equal), so
// order of home/away doesn't matter.
const DERBY_PAIRS: [string, string][] = [
  // The GPL's flagship clash - the "Super Clásico".
  ['asante_kotoko', 'hearts_of_oak'],
  // Kumasi derby - both clubs share the city.
  ['asante_kotoko', 'nations_fc'],
  // Accra derbies.
  ['hearts_of_oak', 'dreams_fc'],
  ['hearts_of_oak', 'heart_of_lions'],
  // Western Region derby - the gold-mining towns.
  ['medeama_sc', 'samartex'],
  // Bono/Ahafo region derbies.
  ['aduana_stars', 'berekum_chelsea'],
  ['bibiani_gold_stars', 'bechem_united'],
];

const DERBY_LOOKUP: Record<string, boolean> = {};
for (const [a, b] of DERBY_PAIRS) {
  DERBY_LOOKUP[[a, b].sort().join('|')] = true;
}

function slugOf(club: { id?: number; slug?: string; name?: string }): string {
  if (club.slug) return club.slug;
  // Fallback for clubs built without a slug: derive one from the name.
  return (club.name ?? `club_${club.id ?? 0}`).toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

export function isDerbyMatch(homeClub: Club, awayClub: Club): boolean {
  const key = [slugOf(homeClub), slugOf(awayClub)].sort().join('|');
  return DERBY_LOOKUP[key] === true;
}