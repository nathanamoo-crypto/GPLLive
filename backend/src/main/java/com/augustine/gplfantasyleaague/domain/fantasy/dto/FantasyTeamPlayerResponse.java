package com.augustine.gplfantasyleaague.domain.fantasy.dto;

import com.augustine.gplfantasyleaague.domain.player.entity.Position;
import lombok.*;

import java.math.BigDecimal;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FantasyTeamPlayerResponse {
    private Integer id;
    // The underlying Player's id and club id - the frontend needs these to
    // build its own Player-shaped objects (club badge lookup, matching a
    // squad row back to the player picked in the draft) since playerName
    // alone isn't enough to reliably identify/display a player.
    private Integer playerId;
    private Integer clubId;
    private String fantasyTeamName;
    private String playerName;
    private Position position;
    private BigDecimal currentPrice;
    private BigDecimal purchasePrice;
    private Boolean isCaptain;
    private Boolean isViceCaptain;
    private Boolean isPartOfXI;
}
