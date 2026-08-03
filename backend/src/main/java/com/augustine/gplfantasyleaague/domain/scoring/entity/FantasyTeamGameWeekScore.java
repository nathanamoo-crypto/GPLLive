package com.augustine.gplfantasyleaague.domain.scoring.entity;

import com.augustine.gplfantasyleaague.domain.fantasy.entity.FantasyTeam;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.Gameweek;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fantasy_team_gameweek_scores")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class FantasyTeamGameWeekScore {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "fantasy_team_id")
    private FantasyTeam fantasyTeam;

    @ManyToOne
    @JoinColumn(name = "gameweek_id")
    private Gameweek gameweek;

    @Builder.Default
    @Column(name = "total_points")
    private Integer points = 0;
}
