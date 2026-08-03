package com.augustine.gplfantasyleaague.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class GoogleAuthRequest {
    // The ID token (JWT) Google returns to the frontend after the user
    // completes the Google consent screen - NOT an access token. We verify
    // this server-side rather than trusting anything the client asserts
    // about who signed in.
    @NotBlank
    private String idToken;
}
