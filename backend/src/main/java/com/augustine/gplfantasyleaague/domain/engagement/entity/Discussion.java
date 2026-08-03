package com.augustine.gplfantasyleaague.domain.engagement.entity;

import com.augustine.gplfantasyleaague.domain.auth.entity.User;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.Fixture;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "discussions")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class Discussion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "fixture_id")
    private Fixture fixture;

    @Column(name = "message")
    private String message;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

}
