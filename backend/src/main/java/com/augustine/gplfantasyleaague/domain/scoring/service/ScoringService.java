package com.augustine.gplfantasyleaague.domain.scoring.service;

import com.augustine.gplfantasyleaague.domain.fantasy.entity.Chip;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.ChipType;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.FantasyTeam;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.FantasyTeamPlayer;
import com.augustine.gplfantasyleaague.domain.fantasy.repository.ChipRepository;
import com.augustine.gplfantasyleaague.domain.fantasy.repository.FantasyTeamPlayerRepository;
import com.augustine.gplfantasyleaague.domain.fantasy.repository.FantasyTeamRepository;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.Fixture;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.FixtureStatus;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.Gameweek;
import com.augustine.gplfantasyleaague.domain.gameweek.repository.FixtureRepository;
import com.augustine.gplfantasyleaague.domain.gameweek.repository.GameweekRepository;
import com.augustine.gplfantasyleaague.domain.player.entity.Player;
import com.augustine.gplfantasyleaague.domain.player.entity.Position;
import com.augustine.gplfantasyleaague.domain.player.repository.PlayerRepository;
import com.augustine.gplfantasyleaague.domain.scoring.dtos.FantasyTeamGameWeekScoreResponse;
import com.augustine.gplfantasyleaague.domain.scoring.dtos.PlayerGameWeekStatsRequest;
import com.augustine.gplfantasyleaague.domain.scoring.dtos.PlayerGameWeekStatsResponse;
import com.augustine.gplfantasyleaague.domain.scoring.entity.FantasyTeamGameWeekScore;
import com.augustine.gplfantasyleaague.domain.scoring.entity.PlayerGameWeekStats;
import com.augustine.gplfantasyleaague.domain.scoring.repository.FantasyTeamGameWeekRepository;
import com.augustine.gplfantasyleaague.domain.scoring.repository.PlayerGameWeekStatsRepository;
import com.augustine.gplfantasyleaague.exception.DataIntegrityViolationException;
import com.augustine.gplfantasyleaague.exception.InvalidFixtureException;
import com.augustine.gplfantasyleaague.exception.InvalidSquadException;
import com.augustine.gplfantasyleaague.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service

public class ScoringService {
    private static final Logger log = LoggerFactory.getLogger(ScoringService.class);
    private final PlayerGameWeekStatsRepository playerGameWeekStatsRepository;
    private final FantasyTeamGameWeekRepository fantasyTeamGameWeekRepository;
    private final FantasyTeamPlayerRepository fantasyTeamPlayerRepository;
    private final FantasyTeamRepository fantasyTeamRepository;
    private final PlayerRepository playerRepository;
    private final FixtureRepository fixtureRepository;
    private final GameweekRepository gameweekRepository;
    private final ChipRepository chipRepository;

    public ScoringService(PlayerGameWeekStatsRepository playerGameWeekStatsRepository, FantasyTeamGameWeekRepository fantasyTeamGameWeekRepository, FantasyTeamPlayerRepository fantasyTeamPlayerRepository, FantasyTeamRepository fantasyTeamRepository, PlayerRepository playerRepository, FixtureRepository fixtureRepository, GameweekRepository gameweekRepository, ChipRepository chipRepository) {
        this.playerGameWeekStatsRepository = playerGameWeekStatsRepository;
        this.fantasyTeamGameWeekRepository = fantasyTeamGameWeekRepository;
        this.fantasyTeamPlayerRepository = fantasyTeamPlayerRepository;
        this.fantasyTeamRepository = fantasyTeamRepository;
        this.playerRepository = playerRepository;
        this.fixtureRepository = fixtureRepository;
        this.gameweekRepository = gameweekRepository;
        this.chipRepository = chipRepository;
    }

    //helper methods
    private int calculateFantasyPoints(PlayerGameWeekStats stats){
        Integer points = 0;
        if(stats.getMinutesPlayed() > 0 && stats.getMinutesPlayed() < 60){
            points  += 1;
        }

        if(stats.getMinutesPlayed() >= 60){
            points += 2;
        }

        if(stats.getGoalsScored() > 0){
            if(stats.getPlayer().getPosition().equals(Position.GK) || stats.getPlayer().getPosition().equals(Position.DEF)){
                points += stats.getGoalsScored() * 6;
            } else if (stats.getPlayer().getPosition().equals(Position.MID)) {
                points += stats.getGoalsScored() * 5;
            }else{
                points += stats.getGoalsScored() * 4;
            }
        }

        if(stats.getAssists() > 0){
            points += stats.getAssists() * 3;
        }

        if(stats.getCleanSheet()){
            if(stats.getPlayer().getPosition().equals(Position.GK) || stats.getPlayer().getPosition().equals(Position.DEF)){
                points += 4;
            }else if (stats.getPlayer().getPosition().equals(Position.MID)){
                points += 1;
            }
        }

        if (stats.getRedCard()) {
            points -= 3;
        } else if (stats.getYellowCard() >= 2) {
            points -= 3;
        } else if (stats.getYellowCard() == 1) {
            points -= 1;
        }

        if(stats.getSaves() >= 3 && stats.getPlayer().getPosition().equals(Position.GK)){
            points += stats.getSaves() / 3;
        }

        return points;
    }

