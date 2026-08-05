import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../../constants/colors';
import { fonts, getScrollBottomPadding } from '../../constants/layout';
import { useTheme } from '../../context/ThemeContext';
import type { Match, StandingRow } from '../../types';
import type { FixturesStackParamList } from '../../navigation/FixturesStack';
import FixtureRow from '../../components/shared/FixtureRow';
import { Logos } from '../../constants/logos';
import { getMatches } from '../../services/matchService';
import { getCurrentGameweek, getGameweeksBySeason, getAllSeasons } from '../../services/fantasyService';
import { fetchStandings } from '../../services/standingsService';
import { getApiErrorMessage } from '../../services/api';

type FixturesNavProp = NativeStackNavigationProp<FixturesStackParamList, 'FixturesRoot'>;
type FixturesRootRouteProp = RouteProp<FixturesStackParamList, 'FixturesRoot'>;

const FILTER_OPTIONS = ['All', 'Live', 'Scheduled', 'Completed'] as const;

export default function FixturesRoot() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<FixturesNavProp>();
  const route = useRoute<FixturesRootRouteProp>();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [filter, setFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'fixtures' | 'table'>(route.params?.defaultTab || 'fixtures');

  // Table used to be reached by tapping a separate bottom tab (which always
  // remounted this screen fresh); now it's also reachable by deep-linking
  // in here (e.g. from the Profile menu) while this screen may already be
  // mounted from the Fixtures tab - re-apply the param if it changes under
  // an already-mounted instance.
  useEffect(() => {
    if (route.params?.defaultTab) {
      setActiveTab(route.params.defaultTab);
    }
  }, [route.params?.defaultTab]);

  // The screen defaults to the REAL current season/gameweek (from the
  // backend's is_current gameweek), not "whatever the highest gameweek
  // number happens to be across every fixture ever seeded" (the old
  // behaviour, which is how a stale/finished season could show up as
  // "current"). Browsing other gameweeks within the loaded season uses the
  // chevrons; jumping to a totally different season+gameweek (including
  // past seasons) is the explicit search below, closed by default so past
  // fixtures never show up unasked-for.
  //
  // `selectedGw` (not just a number) is what actually drives the fixtures
  // fetch below, since getCurrentGameweek()/search both already hand back a
  // real gameweek id directly - fixtures can load as soon as THAT resolves,
  // without waiting on the full season gameweek list too. `seasonGameweeks`
  // loads in parallel purely to know the prev/next chevron bounds.
  const [realCurrent, setRealCurrent] = useState<{ id: number; season: string; gameweekNumber: number; startDate?: string } | null>(null);
  const [season, setSeason] = useState<string | null>(null);
  const [seasonGameweeks, setSeasonGameweeks] = useState<{ id: number; gameweekNumber: number }[]>([]);
  const [selectedGw, setSelectedGw] = useState<{ id: number; gameweekNumber: number } | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchSeason, setSearchSeason] = useState('');
  const [searchMatchday, setSearchMatchday] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [seasonHasNoGameweeks, setSeasonHasNoGameweeks] = useState(false);
  // Surfaces the real backend error when the season-scoped gameweek list
  // (chevron bounds) fails to load, instead of silently leaving the
  // chevrons disabled with no explanation - that silence is exactly what
  // made a real backend 500 look like "the toggle just doesn't work".
  const [seasonLoadError, setSeasonLoadError] = useState<string | null>(null);

  // Every season that has any gameweek data at all - lets the search box
  // tell "that season doesn't exist in our records" (e.g. 2017/2018) apart
  // from "that season exists but doesn't have gameweek N".
  const [allSeasons, setAllSeasons] = useState<string[]>([]);

  // Bootstraps to the real current season/gameweek on mount.
  useEffect(() => {
    let cancelled = false;
    getCurrentGameweek()
      .then((gw) => {
        if (cancelled) return;
        if (!gw?.season) {
          setLoading(false);
          setFetchError('No current gameweek is set yet.');
          return;
        }
        setRealCurrent({ id: gw.gameweekId, season: gw.season, gameweekNumber: gw.gameweekNumber, startDate: gw.startDate });
        setSeason(gw.season);
        setSelectedGw({ id: gw.gameweekId, gameweekNumber: gw.gameweekNumber });
      })
      .catch((err: any) => {
        if (!cancelled) {
          setLoading(false);
          setFetchError(err?.message ?? 'Failed to load the current gameweek.');
        }
      });
    getAllSeasons().then((seasons) => { if (!cancelled) setAllSeasons(seasons); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Loads every gameweek in the selected season, purely for chevron bounds -
  // doesn't gate the fixtures fetch below, so a slow/failed load here never
  // blocks the actual fixture list from showing.
  useEffect(() => {
    if (!season) return;
    let cancelled = false;
    setSeasonLoadError(null);
    getGameweeksBySeason(season)
      .then((gws) => {
        if (cancelled) return;
        const list = gws
          .map((gw) => ({ id: gw.gameweekId, gameweekNumber: gw.gameweekNumber }))
          .sort((a, b) => a.gameweekNumber - b.gameweekNumber);
        setSeasonGameweeks(list);
        setSeasonHasNoGameweeks(list.length === 0);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setSeasonGameweeks([]);
        // Chevrons rely on this list, so a failure here is exactly why
        // prev/next stops working even though the fixture list itself
        // loaded fine - show it instead of failing silently.
        setSeasonLoadError(getApiErrorMessage(err, 'Failed to load this season\'s gameweeks.'));
      });
    return () => { cancelled = true; };
  }, [season]);

  // Fetches fixtures for whichever gameweek is selected - the one network
  // call actually gating the loading spinner/fixture list.
  useEffect(() => {
    if (!selectedGw) return;
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    getMatches(selectedGw.id)
      .then((data) => { if (!cancelled) setMatches(data ?? []); })
      .catch((err: any) => { if (!cancelled) setFetchError(err?.message ?? 'Failed to load fixtures.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedGw]);

  const gwIndex = seasonGameweeks.findIndex((gw) => gw.gameweekNumber === selectedGw?.gameweekNumber);

  const goPrevGameweek = () => {
    if (gwIndex > 0) setSelectedGw(seasonGameweeks[gwIndex - 1]);
  };

  const goNextGameweek = () => {
    if (gwIndex >= 0 && gwIndex < seasonGameweeks.length - 1) {
      setSelectedGw(seasonGameweeks[gwIndex + 1]);
    }
  };

  const handleSearch = useCallback(async () => {
    const targetSeason = searchSeason.trim();
    const targetGameweek = parseInt(searchMatchday, 10);
    if (!targetSeason || Number.isNaN(targetGameweek)) {
      setSearchError('Enter both a season (e.g. 2025/2026) and a gameweek number.');
      return;
    }
    setSearchError(null);
    try {
      const gws = await getGameweeksBySeason(targetSeason);
      const found = gws.find((gw) => gw.gameweekNumber === targetGameweek);
      if (!found) {
        // Season genuinely doesn't exist in our records at all (e.g.
        // someone tries 2017/2018) vs. it exists but doesn't go up to
        // gameweek N - two different reasons for coming up empty that
        // deserve two different messages.
        if (allSeasons.length > 0 && !allSeasons.includes(targetSeason)) {
          setSearchError(`We don't have any records for the ${targetSeason} season - our data starts from ${allSeasons[0]}.`);
        } else {
          setSearchError(`No gameweek ${targetGameweek} found for ${targetSeason}.`);
        }
        return;
      }
      setSeason(targetSeason);
      setSelectedGw({ id: found.gameweekId, gameweekNumber: found.gameweekNumber });
      setSearchOpen(false);
    } catch (err: any) {
      setSearchError(getApiErrorMessage(err, 'Search failed.'));
    }
  }, [searchSeason, searchMatchday, allSeasons]);

  const backToCurrent = () => {
    if (!realCurrent) return;
    setSeason(realCurrent.season);
    setSelectedGw({ id: realCurrent.id, gameweekNumber: realCurrent.gameweekNumber });
    setSearchError(null);
    setSearchOpen(false);
  };

  const filtered = useMemo(() => {
    if (filter === 'All') return matches;
    if (filter === 'Live') return matches.filter((m) => m.status === 'live');
    if (filter === 'Scheduled') return matches.filter((m) => m.status === 'scheduled');
    return matches.filter((m) => m.status === 'finished');
  }, [filter, matches]);

  const gameweekDate = useMemo(() => {
    if (matches.length === 0) return '';
    const dates = matches.map((m) => new Date(m.kickoffTime));
    const min = new Date(Math.min(...dates.map(Number)));
    const max = new Date(Math.max(...dates.map(Number)));
    if (min.toDateString() === max.toDateString()) {
      return min.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    }
    return `${min.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${max.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  }, [matches]);

  const isCurrentGw = !!realCurrent && realCurrent.season === season && realCurrent.gameweekNumber === selectedGw?.gameweekNumber;
  const isViewingOtherSeason = !!realCurrent && season !== null && season !== realCurrent.season;

  // The gameweek stays flagged "current" on the backend right up until its
  // deadline (predictions/transfers/chips all depend on that), but showing
  // a "CURRENT" badge before a ball's even been kicked reads as wrong -
  // label it "UPCOMING" until the gameweek's actual start date arrives.
  const currentGwHasStarted = !realCurrent?.startDate || Date.parse(realCurrent.startDate) <= Date.now();
  const currentBadgeLabel = currentGwHasStarted ? 'CURRENT' : 'UPCOMING';

  // Distinguishes "this season has no gameweeks scheduled at all yet" (e.g.
  // the new season before anything's been entered) from "this gameweek
  // exists but has no fixtures in it" from "fixtures exist but none match
  // the Live/Scheduled/Completed filter" - three different reasons for an
  // empty list that deserve different messages.
  const emptyStateMessage = seasonHasNoGameweeks
    ? `The ${season} season hasn't been scheduled yet - check back closer to kickoff.`
    : matches.length === 0
      ? `No fixtures set for Gameweek ${selectedGw?.gameweekNumber} yet.`
      : 'No matches found for this filter.';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {activeTab === 'fixtures' ? (
        <>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.tableButton}
              onPress={goPrevGameweek}
              disabled={gwIndex <= 0}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={gwIndex <= 0 ? colors.surface2 : colors.grey1}
              />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{selectedGw != null ? `GAMEWEEK ${selectedGw.gameweekNumber}` : 'FIXTURES'}</Text>
              {isCurrentGw && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>{currentBadgeLabel}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.tableButton}
              onPress={goNextGameweek}
              disabled={gwIndex < 0 || gwIndex >= seasonGameweeks.length - 1}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={gwIndex < 0 || gwIndex >= seasonGameweeks.length - 1 ? colors.surface2 : colors.grey1}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.searchToggle}
              onPress={() => setSearchOpen((prev) => !prev)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="search-outline" size={18} color={colors.grey1} />
            </TouchableOpacity>
          </View>

          {season ? <Text style={styles.seasonSubtitle}>{season} season</Text> : null}
          {gameweekDate ? <Text style={styles.dateSubtitle}>{gameweekDate}</Text> : null}
          {seasonLoadError ? <Text style={styles.errorText}>{seasonLoadError}</Text> : null}

          {searchOpen ? (
            <View style={styles.searchBox}>
              <Text style={styles.searchLabel}>Search by season and gameweek</Text>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Season, e.g. 2025/2026"
                  placeholderTextColor={colors.textTertiary}
                  value={searchSeason}
                  onChangeText={setSearchSeason}
                  autoCapitalize="none"
                />
                <TextInput
                  style={[styles.searchInput, styles.searchInputSmall]}
                  placeholder="GW"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                  value={searchMatchday}
                  onChangeText={setSearchMatchday}
                />
                <TouchableOpacity style={styles.searchGoButton} onPress={handleSearch}>
                  <Text style={styles.searchGoButtonText}>Go</Text>
                </TouchableOpacity>
              </View>
              {searchError ? <Text style={styles.searchErrorText}>{searchError}</Text> : null}
            </View>
          ) : null}

          {isViewingOtherSeason ? (
            <TouchableOpacity style={styles.backToCurrentRow} onPress={backToCurrent}>
              <Ionicons name="arrow-back-circle-outline" size={16} color={colors.yellow} />
              <Text style={styles.backToCurrentText}>Back to current season</Text>
            </TouchableOpacity>
          ) : null}
        </>
      ) : null}

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'fixtures' && styles.tabActive]}
          onPress={() => setActiveTab('fixtures')}
        >
          <Text style={[styles.tabText, activeTab === 'fixtures' && styles.tabTextActive]}>
            Fixtures
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'table' && styles.tabActive]}
          onPress={() => setActiveTab('table')}
        >
          <Text style={[styles.tabText, activeTab === 'table' && styles.tabTextActive]}>
            Table
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : fetchError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{fetchError}</Text>
        </View>
      ) : activeTab === 'fixtures' ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={styles.filterContent}
          >
            {FILTER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.filterChip, filter === opt && styles.filterChipActive]}
                onPress={() => setFilter(opt)}
              >
                <Text style={[styles.filterText, filter === opt && styles.filterTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: getScrollBottomPadding(insets.bottom) },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
                <Text style={styles.emptyText}>{emptyStateMessage}</Text>
              </View>
            ) : (
              filtered.map((match) => (
                <FixtureRow
                  key={match.id}
                  match={match}
                  onPress={() =>
                    navigation.navigate('MatchDetails', { matchId: match.id })
                  }
                />
              ))
            )}
          </ScrollView>
        </>
      ) : (
        <StandingsView />
      )}
    </View>
  );
}

