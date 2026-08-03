package com.augustine.gplfantasyleaague.domain.subscription.service;

import com.augustine.gplfantasyleaague.domain.auth.entity.User;
import com.augustine.gplfantasyleaague.domain.subscription.dto.SubscriptionStatusResponse;
import com.augustine.gplfantasyleaague.domain.subscription.entity.Subscription;
import com.augustine.gplfantasyleaague.domain.subscription.entity.SubscriptionStatus;
import com.augustine.gplfantasyleaague.domain.subscription.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

// The single source of truth for "is this user premium right now" - every
// other feature (player analysis, premium badges, etc.) should go through
// isPremium() rather than reading the Subscription entity directly, so the
// expiry check stays in exactly one place.
@Service
public class SubscriptionService {
    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
    }

    @Transactional(readOnly = true)
    public boolean isPremium(Integer userId) {
        if (userId == null) return false;
        return subscriptionRepository.findByUserId(userId)
                .map(this::isActive)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public SubscriptionStatusResponse getStatus(Integer userId) {
        return subscriptionRepository.findByUserId(userId)
                .map(sub -> SubscriptionStatusResponse.builder()
                        .premium(isActive(sub))
                        .status(sub.getStatus())
                        .expiresAt(sub.getExpiresAt())
                        .build())
                .orElse(SubscriptionStatusResponse.builder()
                        .premium(false)
                        .status(SubscriptionStatus.INACTIVE)
                        .expiresAt(null)
                        .build());
    }

    // Called once a Paystack payment verifies as successful. Extends from
    // the current expiry if the subscription is still active (so paying
    // again before it lapses doesn't waste the remaining days), otherwise
    // starts a fresh `days`-day period from now.
    @Transactional
    public void activateOrExtend(User user, int days) {
        Subscription subscription = subscriptionRepository.findByUserId(user.getId())
                .orElseGet(() -> Subscription.builder().user(user).build());

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime base = (subscription.getExpiresAt() != null && subscription.getExpiresAt().isAfter(now))
                ? subscription.getExpiresAt()
                : now;

        subscription.setStatus(SubscriptionStatus.ACTIVE);
        if (subscription.getStartedAt() == null) {
            subscription.setStartedAt(now);
        }
        subscription.setExpiresAt(base.plusDays(days));
        subscription.setUpdatedAt(now);
        subscriptionRepository.save(subscription);
    }

    private boolean isActive(Subscription sub) {
        return sub.getStatus() == SubscriptionStatus.ACTIVE
                && sub.getExpiresAt() != null
                && sub.getExpiresAt().isAfter(LocalDateTime.now());
    }
}
