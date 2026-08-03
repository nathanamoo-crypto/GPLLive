package com.augustine.gplfantasyleaague.domain.fantasy.repository;

import com.augustine.gplfantasyleaague.domain.fantasy.entity.FreeHitSnapShot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FreeHitSnapShotRepository extends JpaRepository<FreeHitSnapShot, Integer> {
    List<FreeHitSnapShot> findByFantasyTeamIdAndGameweekId(Integer fantasyTeamId, Integer gameweekId);
    void deleteByFantasyTeamIdAndGameweekId(Integer fantasyTeamId, Integer gameweekId);
    void deleteByFantasyTeamId(Integer fantasyTeamId);
}