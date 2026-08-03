package com.augustine.gplfantasyleaague.domain.fantasy.entity;

import com.augustine.gplfantasyleaague.domain.player.entity.Player;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "fantasy_team_players")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class FantasyTeamPlayer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "fantasy_team_id")
    private FantasyTeam fantasyTeam;

    @ManyToOne
    @JoinColumn(name = "player_id")
    private Player player;

    @Builder.Default
    @Column(name = "is_part_of_XI")
    private Boolean isPartOfXI = false;

    @Builder.Default
    @Column(name = "is_captain")
    private Boolean isCaptain = false;

    @Builder.Default
    @Column(name = "is_vice_captain")
    private Boolean isViceCaptain = false;

    @Column(name = "purchase_price", precision = 15, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "current_price",precision = 15, scale = 2)
    private BigDecimal currentPrice;
}
