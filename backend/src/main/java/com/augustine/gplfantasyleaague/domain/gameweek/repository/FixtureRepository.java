package com.augustine.gplfantasyleaague.domain.gameweek.repository;

import com.augustine.gplfantasyleaague.domain.gameweek.entity.Fixture;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.FixtureStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface FixtureRepository extends JpaRepository<Fixture, Integer> {
    List<Fixture> findByFixtureStatus(FixtureStatus status);

    List<Fixture> findByGameweekId(Integer gameweekId);

    // Powers the standings table: every finished fixture in a season, with
    // clubs and the recorded result eager-fetched in one query so computing
    // the table doesn't N+1 per fixture.
    @Query("SELECT f FROM Fixture f " +
            "JOIN FETCH f.homeClub " +
            "JOIN FETCH f.awayClub " +
            "LEFT JOIN FETCH f.fixtureResults " +
            "WHERE f.fixtureStatus = :status AND f.gameweek.season = :season")
    List<Fixture> findByFixtureStatusAndSeason(
            @Param("status") FixtureStatus status,
            @Param("season") String season
    );

    // Query to check for double-booking conflicts
    @Query("SELECT COUNT(f) > 0 FROM Fixture f WHERE " +
            "f.gameweek.id = :gameweekId AND " +
            "f.fixtureStatus = :status AND " +
            "f.matchDate = :matchDate AND " +
            "f.id <> :excludeFixtureId AND " +
            "(f.homeClub.id IN (:club1Id, :club2Id) OR f.awayClub.id IN (:club1Id, :club2Id))")
    boolean hasConflictingLiveFixture(
            @Param("gameweekId") Integer gameweekId,
            @Param("status") FixtureStatus status,
            @Param("matchDate") LocalDateTime matchDate, // Change to your project's date-time type if different
            @Param("excludeFixtureId") Integer excludeFixtureId,
            @Param("club1Id") Integer club1Id,
            @Param("club2Id") Integer club2Id
    );
}