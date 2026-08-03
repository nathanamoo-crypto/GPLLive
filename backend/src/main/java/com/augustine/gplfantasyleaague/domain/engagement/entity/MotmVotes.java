package com.augustine.gplfantasyleaague.domain.engagement.entity;

import com.augustine.gplfantasyleaague.domain.auth.entity.User;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.Fixture;
import com.augustine.gplfantasyleaague.domain.player.entity.Player;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "motm_votes",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"user_id", "fixture_id"}
                )
        }
)
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class MotmVotes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "fixture_id")
    private Fixture fixture;

    @ManyToOne
    @JoinColumn(name = "player_id")
    private Player player;

    @Column(name = "voted_at")
    private LocalDateTime votedAt;

}
