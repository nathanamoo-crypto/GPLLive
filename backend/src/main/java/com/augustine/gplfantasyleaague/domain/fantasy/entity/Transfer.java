package com.augustine.gplfantasyleaague.domain.fantasy.entity;

import com.augustine.gplfantasyleaague.domain.gameweek.entity.Gameweek;
import com.augustine.gplfantasyleaague.domain.player.entity.Player;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transfers")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class Transfer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "fantasy_team_id")
    private FantasyTeam fantasyTeam;

    @ManyToOne
    @JoinColumn(name = "gameweek_id")
    private Gameweek gameweek;

    @ManyToOne
    @JoinColumn(name = "player_out_id")
    private Player playerOut;

    @ManyToOne
    @JoinColumn(name = "player_in_id")
    private Player playerIn;

    @Column(name = "player_out_price" , precision = 15, scale = 2)
    private BigDecimal playerOutPrice;

    @Column(name = "player_in_price" , precision = 15, scale = 2)
    private BigDecimal playerInPrice;

    @Column(name = "transferred_at")
    private LocalDateTime transferredAt;

    @Column(name = "is_free_transfer")
    private Boolean isFreeTransfer;



}
