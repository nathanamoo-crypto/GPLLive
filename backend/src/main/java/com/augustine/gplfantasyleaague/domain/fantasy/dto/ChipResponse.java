package com.augustine.gplfantasyleaague.domain.fantasy.dto;

import com.augustine.gplfantasyleaague.domain.fantasy.entity.ChipType;
import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChipResponse {
    private Integer id;
    private String fantasyTeamName;
    private ChipType chipType;
    private Integer gameweekNumber;
    private LocalDateTime usedAt;
}
