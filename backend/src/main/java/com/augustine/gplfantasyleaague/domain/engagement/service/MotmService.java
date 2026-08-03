package com.augustine.gplfantasyleaague.domain.engagement.service;

import com.augustine.gplfantasyleaague.domain.auth.entity.User;
import com.augustine.gplfantasyleaague.domain.auth.repository.UserRepository;
import com.augustine.gplfantasyleaague.domain.engagement.dtos.MotmResultsResponse;
import com.augustine.gplfantasyleaague.domain.engagement.dtos.MotmVoteResponse;
import com.augustine.gplfantasyleaague.domain.engagement.dtos.MotmVotesRequest;
import com.augustine.gplfantasyleaague.domain.engagement.entity.MotmVotes;
import com.augustine.gplfantasyleaague.domain.engagement.repository.MotmVotesRepository;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.Fixture;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.FixtureStatus;
import com.augustine.gplfantasyleaague.domain.gameweek.repository.FixtureRepository;
import com.augustine.gplfantasyleaague.domain.player.entity.Player;
import com.augustine.gplfantasyleaague.domain.player.repository.PlayerRepository;
import com.augustine.gplfantasyleaague.exception.InvalidVoteException;
import com.augustine.gplfantasyleaague.exception.ResourceNotFoundException;
import com.augustine.gplfantasyleaague.exception.VoteConflictException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MotmService {
    // Voting stays open for this long after kickoff, then locks to
    // read-only final results for everyone - Fixture has no separate
    // "finishedAt" timestamp, so kickoff (matchDate) is the anchor.
    private static final long VOTING_WINDOW_HOURS = 24;

    private final UserRepository userRepository;
    private final MotmVotesRepository motmVotesRepository;
    private final FixtureRepository fixtureRepository;
    private final PlayerRepository playerRepository;

    public MotmService(UserRepository userRepository, MotmVotesRepository motmVotesRepository, FixtureRepository fixtureRepository, PlayerRepository playerRepository) {
        this.userRepository = userRepository;
        this.motmVotesRepository = motmVotesRepository;
        this.fixtureRepository = fixtureRepository;
        this.playerRepository = playerRepository;
    }

    private boolean isVotingOpen(Fixture fixture){
        if(fixture.getFixtureStatus() != FixtureStatus.FINISHED) return false;
        LocalDateTime closesAt = fixture.getMatchDate().plusHours(VOTING_WINDOW_HOURS);
        return LocalDateTime.now().isBefore(closesAt);
    }

    public MotmVoteResponse castVote(MotmVotesRequest request, String email){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User with email " + email + " not found"));
        Fixture fixture = fixtureRepository.findById(request.getFixtureId()).orElseThrow(()-> new ResourceNotFoundException("Fixture with ID " + request.getFixtureId() + " not found"));
        Player player = playerRepository.findById(request.getPlayerId()).orElseThrow(()-> new ResourceNotFoundException("Player with ID " + request.getPlayerId() + " not found"));
        if(fixture.getFixtureStatus() != FixtureStatus.FINISHED){
            throw new InvalidVoteException("Voting is only allowed after the match has finished");
        }
        if(!isVotingOpen(fixture)){
            throw new InvalidVoteException("Voting has closed for this match");
        }
        if(motmVotesRepository.existsByUserIdAndFixtureId(user.getId(), fixture.getId())){
            throw new VoteConflictException("You have already voted in this fixture");
        }
        MotmVotes savedMotm = saveToMotmDatabase(user,player,fixture,request);
        return mapToResponse(savedMotm);
    }

    public List<MotmVoteResponse> getVotesByFixture(Integer fixtureId){
        return motmVotesRepository.findByFixtureId(fixtureId).stream()
                .map(motmVotes -> mapToResponse(motmVotes))
                .toList();
    }

    // Tallies the raw vote rows into per-player counts/percentages, and
    // reports which player (if any) the requesting user voted for - a client
    // needs both the leaderboard and its own "have I voted" state, and the
    // raw vote list alone can't answer either without doing this itself.
    public MotmResultsResponse getResultsByFixture(Integer fixtureId, String email){
        Fixture fixture = fixtureRepository.findById(fixtureId).orElseThrow(()-> new ResourceNotFoundException("Fixture with ID " + fixtureId + " not found"));
        List<MotmVotes> votes = motmVotesRepository.findByFixtureId(fixtureId);

        Integer myVotePlayerId = userRepository.findByEmail(email)
                .map(user -> votes.stream()
                        .filter(v -> v.getUser().getId().equals(user.getId()))
                        .map(v -> v.getPlayer().getId())
                        .findFirst()
                        .orElse(null))
                .orElse(null);

        int totalVotes = votes.size();
        Map<Integer, List<MotmVotes>> byPlayer = votes.stream()
                .collect(Collectors.groupingBy(v -> v.getPlayer().getId()));

        List<MotmResultsResponse.MotmResultItem> results = byPlayer.values().stream()
                .map(playerVotes -> {
                    Player player = playerVotes.get(0).getPlayer();
                    int count = playerVotes.size();
                    double percentage = totalVotes > 0 ? (count * 100.0) / totalVotes : 0.0;
                    return MotmResultsResponse.MotmResultItem.builder()
                            .playerId(player.getId())
                            .playerName(player.getFullName())
                            .clubId(player.getClub().getId())
                            .votes(count)
                            .percentage(percentage)
                            .build();
                })
                .sorted(Comparator.comparingInt(MotmResultsResponse.MotmResultItem::getVotes).reversed())
                .toList();

        return MotmResultsResponse.builder()
                .results(results)
                .totalVotes(totalVotes)
                .myVotePlayerId(myVotePlayerId)
                .votingOpen(isVotingOpen(fixture))
                .build();
    }



    private MotmVotes saveToMotmDatabase(User user,Player player, Fixture fixture, MotmVotesRequest request){
        MotmVotes savedMotm = MotmVotes.builder()
                .votedAt(LocalDateTime.now())
                .player(player)
                .user(user)
                .fixture(fixture)
                .build();
        motmVotesRepository.save(savedMotm);
        return savedMotm;
    }

    private MotmVoteResponse mapToResponse(MotmVotes motmVotes){
        return MotmVoteResponse.builder()
                .id(motmVotes.getId())
                .fixtureId(motmVotes.getFixture().getId())
                .username(motmVotes.getUser().getUsername())
                .playerName(motmVotes.getPlayer().getFullName())
                .votedAt(motmVotes.getVotedAt())
                .build();
    }
}
