package com.augustine.gplfantasyleaague.domain.fantasy.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TransferResponse {
    private Integer id;
    private String fantasyTeamName;
    private String playerOutName;
    private String playerInName;
    private BigDecimal playerOutPrice;
    private BigDecimal playerInPrice;
    private Boolean isFreeTransfer;
    private LocalDateTime transferredAt;
}
