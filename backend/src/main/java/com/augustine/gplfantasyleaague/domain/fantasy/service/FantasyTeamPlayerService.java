package com.augustine.gplfantasyleaague.domain.fantasy.service;

import com.augustine.gplfantasyleaague.domain.auth.entity.Role;
import com.augustine.gplfantasyleaague.domain.auth.entity.User;
import com.augustine.gplfantasyleaague.domain.auth.repository.UserRepository;
import com.augustine.gplfantasyleaague.domain.fantasy.dto.FantasyTeamPlayerRequest;
import com.augustine.gplfantasyleaague.domain.fantasy.dto.FantasyTeamPlayerResponse;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.FantasyTeam;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.FantasyTeamPlayer;
import com.augustine.gplfantasyleaague.domain.fantasy.repository.FantasyTeamPlayerRepository;
import com.augustine.gplfantasyleaague.domain.fantasy.repository.FantasyTeamRepository;
import com.augustine.gplfantasyleaague.domain.gameweek.repository.GameweekRepository;
import com.augustine.gplfantasyleaague.domain.player.entity.Player;
import com.augustine.gplfantasyleaague.domain.player.entity.PlayerPrice;
import com.augustine.gplfantasyleaague.domain.player.entity.Position;
import com.augustine.gplfantasyleaague.domain.player.repository.PlayerPriceRepository;
import com.augustine.gplfantasyleaague.domain.player.repository.PlayerRepository;
import com.augustine.gplfantasyleaague.exception.InvalidSquadException;
import com.augustine.gplfantasyleaague.exception.ResourceNotFoundException;
import com.augustine.gplfantasyleaague.exception.UnauthorizedAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.augustine.gplfantasyleaague.domain.club.entity.ClubStatus;

import java.math.BigDecimal;
import java.util.List;

@Service
public class FantasyTeamPlayerService {
    private final GameweekRepository gameweekRepository;
    private final UserRepository userRepository;
    private final PlayerRepository playerRepository;
    private final FantasyTeamRepository fantasyTeamRepository;
    private final FantasyTeamPlayerRepository fantasyTeamPlayerRepository;
    private final PlayerPriceRepository playerPriceRepository;

    public FantasyTeamPlayerService(GameweekRepository gameweekRepository, UserRepository userRepository, PlayerRepository playerRepository, FantasyTeamRepository fantasyTeamRepository, FantasyTeamPlayerRepository fantasyTeamPlayerRepository, PlayerPriceRepository playerPriceRepository) {
        this.gameweekRepository = gameweekRepository;
        this.userRepository = userRepository;
        this.playerRepository = playerRepository;
        this.fantasyTeamRepository = fantasyTeamRepository;
        this.fantasyTeamPlayerRepository = fantasyTeamPlayerRepository;
        this.playerPriceRepository = playerPriceRepository;
    }

