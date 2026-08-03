package com.augustine.gplfantasyleaague.domain.fantasy.repository;

import com.augustine.gplfantasyleaague.domain.fantasy.entity.FantasyTeamPlayer;
import com.augustine.gplfantasyleaague.domain.player.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FantasyTeamPlayerRepository extends JpaRepository<FantasyTeamPlayer, Integer> {
    boolean existsByFantasyTeamIdAndPlayerId(Integer fantasyTeamId, Integer playerId);
    Integer countByFantasyTeamId(Integer id);
    long countByFantasyTeamIdAndPlayer_ClubId(Integer fantasyTeamId, Integer clubId);

    Optional<FantasyTeamPlayer> findByFantasyTeamIdAndIsCaptainTrue(Integer id);

    Optional<FantasyTeamPlayer> findByFantasyTeamIdAndIsViceCaptainTrue(Integer id);

    List<FantasyTeamPlayer> findByFantasyTeamId(Integer fantasyTeamId);

    List<FantasyTeamPlayer> findByFantasyTeamIdAndIsPartOfXITrue(Integer fantasyTeamId);

    List<FantasyTeamPlayer> findByFantasyTeamIdAndIsPartOfXIFalse(Integer fantasyTeamId);

    long countByFantasyTeamIdAndPlayer_Position(Integer id, Position position);

    long countByFantasyTeamIdAndPlayer_PositionAndIsPartOfXITrue(Integer id, Position position);

    void deleteByFantasyTeamId(Integer fantasyTeamId);

    long countByFantasyTeamIdAndIsPartOfXITrue(Integer id);

    Optional<FantasyTeamPlayer> findByFantasyTeamIdAndId(Integer id, Integer benchPlayerId);

    Optional<FantasyTeamPlayer> findByFantasyTeamIdAndPlayerId(Integer id, Integer id1);
}