package com.augustine.gplfantasyleaague.domain.auth.security;

import com.augustine.gplfantasyleaague.exception.InvalidCredentialsException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.GeneralSecurityException;
import java.util.Collections;

// Verifies a Google-issued ID token (JWT) server-side: checks the signature
// against Google's published public keys, confirms it hasn't expired, and
// confirms the audience ("aud" claim) matches OUR web client ID - i.e. the
// token was actually issued for this app, not lifted from some other app's
// Google sign-in flow. GoogleIdTokenVerifier handles fetching/caching
// Google's public keys itself.
@Component
public class GoogleTokenVerifier {
    @Value("${google.oauth.web-client-id}")
    private String webClientId;

    public GoogleUserInfo verify(String idToken) {
        if (webClientId == null || webClientId.isBlank()) {
            // Fail closed - an empty audience list would make the verifier
            // reject everything anyway, but this gives a clearer error
            // while GOOGLE_WEB_CLIENT_ID hasn't been configured yet.
            throw new InvalidCredentialsException("Google sign-in is not configured on this server");
        }

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(webClientId))
                .build();

        GoogleIdToken token;
        try {
            token = verifier.verify(idToken);
        } catch (GeneralSecurityException | java.io.IOException | IllegalArgumentException e) {
            throw new InvalidCredentialsException("Invalid Google sign-in token");
        }

        if (token == null) {
            throw new InvalidCredentialsException("Invalid Google sign-in token");
        }

        GoogleIdToken.Payload payload = token.getPayload();
        Boolean emailVerified = payload.getEmailVerified();
        String email = payload.getEmail();
        Object nameClaim = payload.get("name");

        if (email == null || email.isBlank()) {
            throw new InvalidCredentialsException("Google account has no email on file");
        }

        return new GoogleUserInfo(
                email,
                nameClaim != null ? nameClaim.toString() : email,
                Boolean.TRUE.equals(emailVerified)
        );
    }
}
