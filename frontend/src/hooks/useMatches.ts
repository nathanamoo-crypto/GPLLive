import { useEffect, useState } from 'react';
import { getMatches } from '../services/matchService';
import { Match } from '../types';

// Used by MainTabNavigator purely to decide whether the Home tab's
// live-match dot should show. This used to return a single hardcoded mock
// "live" match, which meant that dot was permanently on regardless of
// whether any real fixture was being played - swapped for a real fetch of
// live fixtures. The tab navigator stays mounted for the whole app session,
// and a fixture's live status can start/end while the app stays open, so
// this polls on an interval rather than fetching once and going stale.
const POLL_INTERVAL_MS = 60_000;

export function useMatches() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      getMatches(undefined, 'live')
        .then((data) => { if (!cancelled) setMatches(data ?? []); })
        .catch(() => { if (!cancelled) setMatches([]); });
    };
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return matches;
}