    @Transactional
    public FantasyTeamPlayerResponse addPlayerToSquad(FantasyTeamPlayerRequest request, String email){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User not found"));
        FantasyTeam fantasyTeam = fantasyTeamRepository.findById(request.getFantasyTeamId()).orElseThrow(()-> new ResourceNotFoundException("Fantasy team not found"));

        if(!fantasyTeam.getUser().getId().equals(user.getId())){
            throw new UnauthorizedAccessException("This team doesn't belong to you");
        }

        long currentSquadSize = fantasyTeamPlayerRepository.countByFantasyTeamId(fantasyTeam.getId());
        boolean squadIsComplete = currentSquadSize >= 15;
        if (squadIsComplete && gameweekRepository.findByIsCurrentTrue().isPresent()) {
            throw new InvalidSquadException("Your squad is complete. Use transfers to make changes.");
        }


        Player player = playerRepository.findById(request.getPlayerId()).orElseThrow(()-> new ResourceNotFoundException("Player with ID " + request.getPlayerId() + " not found"));

        if (player.getClub().getClubStatus() != ClubStatus.ACTIVE) {
            throw new InvalidSquadException(
                    "Cannot add " + player.getFullName() + ": " + player.getClub().getFullName() + " is not an active club");
        }

        if(fantasyTeamPlayerRepository.existsByFantasyTeamIdAndPlayerId(fantasyTeam.getId(), player.getId())){
            throw new InvalidSquadException("Player is already in your lineUp");
        }

        //squad rules
        long gkCount = fantasyTeamPlayerRepository.countByFantasyTeamIdAndPlayer_Position(fantasyTeam.getId(), Position.GK);
        if(player.getPosition() == Position.GK && gkCount >= 2){
            throw new InvalidSquadException("You already have 2 goalkeepers");
        }

        long defCount = fantasyTeamPlayerRepository.countByFantasyTeamIdAndPlayer_Position(fantasyTeam.getId(), Position.DEF);
        if(player.getPosition() == Position.DEF && defCount >= 5){
            throw new InvalidSquadException("You already have 5 defenders");
        }

        long midCount = fantasyTeamPlayerRepository.countByFantasyTeamIdAndPlayer_Position(fantasyTeam.getId(), Position.MID);
        if(player.getPosition() == Position.MID && midCount >= 5){
            throw new InvalidSquadException("You already have 5 midfielders");
        }

        long fwdCount = fantasyTeamPlayerRepository.countByFantasyTeamIdAndPlayer_Position(fantasyTeam.getId(), Position.FWD);
        if(player.getPosition() == Position.FWD && fwdCount >= 3){
            throw new InvalidSquadException("You already have 3 forwards");
        }


        if(fantasyTeamPlayerRepository.countByFantasyTeamId(fantasyTeam.getId()) >= 15){
            throw new InvalidSquadException("Team exceeds 15 players");
        }

        if(fantasyTeamPlayerRepository.countByFantasyTeamIdAndPlayer_ClubId(fantasyTeam.getId(), player.getClub().getId()) >= 3){
            throw new InvalidSquadException("You already have 3 players from "+ player.getClub().getFullName());
        }

        PlayerPrice playerPrice = playerPriceRepository.findTopByPlayerIdOrderByRecordedAtDesc(player.getId()).orElseThrow(()-> new ResourceNotFoundException("Player price not found"));
        BigDecimal newBudget = fantasyTeam.getBudgetRemaining().subtract(playerPrice.getPrice());
        if (newBudget.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidSquadException(
                    String.format("Cannot add %s: insufficient budget. Remaining budget is %s, player costs %s",
                            player.getFullName(), fantasyTeam.getBudgetRemaining(), playerPrice.getPrice()));
        }

        FantasyTeamPlayer fantasyTeamPlayer = saveToFantasyPlayerDatabase(player, playerPrice, fantasyTeam);
        fantasyTeam.setBudgetRemaining(newBudget);
        fantasyTeamRepository.save(fantasyTeam);
        return mapToResponse(fantasyTeamPlayer);
    }

    @Transactional
    public FantasyTeamPlayerResponse setCaptain(Integer fantasyTeamPlayerId, String email){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User account not found"));
        FantasyTeam fantasyTeam = fantasyTeamRepository.findByUserId(user.getId()).orElseThrow(() -> new ResourceNotFoundException("You don't have a registered fantasy team"));
        FantasyTeamPlayer newCaptain = fantasyTeamPlayerRepository.findById(fantasyTeamPlayerId).orElseThrow(()-> new ResourceNotFoundException("Player doesnt exist in your team"));

        if(!newCaptain.getFantasyTeam().getId().equals(fantasyTeam.getId())){
           throw new UnauthorizedAccessException("Player doesnt belong to your team");
        }

        if (newCaptain.getIsViceCaptain()) {
            throw new InvalidSquadException(
                    "A vice captain cannot also be the captain. Choose another player."
            );
        }

        if (!newCaptain.getIsPartOfXI()) {
            throw new InvalidSquadException(
                    "Only players in the starting XI can be selected as captain."
            );
        }

        if (Boolean.TRUE.equals(newCaptain.getIsCaptain())) {
            return mapToResponse(newCaptain);
        }

       fantasyTeamPlayerRepository.findByFantasyTeamIdAndIsCaptainTrue(fantasyTeam.getId())
                .ifPresent(currentCaptain ->{
                    currentCaptain.setIsCaptain(false);
                    fantasyTeamPlayerRepository.save(currentCaptain);
                });
        newCaptain.setIsCaptain(true);
        fantasyTeamPlayerRepository.save(newCaptain);
        return mapToResponse(newCaptain);

    }

