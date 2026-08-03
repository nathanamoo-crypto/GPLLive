package com.augustine.gplfantasyleaague.domain.club.repository;

import com.augustine.gplfantasyleaague.domain.club.entity.Club;
import com.augustine.gplfantasyleaague.domain.club.entity.ClubStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClubRepository extends JpaRepository<Club, Integer> {
    List<Club> findByClubStatus(ClubStatus clubStatus);

    boolean existsByFullName( String fullName);
}