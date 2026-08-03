package com.augustine.gplfantasyleaague.domain.player.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerPriceResponse {
    private Integer id;
    private String playerName;
    private String clubName;
    private Integer gameweekNumber;
    private BigDecimal price;
    private LocalDateTime recordedAt;

}
