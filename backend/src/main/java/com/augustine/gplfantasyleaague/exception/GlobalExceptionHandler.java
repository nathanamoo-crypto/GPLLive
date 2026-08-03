package com.augustine.gplfantasyleaague.exception;

import com.augustine.gplfantasyleaague.exception.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import org.springframework.security.access.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Helper to build a clean error payload
    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, Exception ex, HttpServletRequest request) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(errorResponse, status);
    }

    // 409 Conflict: Duplicate email registration
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyExists(
            EmailAlreadyExistsException ex,
            HttpServletRequest request) {

        return buildResponse(HttpStatus.CONFLICT, ex, request);
    }

    // 409 Conflict: Duplicate username registration
    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUsernameAlreadyExists(
            UsernameAlreadyExistsException ex,
            HttpServletRequest request) {

        return buildResponse(HttpStatus.CONFLICT, ex, request);
    }

    // 409 Conflict: Duplicate club registration
    @ExceptionHandler(ClubAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleClubAlreadyExists(
            ClubAlreadyExistsException ex,
            HttpServletRequest request) {

        return buildResponse(HttpStatus.CONFLICT, ex, request);
    }

    // 409 Conflict: Duplicate MOTM vote for the same fixture
    @ExceptionHandler(VoteConflictException.class)
    public ResponseEntity<ErrorResponse> handleVoteConflict(
            VoteConflictException ex,
            HttpServletRequest request) {

        return buildResponse(HttpStatus.CONFLICT, ex, request);
    }

    // 409 Conflict: Team already exists / team name taken
    @ExceptionHandler(TeamCreationException.class)
    public ResponseEntity<ErrorResponse> handleTeamCreation(
            TeamCreationException ex,
            HttpServletRequest request) {

        return buildResponse(HttpStatus.CONFLICT, ex, request);
    }

    // 400 Bad Request: Voting outside a live fixture, etc.
    @ExceptionHandler(InvalidVoteException.class)
    public ResponseEntity<ErrorResponse> handleInvalidVote(
            InvalidVoteException ex,
            HttpServletRequest request) {

        return buildResponse(HttpStatus.BAD_REQUEST, ex, request);
    }

    // 404 Not Found Exceptions
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex, request);
    }

    // 403 Forbidden Exceptions (Ownership/Resource protection)
    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedAccess(UnauthorizedAccessException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.FORBIDDEN, ex, request);
    }

    // 403 Forbidden: Spring Security access-denied (e.g. manual AccessDeniedException throws in services)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.FORBIDDEN, ex, request);
    }

    // 401 Unauthorized: Invalid login details
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(
            InvalidCredentialsException ex,
            HttpServletRequest request) {

        return buildResponse(HttpStatus.UNAUTHORIZED, ex, request);
    }

    // 403 Forbidden: Correct password, but the account's email hasn't been
    // verified yet - distinct status from 401 so the frontend can tell
    // "wrong password" apart from "right password, go verify your email"
    // without having to string-match the error message.
    @ExceptionHandler(EmailNotVerifiedException.class)
    public ResponseEntity<ErrorResponse> handleEmailNotVerified(
            EmailNotVerifiedException ex,
            HttpServletRequest request) {

        return buildResponse(HttpStatus.FORBIDDEN, ex, request);
    }

    // 400 Bad Request: Squad Tactics/Rule Violations
    @ExceptionHandler(InvalidSquadException.class)
    public ResponseEntity<ErrorResponse> handleInvalidSquad(InvalidSquadException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex, request);
    }

    // 400 Bad Request: Fixture status/recording errors
    @ExceptionHandler(InvalidFixtureException.class)
    public ResponseEntity<ErrorResponse> handleInvalidFixture(InvalidFixtureException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex, request);
    }

    // 409 Conflict: Duplicates or static data violations
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.CONFLICT, ex, request);
    }

    // 502 Bad Gateway: Paystack itself failed, or returned something we
    // can't trust (bad init response, unverifiable webhook signature).
    @ExceptionHandler(PaymentException.class)
    public ResponseEntity<ErrorResponse> handlePaymentException(PaymentException ex, HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_GATEWAY, ex, request);
    }

    // 400 Bad Request: Bean Validation failures on @Valid @RequestBody DTOs
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(message)
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    // 500 Internal Server Error (Fallback for unexpected system exceptions)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex, HttpServletRequest request) {
        log.error("Unhandled exception at {}", request.getRequestURI(), ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message("An unexpected system error occurred. Please try again later.")
                .path(request.getRequestURI())
                .build();
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
