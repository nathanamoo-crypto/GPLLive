package com.augustine.gplfantasyleaague.domain.gameweek.dtos;

import com.augustine.gplfantasyleaague.domain.gameweek.entity.FixtureStatus;
import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FixtureResponse {
    private Integer id;
    private Integer gameweekNumber;
    private String homeClubName;
    private String awayClubName;
    private LocalDateTime matchDate;
    private String venue;
    private FixtureStatus fixtureStatus;
    // Populated from the fixture's linked FixtureResults, if one exists yet -
    // null until the match has actually been played/recorded.
    private Integer homeScore;
    private Integer awayScore;
}