type StandingsSortKey = 'pts' | 'gd' | 'w';

// This is now the app's only league table view (the standalone Table tab
// was folded into this Fixtures/Table toggle). Computed live by the backend
// from real recorded fixture results (StandingsService.java) - no
// hardcoded/generated rows - so it stays correct as results get entered,
// this season or a future one, with nothing to update here by hand.
function StandingsView() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [sortBy, setSortBy] = useState<StandingsSortKey>('pts');
  const [rows, setRows] = useState<StandingRow[]>([]);

  // `defaultSeason` is the real current season (resolved once on mount, via
  // the current gameweek - not by asking Standings, since Standings itself
  // needs a season to already know what "current" means). `season` is
  // whichever season is actually on screen right now - chevrons/search move
  // this around; `defaultSeason` never changes, so "back to current" always
  // has somewhere to return to. `allSeasons` (every season with any
  // gameweek data, oldest first) drives the chevron bounds, same pattern as
  // the Fixtures screen's gameweek chevrons.
  const [defaultSeason, setDefaultSeason] = useState<string | null>(null);
  const [season, setSeason] = useState<string | null>(null);
  const [allSeasons, setAllSeasons] = useState<string[]>([]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchSeason, setSearchSeason] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bootstraps to the real current season - doesn't fetch the table itself,
  // just resolves which season to load first and the full list of seasons
  // for the chevrons. Setting `season` below hands off to the fetch effect.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getCurrentGameweek().catch(() => null),
      getAllSeasons(),
    ])
      .then(([gw, seasons]) => {
        if (cancelled) return;
        const current = gw?.season ?? seasons[seasons.length - 1] ?? null;
        setAllSeasons(seasons);
        setDefaultSeason(current);
        if (current) {
          setSeason(current);
        } else {
          setLoading(false);
          setError('No seasons found.');
        }
      })
      .catch((err: any) => {
        if (cancelled) return;
        setLoading(false);
        setError(getApiErrorMessage(err, 'Failed to load the league table.'));
      });
    return () => { cancelled = true; };
  }, []);

  // The one fetch that actually loads table rows - re-runs whenever the
  // displayed season changes, whether from a chevron tap, a search, or
  // "back to current". A season with no results yet still comes back with
  // every active club at 0 (StandingsService.buildZeroStandings) - a real
  // 404 here means the season itself has no record at all (e.g. 2017/2018).
  useEffect(() => {
    if (!season) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchStandings(season)
      .then((data) => {
        if (cancelled) return;
        setRows(data.rows);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setRows([]);
        setError(getApiErrorMessage(err, 'Failed to load the league table.'));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [season]);

  const seasonIndex = allSeasons.indexOf(season ?? '');

  const goPrevSeason = () => {
    if (seasonIndex > 0) setSeason(allSeasons[seasonIndex - 1]);
  };

  const goNextSeason = () => {
    if (seasonIndex >= 0 && seasonIndex < allSeasons.length - 1) {
      setSeason(allSeasons[seasonIndex + 1]);
    }
  };

  const handleSearch = () => {
    const target = searchSeason.trim();
    if (!target) return;
    setSeason(target);
    setSearchOpen(false);
  };

  const backToCurrentSeason = () => {
    if (defaultSeason) setSeason(defaultSeason);
    setSearchOpen(false);
  };

  const isViewingOtherSeason = !!defaultSeason && !!season && season !== defaultSeason;

  const standings = useMemo(() => {
    const sorted = [...rows];
    if (sortBy === 'pts') sorted.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
    else if (sortBy === 'gd') sorted.sort((a, b) => b.goalDifference - a.goalDifference || b.points - a.points);
    else sorted.sort((a, b) => b.won - a.won || b.points - a.points);
    return sorted.map((row, i) => ({ ...row, position: i + 1 }));
  }, [rows, sortBy]);

  const seasonHeader = (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.tableButton} onPress={goPrevSeason} disabled={seasonIndex <= 0}>
          <Ionicons name="chevron-back" size={20} color={seasonIndex <= 0 ? colors.surface2 : colors.grey1} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{season ? `${season} TABLE` : 'TABLE'}</Text>
        </View>
        <TouchableOpacity
          style={styles.tableButton}
          onPress={goNextSeason}
          disabled={seasonIndex < 0 || seasonIndex >= allSeasons.length - 1}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={seasonIndex < 0 || seasonIndex >= allSeasons.length - 1 ? colors.surface2 : colors.grey1}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.searchToggle}
          onPress={() => setSearchOpen((prev) => !prev)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="search-outline" size={18} color={colors.grey1} />
        </TouchableOpacity>
      </View>

      {searchOpen ? (
        <View style={styles.searchBox}>
          <Text style={styles.searchLabel}>Search by season</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Season, e.g. 2025/2026"
              placeholderTextColor={colors.textTertiary}
              value={searchSeason}
              onChangeText={setSearchSeason}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.searchGoButton} onPress={handleSearch}>
              <Text style={styles.searchGoButtonText}>Go</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {isViewingOtherSeason ? (
        <TouchableOpacity style={styles.backToCurrentRow} onPress={backToCurrentSeason}>
          <Ionicons name="arrow-back-circle-outline" size={16} color={colors.yellow} />
          <Text style={styles.backToCurrentText}>Back to current season</Text>
        </TouchableOpacity>
      ) : null}
    </>
  );

  // The header (season title, chevrons, search) stays visible through
  // every state below - losing it while a season change is loading, or
  // when a searched-for season 404s, would leave no way to chevron/search
  // back out without a re-mount.
  if (loading) {
    return (
      <View style={styles.container}>
        {seasonHeader}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (error || standings.length === 0) {
    // A real 404 (season doesn't exist at all) lands here with the
    // backend's own message; zero ACTIVE clubs in the league (should never
    // actually happen) is the only other way to reach an empty table now.
    return (
      <View style={styles.container}>
        {seasonHeader}
        <View style={styles.center}>
          <Text style={styles.errorText}>{error ?? 'No clubs found for this league.'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {seasonHeader}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.standingsContent}
        showsVerticalScrollIndicator={false}
      >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortScroll}
        contentContainerStyle={styles.sortContent}
      >
        {([
          { key: 'pts' as StandingsSortKey, label: 'Points' },
          { key: 'gd' as StandingsSortKey, label: 'Goal Diff' },
          { key: 'w' as StandingsSortKey, label: 'Wins' },
        ]).map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.sortChip, sortBy === s.key && styles.sortChipActive]}
            onPress={() => setSortBy(s.key)}
          >
            <Text style={[styles.sortText, sortBy === s.key && styles.sortTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.tableHead}>
        <Text style={[styles.th, { width: 28 }]}>#</Text>
        <Text style={[styles.th, { flex: 1 }]}>Club</Text>
        <Text style={[styles.th, { width: 24, textAlign: 'center' }]}>P</Text>
        <Text style={[styles.th, { width: 24, textAlign: 'center' }]}>W</Text>
        <Text style={[styles.th, { width: 24, textAlign: 'center' }]}>D</Text>
        <Text style={[styles.th, { width: 24, textAlign: 'center' }]}>L</Text>
        <Text style={[styles.th, { width: 32, textAlign: 'center' }]}>GD</Text>
        <Text style={[styles.th, { width: 32, textAlign: 'center' }]}>Pts</Text>
      </View>
      {standings.map((s, i) => (
        <View
          key={s.club.id || s.club.name}
          style={[styles.row, i % 2 === 0 && styles.rowAlt, i < 3 && styles.rowTop]}
        >
          <Text
            style={[
              styles.cellPos,
              { width: 28 },
              i < 3 && { color: colors.fantasyGold, fontWeight: '900' },
            ]}
          >
            {s.position}
          </Text>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Image
            source={Logos[s.club.id]}
            style={styles.clubLogo}
            resizeMode="contain"
            />
            <Text style={styles.cellClub} numberOfLines={1}>
              {s.club.shortName}
            </Text>
          </View>
          <Text style={[styles.cell, { width: 24, textAlign: 'center' }]}>{s.played}</Text>
          <Text style={[styles.cell, { width: 24, textAlign: 'center' }]}>{s.won}</Text>
          <Text style={[styles.cell, { width: 24, textAlign: 'center' }]}>{s.drawn}</Text>
          <Text style={[styles.cell, { width: 24, textAlign: 'center' }]}>{s.lost}</Text>
          <Text
            style={[
              styles.cellGd,
              { width: 32, textAlign: 'center' },
              s.goalDifference > 0 && { color: colors.win },
              s.goalDifference < 0 && { color: colors.loss },
            ]}
          >
            {s.goalDifference > 0 ? '+' : ''}{s.goalDifference}
          </Text>
          <Text style={[styles.cellPts, { width: 32, textAlign: 'center' }]}>{s.points}</Text>
        </View>
      ))}
      </ScrollView>
    </View>
  );
}

function getStyles(colors: typeof Colors) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: colors.black,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  searchToggle: {
    padding: 8,
  },
  seasonSubtitle: {
    color: colors.grey2,
    fontSize: 11,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.06,
    marginTop: -4,
  },
  searchBox: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.surface2,
  },
  searchLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.grey1,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.black,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.white,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInputSmall: { flex: 0, width: 56, textAlign: 'center' },
  searchGoButton: {
    backgroundColor: colors.yellow,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchGoButtonText: { fontSize: 13, fontWeight: '800', color: '#000000' },
  backToCurrentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  backToCurrentText: { fontSize: 12, fontWeight: '700', color: colors.yellow },
  searchErrorText: { fontSize: 12, color: colors.live, marginTop: 8 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: fonts.display,
    color: colors.white,
    textTransform: 'uppercase',
  },
  currentBadge: {
    backgroundColor: colors.red,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.white,
    textTransform: 'uppercase',
  },
  dateSubtitle: {
    color: colors.grey1,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 6,
  },
  tableButton: {
    padding: 8,
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 4,
    borderRadius: 8,
    backgroundColor: colors.surface2,
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.yellow,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: fonts.display,
    color: colors.grey1,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
  },
  tabTextActive: {
    color: '#000000',
  },
  filterRow: {
  height: 40,
  marginBottom: 0,
  backgroundColor: colors.black,
  borderBottomWidth: 0,
  },
  filterContent: {
  paddingHorizontal: 12,
  paddingVertical: 2,
  gap: 4,
  alignItems: 'center',
  },
  filterChip: {
  paddingHorizontal: 22,
  paddingVertical: 10,
  borderRadius: 20,
  backgroundColor: colors.surface2,
  marginRight: 6,
  },
  filterChipActive: { backgroundColor: colors.yellow },
  filterText: { fontSize: 12, fontWeight: '600', color: colors.grey1 },
  filterTextActive: { color: '#000000' },
  list: { flex: 1 },
  listContent: {
  paddingHorizontal: 12,
  paddingTop: 0,
  paddingBottom: 24,
  gap: 6,
  },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32, gap: 12 },
  emptyText: { fontSize: 15, color: colors.grey2, textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: colors.live, textAlign: 'center', paddingHorizontal: 32 },
  standingsContent: { padding: 16, paddingBottom: 40 },
  seasonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.grey2,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
    marginBottom: 10,
  },
  sortScroll: { flexGrow: 0, marginBottom: 12 },
  sortContent: { alignItems: 'center', gap: 4 },
  sortChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  sortChipActive: { backgroundColor: colors.yellow, borderColor: colors.yellow },
  sortText: { fontSize: 12, fontWeight: '600', color: colors.grey1 },
  sortTextActive: { color: '#000000', fontWeight: '700' },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 4,
  },
  th: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: fonts.display,
    color: colors.grey2,
    textTransform: 'uppercase',
    letterSpacing: 0.08,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  rowAlt: { backgroundColor: colors.surface2 },
  rowTop: { backgroundColor: 'rgba(245,197,24,0.06)' },
  cell: { fontSize: 13, color: colors.grey1 },
  cellPts: { fontSize: 15, fontWeight: '900', color: colors.fantasyGold },
  cellPos: { fontSize: 12, fontWeight: '800', color: colors.grey2, fontFamily: fonts.display },
  cellClub: { fontSize: 13, fontWeight: '600', color: colors.white },
  cellGd: { fontSize: 12, fontWeight: '700', color: colors.grey2 },
  // 28x28 - matches the club badge size used everywhere else (Home's match
  // cards, Fixtures rows, League Table screen), was 24 here.
  clubLogo: {
  width: 28,
  height: 28,
},
  });
}
