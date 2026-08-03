package com.augustine.gplfantasyleaague.domain.subscription.controller;

import com.augustine.gplfantasyleaague.domain.auth.entity.User;
import com.augustine.gplfantasyleaague.domain.auth.repository.UserRepository;
import com.augustine.gplfantasyleaague.domain.subscription.dto.SubscriptionStatusResponse;
import com.augustine.gplfantasyleaague.domain.subscription.service.SubscriptionService;
import com.augustine.gplfantasyleaague.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/subscriptions")
public class SubscriptionController {
    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    public SubscriptionController(SubscriptionService subscriptionService, UserRepository userRepository) {
        this.subscriptionService = subscriptionService;
        this.userRepository = userRepository;
    }

    // Lets the frontend check premium status independent of the payment
    // flow - e.g. on app launch, to decide whether to show the premium
    // badge/unlock premium screens without re-running a purchase.
    @GetMapping("/me")
    public ResponseEntity<SubscriptionStatusResponse> getMyStatus() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(subscriptionService.getStatus(user.getId()));
    }
}
