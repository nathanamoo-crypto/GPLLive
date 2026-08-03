package com.augustine.gplfantasyleaague.domain.fantasy.controller;

import com.augustine.gplfantasyleaague.domain.fantasy.dto.FantasyTeamRequest;
import com.augustine.gplfantasyleaague.domain.fantasy.dto.FantasyTeamResponse;
import com.augustine.gplfantasyleaague.domain.fantasy.service.FantasyTeamService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fantasy-teams")
public class FantasyTeamController {
    private final FantasyTeamService fantasyTeamService;

    public FantasyTeamController(FantasyTeamService fantasyTeamService) {
        this.fantasyTeamService = fantasyTeamService;
    }

    @GetMapping("/my-team")
    public ResponseEntity<FantasyTeamResponse> getFantasyTeamByUser(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(fantasyTeamService.getFantasyTeamByUser(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FantasyTeamResponse> getFantasyTeamById(@PathVariable Integer id){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(fantasyTeamService.getFantasyTeamById(id, email));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<FantasyTeamResponse>> getAllFantasyTeams(){
        return ResponseEntity.ok(fantasyTeamService.getAllFantasyTeams());
    }

    @PostMapping
    public ResponseEntity<FantasyTeamResponse> createFantasyTeam(@RequestBody @Valid FantasyTeamRequest request){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(fantasyTeamService.createFantasyTeam(request, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FantasyTeamResponse> updateTeamName(@PathVariable Integer id, @RequestBody @Valid FantasyTeamRequest request){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(fantasyTeamService.updateTeamName(id, request, email));
    }

    // Lets the caller delete their own fantasy team and everything under it
    // (squad, transfers, chips, gameweek scores, free-hit snapshots) so they
    // can rebuild from scratch - createFantasyTeam otherwise 409s forever
    // once a team exists, with no other way to reset.
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyFantasyTeam(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        fantasyTeamService.deleteMyFantasyTeam(email);
        return ResponseEntity.noContent().build();
    }
}
