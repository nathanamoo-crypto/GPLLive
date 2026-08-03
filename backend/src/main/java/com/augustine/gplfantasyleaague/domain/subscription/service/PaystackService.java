package com.augustine.gplfantasyleaague.domain.subscription.service;

import com.augustine.gplfantasyleaague.exception.PaymentException;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;

// Thin wrapper around Paystack's REST API (https://api.paystack.co) - the
// only thing in this app that talks to Paystack directly. Everything else
// (PaymentController, SubscriptionService) goes through this so the HTTP
// details and signature verification live in exactly one place.
@Service
public class PaystackService {
    private final RestClient restClient;
    private final String secretKey;

    public PaystackService(@Value("${paystack.secret-key}") String secretKey) {
        this.secretKey = secretKey;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.paystack.co")
                .defaultHeader("Authorization", "Bearer " + secretKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    // Kicks off a transaction - the returned authorizationUrl is what the
    // frontend opens in a WebView (Paystack's own hosted checkout; the
    // amount actually charged is fixed server-side by whoever calls this,
    // not something the frontend can influence).
    public InitializeResult initializeTransaction(String email, int amountPesewas, String reference, String callbackUrl) {
        Map<String, Object> body = new HashMap<>();
        body.put("email", email);
        body.put("amount", amountPesewas);
        body.put("reference", reference);
        body.put("currency", "GHS");
        if (callbackUrl != null && !callbackUrl.isBlank()) {
            body.put("callback_url", callbackUrl);
        }

        PaystackInitializeResponse response;
        try {
            response = restClient.post()
                    .uri("/transaction/initialize")
                    .body(body)
                    .retrieve()
                    .body(PaystackInitializeResponse.class);
        } catch (Exception e) {
            throw new PaymentException("Could not reach Paystack to start the transaction: " + e.getMessage());
        }

        if (response == null || !response.status || response.data == null) {
            String message = response != null ? response.message : "no response";
            throw new PaymentException("Paystack declined to initialize the transaction: " + message);
        }

        return new InitializeResult(response.data.authorizationUrl, response.data.accessCode, response.data.reference);
    }

    // Server-to-server confirmation that a transaction actually succeeded -
    // never trust the frontend's word alone that a payment went through.
    public VerifyResult verifyTransaction(String reference) {
        PaystackVerifyResponse response;
        try {
            response = restClient.get()
                    .uri("/transaction/verify/{reference}", reference)
                    .retrieve()
                    .body(PaystackVerifyResponse.class);
        } catch (Exception e) {
            throw new PaymentException("Could not reach Paystack to verify the transaction: " + e.getMessage());
        }

        if (response == null || response.data == null) {
            throw new PaymentException("Paystack returned no data verifying reference " + reference);
        }

        boolean success = "success".equalsIgnoreCase(response.data.status);
        return new VerifyResult(success, response.data.status, response.data.reference, response.data.amount);
    }

    // Paystack signs every webhook body with HMAC-SHA512 using YOUR secret
    // key, sent in the x-paystack-signature header - verifying this before
    // trusting a webhook call is the whole point of having a webhook at all
    // (otherwise anyone could POST a fake "payment succeeded" to this URL).
    public boolean verifyWebhookSignature(String rawBody, String signatureHeader) {
        if (signatureHeader == null || signatureHeader.isBlank() || rawBody == null) {
            return false;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8));
            String computed = HexFormat.of().formatHex(hash);
            return computed.equalsIgnoreCase(signatureHeader);
        } catch (Exception e) {
            return false;
        }
    }

    public record InitializeResult(String authorizationUrl, String accessCode, String reference) {}

    public record VerifyResult(boolean success, String status, String reference, Integer amountPesewas) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class PaystackInitializeResponse {
        public boolean status;
        public String message;
        public Data data;

        @JsonIgnoreProperties(ignoreUnknown = true)
        static class Data {
            @JsonProperty("authorization_url")
            public String authorizationUrl;
            @JsonProperty("access_code")
            public String accessCode;
            public String reference;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class PaystackVerifyResponse {
        public boolean status;
        public String message;
        public Data data;

        @JsonIgnoreProperties(ignoreUnknown = true)
        static class Data {
            public String status;
            public String reference;
            public Integer amount;
        }
    }
}
