package com.augustine.gplfantasyleaague.domain.player.service;

import com.augustine.gplfantasyleaague.domain.gameweek.entity.Gameweek;
import com.augustine.gplfantasyleaague.domain.gameweek.repository.GameweekRepository;
import com.augustine.gplfantasyleaague.domain.player.dto.PlayerPriceRequest;
import com.augustine.gplfantasyleaague.domain.player.dto.PlayerPriceResponse;
import com.augustine.gplfantasyleaague.domain.player.entity.Player;
import com.augustine.gplfantasyleaague.domain.player.entity.PlayerPrice;
import com.augustine.gplfantasyleaague.domain.player.repository.PlayerPriceRepository;
import com.augustine.gplfantasyleaague.domain.player.repository.PlayerRepository;
import com.augustine.gplfantasyleaague.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PlayerPriceService {
    private final PlayerRepository playerRepository;
    private final GameweekRepository gameweekRepository;
    private final PlayerPriceRepository playerPriceRepository;

    public PlayerPriceService(PlayerRepository playerRepository, GameweekRepository gameweekRepository, PlayerPriceRepository playerPriceRepository) {
        this.playerRepository = playerRepository;
        this.gameweekRepository = gameweekRepository;
        this.playerPriceRepository = playerPriceRepository;
    }

    public PlayerPriceResponse setPlayerPrice(PlayerPriceRequest request){
        Player player = playerRepository.findById(request.getPlayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Player with ID " + request.getPlayerId() + " not found"));
        Gameweek gameweek = gameweekRepository.findById(request.getGameweekId())
                .orElseThrow(() -> new ResourceNotFoundException("Gameweek with ID " + request.getGameweekId() + " not found"));
        PlayerPrice savedPrice = saveToPriceDatabase(player, gameweek, request);
        return mapToResponse(savedPrice);
    }

    public PlayerPriceResponse getCurrentPrice(Integer playerId){
        PlayerPrice playerPrice = playerPriceRepository
                .findTopByPlayerIdOrderByRecordedAtDesc(playerId)
                .orElseThrow(() -> new ResourceNotFoundException("No price records found for player ID " + playerId));
        return mapToResponse(playerPrice);
    }

    public List<PlayerPriceResponse> getPlayerPriceHistory(Integer playerId){
        return playerPriceRepository.findByPlayerId(playerId)
                .stream()
                .map(price -> mapToResponse(price))
                .toList();
    }

    private PlayerPrice saveToPriceDatabase(Player player, Gameweek gameweek, PlayerPriceRequest request){
        PlayerPrice playerPrice = PlayerPrice.builder()
                .price(request.getPrice())
                .recordedAt(LocalDateTime.now())
                .player(player)
                .gameweek(gameweek)
                .build();
        playerPriceRepository.save(playerPrice);
        return playerPrice;
    }

    private PlayerPriceResponse mapToResponse(PlayerPrice playerPrice){
        return PlayerPriceResponse.builder()
                .id(playerPrice.getId())
                .gameweekNumber(playerPrice.getGameweek().getGameweekNumber())
                .playerName(playerPrice.getPlayer().getFullName())
                .clubName(playerPrice.getPlayer().getClub().getFullName())
                .price(playerPrice.getPrice())
                .recordedAt(playerPrice.getRecordedAt())
                .build();
    }
}
