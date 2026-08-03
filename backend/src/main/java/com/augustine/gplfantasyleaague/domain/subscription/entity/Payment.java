package com.augustine.gplfantasyleaague.domain.subscription.entity;

import com.augustine.gplfantasyleaague.domain.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Paystack transaction reference - we generate it, send it on
    // initialize, and use it to look this row back up on verify/webhook.
    @Column(name = "reference", nullable = false, unique = true)
    private String reference;

    @Column(name = "amount_pesewas", nullable = false)
    private Integer amountPesewas;

    @Column(name = "currency", nullable = false)
    @Builder.Default
    private String currency = "GHS";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
}
