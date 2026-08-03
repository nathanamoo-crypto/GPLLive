package com.augustine.gplfantasyleaague.domain.standings.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StandingsResponse {
    private String season;
    private List<StandingRowResponse> standings;
}
