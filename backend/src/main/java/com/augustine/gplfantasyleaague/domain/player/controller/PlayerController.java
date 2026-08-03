package com.augustine.gplfantasyleaague.domain.player.controller;

import com.augustine.gplfantasyleaague.domain.player.dto.PlayerAnalysisResponse;
import com.augustine.gplfantasyleaague.domain.player.dto.PlayerRequest;
import com.augustine.gplfantasyleaague.domain.player.dto.PlayerResponse;
import com.augustine.gplfantasyleaague.domain.player.entity.Position;
import com.augustine.gplfantasyleaague.domain.player.service.PlayerAnalysisService;
import com.augustine.gplfantasyleaague.domain.player.service.PlayerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/players")
public class PlayerController {
    private final PlayerService playerService;
    private final PlayerAnalysisService playerAnalysisService;

    public PlayerController(PlayerService playerService, PlayerAnalysisService playerAnalysisService) {
        this.playerService = playerService;
        this.playerAnalysisService = playerAnalysisService;
    }

    @GetMapping
    public ResponseEntity<List<PlayerResponse>> getAllActivePlayers(){
        return ResponseEntity.ok(playerService.getAllActivePlayers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerResponse> getPlayersById(@PathVariable Integer id){
        return ResponseEntity.ok(playerService.getPlayerById(id));
    }

    @GetMapping("/position/{position}")
    public ResponseEntity<List<PlayerResponse>> getPlayersByPosition(@PathVariable Position position){
        return ResponseEntity.ok(playerService.getPlayerByPosition(position));
    }

    @GetMapping("/club/{clubId}")
    public ResponseEntity<List<PlayerResponse>> getPlayersByClub(@PathVariable Integer clubId){
        return ResponseEntity.ok(playerService.getPlayersByClub(clubId));
    }

    // Reused by the Player Details screen wherever it's opened from (Draft,
    // Transfers, Pitch view) - free-tier fields always come back, the
    // premium analysis section only populates for subscribed users (see
    // PlayerAnalysisService.analyze).
    @GetMapping("/{id}/analysis")
    public ResponseEntity<PlayerAnalysisResponse> getPlayerAnalysis(@PathVariable Integer id){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(playerAnalysisService.analyze(id, email));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<PlayerResponse> addPlayer(@RequestBody @Valid PlayerRequest request){
        return ResponseEntity.ok(playerService.addPlayer(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<PlayerResponse> updatePlayer(@PathVariable Integer id, @RequestBody @Valid PlayerRequest request){
        return ResponseEntity.ok(playerService.updatePlayer(id, request));
    }

}
