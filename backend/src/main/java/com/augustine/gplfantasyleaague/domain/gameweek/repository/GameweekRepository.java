package com.augustine.gplfantasyleaague.domain.gameweek.repository;

import com.augustine.gplfantasyleaague.domain.gameweek.entity.Gameweek;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface GameweekRepository extends JpaRepository<Gameweek, Integer> {
    List<Gameweek> findBySeason(String season);
    Optional<Gameweek> findByIsCurrentTrue();
    List<Gameweek> findByIsCurrentTrueAndEndDateBefore(LocalDateTime now);
    Optional<Gameweek> findByGameweekNumber(Integer gameweekNumber);

    // Used by StandingsService to pick a default season when no gameweek is
    // flagged current (e.g. a season that has just ended) - falls back to
    // whichever season's gameweeks ran most recently, so the table follows
    // the data forward automatically once a new season is seeded.
    Optional<Gameweek> findTopByOrderByEndDateDesc();
}
