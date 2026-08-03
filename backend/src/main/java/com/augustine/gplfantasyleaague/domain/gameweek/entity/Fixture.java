package com.augustine.gplfantasyleaague.domain.gameweek.entity;

import com.augustine.gplfantasyleaague.domain.club.entity.Club;
import com.augustine.gplfantasyleaague.domain.engagement.entity.Discussion;
import com.augustine.gplfantasyleaague.domain.engagement.entity.MotmVotes;
import com.augustine.gplfantasyleaague.domain.scoring.entity.PlayerGameWeekStats;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fixtures")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class Fixture {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "gameweek_id")
    private Gameweek gameweek;

    @ManyToOne
    @JoinColumn(name = "home_club_id")
    private Club homeClub;

    @ManyToOne
    @JoinColumn(name = "away_club_id")
    private Club awayClub;

    @Column(name = "match_date")
    private LocalDateTime matchDate;

    @Column(name = "venue")
    private String venue;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private FixtureStatus fixtureStatus = FixtureStatus.SCHEDULED;

    @OneToMany(mappedBy = "fixture")
    private List<MotmVotes> motmVotesList = new ArrayList<>();

    @OneToMany(mappedBy = "fixture")
    private List<Discussion> discussions = new ArrayList<>();

    @OneToOne(mappedBy = "fixture")
    private FixtureResults fixtureResults;

    @OneToMany(mappedBy = "fixture")
    private List<PlayerGameWeekStats> playerGameWeekStats =  new ArrayList<>();

}
