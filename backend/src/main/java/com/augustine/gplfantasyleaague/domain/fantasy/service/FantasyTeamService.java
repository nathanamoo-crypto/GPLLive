package com.augustine.gplfantasyleaague.domain.fantasy.service;

import com.augustine.gplfantasyleaague.domain.auth.entity.Role;
import com.augustine.gplfantasyleaague.domain.auth.entity.User;
import com.augustine.gplfantasyleaague.domain.auth.repository.UserRepository;
import com.augustine.gplfantasyleaague.domain.fantasy.dto.FantasyTeamRequest;
import com.augustine.gplfantasyleaague.domain.fantasy.dto.FantasyTeamResponse;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.FantasyTeam;
import com.augustine.gplfantasyleaague.domain.fantasy.repository.ChipRepository;
import com.augustine.gplfantasyleaague.domain.fantasy.repository.FantasyTeamPlayerRepository;
import com.augustine.gplfantasyleaague.domain.fantasy.repository.FantasyTeamRepository;
import com.augustine.gplfantasyleaague.domain.fantasy.repository.TransferRepository;
import com.augustine.gplfantasyleaague.domain.scoring.repository.FantasyTeamGameWeekRepository;
import com.augustine.gplfantasyleaague.exception.ResourceNotFoundException;
import com.augustine.gplfantasyleaague.exception.TeamCreationException;
import com.augustine.gplfantasyleaague.exception.UnauthorizedAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FantasyTeamService {
    private final UserRepository userRepository;
    private final FantasyTeamRepository fantasyTeamRepository;
    private final FantasyTeamPlayerRepository fantasyTeamPlayerRepository;
    private final TransferRepository transferRepository;
    private final ChipRepository chipRepository;
    private final FantasyTeamGameWeekRepository fantasyTeamGameWeekRepository;


    public FantasyTeamService(UserRepository userRepository, FantasyTeamRepository fantasyTeamRepository,
                               FantasyTeamPlayerRepository fantasyTeamPlayerRepository, TransferRepository transferRepository,
                               ChipRepository chipRepository, FantasyTeamGameWeekRepository fantasyTeamGameWeekRepository) {
        this.userRepository = userRepository;
        this.fantasyTeamRepository = fantasyTeamRepository;
        this.fantasyTeamPlayerRepository = fantasyTeamPlayerRepository;
        this.transferRepository = transferRepository;
        this.chipRepository = chipRepository;
        this.fantasyTeamGameWeekRepository = fantasyTeamGameWeekRepository;
    }

    public FantasyTeamResponse createFantasyTeam(FantasyTeamRequest request, String email){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User not found"));
        if(fantasyTeamRepository.existsByUserId(user.getId())){
            throw new TeamCreationException("You already have a fantasy team");
        }

        if(fantasyTeamRepository.existsByTeamName(request.getTeamName())){
            throw new TeamCreationException("Team name '" + request.getTeamName() + "' already exists. Please choose another name");
        }

        FantasyTeam savedTeam = saveToDatabase(request, user);
        return mapToFantasyResponse(savedTeam);
    }

    public FantasyTeamResponse getFantasyTeamByUser(String email){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User not found"));
        FantasyTeam fantasyTeam = fantasyTeamRepository.findByUserId(user.getId()).orElseThrow(()-> new ResourceNotFoundException("Fantasy team configuration not found for this profile"));
        return mapToFantasyResponse(fantasyTeam);
    }

    public FantasyTeamResponse getFantasyTeamById(Integer id, String email){
        FantasyTeam team = fantasyTeamRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Team with ID " + id + " not found"));
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User not found"));

        boolean isOwner = team.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if(!isOwner && !isAdmin){
            throw new UnauthorizedAccessException("You are not authorized to view this team");
        }

        return mapToFantasyResponse(team);
    }

    public List<FantasyTeamResponse> getAllFantasyTeams(){
        return fantasyTeamRepository.findAll().stream()
                .map(team-> mapToFantasyResponse(team))
                .toList();
    }

    public FantasyTeamResponse updateTeamName(Integer id, FantasyTeamRequest request, String email){
        FantasyTeam team = fantasyTeamRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Team ID configuration missing"));
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User context not found"));

        if(!team.getUser().getId().equals(user.getId())){
            throw new UnauthorizedAccessException("You are not authorized to update this team configuration");
        }
        team.setTeamName(request.getTeamName());
        team.setUpdatedAt(LocalDateTime.now());

        FantasyTeam updatedTeam = fantasyTeamRepository.save(team);
        return mapToFantasyResponse(updatedTeam);
    }

    // Deletes children before the team row itself so this works regardless
    // of whether the DB's ON DELETE CASCADE (present on fantasy_team_players/
    // transfers/chips/fantasy_team_gameweek_scores per the Flyway migrations)
    // is relied on or not. NOTE: this deliberately does NOT touch
    // free_hit_snapshots - that table has no migration that creates it, so
    // querying/deleting against it throws (that was the actual cause of the
    // "unexpected system error" on this endpoint before this fix). Lets a
    // user (or, mainly right now, a tester) fully reset and rebuild a squad
    // from scratch, since createFantasyTeam otherwise permanently blocks a
    // second team per user.
    @Transactional
    public void deleteMyFantasyTeam(String email){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User not found"));
        FantasyTeam team = fantasyTeamRepository.findByUserId(user.getId())
                .orElseThrow(()-> new ResourceNotFoundException("You don't have a fantasy team to delete"));

        // User.fantasyTeam is a @OneToOne(mappedBy = "user") - eagerly
        // loaded, so userRepository.findByEmail above already pulled this
        // exact FantasyTeam instance into the persistence context via the
        // User side too. Once fantasyTeamRepository.delete(team) marks it
        // removed, Hibernate's flush-time consistency check still finds
        // `user.fantasyTeam` pointing at that same (now-removed) instance
        // and throws TransientPropertyValueException, since it looks
        // unresolved from that association's point of view. Breaking the
        // in-memory back-reference first avoids the check entirely - it's
        // the inverse side of the relationship, so this doesn't need its
        // own save/column update.
        user.setFantasyTeam(null);

        Integer teamId = team.getId();
        fantasyTeamPlayerRepository.deleteByFantasyTeamId(teamId);
        transferRepository.deleteByFantasyTeamId(teamId);
        chipRepository.deleteByFantasyTeamId(teamId);
        fantasyTeamGameWeekRepository.deleteByFantasyTeamId(teamId);
        fantasyTeamRepository.delete(team);
    }

    // Standard fantasy-football rule: unused free transfers carry over, but
    // never past a bank of 2. Called by GameweekScheduler each time a new
    // gameweek becomes current, so every team gets its weekly allowance
    // back regardless of how many transfers they made (or didn't) the week
    // before.
    private static final int MAX_BANKED_FREE_TRANSFERS = 2;

    @Transactional
    public void grantWeeklyFreeTransfers(){
        List<FantasyTeam> teams = fantasyTeamRepository.findAll();
        for (FantasyTeam team : teams) {
            team.setTransferPoints(Math.min(team.getTransferPoints() + 1, MAX_BANKED_FREE_TRANSFERS));
        }
        fantasyTeamRepository.saveAll(teams);
    }

    private FantasyTeam saveToDatabase(FantasyTeamRequest request, User user){
        FantasyTeam savedFantasyTeam =  FantasyTeam.builder()
                    .teamName(request.getTeamName())
                    .user(user)
                    .createdAt(LocalDateTime.now())
                    .build();
        fantasyTeamRepository.save(savedFantasyTeam);
        return savedFantasyTeam;
    }

    private FantasyTeamResponse mapToFantasyResponse(FantasyTeam savedTeam){
        return FantasyTeamResponse.builder()
                .id(savedTeam.getId())
                .transferPoints(savedTeam.getTransferPoints())
                .budgetRemaining(savedTeam.getBudgetRemaining())
                .teamName(savedTeam.getTeamName())
                .username(savedTeam.getUser().getUsername())
                .totalPoints(savedTeam.getTotalPoints())
                .build();
    }
}
