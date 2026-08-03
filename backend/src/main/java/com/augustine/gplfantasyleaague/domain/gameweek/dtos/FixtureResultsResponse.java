package com.augustine.gplfantasyleaague.domain.gameweek.dtos;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FixtureResultsResponse {
    private Integer id;
    private String homeClubName;
    private String awayClubName;
    private Integer homeScore;
    private Integer awayScore;
    private Integer homePossession;
    private Integer awayPossession;
    private LocalDateTime recordedAt;
}
