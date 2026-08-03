package com.augustine.gplfantasyleaague.domain.scoring.controller;

import com.augustine.gplfantasyleaague.domain.scoring.dtos.FantasyTeamGameWeekScoreResponse;
import com.augustine.gplfantasyleaague.domain.scoring.dtos.PlayerGameWeekStatsRequest;
import com.augustine.gplfantasyleaague.domain.scoring.dtos.PlayerGameWeekStatsResponse;
import com.augustine.gplfantasyleaague.domain.scoring.service.ScoringService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/scoring")
public class ScoringController {
    private final ScoringService scoringService;

    public ScoringController(ScoringService scoringService) {
        this.scoringService = scoringService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/stats")
    public ResponseEntity<PlayerGameWeekStatsResponse> recordPlayerStats(@RequestBody @Valid PlayerGameWeekStatsRequest request){
        return ResponseEntity.ok(scoringService.recordPlayerStats(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/calculate-all/{gameweekId}")
    public ResponseEntity<String> calculateAllTeamsForGameweek(@PathVariable Integer gameweekId){
        scoringService.calculateAllTeamsForGameweek(gameweekId);
        return ResponseEntity.ok("Successfully calculated scores for all teams for Gameweek " + gameweekId);
    }

    @GetMapping("/fixture/{fixtureId}")
    public ResponseEntity<List<PlayerGameWeekStatsResponse>> getPlayerStatsByFixture(@PathVariable Integer fixtureId){
        return ResponseEntity.ok(scoringService.getPlayerStatsByFixture(fixtureId));
    }

    @GetMapping("/gameweek/{gameweekId}")
    public ResponseEntity<List<FantasyTeamGameWeekScoreResponse>> getFantasyTeamScoreByGameweek(@PathVariable Integer gameweekId){
        return ResponseEntity.ok(scoringService.getFantasyTeamScoreByGameweek(gameweekId));
    }

    @GetMapping("/history/{fantasyTeamId}")
    public ResponseEntity<List<FantasyTeamGameWeekScoreResponse>> getFantasyTeamHistory(@PathVariable Integer fantasyTeamId){
        return ResponseEntity.ok(scoringService.getFantasyTeamHistory(fantasyTeamId));
    }
}
