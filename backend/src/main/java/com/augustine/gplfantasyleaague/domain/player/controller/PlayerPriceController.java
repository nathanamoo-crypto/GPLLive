package com.augustine.gplfantasyleaague.domain.player.controller;

import com.augustine.gplfantasyleaague.domain.player.dto.PlayerPriceRequest;
import com.augustine.gplfantasyleaague.domain.player.dto.PlayerPriceResponse;
import com.augustine.gplfantasyleaague.domain.player.service.PlayerPriceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/player-price")
public class PlayerPriceController {
    private final PlayerPriceService playerPriceService;

    public PlayerPriceController(PlayerPriceService playerPriceService) {
        this.playerPriceService = playerPriceService;
    }


    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<PlayerPriceResponse> setPlayerPrice(@RequestBody @Valid PlayerPriceRequest request){
        return ResponseEntity.ok(playerPriceService.setPlayerPrice(request));
    }

    @GetMapping("/{playerId}/current")
    public ResponseEntity<PlayerPriceResponse> getCurrentPrice(@PathVariable Integer playerId){
        return ResponseEntity.ok(playerPriceService.getCurrentPrice(playerId));
    }

    @GetMapping("/{playerId}/history")
    public ResponseEntity<List<PlayerPriceResponse>> getPlayerPriceHistory(@PathVariable Integer playerId){
        return ResponseEntity.ok(playerPriceService.getPlayerPriceHistory(playerId));
    }
}
