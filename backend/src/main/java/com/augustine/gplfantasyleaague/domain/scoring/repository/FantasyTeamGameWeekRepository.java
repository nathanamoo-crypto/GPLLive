package com.augustine.gplfantasyleaague.domain.scoring.repository;

import com.augustine.gplfantasyleaague.domain.scoring.dtos.FantasyTeamGameWeekScoreResponse;
import com.augustine.gplfantasyleaague.domain.scoring.entity.FantasyTeamGameWeekScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FantasyTeamGameWeekRepository extends JpaRepository<FantasyTeamGameWeekScore, Integer> {
    List<FantasyTeamGameWeekScore> findByGameweekId(Integer gameweekId);

    List<FantasyTeamGameWeekScore> findByFantasyTeamId(Integer fantasyTeamId);

    Optional<FantasyTeamGameWeekScore> findByFantasyTeamIdAndGameweekId(Integer id, Integer gameweekId);

    void deleteByFantasyTeamId(Integer fantasyTeamId);
}