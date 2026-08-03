package com.augustine.gplfantasyleaague.domain.engagement.dtos;

import lombok.*;

import java.time.LocalDateTime;

@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MotmVoteResponse {
    private Integer id;
    private String username;
    private String playerName;
    private Integer fixtureId;
    private LocalDateTime votedAt;
}
