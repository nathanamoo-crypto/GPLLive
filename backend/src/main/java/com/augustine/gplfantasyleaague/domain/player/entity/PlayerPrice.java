package com.augustine.gplfantasyleaague.domain.player.entity;

import com.augustine.gplfantasyleaague.domain.gameweek.entity.Gameweek;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "player_prices")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class PlayerPrice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "player_id")
    private Player player;

    @ManyToOne
    @JoinColumn(name = "gameweek_id")
    private Gameweek gameweek;

    @Column(name = "price", precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;
}
