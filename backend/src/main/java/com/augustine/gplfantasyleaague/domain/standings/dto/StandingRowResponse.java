package com.augustine.gplfantasyleaague.domain.standings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StandingRowResponse {
    private int position;
    private Integer clubId;
    private String clubName;
    private String shortName;
    private int played;
    private int won;
    private int drawn;
    private int lost;
    private int goalsFor;
    private int goalsAgainst;
    private int goalDifference;
    private int points;
}
