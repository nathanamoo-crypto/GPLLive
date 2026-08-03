package com.augustine.gplfantasyleaague.domain.gameweek.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
public class FixtureRequest {
    @NotNull
    private Integer homeClubId;

    @NotNull
    private Integer awayClubId;

    @NotNull
    private Integer gameweekId;

    @NotNull
    private LocalDateTime matchDate;

    @NotBlank
    private String venue;
}
