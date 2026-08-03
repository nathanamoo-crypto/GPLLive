package com.augustine.gplfantasyleaague.domain.gameweek.entity;

import com.augustine.gplfantasyleaague.domain.fantasy.entity.Chip;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.FreeHitSnapShot;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.Transfer;
import com.augustine.gplfantasyleaague.domain.player.entity.PlayerPrice;
import com.augustine.gplfantasyleaague.domain.scoring.entity.FantasyTeamGameWeekScore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "gameweeks")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class Gameweek {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "season")
    private String season;

    @Column(name = "gameweek_number")
    private Integer gameweekNumber;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Builder.Default
    @Column(name = "is_current")
    private Boolean isCurrent = false;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @OneToMany(mappedBy = "gameweek")
    private List<Chip> chips = new ArrayList<>();

    @OneToMany(mappedBy = "gameweek")
    private List<Transfer> transfers = new ArrayList<>();

    @OneToMany(mappedBy = "gameweek")
    private List<Fixture> fixtures = new ArrayList<>();

    @OneToMany(mappedBy = "gameweek")
    private List<FantasyTeamGameWeekScore> fantasyTeamGameWeekScores = new ArrayList<>();

    @OneToMany(mappedBy = "gameweek")
    private List<PlayerPrice> prices = new ArrayList<>();

    @OneToMany(mappedBy = "gameweek")
    private List<FreeHitSnapShot> freeHitSnapShots = new ArrayList<>();

}
