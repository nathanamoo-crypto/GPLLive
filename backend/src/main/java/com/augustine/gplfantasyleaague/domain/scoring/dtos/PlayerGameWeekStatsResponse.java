package com.augustine.gplfantasyleaague.domain.scoring.dtos;

import com.augustine.gplfantasyleaague.domain.player.entity.Position;
import lombok.*;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerGameWeekStatsResponse {
    private Integer id;
    private String playerName;
    private String clubName;
    private Position position;
    private Integer minutesPlayed;
    private Integer goalsScored;
    private Integer assists;
    private Boolean cleanSheet;
    private Integer yellowCard;
    private Boolean redCard;
    private Integer saves;
    private Integer fantasyPoint;
}