    private PlayerGameWeekStats saveToPlayerGameweekStats(PlayerGameWeekStatsRequest request, Player player, Fixture fixture){
        PlayerGameWeekStats savedPlayerStats = PlayerGameWeekStats.builder()
                .saves(request.getSaves())
                .goalsScored(request.getGoalsScored())
                .minutesPlayed(request.getMinutesPlayed())
                .redCard(request.getRedCard())
                .yellowCard(request.getYellowCard())
                .cleanSheet(request.getCleanSheet())
                .assists(request.getAssists())
                .fixture(fixture)
                .player(player)
                .build();
        return savedPlayerStats;
    }

    private PlayerGameWeekStatsResponse mapToResponse(PlayerGameWeekStats playerGameWeekStats){
        return PlayerGameWeekStatsResponse.builder()
                .id(playerGameWeekStats.getId())
                .fantasyPoint(playerGameWeekStats.getFantasyPoint())
                .playerName(playerGameWeekStats.getPlayer().getFullName())
                .clubName(playerGameWeekStats.getPlayer().getClub().getFullName())
                .position(playerGameWeekStats.getPlayer().getPosition())
                .saves(playerGameWeekStats.getSaves())
                .redCard(playerGameWeekStats.getRedCard())
                .goalsScored(playerGameWeekStats.getGoalsScored())
                .minutesPlayed(playerGameWeekStats.getMinutesPlayed())
                .yellowCard(playerGameWeekStats.getYellowCard())
                .assists(playerGameWeekStats.getAssists())
                .cleanSheet(playerGameWeekStats.getCleanSheet())
                .build();
    }

    private FantasyTeamGameWeekScore saveToGameweekScore(FantasyTeam fantasyTeam, Integer gameweekId, Integer totalTeamPoints){
        Gameweek gameweek = gameweekRepository.findById(gameweekId).orElseThrow(()-> new ResourceNotFoundException("Gameweek with ID " + gameweekId + " not found"));
        FantasyTeamGameWeekScore teamGameWeekScore =  FantasyTeamGameWeekScore.builder()
                                                            .fantasyTeam(fantasyTeam)
                                                            .gameweek(gameweek)
                                                            .points(totalTeamPoints)
                                                             .build();
        fantasyTeamGameWeekRepository.save(teamGameWeekScore);
        return teamGameWeekScore;

    }

    private FantasyTeamGameWeekScoreResponse mapToGameweekScoreResponse(FantasyTeamGameWeekScore teamGameWeekScore){
        return FantasyTeamGameWeekScoreResponse.builder()
                .totalPoints(teamGameWeekScore.getPoints())
                .fantasyTeamName(teamGameWeekScore.getFantasyTeam().getTeamName())
                .gameweekNumber(teamGameWeekScore.getGameweek().getGameweekNumber())
                .id(teamGameWeekScore.getId())
                .build();
    }


