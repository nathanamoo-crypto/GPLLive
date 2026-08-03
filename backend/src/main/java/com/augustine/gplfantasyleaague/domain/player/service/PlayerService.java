package com.augustine.gplfantasyleaague.domain.player.service;

import com.augustine.gplfantasyleaague.domain.club.entity.Club;
import com.augustine.gplfantasyleaague.domain.club.entity.ClubStatus;
import com.augustine.gplfantasyleaague.domain.club.repository.ClubRepository;
import com.augustine.gplfantasyleaague.domain.player.dto.PlayerRequest;
import com.augustine.gplfantasyleaague.domain.player.dto.PlayerResponse;
import com.augustine.gplfantasyleaague.domain.player.entity.Player;
import com.augustine.gplfantasyleaague.domain.player.entity.Position;
import com.augustine.gplfantasyleaague.domain.player.entity.Status;
import com.augustine.gplfantasyleaague.domain.player.repository.PlayerPriceRepository;
import com.augustine.gplfantasyleaague.domain.player.repository.PlayerRepository;
import com.augustine.gplfantasyleaague.exception.DataIntegrityViolationException;
import com.augustine.gplfantasyleaague.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;


@Service
public class PlayerService {
    private final PlayerRepository playerRepository;
    private final ClubRepository clubRepository;
    private final PlayerPriceRepository playerPriceRepository;

    public PlayerService(PlayerRepository playerRepository, ClubRepository clubRepository, PlayerPriceRepository playerPriceRepository) {
        this.playerRepository = playerRepository;
        this.clubRepository = clubRepository;
        this.playerPriceRepository = playerPriceRepository;
    }

    public List<PlayerResponse> getAllActivePlayers(){

        return playerRepository.findByStatus(Status.AVAILABLE)
                .stream()
                .filter(player -> player.getClub().getClubStatus() == com.augustine.gplfantasyleaague.domain.club.entity.ClubStatus.ACTIVE)
                .map(player -> mapToPlayerResponse(player))
                .toList();
    }

    public PlayerResponse getPlayerById(Integer id){
        Player player = playerRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Player with ID " + id + " not found"));
        return mapToPlayerResponse(player);
    }

    public List<PlayerResponse> getPlayersByClub(Integer clubId){
        Club club = clubRepository.findById(clubId).orElseThrow(()-> new ResourceNotFoundException("Club with ID " + clubId + " does not exist"));
        return playerRepository.findByClubId(club.getId())
                .stream()
                .map(player -> mapToPlayerResponse(player))
                .toList();
    }

    public List<PlayerResponse> getPlayerByPosition(Position position){
        return playerRepository.findByPosition(position)
                .stream()
                .filter(player -> player.getClub().getClubStatus() == ClubStatus.ACTIVE)
                .map(player -> mapToPlayerResponse(player))
                .toList();
    }

    public PlayerResponse addPlayer(PlayerRequest request){
        if(playerRepository.existsByFullNameAndClubId(request.getFullName(), request.getClubId() )){
            throw new DataIntegrityViolationException("Registration failed: Player '" + request.getFullName() + "' already exists within this club");
        }

        Player savedPlayer = addToPlayerDatabase(request);
        return mapToPlayerResponse(savedPlayer);
    }

    public PlayerResponse updatePlayer(Integer id, PlayerRequest request){
        Player player = playerRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Cannot update: Player with ID " + id + " does not exist"));
        Club club = clubRepository.findById(request.getClubId()).orElseThrow(()-> new ResourceNotFoundException("Club not found"));

        player.setFullName(request.getFullName());
        player.setJerseyNumber(request.getJerseyNumber());
        player.setPosition(request.getPosition());
        player.setPhotoUrl(request.getPhotoUrl());
        player.setNationality(request.getNationality());
        player.setStatus(request.getStatus());
        player.setClub(club);

        Player updatedPlayer = playerRepository.save(player);
        return mapToPlayerResponse(updatedPlayer);
    }

    private PlayerResponse mapToPlayerResponse(Player player){
        BigDecimal currentPrice = playerPriceRepository.findTopByPlayerIdOrderByRecordedAtDesc(player.getId())
                .map(price -> price.getPrice())
                .orElse(null);

        return PlayerResponse.builder()
                .id(player.getId())
                .photoUrl(player.getPhotoUrl())
                .fullName(player.getFullName())
                .status(player.getStatus())
                .clubId(player.getClub().getId())
                .jerseyNumber(player.getJerseyNumber())
                .nationality(player.getNationality())
                .position(player.getPosition())
                .clubName(player.getClub().getFullName())
                .currentPrice(currentPrice)
                .build();
    }

    private Player addToPlayerDatabase(PlayerRequest player){
        Club club = clubRepository.findById(player.getClubId()).orElseThrow(()-> new ResourceNotFoundException("Club with ID " + player.getClubId() + " not found"));
        Player savedPlayer = Player.builder()
                .photoUrl(player.getPhotoUrl())
                .fullName(player.getFullName())
                .status(player.getStatus())
                .jerseyNumber(player.getJerseyNumber())
                .club(club)
                .nationality(player.getNationality())
                .position(player.getPosition())
                .build();
        playerRepository.save(savedPlayer);
        return savedPlayer;
    }
}