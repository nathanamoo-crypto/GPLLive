package com.augustine.gplfantasyleaague.domain.fantasy.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
@Getter
@Setter
public class LineupRequest {
    @NotEmpty
    private List<Integer> fantasyTeamPlayerIds;
}
