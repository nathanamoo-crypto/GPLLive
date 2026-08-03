package com.augustine.gplfantasyleaague.domain.subscription.dto;

import com.augustine.gplfantasyleaague.domain.subscription.entity.SubscriptionStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionStatusResponse {
    private boolean premium;
    private SubscriptionStatus status;
    private LocalDateTime expiresAt;
}
