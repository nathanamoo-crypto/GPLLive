package com.augustine.gplfantasyleaague.domain.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// Returned by register() and resend-verification - deliberately has no
// token, since the account isn't usable yet. Only POST /auth/verify-email
// returns a real AuthResponse (token) once the code is confirmed.
@Getter
@Setter
@AllArgsConstructor
public class EmailVerificationResponse {
    private String email;
    private String message;
}
