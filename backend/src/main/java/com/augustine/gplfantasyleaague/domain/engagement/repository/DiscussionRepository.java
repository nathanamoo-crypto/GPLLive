package com.augustine.gplfantasyleaague.domain.engagement.repository;

import com.augustine.gplfantasyleaague.domain.engagement.dtos.DiscussionResponse;
import com.augustine.gplfantasyleaague.domain.engagement.entity.Discussion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiscussionRepository extends JpaRepository<Discussion, Integer> {
    List<Discussion> findByFixtureId(Integer fixtureId);
}