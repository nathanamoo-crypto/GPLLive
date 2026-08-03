package com.augustine.gplfantasyleaague.domain.fantasy.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FantasyTeamResponse {
    private Integer id;
    private String teamName;
    private Integer totalPoints;
    private BigDecimal budgetRemaining;
    private Integer transferPoints;
    private String username;

}
