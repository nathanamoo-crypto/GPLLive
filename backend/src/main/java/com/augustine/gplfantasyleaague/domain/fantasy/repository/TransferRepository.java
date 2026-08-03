package com.augustine.gplfantasyleaague.domain.fantasy.repository;

import com.augustine.gplfantasyleaague.domain.fantasy.dto.TransferResponse;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransferRepository extends JpaRepository<Transfer, Integer> {
    List<Transfer> findByFantasyTeamId(Integer fantasyId);
    void deleteByFantasyTeamId(Integer fantasyTeamId);
}