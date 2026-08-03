package com.augustine.gplfantasyleaague.domain.gameweek.repository;

import com.augustine.gplfantasyleaague.domain.gameweek.entity.FixtureResults;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FixtureResultsRepository extends JpaRepository<FixtureResults, Integer> {
    Optional<FixtureResults> findByFixtureId(Integer id);
}