package com.augustine.gplfantasyleaague.domain.auth.service;

import com.augustine.gplfantasyleaague.domain.auth.dto.AuthResponse;
import com.augustine.gplfantasyleaague.domain.auth.dto.ClubSummary;
import com.augustine.gplfantasyleaague.domain.auth.dto.EmailVerificationResponse;
import com.augustine.gplfantasyleaague.domain.auth.dto.LoginRequest;
import com.augustine.gplfantasyleaague.domain.auth.dto.RegisterRequest;
import com.augustine.gplfantasyleaague.domain.auth.dto.UserProfileResponse;
import com.augustine.gplfantasyleaague.domain.auth.dto.VerifyEmailRequest;
import com.augustine.gplfantasyleaague.domain.auth.entity.User;
import com.augustine.gplfantasyleaague.domain.auth.repository.UserRepository;
import com.augustine.gplfantasyleaague.domain.auth.security.GoogleTokenVerifier;
import com.augustine.gplfantasyleaague.domain.auth.security.GoogleUserInfo;
import com.augustine.gplfantasyleaague.domain.auth.security.JwtService;
import com.augustine.gplfantasyleaague.domain.club.entity.Club;
import com.augustine.gplfantasyleaague.domain.club.repository.ClubRepository;
import com.augustine.gplfantasyleaague.domain.subscription.service.SubscriptionService;
import com.augustine.gplfantasyleaague.exception.EmailAlreadyExistsException;
import com.augustine.gplfantasyleaague.exception.EmailNotVerifiedException;
import com.augustine.gplfantasyleaague.exception.InvalidCredentialsException;
import com.augustine.gplfantasyleaague.exception.ResourceNotFoundException;
import com.augustine.gplfantasyleaague.exception.UsernameAlreadyExistsException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final ClubRepository clubRepository;
    private final SubscriptionService subscriptionService;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final EmailService emailService;

    private static final int VERIFICATION_CODE_VALID_MINUTES = 15;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager, UserDetailsServiceImpl userDetailsService, ClubRepository clubRepository, SubscriptionService subscriptionService, GoogleTokenVerifier googleTokenVerifier, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.clubRepository = clubRepository;
        this.subscriptionService = subscriptionService;
        this.googleTokenVerifier = googleTokenVerifier;
        this.emailService = emailService;
    }

    // No longer returns a token - a freshly registered account can't log in
    // until the emailed code is confirmed via verifyEmail(). See
    // EmailVerificationResponse for why.
    public EmailVerificationResponse register(RegisterRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new EmailAlreadyExistsException("Email already exists");
        }
        if(userRepository.existsByUsername(request.getUsername())){
            throw new UsernameAlreadyExistsException("Username already exists");
        }
        Club favouriteClub = clubRepository.findById(request.getFavouriteClubId())
                .orElseThrow(() -> new ResourceNotFoundException("Club with ID " + request.getFavouriteClubId() + " does not exist"));

        String code = generateVerificationCode();

        User savedUser = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .favouriteClub(favouriteClub)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .emailVerified(false)
                .verificationCode(code)
                .verificationCodeExpiresAt(LocalDateTime.now().plusMinutes(VERIFICATION_CODE_VALID_MINUTES))
                .build();
        userRepository.save(savedUser);

        emailService.sendVerificationCode(savedUser.getEmail(), code);

        return new EmailVerificationResponse(savedUser.getEmail(), "Verification code sent to your email.");
    }

    // Confirms the emailed code and returns the real login token - this is
    // the moment a freshly registered account actually becomes usable.
    public AuthResponse verifyEmail(VerifyEmailRequest request){
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            boolean codeMatches = user.getVerificationCode() != null
                    && user.getVerificationCode().equals(request.getCode());
            boolean notExpired = user.getVerificationCodeExpiresAt() != null
                    && user.getVerificationCodeExpiresAt().isAfter(LocalDateTime.now());

            if (!codeMatches || !notExpired) {
                throw new InvalidCredentialsException("Invalid or expired verification code");
            }

            user.setEmailVerified(true);
            user.setVerificationCode(null);
            user.setVerificationCodeExpiresAt(null);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        return response;
    }

    public EmailVerificationResponse resendVerification(String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return new EmailVerificationResponse(user.getEmail(), "This account is already verified - just log in.");
        }

        String code = generateVerificationCode();
        user.setVerificationCode(code);
        user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(VERIFICATION_CODE_VALID_MINUTES));
        userRepository.save(user);

        emailService.sendVerificationCode(user.getEmail(), code);

        return new EmailVerificationResponse(user.getEmail(), "Verification code sent to your email.");
    }

    private String generateVerificationCode(){
        int number = new SecureRandom().nextInt(1_000_000);
        return String.format("%06d", number);
    }

    public AuthResponse login(LoginRequest request){
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

        } catch (BadCredentialsException ex) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Email does not exist"));

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new EmailNotVerifiedException("Please verify your email before logging in");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());

        return response;

