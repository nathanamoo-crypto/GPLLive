package com.augustine.gplfantasyleaague.domain.engagement.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class MotmVotesRequest {
    @NotNull
    private Integer fixtureId;

    @NotNull
    private Integer playerId;
}
