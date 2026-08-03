package com.augustine.gplfantasyleaague.domain.scoring.dtos;

import lombok.*;

@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FantasyTeamGameWeekScoreResponse {
    private Integer id;
    private String fantasyTeamName;
    private Integer gameweekNumber;
    private Integer totalPoints;
    private String activeChip;
}
