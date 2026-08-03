package com.augustine.gplfantasyleaague.exception;

public class DataIntegrityViolationException extends RuntimeException {
    public DataIntegrityViolationException(String message) {
        super(message);
    }
}
