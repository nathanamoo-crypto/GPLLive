package com.augustine.gplfantasyleaague.domain.scoring.entity;

import com.augustine.gplfantasyleaague.domain.gameweek.entity.Fixture;
import com.augustine.gplfantasyleaague.domain.player.entity.Player;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "player_gameweek_stats")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class PlayerGameWeekStats {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "player_id")
    private Player player;


    @ManyToOne
    @JoinColumn(name = "fixture_id")
    private Fixture fixture;

    @Builder.Default
    @Column(name = "minutes_played")
    private Integer minutesPlayed = 0;

    @Builder.Default
    @Column(name = "goals_scored")
    private Integer goalsScored = 0;

    @Builder.Default
    @Column(name = "assists")
    private Integer assists = 0;

    @Builder.Default
    @Column(name = "clean_sheet")
    private Boolean cleanSheet = false;

    @Builder.Default
    @Column(name = "yellow_card")
    private Integer yellowCard = 0;

    @Builder.Default
    @Column(name = "red_card")
    private Boolean redCard = false;

    @Builder.Default
    @Column(name = "saves")
    private Integer saves = 0;

    @Builder.Default
    @Column(name = "fantasy_point")
    private Integer fantasyPoint = 0;


}
