package com.augustine.gplfantasyleaague.domain.auth.controller;

import com.augustine.gplfantasyleaague.domain.auth.dto.AuthResponse;
import com.augustine.gplfantasyleaague.domain.auth.dto.EmailVerificationResponse;
import com.augustine.gplfantasyleaague.domain.auth.dto.GoogleAuthRequest;
import com.augustine.gplfantasyleaague.domain.auth.dto.LoginRequest;
import com.augustine.gplfantasyleaague.domain.auth.dto.RegisterRequest;
import com.augustine.gplfantasyleaague.domain.auth.dto.ResendVerificationRequest;
import com.augustine.gplfantasyleaague.domain.auth.dto.UpdateFavouriteClubRequest;
import com.augustine.gplfantasyleaague.domain.auth.dto.UserProfileResponse;
import com.augustine.gplfantasyleaague.domain.auth.dto.VerifyEmailRequest;
import com.augustine.gplfantasyleaague.domain.auth.service.AuthService;
import jakarta.persistence.EntityManager;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<EmailVerificationResponse> register(@RequestBody @Valid RegisterRequest request){
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmail(@RequestBody @Valid VerifyEmailRequest request){
        return ResponseEntity.ok(authService.verifyEmail(request));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<EmailVerificationResponse> resendVerification(@RequestBody @Valid ResendVerificationRequest request){
        return ResponseEntity.ok(authService.resendVerification(request.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest request){
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleSignIn(@RequestBody @Valid GoogleAuthRequest request){
        return ResponseEntity.ok(authService.loginWithGoogle(request.getIdToken()));
    }

    @GetMapping("/users/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(authService.getCurrentUser(email));
    }

    @PatchMapping("/users/me")
    public ResponseEntity<UserProfileResponse> updateFavouriteClub(@RequestBody @Valid UpdateFavouriteClubRequest request){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(authService.updateFavouriteClub(email, request.getFavouriteClubId()));
    }
}
