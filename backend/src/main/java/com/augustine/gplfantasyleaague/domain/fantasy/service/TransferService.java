package com.augustine.gplfantasyleaague.domain.fantasy.service;

import com.augustine.gplfantasyleaague.domain.auth.entity.Role;
import com.augustine.gplfantasyleaague.domain.auth.entity.User;
import com.augustine.gplfantasyleaague.domain.auth.repository.UserRepository;
import com.augustine.gplfantasyleaague.domain.fantasy.dto.TransferRequest;
import com.augustine.gplfantasyleaague.domain.fantasy.dto.TransferResponse;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.ChipType;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.FantasyTeam;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.FantasyTeamPlayer;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.Transfer;
import com.augustine.gplfantasyleaague.domain.fantasy.repository.ChipRepository;
import com.augustine.gplfantasyleaague.domain.fantasy.repository.FantasyTeamPlayerRepository;
import com.augustine.gplfantasyleaague.domain.fantasy.repository.FantasyTeamRepository;
import com.augustine.gplfantasyleaague.domain.fantasy.repository.TransferRepository;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.Gameweek;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransferService {
    private final TransferRepository transferRepository;
    private final PlayerRepository playerRepository;
    private final GameweekRepository gameweekRepository;
    private final FantasyTeamRepository fantasyTeamRepository;
    private final UserRepository userRepository;
    private final FantasyTeamPlayerRepository fantasyTeamPlayerRepository;
    private final PlayerPriceRepository playerPriceRepository;
    private final ChipRepository chipRepository;

    public TransferService(TransferRepository transferRepository, PlayerRepository playerRepository, GameweekRepository gameweekRepository, FantasyTeamRepository fantasyTeamRepository, UserRepository userRepository, FantasyTeamPlayerRepository fantasyTeamPlayerRepository, PlayerPriceRepository playerPriceRepository, ChipRepository chipRepository) {
        this.transferRepository = transferRepository;
        this.playerRepository = playerRepository;
        this.gameweekRepository = gameweekRepository;
        this.fantasyTeamRepository = fantasyTeamRepository;
        this.userRepository = userRepository;
        this.fantasyTeamPlayerRepository = fantasyTeamPlayerRepository;
        this.playerPriceRepository = playerPriceRepository;
        this.chipRepository = chipRepository;
    }

    @Transactional
    public TransferResponse makeTransfer(TransferRequest request, String email){
        User user =  userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User with email " + email + " not found"));
        FantasyTeam fantasyTeam = fantasyTeamRepository.findById(request.getFantasyTeamId()).orElseThrow(()-> new ResourceNotFoundException("Fantasy Team with ID " + request.getFantasyTeamId() + " not found"));
        if(!fantasyTeam.getUser().getId().equals(user.getId())){
            throw new UnauthorizedAccessException("User doesnt match team");
        }

        Player playerIn = playerRepository.findById(request.getPlayerInId()).orElseThrow(()-> new ResourceNotFoundException("Incoming player with ID " + request.getPlayerInId() + " not found"));
        Player playerOut = playerRepository.findById(request.getPlayerOutId()).orElseThrow(()-> new ResourceNotFoundException("Outgoing player with ID " + request.getPlayerOutId() + " not found"));


        BigDecimal playerInPrice = playerPriceRepository.findTopByPlayerIdOrderByRecordedAtDesc(playerIn.getId())
                .map(PlayerPrice::getPrice)
                .orElseThrow(()-> new ResourceNotFoundException("Price records not found for player: " + playerIn.getFullName()));

        BigDecimal playerOutPrice = playerPriceRepository.findTopByPlayerIdOrderByRecordedAtDesc(playerOut.getId())
                .map(PlayerPrice::getPrice)
                .orElseThrow(()->new ResourceNotFoundException("Price records not found for player: " + playerOut.getFullName()));

        Gameweek gameweek = gameweekRepository.findById(request.getGameweekId()).orElseThrow(()-> new ResourceNotFoundException("Gameweek with ID " + request.getGameweekId() + " not found"));

        // Same deadline rule ChipService already enforces for chip activation -
        // transfers previously had no lock at all, letting a team change its
        // lineup after that gameweek's matches had already kicked off.
        if(gameweek.getDeadline().isBefore(LocalDateTime.now())){
            throw new InvalidSquadException("Gameweek has already ended");
        }

        if(!fantasyTeamPlayerRepository.existsByFantasyTeamIdAndPlayerId(fantasyTeam.getId(), playerOut.getId())){
            throw new InvalidSquadException("Transfer failed: Player '" + playerOut.getFullName() + "' is not in your current lineup");
        }

        if(fantasyTeamPlayerRepository.existsByFantasyTeamIdAndPlayerId(fantasyTeam.getId(), playerIn.getId())){
            throw new InvalidSquadException("Transfer failed: Player '" + playerIn.getFullName() + "' is already in your lineup");
        }

        // Strictly enforce FPL rule: Like-for-like position transfers only
        if (playerOut.getPosition() != playerIn.getPosition()) {
            throw new InvalidSquadException(
                    String.format("Transfer failed: You cannot swap a %s for a %s. Transfers must be between players of the same position.",
                            playerOut.getPosition(), playerIn.getPosition())
            );
        }

        FantasyTeamPlayer oldPlayer =
                fantasyTeamPlayerRepository
                        .findByFantasyTeamIdAndPlayerId(
                                fantasyTeam.getId(),
                                playerOut.getId()
                        )
                        .orElseThrow(() -> new ResourceNotFoundException("Player not found in your current squad"));

        boolean wasStarting = oldPlayer.getIsPartOfXI();
        boolean wasCaptain = oldPlayer.getIsCaptain();
        boolean wasViceCaptain = oldPlayer.getIsViceCaptain();

        if(wasCaptain && wasViceCaptain){
            throw new InvalidSquadException("Player cannot be both captain and vice captain");
        }

        // Wildcard/Wildcard 2 waive the free-transfer/point-cost logic
        // entirely, as before. Free Hit is now included too - activating it
        // is supposed to mean unlimited free changes for that one gameweek
        // (the squad itself gets reverted afterwards by GameweekScheduler's
        // Free Hit restore step, so nothing here needs to change about
        // that part) - previously Free Hit didn't stop transfers from still
        // burning a credit or costing points during that gameweek, which
        // contradicted what the chip is meant to do.
        boolean transferCostWaived = chipRepository
                .findByFantasyTeamIdAndGameweekId(fantasyTeam.getId(), gameweek.getId())
                .map(chip -> chip.getChipType() == ChipType.WILDCARD ||
                        chip.getChipType() == ChipType.WILDCARD_2 ||
                        chip.getChipType() == ChipType.FREEHIT)
                .orElse(false);

        // 1. Calculate the net cost of the transfer
        BigDecimal netCost = playerInPrice.subtract(playerOutPrice);

        // 2. Retrieve the team's remaining budget (assuming 'bank' is a BigDecimal field on FantasyTeam)
        BigDecimal currentBank = fantasyTeam.getBudgetRemaining(); // or fantasyTeam.getBudget()

        BigDecimal newBudget = currentBank.subtract(netCost);

        // 3. Ensure the team can afford the transfer
        if (newBudget.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidSquadException(
                    String.format("Transfer failed: Insufficient funds. Remaining budget is %s, but net transfer cost is %s",
                            currentBank, netCost)
            );
        }

        Transfer saveTransfer = new Transfer();

        if(transferCostWaived){
            saveTransfer.setIsFreeTransfer(true);
        }
        else if(fantasyTeam.getTransferPoints() > 0){
            fantasyTeam.setTransferPoints(fantasyTeam.getTransferPoints() - 1);
            saveTransfer.setIsFreeTransfer(true);
        }else{
            fantasyTeam.setTotalPoints(fantasyTeam.getTotalPoints() - 4);
            saveTransfer.setIsFreeTransfer(false);
        }
        // 4. Update the team's bank balance and save
        fantasyTeam.setBudgetRemaining(newBudget);
        fantasyTeamRepository.save(fantasyTeam);

        fantasyTeamPlayerRepository.delete(oldPlayer);
        FantasyTeamPlayer newPlayerAdded = FantasyTeamPlayer.builder()
                .currentPrice(playerInPrice)
                .fantasyTeam(fantasyTeam)
                .player(playerIn)
                .isPartOfXI(wasStarting)
                .purchasePrice(playerInPrice)
                .isViceCaptain(wasViceCaptain)
                .isCaptain(wasCaptain)
                .build();
        fantasyTeamPlayerRepository.save(newPlayerAdded);

        Transfer transfer = saveToTransferDatabase(fantasyTeam,playerInPrice,playerOutPrice,saveTransfer,gameweek,playerIn,playerOut);
        return mapToResponse(transfer);
    }

    public List<TransferResponse> getTransfersByFantasyTeam(Integer fantasyId, String email){
        FantasyTeam fantasyTeam = fantasyTeamRepository.findById(fantasyId).orElseThrow(()-> new ResourceNotFoundException("Fantasy Team with ID " + fantasyId + " not found"));
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User not found"));

        boolean isOwner = fantasyTeam.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if(!isOwner && !isAdmin){
            throw new UnauthorizedAccessException("You are not authorized to view this team's transfers");
        }

        return transferRepository.findByFantasyTeamId(fantasyId).stream()
                .map(teamTransfer-> mapToResponse(teamTransfer))
                .toList();
    }

    private Transfer saveToTransferDatabase(FantasyTeam fantasyTeam,BigDecimal playerInPrice, BigDecimal playerOutPrice, Transfer saveTransfer, Gameweek gameweek, Player playerIn, Player playerOut){
        Transfer savedTransfer = Transfer.builder()
                .fantasyTeam(fantasyTeam)
                .gameweek(gameweek)
                .isFreeTransfer(saveTransfer.getIsFreeTransfer())
                .transferredAt(LocalDateTime.now())
                .playerOutPrice(playerOutPrice)
                .playerInPrice(playerInPrice)
                .playerIn(playerIn)
                .playerOut(playerOut)
                .build();
        transferRepository.save(savedTransfer);
        return savedTransfer;
    }

    private TransferResponse mapToResponse(Transfer transfer){
        return TransferResponse.builder()
                .id(transfer.getId())
                .fantasyTeamName(transfer.getFantasyTeam().getTeamName())
                .playerInName(transfer.getPlayerIn().getFullName())
                .playerOutName(transfer.getPlayerOut().getFullName())
                .transferredAt(transfer.getTransferredAt())
                .isFreeTransfer(transfer.getIsFreeTransfer())
                .playerOutPrice(transfer.getPlayerOutPrice())
                .playerInPrice(transfer.getPlayerInPrice())
                .build();
    }
}