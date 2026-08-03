package com.augustine.gplfantasyleaague.domain.standings.controller;

import com.augustine.gplfantasyleaague.domain.standings.dto.StandingsResponse;
import com.augustine.gplfantasyleaague.domain.standings.service.StandingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/standings")
public class StandingsController {
    private final StandingsService standingsService;

    public StandingsController(StandingsService standingsService) {
        this.standingsService = standingsService;
    }

    // ?season=2025/2026 to look up a specific season explicitly; omitted
    // defaults to whichever season is current, or the most recently-ended
    // one if none is flagged current yet.
    @GetMapping
    public ResponseEntity<StandingsResponse> getStandings(@RequestParam(required = false) String season) {
        return ResponseEntity.ok(standingsService.getStandings(season));
    }
}
