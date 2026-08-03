package com.augustine.gplfantasyleaague.domain.player.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
public class PlayerPriceRequest {
    @NotNull
    private Integer playerId;

    @NotNull
    private Integer gameweekId;

    @NotNull
    private BigDecimal price;
}
