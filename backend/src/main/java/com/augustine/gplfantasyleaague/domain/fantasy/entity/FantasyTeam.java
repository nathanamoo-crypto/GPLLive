package com.augustine.gplfantasyleaague.domain.fantasy.entity;

import com.augustine.gplfantasyleaague.domain.auth.entity.User;
import com.augustine.gplfantasyleaague.domain.scoring.entity.FantasyTeamGameWeekScore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fantasy_teams")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class FantasyTeam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "team_name", nullable = false, unique = true)
    private String teamName;

    @Builder.Default
    @Column(name = "budget_remaining",precision = 15, scale = 2)
    private BigDecimal budgetRemaining = new BigDecimal(100000000.00);

    @Builder.Default
    @Column(name = "total_points")
    private Integer totalPoints = 0;

    // Starts at 1 (the standard fantasy-football weekly allowance) - grows
    // by 1 each new gameweek via FantasyTeamService.grantWeeklyFreeTransfers,
    // capped at a bank of 2, rather than being a one-time stockpile.
    @Builder.Default
    @Column(name = "transfer_points")
    private Integer transferPoints = 1;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "free_hit_budget_snapshot", precision = 15, scale = 2)
    private BigDecimal freeHitBudgetSnapshot;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "fantasyTeam")
    private List<FantasyTeamPlayer> fantasyTeamPlayers = new ArrayList<>();

    @OneToMany(mappedBy = "fantasyTeam")
    private List<Transfer> transfers = new ArrayList<>();

    @OneToMany(mappedBy = "fantasyTeam")
    private List<Chip> chips = new ArrayList<>();

    @OneToMany(mappedBy = "fantasyTeam")
    private List<FantasyTeamGameWeekScore> fantasyTeamGameWeekScores = new ArrayList<>();

    @OneToMany(mappedBy = "fantasyTeam")
    private List<FreeHitSnapShot> freeHitSnapShots = new ArrayList<>();
}
