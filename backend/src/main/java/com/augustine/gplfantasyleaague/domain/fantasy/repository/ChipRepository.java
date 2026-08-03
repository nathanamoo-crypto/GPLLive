package com.augustine.gplfantasyleaague.domain.fantasy.repository;

import com.augustine.gplfantasyleaague.domain.fantasy.entity.Chip;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.ChipType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChipRepository extends JpaRepository<Chip, Integer> {
    Optional<Chip> findByFantasyTeamIdAndGameweekId(Integer fantasyTeamId, Integer gameweekId);

    boolean existsByFantasyTeamIdAndChipType(Integer fantasyTeamId, ChipType chipType);

    List<Chip> findByGameweekIdAndChipType(Integer gameweekId, ChipType chipType);

    void deleteByFantasyTeamId(Integer fantasyTeamId);
}