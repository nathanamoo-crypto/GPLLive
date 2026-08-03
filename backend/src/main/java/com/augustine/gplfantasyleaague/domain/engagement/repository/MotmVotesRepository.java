package com.augustine.gplfantasyleaague.domain.engagement.repository;

import com.augustine.gplfantasyleaague.domain.engagement.entity.MotmVotes;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MotmVotesRepository extends JpaRepository<MotmVotes, Integer> {
    boolean existsByUserIdAndFixtureId(Integer userId, Integer fixtureId);

    List<MotmVotes> findByFixtureId(Integer fixtureId);
}