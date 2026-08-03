package com.augustine.gplfantasyleaague.exception;

// Thrown when Paystack itself fails or returns something we can't trust
// (bad signature, non-success init response, etc.) - distinct from
// InvalidSquadException-style "the user did something wrong" errors, since
// this means the upstream payment provider is the problem.
public class PaymentException extends RuntimeException {
    public PaymentException(String message) {
        super(message);
    }
}
