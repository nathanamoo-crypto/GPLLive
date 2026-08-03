package com.augustine.gplfantasyleaague.domain.player.repository;

import com.augustine.gplfantasyleaague.domain.player.entity.Player;
import com.augustine.gplfantasyleaague.domain.player.entity.Position;
import com.augustine.gplfantasyleaague.domain.player.entity.Status;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlayerRepository extends JpaRepository<Player, Integer> {
    List<Player> findByStatus(Status status);
    List<Player> findByClubId(Integer id);
    List<Player> findByPosition(Position position);
    Boolean existsByFullNameAndClubId(String fullName, Integer clubId);

}