package com.augustine.gplfantasyleaague.domain.scoring.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PlayerGameWeekStatsRequest {
    @NotNull
    private Integer playerId;

    @NotNull
    private Integer fixtureId;

    @NotNull
    private Integer minutesPlayed;

    @NotNull
    private Integer goalsScored;

    @NotNull
    private Integer assists;

    @NotNull
    private Boolean cleanSheet;

    @NotNull
    private Integer yellowCard;

    @NotNull
    private Boolean redCard;

    @NotNull
    private Integer saves;
}
