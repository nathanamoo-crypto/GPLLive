package com.augustine.gplfantasyleaague.domain.gameweek.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FixtureResultsRequest {
    private Integer fixtureId;
    private Integer homeScore;
    private Integer awayScore;
    private Integer homePossession;
    private Integer awayPossession;
}