    @Transactional
    public FantasyTeamPlayerResponse setViceCaptain(Integer fantasyTeamPlayerId, String email){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User not found"));
        FantasyTeam fantasyTeam = fantasyTeamRepository.findByUserId(user.getId()).orElseThrow(() -> new ResourceNotFoundException("You don't have a registered fantasy team"));
        FantasyTeamPlayer newViceCaptain = fantasyTeamPlayerRepository.findById(fantasyTeamPlayerId).orElseThrow(()-> new ResourceNotFoundException("Player doesnt exist in your team"));

        if(!newViceCaptain.getFantasyTeam().getId().equals(fantasyTeam.getId())){
            throw new UnauthorizedAccessException("Player doesnt belong to your team");
        }

        if (newViceCaptain.getIsCaptain()) {
            throw new InvalidSquadException(
                    "A captain cannot also be the vice captain. Choose another player."
            );
        }

        if (!newViceCaptain.getIsPartOfXI()) {
            throw new InvalidSquadException(
                    "Only players in the starting XI can be selected as vice captain."
            );
        }

        if (Boolean.TRUE.equals(newViceCaptain.getIsViceCaptain())) {
            return mapToResponse(newViceCaptain);
        }

        fantasyTeamPlayerRepository.findByFantasyTeamIdAndIsViceCaptainTrue(fantasyTeam.getId())
                .ifPresent(currentViceCaptain ->{
                    currentViceCaptain.setIsViceCaptain(false);
                    fantasyTeamPlayerRepository.save(currentViceCaptain);
                });
        newViceCaptain.setIsViceCaptain(true);
        fantasyTeamPlayerRepository.save(newViceCaptain);
        return mapToResponse(newViceCaptain);
    }

    @Transactional
    public void removePlayerFromSquad(Integer fantasyTeamPlayerId, String email){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User not found"));
        FantasyTeam team = fantasyTeamRepository.findByUserId(user.getId()).orElseThrow(()-> new ResourceNotFoundException("You don't have a registered fantasy team"));
        FantasyTeamPlayer player = fantasyTeamPlayerRepository.findByFantasyTeamIdAndId(team.getId(), fantasyTeamPlayerId)
                .orElseThrow(()-> new ResourceNotFoundException("Player not found in your squad"));

        if(Boolean.TRUE.equals(player.getIsCaptain())){
            throw new InvalidSquadException("You cannot remove your captain. Assign captain to another player first.");
        }
        if(Boolean.TRUE.equals(player.getIsViceCaptain())){
            throw new InvalidSquadException("You cannot remove your vice-captain. Assign vice-captain to another player first.");
        }

        BigDecimal refund = player.getCurrentPrice() != null ? player.getCurrentPrice() : player.getPurchasePrice();
        team.setBudgetRemaining(team.getBudgetRemaining().add(refund));
        fantasyTeamRepository.save(team);

        fantasyTeamPlayerRepository.delete(player);
    }

    public List<FantasyTeamPlayerResponse> getSquad(Integer fantasyTeamId, String email){
        requireOwnerOrAdmin(fantasyTeamId, email);
        return fantasyTeamPlayerRepository.findByFantasyTeamId(fantasyTeamId).stream()
                .map(player -> mapToResponse(player))
                .toList();
    }

    public List<FantasyTeamPlayerResponse> getStartingXI(Integer fantasyTeamId, String email){
        requireOwnerOrAdmin(fantasyTeamId, email);
        return fantasyTeamPlayerRepository.findByFantasyTeamIdAndIsPartOfXITrue(fantasyTeamId).stream()
                .map(player-> mapToResponse(player))
                .toList();
    }

    public List<FantasyTeamPlayerResponse> getBenchPlayers(Integer fantasyTeamId, String email){
        requireOwnerOrAdmin(fantasyTeamId, email);
        return fantasyTeamPlayerRepository.findByFantasyTeamIdAndIsPartOfXIFalse(fantasyTeamId).stream()
                .map(player-> mapToResponse(player))
                .toList();
    }

    private void requireOwnerOrAdmin(Integer fantasyTeamId, String email){
        FantasyTeam fantasyTeam = fantasyTeamRepository.findById(fantasyTeamId).orElseThrow(()-> new ResourceNotFoundException("Fantasy team not found"));
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User not found"));

        boolean isOwner = fantasyTeam.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if(!isOwner && !isAdmin){
            throw new UnauthorizedAccessException("This team doesn't belong to you");
        }
    }

