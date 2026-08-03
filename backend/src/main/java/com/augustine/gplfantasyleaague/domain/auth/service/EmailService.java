package com.augustine.gplfantasyleaague.domain.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final URI BREVO_SEND_URI = URI.create("https://api.brevo.com/v3/smtp/email");

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${brevo.api-key:}")
    private String apiKey;

    @Value("${brevo.sender-email:}")
    private String senderEmail;

    @Value("${brevo.sender-name:GPL Live}")
    private String senderName;

    // Deliberately swallows send failures rather than propagating them -
    // AuthService calls this as a best-effort step during registration/resend
    // so a flaky call to Brevo doesn't turn into a 500 that blocks account
    // creation entirely. If sending genuinely fails, the user still has
    // "resend code" to retry once it's working.
    //
    // Sent over Brevo's HTTPS API (POST /v3/smtp/email) rather than raw SMTP
    // - Render blocks outbound traffic to SMTP ports 25/465/587 on free web
    // services, so a direct SMTP connection (e.g. to Gmail) always times out
    // there. Plain HTTPS on 443 isn't affected by that block.
    public void sendVerificationCode(String toEmail, String code) {
        if (apiKey == null || apiKey.isBlank() || senderEmail == null || senderEmail.isBlank()) {
            log.warn("BREVO_API_KEY or BREVO_SENDER_EMAIL is not configured - skipping verification email to {} (code: {})", toEmail, code);
            return;
        }

        try {
            Map<String, Object> payload = Map.of(
                    "sender", Map.of("email", senderEmail, "name", senderName),
                    "to", List.of(Map.of("email", toEmail)),
                    "subject", "Your GPL Live verification code",
                    "textContent", "Your GPL Live verification code is: " + code + "\n\n"
                            + "This code expires in 15 minutes. If you didn't request this, you can ignore this email."
            );

            HttpRequest request = HttpRequest.newBuilder(BREVO_SEND_URI)
                    .header("api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 300) {
                log.error("Brevo rejected verification email to {}: HTTP {} - {}", toEmail, response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Failed to send verification email to {}", toEmail, e);
        }
    }
}
