package com.augustine.gplfantasyleaague.domain.fantasy.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FantasyTeamRequest {
    @NotBlank
    private String teamName;
}