//        authenticationManager.authenticate(
//                new UsernamePasswordAuthenticationToken(
//                        request.getEmail(),
//                        request.getPassword()
//                )
//        );
//
//        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(()-> new InvalidCredentialsException("Email does not exist"));
//        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
//        String token = jwtService.generateToken(userDetails);
//
//        AuthResponse response = new AuthResponse();
//        response.setToken(token);
//        response.setUsername(user.getUsername());
//        return response;
    }

    // "Continue with Google": verifies the ID token the frontend obtained
    // from Google, then either logs in the existing user with that email or
    // creates a brand-new one. Google-created accounts get no
    // favouriteClub - the frontend detects that (same as the demo-user
    // flow) and routes to PickClubScreen, since Google doesn't know which
    // GPL club someone supports.
    public AuthResponse loginWithGoogle(String idToken){
        GoogleUserInfo googleUser = googleTokenVerifier.verify(idToken);

        if (!googleUser.emailVerified()) {
            throw new InvalidCredentialsException("Google account email is not verified");
        }

        User user = userRepository.findByEmail(googleUser.email())
                .orElseGet(() -> createUserFromGoogle(googleUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);

        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUsername(user.getUsername());
        return response;
    }

    private User createUserFromGoogle(GoogleUserInfo googleUser){
        String username = generateUniqueUsername(googleUser.email());
        // Google accounts never use password login, so this value is never
        // shown to or usable by the user - it just satisfies the column's
        // NOT NULL constraint without a schema change. Encoded the same way
        // a real password would be, so nothing downstream needs to know the
        // difference.
        String placeholderPassword = passwordEncoder.encode(UUID.randomUUID().toString());

        User newUser = User.builder()
                .email(googleUser.email())
                .username(username)
                .password(placeholderPassword)
                .fullName(googleUser.name())
                .favouriteClub(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return userRepository.save(newUser);
    }

    // Works for either an email (Google Sign-In - uses the part before @)
    // or a plain full name (manual registration - the whole string, spaces
    // and all, get stripped down to alphanumerics below).
    private String generateUniqueUsername(String source){
        String localPart = source.contains("@") ? source.substring(0, source.indexOf('@')) : source;
        String base = localPart.replaceAll("[^a-zA-Z0-9_]", "");
        if (base.isBlank()) {
            base = "user";
        }

        String candidate = base;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = base + suffix;
            suffix++;
        }
        return candidate;
    }

    public UserProfileResponse getCurrentUser(String email){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToProfileResponse(user);
    }

    public UserProfileResponse updateFavouriteClub(String email, Integer favouriteClubId){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Club club = clubRepository.findById(favouriteClubId)
                .orElseThrow(() -> new ResourceNotFoundException("Club with ID " + favouriteClubId + " does not exist"));

        user.setFavouriteClub(club);
        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);
        return mapToProfileResponse(updatedUser);
    }

    private UserProfileResponse mapToProfileResponse(User user){
        ClubSummary clubSummary = null;
        if (user.getFavouriteClub() != null) {
            clubSummary = ClubSummary.builder()
                    .id(user.getFavouriteClub().getId())
                    .fullName(user.getFavouriteClub().getFullName())
                    .shortName(user.getFavouriteClub().getShortName())
                    .logoUrl(user.getFavouriteClub().getLogoUrl())
                    .build();
        }

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .favouriteClub(clubSummary)
                .premium(subscriptionService.isPremium(user.getId()))
                .build();
    }
}
