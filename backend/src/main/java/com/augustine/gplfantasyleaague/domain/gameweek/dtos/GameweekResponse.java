package com.augustine.gplfantasyleaague.domain.gameweek.dtos;


import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GameweekResponse {
    private Integer id;
    private String season;
    private Integer gameweekNumber;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime deadline;
    private Boolean isCurrent;

}
