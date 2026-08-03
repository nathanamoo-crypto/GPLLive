package com.augustine.gplfantasyleaague.domain.player.service;

import com.augustine.gplfantasyleaague.domain.auth.entity.User;
import com.augustine.gplfantasyleaague.domain.auth.repository.UserRepository;
import com.augustine.gplfantasyleaague.domain.player.dto.PlayerAnalysisResponse;
import com.augustine.gplfantasyleaague.domain.player.entity.Player;
import com.augustine.gplfantasyleaague.domain.player.entity.PlayerPrice;
import com.augustine.gplfantasyleaague.domain.player.repository.PlayerPriceRepository;
import com.augustine.gplfantasyleaague.domain.player.repository.PlayerRepository;
import com.augustine.gplfantasyleaague.domain.scoring.entity.PlayerGameWeekStats;
import com.augustine.gplfantasyleaague.domain.scoring.repository.PlayerGameWeekStatsRepository;
import com.augustine.gplfantasyleaague.domain.subscription.service.SubscriptionService;
import com.augustine.gplfantasyleaague.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

// Powers the Player Details screen: free-tier stats for everyone, deeper
// analysis (average points, recent form, trend, rule-based insights) only
// for users with an active subscription. Used the same way regardless of
// whether the player card was tapped from Draft, Transfers, or the Pitch
// view - the frontend just hits GET /players/{id}/analysis in all three
// places.
@Service
public class PlayerAnalysisService {
    private final PlayerRepository playerRepository;
    private final PlayerPriceRepository playerPriceRepository;
    private final PlayerGameWeekStatsRepository statsRepository;
    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    public PlayerAnalysisService(
            PlayerRepository playerRepository,
            PlayerPriceRepository playerPriceRepository,
            PlayerGameWeekStatsRepository statsRepository,
            SubscriptionService subscriptionService,
            UserRepository userRepository
    ) {
        this.playerRepository = playerRepository;
        this.playerPriceRepository = playerPriceRepository;
        this.statsRepository = statsRepository;
        this.subscriptionService = subscriptionService;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PlayerAnalysisResponse analyze(Integer playerId, String requesterEmail) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("Player with ID " + playerId + " not found"));

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Most-recent-first - both the free totals (order-independent sums)
        // and the premium recent-form/trend calculations (which do care
        // about order) read from this same list.
        List<PlayerGameWeekStats> statsDesc = statsRepository.findByPlayer_IdOrderByFixture_MatchDateDesc(playerId);

        int totalPoints = statsDesc.stream().mapToInt(s -> nz(s.getFantasyPoint())).sum();
        int totalGoals = statsDesc.stream().mapToInt(s -> nz(s.getGoalsScored())).sum();
        int totalAssists = statsDesc.stream().mapToInt(s -> nz(s.getAssists())).sum();

        java.math.BigDecimal currentPrice = playerPriceRepository.findTopByPlayerIdOrderByRecordedAtDesc(playerId)
                .map(PlayerPrice::getPrice)
                .orElse(null);

        PlayerAnalysisResponse.PlayerAnalysisResponseBuilder response = PlayerAnalysisResponse.builder()
                .id(player.getId())
                .fullName(player.getFullName())
                .photoUrl(player.getPhotoUrl())
                .clubName(player.getClub().getFullName())
                .position(player.getPosition())
                .currentPrice(currentPrice)
                .totalPoints(totalPoints)
                .totalGoals(totalGoals)
                .totalAssists(totalAssists);

        boolean premium = subscriptionService.isPremium(requester.getId());
        response.premium(premium);

        if (premium) {
            applyPremiumInsights(response, statsDesc);
        }

        return response.build();
    }

    private void applyPremiumInsights(PlayerAnalysisResponse.PlayerAnalysisResponseBuilder response, List<PlayerGameWeekStats> statsDesc) {
        long matchesPlayed = statsDesc.stream().filter(s -> nz(s.getMinutesPlayed()) > 0).count();
        int totalPoints = statsDesc.stream().mapToInt(s -> nz(s.getFantasyPoint())).sum();
        double averagePoints = matchesPlayed > 0 ? (double) totalPoints / matchesPlayed : 0.0;

        List<PlayerGameWeekStats> lastFive = statsDesc.stream().limit(5).toList();

        List<PlayerAnalysisResponse.FormEntry> recentForm = lastFive.stream()
                .map(s -> PlayerAnalysisResponse.FormEntry.builder()
                        .gameweek(s.getFixture() != null && s.getFixture().getGameweek() != null
                                ? s.getFixture().getGameweek().getGameweekNumber() : null)
                        .points(nz(s.getFantasyPoint()))
                        .build())
                .toList();

        response.averagePoints(round1(averagePoints))
                .recentForm(recentForm)
                .trend(computeTrend(lastFive, averagePoints))
                .insights(buildInsights(statsDesc));
    }

    // Compares the last-3-game average against the season average - a
    // simple, explainable rule rather than anything statistical, matching
    // the "rule-based initially" scope from the feature spec.
    private String computeTrend(List<PlayerGameWeekStats> lastFive, double seasonAverage) {
        if (lastFive.isEmpty()) return "STABLE";
        List<PlayerGameWeekStats> lastThree = lastFive.stream().limit(3).toList();
        double recentAverage = lastThree.stream().mapToInt(s -> nz(s.getFantasyPoint())).average().orElse(0.0);
        double diff = recentAverage - seasonAverage;
        if (diff > 1.0) return "IMPROVING";
        if (diff < -1.0) return "DECLINING";
        return "STABLE";
    }

    private List<String> buildInsights(List<PlayerGameWeekStats> statsDesc) {
        List<String> insights = new ArrayList<>();
        if (statsDesc.isEmpty()) {
            return insights;
        }

        List<PlayerGameWeekStats> lastFive = statsDesc.stream().limit(5).toList();
        List<PlayerGameWeekStats> lastTen = statsDesc.stream().limit(10).toList();

        double recentAvg = lastFive.stream().mapToInt(s -> nz(s.getFantasyPoint())).average().orElse(0.0);
        insights.add(String.format("🔥 Player has averaged %.1f points over his last %d matches.", recentAvg, lastFive.size()));

        long gamesWithGoal = lastFive.stream().filter(s -> nz(s.getGoalsScored()) > 0).count();
        insights.add(String.format("⚽ Player has scored in %d of his last %d matches.", gamesWithGoal, lastFive.size()));

        long returnedPoints = lastTen.stream().filter(s -> nz(s.getFantasyPoint()) > 0).count();
        insights.add(String.format("⭐ Player has returned fantasy points in %d of his last %d appearances.", returnedPoints, lastTen.size()));

        long startedCount = lastFive.stream().filter(s -> nz(s.getMinutesPlayed()) >= 60).count();
        if (startedCount * 2 >= lastFive.size()) {
            insights.add("🟢 Player has been a regular starter in recent matches.");
        }

        int yellowCards = lastFive.stream().mapToInt(s -> nz(s.getYellowCard())).sum();
        if (yellowCards >= 2) {
            insights.add("⚠️ Player has received multiple yellow cards recently.");
        }

        return insights;
    }

    private static int nz(Integer value) {
        return value != null ? value : 0;
    }

    private static double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
