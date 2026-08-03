package com.augustine.gplfantasyleaague.domain.subscription.entity;

import com.augustine.gplfantasyleaague.domain.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// One row per user, holding their CURRENT subscription state. This is the
// fast-path table SubscriptionService.isPremium() reads - Payment is the
// append-only transaction history it gets derived from.
@Entity
@Table(name = "subscriptions")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.INACTIVE;

    @Column(name = "plan", nullable = false)
    @Builder.Default
    private String plan = "PREMIUM_MONTHLY";

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
