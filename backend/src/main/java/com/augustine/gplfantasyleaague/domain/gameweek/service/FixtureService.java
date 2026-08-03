package com.augustine.gplfantasyleaague.domain.gameweek.service;

import com.augustine.gplfantasyleaague.domain.club.entity.Club;
import com.augustine.gplfantasyleaague.domain.club.repository.ClubRepository;
import com.augustine.gplfantasyleaague.domain.gameweek.dtos.FixtureRequest;
import com.augustine.gplfantasyleaague.domain.gameweek.dtos.FixtureResponse;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.Fixture;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.FixtureResults;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.FixtureStatus;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.Gameweek;
import com.augustine.gplfantasyleaague.domain.gameweek.repository.FixtureRepository;
import com.augustine.gplfantasyleaague.domain.gameweek.repository.GameweekRepository;
import com.augustine.gplfantasyleaague.exception.InvalidFixtureException;
import com.augustine.gplfantasyleaague.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FixtureService {
    private final FixtureRepository fixtureRepository;
    private final ClubRepository clubRepository;
    private final GameweekRepository gameweekRepository;

    public FixtureService(FixtureRepository fixtureRepository, ClubRepository clubRepository, GameweekRepository gameweekRepository) {
        this.fixtureRepository = fixtureRepository;
        this.clubRepository = clubRepository;
        this.gameweekRepository = gameweekRepository;
    }

    public List<FixtureResponse> getAllFixtures(){
        return fixtureRepository.findAll().stream()
                .sorted((a, b) -> {
                    if (a.getMatchDate() == null || b.getMatchDate() == null) return 0;
                    return a.getMatchDate().compareTo(b.getMatchDate());
                })
                .map(fixture -> mapToResponse(fixture))
                .toList();
    }

    public FixtureResponse getFixtureById(Integer id){
        Fixture fixture = fixtureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fixture with ID " + id + " not found"));
        return mapToResponse(fixture);
    }

    public List<FixtureResponse> getAllScheduledFixtures(){
        return fixtureRepository.findByFixtureStatus(FixtureStatus.SCHEDULED).stream()
                .map(fixture -> mapToResponse(fixture))
                .toList();
    }

    public List<FixtureResponse> getAllLiveFixtures(){
        return fixtureRepository.findByFixtureStatus(FixtureStatus.LIVE).stream()
                .map(fixture -> mapToResponse(fixture))
                .toList();
    }

    public List<FixtureResponse> getAllFinishFixtures(){
        return fixtureRepository.findByFixtureStatus(FixtureStatus.FINISHED).stream()
                .map(fixture -> mapToResponse(fixture))
                .toList();
    }

    public List<FixtureResponse> getFixturesByGameweek(Integer gameweekId){
        Gameweek gameweek = gameweekRepository.findById(gameweekId).orElseThrow(()-> new ResourceNotFoundException("Gameweek with ID " + gameweekId + " not found"));
        return fixtureRepository.findByGameweekId(gameweek.getId()).stream()
                .map(fixture -> mapToResponse(fixture))
                .toList();
    }

    public FixtureResponse createFixture(FixtureRequest request){
        Gameweek gameweek = gameweekRepository.findById(request.getGameweekId())
                .orElseThrow(() -> new ResourceNotFoundException("Gameweek with ID " + request.getGameweekId() + " not found"));
        Club homeClub = clubRepository.findById(request.getHomeClubId())
                .orElseThrow(() -> new ResourceNotFoundException("Home club with ID " + request.getHomeClubId() + " not found"));
        Club awayClub = clubRepository.findById(request.getAwayClubId())
                .orElseThrow(() -> new ResourceNotFoundException("Away club with ID " + request.getAwayClubId() + " not found"));

        if(homeClub.getFullName().equalsIgnoreCase(awayClub.getFullName())){
            throw new InvalidFixtureException("Cannot create fixture: Home club and Away club cannot be the same");
        }

        Fixture savedFixture = Fixture.builder()
                .homeClub(homeClub)
                .awayClub(awayClub)
                .gameweek(gameweek)
                .fixtureStatus(FixtureStatus.SCHEDULED)
                .matchDate(request.getMatchDate())
                .venue(request.getVenue())
                .build();
        fixtureRepository.save(savedFixture);
        return mapToResponse(savedFixture);

    }

    public FixtureResponse updatedFixtureStatus(Integer id, FixtureStatus status){
        Fixture fixture = fixtureRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Fixture with ID " + id + " not found"));

        if (status == FixtureStatus.LIVE) {
            boolean hasConflict = fixtureRepository.hasConflictingLiveFixture(
                    fixture.getGameweek().getId(),
                    FixtureStatus.LIVE,
                    fixture.getMatchDate(),
                    fixture.getId(), // Exclude current fixture from conflict checks
                    fixture.getHomeClub().getId(),
                    fixture.getAwayClub().getId()
            );

            if (hasConflict) {
                throw new InvalidFixtureException(
                        "Cannot set fixture to LIVE: One of the teams is already involved in a LIVE match at this exact date and time in this gameweek."
                );
            }
        }

        fixture.setFixtureStatus(status);
        Fixture updatedFixture = fixtureRepository.save(fixture);
        return mapToResponse(updatedFixture);
    }



    private FixtureResponse mapToResponse(Fixture fixture){
        FixtureResults results = fixture.getFixtureResults();
        return FixtureResponse.builder()
                .id(fixture.getId())
                .venue(fixture.getVenue())
                .fixtureStatus(fixture.getFixtureStatus())
                .awayClubName(fixture.getAwayClub().getFullName())
                .homeClubName(fixture.getHomeClub().getFullName())
                .matchDate(fixture.getMatchDate())
                .gameweekNumber(fixture.getGameweek().getGameweekNumber())
                .homeScore(results != null ? results.getHomeScore() : null)
                .awayScore(results != null ? results.getAwayScore() : null)
                .build();
    }


}

