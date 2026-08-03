package com.augustine.gplfantasyleaague.domain.fantasy.controller;

import com.augustine.gplfantasyleaague.domain.fantasy.dto.FantasyTeamPlayerRequest;
import com.augustine.gplfantasyleaague.domain.fantasy.dto.FantasyTeamPlayerResponse;
import com.augustine.gplfantasyleaague.domain.fantasy.dto.LineupRequest;
import com.augustine.gplfantasyleaague.domain.fantasy.service.FantasyTeamPlayerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/squad")
public class FantasyTeamPlayerController {
    private final FantasyTeamPlayerService fantasyTeamPlayerService;

    public FantasyTeamPlayerController(FantasyTeamPlayerService fantasyTeamPlayerService) {
        this.fantasyTeamPlayerService = fantasyTeamPlayerService;
    }

    @PostMapping
    public ResponseEntity<FantasyTeamPlayerResponse> addPlayerToSquad(@RequestBody @Valid FantasyTeamPlayerRequest request){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(fantasyTeamPlayerService.addPlayerToSquad(request,email));
    }

    @DeleteMapping("/remove/{fantasyTeamPlayerId}")
    public ResponseEntity<Void> removePlayerFromSquad(@PathVariable Integer fantasyTeamPlayerId){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        fantasyTeamPlayerService.removePlayerFromSquad(fantasyTeamPlayerId, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{fantasyTeamId}")
    public ResponseEntity<List<FantasyTeamPlayerResponse>> getSquad(@PathVariable Integer fantasyTeamId){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(fantasyTeamPlayerService.getSquad(fantasyTeamId, email));
    }

    @GetMapping("/{fantasyTeamId}/start-xi")
    public ResponseEntity<List<FantasyTeamPlayerResponse>> getStartingXI(@PathVariable Integer fantasyTeamId){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(fantasyTeamPlayerService.getStartingXI(fantasyTeamId, email));
    }

    @GetMapping("/{fantasyTeamId}/bench")
    public ResponseEntity<List<FantasyTeamPlayerResponse>> getBenchPlayers(@PathVariable Integer fantasyTeamId){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(fantasyTeamPlayerService.getBenchPlayers(fantasyTeamId, email));
    }

    @PatchMapping("/{fantasyTeamPlayerId}/captain")
    public ResponseEntity<FantasyTeamPlayerResponse> setCaptain(@PathVariable Integer fantasyTeamPlayerId){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(fantasyTeamPlayerService.setCaptain(fantasyTeamPlayerId, email));
    }

    @PatchMapping("/{fantasyTeamPlayerId}/vice-captain")
    public ResponseEntity<FantasyTeamPlayerResponse> setViceCaptain(@PathVariable Integer fantasyTeamPlayerId){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(fantasyTeamPlayerService.setViceCaptain(fantasyTeamPlayerId, email));
    }

    @PatchMapping("/{playerAId}/{playerBId}/toggle-bench")
    public ResponseEntity<List<FantasyTeamPlayerResponse>> toggleBench(@PathVariable Integer playerAId, @PathVariable Integer playerBId){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(fantasyTeamPlayerService.swapPlayers(playerAId, playerBId, email));
    }

    @PutMapping("/lineup")
    public ResponseEntity<List<FantasyTeamPlayerResponse>> setStartingLineup(@RequestBody @Valid LineupRequest request){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(fantasyTeamPlayerService.setStartingLineup(request.getFantasyTeamPlayerIds(), email));
    }

}
