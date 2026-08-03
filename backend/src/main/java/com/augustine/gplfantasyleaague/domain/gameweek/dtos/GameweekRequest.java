package com.augustine.gplfantasyleaague.domain.gameweek.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
public class GameweekRequest {
    @NotBlank
    private String season;

    @NotNull
    private Integer gameweekNumber;

    @NotNull
    private LocalDateTime startDate;

    @NotNull
    private LocalDateTime endDate;

    @NotNull
    private LocalDateTime deadline;
}
