package com.augustine.gplfantasyleaague.domain.auth.security;

// Just the claims we actually use out of a verified Google ID token payload.
public record GoogleUserInfo(String email, String name, boolean emailVerified) {
}
