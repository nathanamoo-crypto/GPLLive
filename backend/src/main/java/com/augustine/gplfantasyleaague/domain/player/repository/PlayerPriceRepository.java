package com.augustine.gplfantasyleaague.domain.player.repository;

import com.augustine.gplfantasyleaague.domain.player.entity.PlayerPrice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlayerPriceRepository extends JpaRepository<PlayerPrice, Integer> {
    Optional<PlayerPrice> findTopByPlayerIdOrderByRecordedAtDesc(Integer playerId);
    List<PlayerPrice> findByPlayerId(Integer playerId);
}