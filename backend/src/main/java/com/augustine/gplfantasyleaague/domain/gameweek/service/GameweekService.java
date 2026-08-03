package com.augustine.gplfantasyleaague.domain.gameweek.service;

import com.augustine.gplfantasyleaague.domain.gameweek.dtos.GameweekRequest;
import com.augustine.gplfantasyleaague.domain.gameweek.dtos.GameweekResponse;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.Gameweek;
import com.augustine.gplfantasyleaague.domain.gameweek.repository.GameweekRepository;
import com.augustine.gplfantasyleaague.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GameweekService {
    private final GameweekRepository gameweekRepository;

    public GameweekService(GameweekRepository gameweekRepository) {
        this.gameweekRepository = gameweekRepository;
    }

    private GameweekResponse mapToResponse(Gameweek gameweek){
        return GameweekResponse.builder()
                .id(gameweek.getId())
                .season(gameweek.getSeason())
                .startDate(gameweek.getStartDate())
                .endDate(gameweek.getEndDate())
                .deadline(gameweek.getDeadline())
                .isCurrent(gameweek.getIsCurrent())
                .gameweekNumber(gameweek.getGameweekNumber())
                .build();

    }

    public List<GameweekResponse> getAllGameweeks(){
        return gameweekRepository.findAll().stream()
                .map(gameweek -> mapToResponse(gameweek) )
                .toList();
    }

    public GameweekResponse getCurrentGameweek(){
        Gameweek gameweek = gameweekRepository.findByIsCurrentTrue().orElseThrow(()-> new ResourceNotFoundException("No current Gameweek is active"));
        return mapToResponse(gameweek);
    }

    public List<GameweekResponse> getGameweekBySeason(String season){
        return gameweekRepository.findBySeason(season).stream()
                .map(gameweek -> mapToResponse(gameweek))
                .toList();
    }

    public GameweekResponse createGameweek(GameweekRequest request){
        Gameweek saveGameweek = saveToDatabase(request);
        return mapToResponse(saveGameweek);
    }

    public GameweekResponse setCurrentGameweek(Integer id){
        //find and deactivate the current gameweek
        gameweekRepository.findByIsCurrentTrue().ifPresent(current -> {
            current.setIsCurrent(false);
            gameweekRepository.save(current);
        });

        // activate the new one
        Gameweek gameweek = gameweekRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gameweek with ID " + id + " not found"));
        gameweek.setIsCurrent(true);
        gameweekRepository.save(gameweek);

        return mapToResponse(gameweek);
    }

    private Gameweek saveToDatabase(GameweekRequest request){
        Gameweek savedGameweek = Gameweek.builder()
                .season(request.getSeason())
                .gameweekNumber(request.getGameweekNumber())
                .deadline(request.getDeadline())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();
        gameweekRepository.save(savedGameweek);
        return savedGameweek;
    }

}
