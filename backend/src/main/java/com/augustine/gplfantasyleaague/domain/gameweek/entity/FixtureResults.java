package com.augustine.gplfantasyleaague.domain.gameweek.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "fixture_results")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class FixtureResults {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "fixture_id", unique = true)
    private Fixture fixture;

    @Builder.Default
    @Column(name = "home_score")
    private Integer homeScore = 0;

    @Builder.Default
    @Column(name = "away_score")
    private Integer awayScore = 0;

    @Builder.Default
    @Column(name = "home_possession")
    private Integer homePossession = 0;

    @Builder.Default
    @Column(name = "away_possession")
    private Integer awayPossession = 0;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;
}
