package com.augustine.gplfantasyleaague.domain.gameweek.controller;

import com.augustine.gplfantasyleaague.domain.gameweek.dtos.GameweekRequest;
import com.augustine.gplfantasyleaague.domain.gameweek.dtos.GameweekResponse;
import com.augustine.gplfantasyleaague.domain.gameweek.service.GameweekService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/gameweeks")
public class GameweekController {
    private final GameweekService gameweekService;

    public GameweekController(GameweekService gameweekService) {
        this.gameweekService = gameweekService;
    }

    @GetMapping
    public ResponseEntity<List<GameweekResponse>> getAllGameweeks(){
        return ResponseEntity.ok(gameweekService.getAllGameweeks());
    }

    @GetMapping("/current")
    public ResponseEntity<GameweekResponse> getCurrentGameweek(){
        return ResponseEntity.ok(gameweekService.getCurrentGameweek());
    }

    @GetMapping("/season/{season}")
    public ResponseEntity<List<GameweekResponse>> getGameweekBySeason(@PathVariable String season){
        return ResponseEntity.ok(gameweekService.getGameweekBySeason(season));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<GameweekResponse> createGameWeek(@RequestBody @Valid GameweekRequest request){
        return ResponseEntity.ok(gameweekService.createGameweek(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/set-current")
    public ResponseEntity<GameweekResponse> setIsCuurent(@PathVariable Integer id){
        return ResponseEntity.ok(gameweekService.setCurrentGameweek(id));
    }
}
