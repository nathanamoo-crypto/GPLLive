package com.augustine.gplfantasyleaague.domain.player.entity;

import com.augustine.gplfantasyleaague.domain.club.entity.Club;
import com.augustine.gplfantasyleaague.domain.engagement.entity.MotmVotes;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.FantasyTeamPlayer;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.FreeHitSnapShot;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.Transfer;
import com.augustine.gplfantasyleaague.domain.scoring.entity.PlayerGameWeekStats;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;


import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "players")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @ManyToOne
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    @Column(name = "position", nullable = false)
    private Position position;

    @Column(name = "jersey_number")
    private Integer jerseyNumber;

    @Column(name = "photo_url")
    private String photoUrl;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;

    @Column(name = "nationality", nullable = false)
    private String nationality;

    @OneToMany(mappedBy = "player")
    private List<FantasyTeamPlayer> fantasyTeamPlayers = new ArrayList<>();

    @OneToMany(mappedBy = "playerOut")
    private List<Transfer> transfersOut = new ArrayList<>();

    @OneToMany(mappedBy = "playerIn")
    private List<Transfer> transfersIn = new ArrayList<>();

    @OneToMany(mappedBy = "player")
    private List<MotmVotes> motmVotesList = new ArrayList<>();

    @OneToMany(mappedBy = "player")
    private List<PlayerGameWeekStats> playerGameWeekStats = new ArrayList<>();

    @OneToMany(mappedBy = "player")
    private List<PlayerPrice> prices = new ArrayList<>();

    @OneToMany(mappedBy = "player")
    private List<FreeHitSnapShot> freeHitSnapShots = new ArrayList<>();

}
