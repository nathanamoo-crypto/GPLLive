package com.augustine.gplfantasyleaague.domain.standings.service;

import com.augustine.gplfantasyleaague.domain.club.entity.Club;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.Fixture;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.FixtureResults;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.FixtureStatus;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.Gameweek;
import com.augustine.gplfantasyleaague.domain.gameweek.repository.FixtureRepository;
import com.augustine.gplfantasyleaague.domain.gameweek.repository.GameweekRepository;
import com.augustine.gplfantasyleaague.domain.standings.dto.StandingRowResponse;
import com.augustine.gplfantasyleaague.domain.standings.dto.StandingsResponse;
import com.augustine.gplfantasyleaague.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// Computes the league table live from finished fixtures + their recorded
// results already in the DB - no external API, no hardcoded rows. As soon
// as more fixture results get entered (this season or a future one), the
// table reflects them on the next request, with nothing to update by hand.
@Service
public class StandingsService {
    private static final int POINTS_PER_WIN = 3;
    private static final int POINTS_PER_DRAW = 1;

    private final FixtureRepository fixtureRepository;
    private final GameweekRepository gameweekRepository;

    public StandingsService(FixtureRepository fixtureRepository, GameweekRepository gameweekRepository) {
        this.fixtureRepository = fixtureRepository;
        this.gameweekRepository = gameweekRepository;
    }

    public StandingsResponse getStandings(String requestedSeason) {
        String season = (requestedSeason != null && !requestedSeason.isBlank())
                ? requestedSeason
                : resolveDefaultSeason();

        List<Fixture> fixtures = fixtureRepository.findByFixtureStatusAndSeason(FixtureStatus.FINISHED, season);

        Map<Integer, ClubStats> statsByClubId = new LinkedHashMap<>();
        for (Fixture fixture : fixtures) {
            FixtureResults results = fixture.getFixtureResults();
            // A fixture can be marked FINISHED without a results row yet in
            // theory - skip rather than let a null score corrupt the table.
            if (results == null || results.getHomeScore() == null || results.getAwayScore() == null) continue;

            applyResult(statsByClubId, fixture.getHomeClub(), fixture.getAwayClub(),
                    results.getHomeScore(), results.getAwayScore());
        }

        Comparator<ClubStats> byPoints = Comparator.comparingInt((ClubStats s) -> s.points).reversed();
        Comparator<ClubStats> byGoalDifference = Comparator.comparingInt(ClubStats::goalDifference).reversed();
        Comparator<ClubStats> byGoalsFor = Comparator.comparingInt((ClubStats s) -> s.goalsFor).reversed();

        List<ClubStats> ordered = statsByClubId.values().stream()
                .sorted(byPoints.thenComparing(byGoalDifference).thenComparing(byGoalsFor))
                .toList();

        List<StandingRowResponse> rows = new ArrayList<>();
        int position = 1;
        for (ClubStats stats : ordered) {
            rows.add(StandingRowResponse.builder()
                    .position(position++)
                    .clubId(stats.club.getId())
                    .clubName(stats.club.getFullName())
                    .shortName(stats.club.getShortName())
                    .played(stats.played)
                    .won(stats.won)
                    .drawn(stats.drawn)
                    .lost(stats.lost)
                    .goalsFor(stats.goalsFor)
                    .goalsAgainst(stats.goalsAgainst)
                    .goalDifference(stats.goalDifference())
                    .points(stats.points)
                    .build());
        }

        return StandingsResponse.builder().season(season).standings(rows).build();
    }

    private void applyResult(Map<Integer, ClubStats> statsByClubId, Club home, Club away, int homeScore, int awayScore) {
        ClubStats homeStats = statsByClubId.computeIfAbsent(home.getId(), id -> new ClubStats(home));
        ClubStats awayStats = statsByClubId.computeIfAbsent(away.getId(), id -> new ClubStats(away));

        homeStats.played++;
        awayStats.played++;
        homeStats.goalsFor += homeScore;
        homeStats.goalsAgainst += awayScore;
        awayStats.goalsFor += awayScore;
        awayStats.goalsAgainst += homeScore;

        if (homeScore > awayScore) {
            homeStats.won++;
            homeStats.points += POINTS_PER_WIN;
            awayStats.lost++;
        } else if (awayScore > homeScore) {
            awayStats.won++;
            awayStats.points += POINTS_PER_WIN;
            homeStats.lost++;
        } else {
            homeStats.drawn++;
            homeStats.points += POINTS_PER_DRAW;
            awayStats.drawn++;
            awayStats.points += POINTS_PER_DRAW;
        }
    }

    // Prefers whichever gameweek is flagged current; if none is (e.g. right
    // after a season ends and before the next one's gameweeks are seeded),
    // falls back to the season whose gameweeks ran most recently.
    private String resolveDefaultSeason() {
        return gameweekRepository.findByIsCurrentTrue()
                .map(Gameweek::getSeason)
                .orElseGet(() -> gameweekRepository.findTopByOrderByEndDateDesc()
                        .map(Gameweek::getSeason)
                        .orElseThrow(() -> new ResourceNotFoundException("No gameweek data available to compute standings")));
    }

    private static class ClubStats {
        final Club club;
        int played;
        int won;
        int drawn;
        int lost;
        int goalsFor;
        int goalsAgainst;
        int points;

        ClubStats(Club club) {
            this.club = club;
        }

        int goalDifference() {
            return goalsFor - goalsAgainst;
        }
    }
}