    @Transactional
    public PlayerGameWeekStatsResponse recordPlayerStats(PlayerGameWeekStatsRequest request){
        Player player = playerRepository.findById(request.getPlayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Player with ID " + request.getPlayerId() + " not found"));
        Fixture fixture = fixtureRepository.findById(request.getFixtureId())
                .orElseThrow(() -> new ResourceNotFoundException("Fixture with ID " + request.getFixtureId() + " not found"));

        if(playerGameWeekStatsRepository.existsByPlayerIdAndFixtureId(player.getId(), fixture.getId())){
            throw new DataIntegrityViolationException("Stats already recorded for player '" + player.getFullName() + "' in this fixture");
        }

        if(fixture.getFixtureStatus() == FixtureStatus.POSTPONED){
            throw new InvalidFixtureException("Cannot record matching player statistics for a postponed fixture");
        }

        PlayerGameWeekStats playerStats = saveToPlayerGameweekStats(request,player,fixture);
        Integer points = calculateFantasyPoints(playerStats);
        playerStats.setFantasyPoint(points);
        playerGameWeekStatsRepository.save(playerStats);
        return mapToResponse(playerStats);

    }

    @Transactional
    public FantasyTeamGameWeekScoreResponse calculateGameweekScore(Integer fantasyTeamId, Integer gameweekId){
        Optional<Chip> activeChip = chipRepository.findByFantasyTeamIdAndGameweekId(fantasyTeamId, gameweekId);
        FantasyTeam team = fantasyTeamRepository.findById(fantasyTeamId).orElseThrow(()-> new ResourceNotFoundException("Fantasy Team with ID " + fantasyTeamId + " does not exist"));

        boolean isBenchBoost = activeChip.isPresent() &&
                activeChip.get().getChipType() == ChipType.BENCH_BOOST;

        boolean isTripleCaptain = activeChip.isPresent() && activeChip.get().getChipType() == ChipType.TRIPLE_CAPTAIN;

        List<FantasyTeamPlayer> allActivePlayers = isBenchBoost ? fantasyTeamPlayerRepository.findByFantasyTeamId(fantasyTeamId) : fantasyTeamPlayerRepository.findByFantasyTeamIdAndIsPartOfXITrue(fantasyTeamId);
        List<Integer> fixtureIds = fixtureRepository.findByGameweekId(gameweekId)
                .stream()
                .map(Fixture::getId)
                .toList();
        if (fixtureIds.isEmpty()) {
            throw new InvalidFixtureException("Execution aborted: No active fixtures scheduled for Gameweek ID " + gameweekId);
        }

        Optional<FantasyTeamPlayer> captain = allActivePlayers.stream()
                .filter(captan -> captan.getIsCaptain().equals(true))
                .findFirst();

        Optional<FantasyTeamPlayer> viceCaptain = allActivePlayers.stream()
                .filter(captan -> captan.getIsViceCaptain().equals(true))
                .findFirst();

        boolean captainPlayed = captain.isPresent() &&
                playerGameWeekStatsRepository
                        .findByPlayerIdAndFixtureIdIn(captain.get().getPlayer().getId(), fixtureIds)
                        .stream()
                        .anyMatch(stats -> stats.getMinutesPlayed() > 0);

        int totalTeamPoints = 0;

        for(FantasyTeamPlayer player: allActivePlayers){
            List<PlayerGameWeekStats> playerStatsList = playerGameWeekStatsRepository.findByPlayerIdAndFixtureIdIn(player.getPlayer().getId(), fixtureIds);

            int basePoints = playerStatsList.stream()
                    .mapToInt(PlayerGameWeekStats::getFantasyPoint)
                    .sum();

            int multiplier = 1;

            if(captain.isPresent() && player.getPlayer().getId().equals(captain.get().getPlayer().getId())){
                if(captainPlayed){
                    multiplier = isTripleCaptain ? 3 : 2;
                }
            } else if(viceCaptain.isPresent() && player.getPlayer().getId().equals(viceCaptain.get().getPlayer().getId())){
                if(!captainPlayed){
                    multiplier = 2;
                }
            }

            totalTeamPoints += (basePoints * multiplier);
        }

        Optional<FantasyTeamGameWeekScore> existingTeamGameweekScore = fantasyTeamGameWeekRepository.findByFantasyTeamIdAndGameweekId(team.getId(),gameweekId);
        int pointsToSubtract = 0;
        if(existingTeamGameweekScore.isPresent()){
            pointsToSubtract = existingTeamGameweekScore.get().getPoints();
        }
        team.setTotalPoints(team.getTotalPoints() - pointsToSubtract + totalTeamPoints);
        fantasyTeamRepository.save(team);

        FantasyTeamGameWeekScore savedGameweekScore;
        if(existingTeamGameweekScore.isPresent()){
            savedGameweekScore = existingTeamGameweekScore.get();
            savedGameweekScore.setPoints(totalTeamPoints);
            fantasyTeamGameWeekRepository.save(savedGameweekScore);
        }else{
            savedGameweekScore = saveToGameweekScore(team,gameweekId,totalTeamPoints);
        }

        return mapToGameweekScoreResponse(savedGameweekScore);
    }

    public List<PlayerGameWeekStatsResponse> getPlayerStatsByFixture(Integer fixtureId){
        return playerGameWeekStatsRepository.findByFixtureId(fixtureId).stream()
                .map(playerStats -> mapToResponse(playerStats))
                .toList();
    }

    public List<FantasyTeamGameWeekScoreResponse> getFantasyTeamScoreByGameweek(Integer gameweekId){
        return fantasyTeamGameWeekRepository.findByGameweekId(gameweekId).stream()
                .map(teamGameWeekScore -> mapToGameweekScoreResponse(teamGameWeekScore))
                .toList();
    }

    public List<FantasyTeamGameWeekScoreResponse> getFantasyTeamHistory(Integer fantasyTeamId){
        return fantasyTeamGameWeekRepository.findByFantasyTeamId(fantasyTeamId).stream()
                .map(teamGameWeekScore -> mapToGameweekScoreResponse(teamGameWeekScore))
                .toList();
    }

    @Transactional
    public void calculateAllTeamsForGameweek(Integer gameweekId) {
        List<Integer> fixtureIds = fixtureRepository.findByGameweekId(gameweekId)
                .stream()
                .map(Fixture::getId)
                .toList();

        if (fixtureIds.isEmpty()) {
            throw new ResourceNotFoundException("Cannot batch calculate: No active fixtures found for Gameweek ID " + gameweekId);
        }

        List<FantasyTeam> allTeams = fantasyTeamRepository.findAll();

        for (FantasyTeam team : allTeams) {
            try {
                calculateGameweekScore(team.getId(), gameweekId);
            } catch (Exception e) {
                log.error("Skipping Team ID {} due to error: {}", team.getId(), e.getMessage(), e);
            }
        }
    }
}