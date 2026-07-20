import api from './api';
import { AUTH_URL } from '../constants/apiUrls';
import { CLUB_BY_SLUG } from '../constants/clubs';
import { Logos } from '../constants/logos';
import { BACKEND_CLUB_NAME_TO_SLUG } from '../constants/backendClubMap';
import type { Club } from '../types';
import type { ImageSourcePropType } from 'react-native';

// A club as it actually exists on the backend - real id, real name - paired
// with a locally bundled badge image resolved via BACKEND_CLUB_NAME_TO_SLUG.
export interface RealClub {
  id: number;
  fullName: string;
  shortName: string;
  city: string;
  badge: ImageSourcePropType | null;
}

function resolveBadge(fullName: string): ImageSourcePropType | null {
  const slug = BACKEND_CLUB_NAME_TO_SLUG[fullName];
  if (!slug) return null;
  const localClub = CLUB_BY_SLUG[slug];
  if (!localClub) return null;
  return Logos[localClub.id] ?? null;
}

export async function fetchClubs(signal?: AbortSignal): Promise<RealClub[]> {
  const { data } = await api.get<any[]>('/clubs', { baseURL: AUTH_URL, signal });
  return (data ?? []).map((c: any) => ({
    id: c.id,
    fullName: c.fullName ?? c.full_name,
    shortName: c.shortName ?? c.short_name,
    city: c.city,
    badge: resolveBadge(c.fullName ?? c.full_name),
  }));
}

// Same data as fetchClubs(), keyed by the backend's real club id - for
// screens that only have a raw clubId (e.g. Player.clubId from
// fetchPlayers()) and need to look up the matching name/badge.
export async function fetchClubsById(signal?: AbortSignal): Promise<Record<number, RealClub>> {
  const clubs = await fetchClubs(signal);
  const byId: Record<number, RealClub> = {};
  for (const club of clubs) {
    byId[club.id] = club;
  }
  return byId;
}

// Converts a backend club (real id, e.g. from the user's favouriteClub) into
// this app's local Club shape for display, via the same name->slug mapping.
// Deliberately keeps the LOCAL id/badgeUrl here (not the backend's real id) -
// this is for feeding UI that still keys off the local club list
// (CLUB_LOOKUP etc). Anything that needs to talk to the backend about a
// specific club should use the real id from fetchClubs() directly, not this.
export function backendClubToLocalClub(fullName: string): Club | null {
  const slug = BACKEND_CLUB_NAME_TO_SLUG[fullName];
  if (!slug) return null;
  return CLUB_BY_SLUG[slug] ?? null;
}

// Chains the two lookups above: given a raw backend clubId (e.g.
// Player.clubId) and a clubsById map from fetchClubsById(), resolves the
// matching LOCAL club - for components that key off the local club list
// (CLUB_COLORS, CLUB_LOOKUP) rather than displaying backend data directly.
export function backendClubIdToLocalClub(
  backendClubId: number,
  clubsById: Record<number, RealClub>
): Club | null {
  const real = clubsById[backendClubId];
  if (!real) return null;
  return backendClubToLocalClub(real.fullName);
}
