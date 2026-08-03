package com.augustine.gplfantasyleaague.domain.fantasy.entity;

import com.augustine.gplfantasyleaague.domain.gameweek.entity.Gameweek;
import com.augustine.gplfantasyleaague.domain.player.entity.Player;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "free_hit_snapshots")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class FreeHitSnapShot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "fantasy_id")
    private FantasyTeam fantasyTeam;

    @ManyToOne
    @JoinColumn(name = "gameweek_id")
    private Gameweek gameweek;

    @ManyToOne
    @JoinColumn(name = "player_id")
    private Player player;

    @Column(precision = 15, scale = 2)
    private BigDecimal purchasePrice;

    @Column(precision = 15, scale = 2)
    private BigDecimal currentPrice;

    @Column(name = "is_part_of_XI")
    private Boolean isPartOfXI;

    @Column(name = "is_captain")
    private Boolean isCaptain;

    @Column(name = "is_vice_captain")
    private Boolean isViceCaptain;

}
