package com.augustine.gplfantasyleaague.domain.engagement.dtos;

import lombok.*;

import java.util.List;

// Aggregated view of GET /motmVotes/{fixtureId} - the raw vote rows
// (MotmVoteResponse, one per user who voted) aren't useful to a client on
// their own since nobody wants to see every individual vote; this tallies
// them per player and also reports whether the requesting user has already
// voted (and for whom), since the frontend needs that to decide whether to
// show the ballot or the results.
@Setter
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MotmResultsResponse {
    private List<MotmResultItem> results;
    private Integer totalVotes;
    private Integer myVotePlayerId;
    private Boolean votingOpen;

    @Setter
    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MotmResultItem {
        private Integer playerId;
        private String playerName;
        private Integer clubId;
        private Integer votes;
        private Double percentage;
    }
}
