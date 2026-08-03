package com.augustine.gplfantasyleaague.exception;

public class UnauthorizedAccessException extends RuntimeException{
    public UnauthorizedAccessException(String message) {
        super(message);
    }
}
