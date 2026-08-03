package com.augustine.gplfantasyleaague.domain.subscription.service;

import com.augustine.gplfantasyleaague.domain.auth.entity.User;
import com.augustine.gplfantasyleaague.domain.auth.repository.UserRepository;
import com.augustine.gplfantasyleaague.domain.subscription.dto.InitializePaymentResponse;
import com.augustine.gplfantasyleaague.domain.subscription.dto.SubscriptionStatusResponse;
import com.augustine.gplfantasyleaague.domain.subscription.entity.Payment;
import com.augustine.gplfantasyleaague.domain.subscription.entity.PaymentStatus;
import com.augustine.gplfantasyleaague.domain.subscription.repository.PaymentRepository;
import com.augustine.gplfantasyleaague.exception.ResourceNotFoundException;
import com.augustine.gplfantasyleaague.exception.UnauthorizedAccessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

// Orchestrates the premium purchase flow: create a pending Payment row,
// ask Paystack to initialize a transaction, and later (via verify or the
// webhook) confirm it succeeded and extend the user's subscription.
@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final PaystackService paystackService;
    private final SubscriptionService subscriptionService;
    private final int premiumPricePesewas;
    private final int premiumDays;
    private final String callbackUrl;

    public PaymentService(
            PaymentRepository paymentRepository,
            UserRepository userRepository,
            PaystackService paystackService,
            SubscriptionService subscriptionService,
            @Value("${paystack.premium-price-pesewas}") int premiumPricePesewas,
            @Value("${paystack.premium-days}") int premiumDays,
            @Value("${paystack.callback-url:}") String callbackUrl
    ) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.paystackService = paystackService;
        this.subscriptionService = subscriptionService;
        this.premiumPricePesewas = premiumPricePesewas;
        this.premiumDays = premiumDays;
        this.callbackUrl = callbackUrl;
    }

    @Transactional
    public InitializePaymentResponse initializePremiumPurchase(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Our own reference, not Paystack's - generated up front so we have
        // a Payment row to reconcile against however the confirmation
        // arrives (frontend-initiated verify, or the webhook, whichever is
        // first).
        String reference = "gpl_" + UUID.randomUUID().toString().replace("-", "");

        Payment payment = Payment.builder()
                .user(user)
                .reference(reference)
                .amountPesewas(premiumPricePesewas)
                .currency("GHS")
                .status(PaymentStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        PaystackService.InitializeResult result = paystackService.initializeTransaction(
                email, premiumPricePesewas, reference, callbackUrl.isBlank() ? null : callbackUrl);

        return InitializePaymentResponse.builder()
                .authorizationUrl(result.authorizationUrl())
                .reference(result.reference())
                .amountPesewas(premiumPricePesewas)
                .build();
    }

    // Called by the frontend right after its WebView detects the Paystack
    // callback redirect - the real source of truth is the server-to-server
    // verifyTransaction() call below, not anything the WebView URL claims.
    @Transactional
    public SubscriptionStatusResponse verifyAndActivate(String reference, String requesterEmail) {
        Payment payment = paymentRepository.findByReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("No payment found for reference " + reference));

        if (!payment.getUser().getEmail().equalsIgnoreCase(requesterEmail)) {
            throw new UnauthorizedAccessException("This payment does not belong to you");
        }

        // Already processed - most likely the webhook beat this call to it.
        // Just report current state instead of extending the subscription
        // a second time for the same payment.
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return subscriptionService.getStatus(payment.getUser().getId());
        }

        PaystackService.VerifyResult result = paystackService.verifyTransaction(reference);

        if (result.success()) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setVerifiedAt(LocalDateTime.now());
            paymentRepository.save(payment);
            subscriptionService.activateOrExtend(payment.getUser(), premiumDays);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
        }

        return subscriptionService.getStatus(payment.getUser().getId());
    }

    // Webhook path - Paystack is the caller, not an authenticated app user,
    // so there's no email to cross-check against; trust is established by
    // PaystackService.verifyWebhookSignature() before this is ever called.
    @Transactional
    public void handleSuccessfulWebhook(String reference) {
        Payment payment = paymentRepository.findByReference(reference).orElse(null);
        if (payment == null || payment.getStatus() == PaymentStatus.SUCCESS) {
            return;
        }
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setVerifiedAt(LocalDateTime.now());
        paymentRepository.save(payment);
        subscriptionService.activateOrExtend(payment.getUser(), premiumDays);
    }
}