    @Transactional
    public List<FantasyTeamPlayerResponse> swapPlayers(Integer playerAId, Integer playerBId, String email){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User not found"));
        FantasyTeam team = fantasyTeamRepository.findByUserId(user.getId()).orElseThrow(()-> new ResourceNotFoundException("Team not found"));
        FantasyTeamPlayer playerA = fantasyTeamPlayerRepository.findByFantasyTeamIdAndId(team.getId(), playerAId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found"));
        FantasyTeamPlayer playerB = fantasyTeamPlayerRepository.findByFantasyTeamIdAndId(team.getId(), playerBId)
                .orElseThrow(() -> new ResourceNotFoundException("Player not found"));

        // Figure out which one is starting and which is benched, regardless of argument order
        FantasyTeamPlayer startingPlayer;
        FantasyTeamPlayer benchPlayer;
        if (Boolean.TRUE.equals(playerA.getIsPartOfXI()) && Boolean.FALSE.equals(playerB.getIsPartOfXI())) {
            startingPlayer = playerA;
            benchPlayer = playerB;
        } else if (Boolean.TRUE.equals(playerB.getIsPartOfXI()) && Boolean.FALSE.equals(playerA.getIsPartOfXI())) {
            startingPlayer = playerB;
            benchPlayer = playerA;
        } else {
            throw new InvalidSquadException("Swap requires one starting player and one bench player");
        }

        // A captain or vice-captain must be reassigned before the player holding that role can be benched
        if (Boolean.TRUE.equals(startingPlayer.getIsCaptain())) {
            throw new InvalidSquadException(
                    "You cannot bench your captain. Assign captain to another player in your starting XI first.");
        }
        if (Boolean.TRUE.equals(startingPlayer.getIsViceCaptain())) {
            throw new InvalidSquadException(
                    "You cannot bench your vice-captain. Assign vice-captain to another player in your starting XI first.");
        }

        if(startingPlayer.getPlayer().getPosition() == Position.GK ||
                benchPlayer.getPlayer().getPosition() == Position.GK){
            if(startingPlayer.getPlayer().getPosition() != benchPlayer.getPlayer().getPosition()){
                throw new InvalidSquadException("Goalkeeper can only swap with another goalkeeper");
            }
        }

        Position outPosition = startingPlayer.getPlayer().getPosition();
        Position inPosition = benchPlayer.getPlayer().getPosition();

        if(outPosition == Position.DEF){
            long defCount = fantasyTeamPlayerRepository.countByFantasyTeamIdAndPlayer_PositionAndIsPartOfXITrue(team.getId(), Position.DEF);

            if(defCount - 1 < 3 && inPosition != Position.DEF){
                throw new InvalidSquadException("Swap would leave fewer than 3 defenders");
            }
        }

        if(outPosition == Position.MID){
            long midCount = fantasyTeamPlayerRepository.countByFantasyTeamIdAndPlayer_PositionAndIsPartOfXITrue(team.getId(), Position.MID);

            if(midCount - 1 < 2 && inPosition != Position.MID){
                throw new InvalidSquadException("Swap would leave fewer than 2 midfielders");
            }
        }

        if(outPosition == Position.FWD){
            long fwdCount = fantasyTeamPlayerRepository.countByFantasyTeamIdAndPlayer_PositionAndIsPartOfXITrue(team.getId(), Position.FWD);

            if(fwdCount - 1 < 1 && inPosition != Position.FWD){
                throw new InvalidSquadException("Swap would leave fewer than 1 forward");
            }
        }

        startingPlayer.setIsPartOfXI(false);
        benchPlayer.setIsPartOfXI(true);

        fantasyTeamPlayerRepository.save(startingPlayer);
        fantasyTeamPlayerRepository.save(benchPlayer);
        return fantasyTeamPlayerRepository.findByFantasyTeamIdAndIsPartOfXITrue(team.getId()).stream()
                .map(allPlayers-> mapToResponse(allPlayers))
                .toList();
    }

    @Transactional
    public List<FantasyTeamPlayerResponse> setStartingLineup(List<Integer> fantasyTeamPlayerIds, String email){
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        FantasyTeam team = fantasyTeamRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("You don't have a registered fantasy team"));

        if (fantasyTeamPlayerIds.size() != 11) {
            throw new InvalidSquadException("Starting lineup must contain exactly 11 players");
        }

        List<FantasyTeamPlayer> chosenPlayers = fantasyTeamPlayerRepository.findAllById(fantasyTeamPlayerIds);

        if (chosenPlayers.size() != 11) {
            throw new InvalidSquadException("One or more selected players do not exist");
        }

        for (FantasyTeamPlayer p : chosenPlayers) {
            if (!p.getFantasyTeam().getId().equals(team.getId())) {
                throw new UnauthorizedAccessException("Player " + p.getId() + " does not belong to your team");
            }
        }


        // The current captain/vice-captain must remain in the lineup, or be reassigned first
        fantasyTeamPlayerRepository.findByFantasyTeamIdAndIsCaptainTrue(team.getId())
                .ifPresent(currentCaptain -> {
                    if (!fantasyTeamPlayerIds.contains(currentCaptain.getId())) {
                        throw new InvalidSquadException(
                                "Your captain (" + currentCaptain.getPlayer().getFullName() + ") must be included in the lineup, or reassign captain to someone else first.");
                    }
                });

        fantasyTeamPlayerRepository.findByFantasyTeamIdAndIsViceCaptainTrue(team.getId())
                .ifPresent(currentViceCaptain -> {
                    if (!fantasyTeamPlayerIds.contains(currentViceCaptain.getId())) {
                        throw new InvalidSquadException(
                                "Your vice-captain (" + currentViceCaptain.getPlayer().getFullName() + ") must be included in the lineup, or reassign vice-captain to someone else first.");
                    }
                });

        long gkCount = chosenPlayers.stream().filter(p -> p.getPlayer().getPosition() == Position.GK).count();
        long defCount = chosenPlayers.stream().filter(p -> p.getPlayer().getPosition() == Position.DEF).count();
        long midCount = chosenPlayers.stream().filter(p -> p.getPlayer().getPosition() == Position.MID).count();
        long fwdCount = chosenPlayers.stream().filter(p -> p.getPlayer().getPosition() == Position.FWD).count();

        if (gkCount != 1) {
            throw new InvalidSquadException("Lineup must include exactly 1 goalkeeper");
        }
        if (defCount < 3 || defCount > 5) {
            throw new InvalidSquadException("Lineup must include between 3 and 5 defenders");
        }
        if (midCount < 3 || midCount > 5) {
            throw new InvalidSquadException("Lineup must include between 3 and 5 midfielders");
        }
        if (fwdCount < 1 || fwdCount > 3) {
            throw new InvalidSquadException("Lineup must include between 1 and 3 forwards");
        }

        List<FantasyTeamPlayer> allSquadPlayers = fantasyTeamPlayerRepository.findByFantasyTeamId(team.getId());
        for (FantasyTeamPlayer p : allSquadPlayers) {
            boolean isChosen = fantasyTeamPlayerIds.contains(p.getId());
            p.setIsPartOfXI(isChosen);
        }
        fantasyTeamPlayerRepository.saveAll(allSquadPlayers);

        return fantasyTeamPlayerRepository.findByFantasyTeamIdAndIsPartOfXITrue(team.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }


    //helper methods
    private FantasyTeamPlayer saveToFantasyPlayerDatabase(Player player, PlayerPrice playerPrice, FantasyTeam fantasyTeam){
        FantasyTeamPlayer savedFantasyPlayer = FantasyTeamPlayer.builder()
                .purchasePrice(playerPrice.getPrice())
                .player(player)
                .fantasyTeam(fantasyTeam)
                .currentPrice(playerPrice.getPrice())
                .isPartOfXI(false)
                .build();
        fantasyTeamPlayerRepository.save(savedFantasyPlayer);
        return savedFantasyPlayer;
    }

    private FantasyTeamPlayerResponse mapToResponse(FantasyTeamPlayer fantasyTeamPlayer){
        return FantasyTeamPlayerResponse.builder()
                .id(fantasyTeamPlayer.getId())
                .playerId(fantasyTeamPlayer.getPlayer().getId())
                .clubId(fantasyTeamPlayer.getPlayer().getClub().getId())
                .fantasyTeamName(fantasyTeamPlayer.getFantasyTeam().getTeamName())
                .isCaptain(fantasyTeamPlayer.getIsCaptain())
                .isViceCaptain(fantasyTeamPlayer.getIsViceCaptain())
                .isPartOfXI(fantasyTeamPlayer.getIsPartOfXI())
                .playerName(fantasyTeamPlayer.getPlayer().getFullName())
                .position(fantasyTeamPlayer.getPlayer().getPosition())
                .purchasePrice(fantasyTeamPlayer.getPurchasePrice())
                .currentPrice(fantasyTeamPlayer.getCurrentPrice())
                .build();
    }
}