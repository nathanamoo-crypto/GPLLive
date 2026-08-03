package com.augustine.gplfantasyleaague.domain.fantasy.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ChipRequest {
    @NotNull
    private Integer fantasyTeamId;

    @NotNull
    private Integer gameweekId;
}
