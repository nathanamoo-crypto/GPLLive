package com.augustine.gplfantasyleaague.domain.fantasy.repository;

import com.augustine.gplfantasyleaague.domain.fantasy.entity.FantasyTeam;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FantasyTeamRepository extends JpaRepository<FantasyTeam, Integer> {
    boolean existsByUserId(Integer id);

    boolean existsByTeamName(String teamName);

    Optional<FantasyTeam> findByUserId(Integer id);
}