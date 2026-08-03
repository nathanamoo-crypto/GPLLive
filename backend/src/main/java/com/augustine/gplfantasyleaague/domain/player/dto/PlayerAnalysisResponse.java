package com.augustine.gplfantasyleaague.domain.player.dto;

import com.augustine.gplfantasyleaague.domain.player.entity.Position;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

// Free-tier fields are always populated. The premium-only fields
// (averagePoints, recentForm, trend, insights) stay null unless the
// requesting user has an active subscription - `premium` on this response
// tells the frontend which case it got so it doesn't have to guess from
// nulls (see PlayerAnalysisService.analyze).
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerAnalysisResponse {
    // Free tier
    private Integer id;
    private String fullName;
    private String photoUrl;
    private String clubName;
    private Position position;
    private BigDecimal currentPrice;
    private Integer totalPoints;
    private Integer totalGoals;
    private Integer totalAssists;

    // Whether THIS response includes the premium section below.
    private boolean premium;

    // Premium tier - null/empty unless `premium` is true
    private Double averagePoints;
    private List<FormEntry> recentForm;
    private String trend;
    private List<String> insights;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FormEntry {
        private Integer gameweek;
        private Integer points;
    }
}
