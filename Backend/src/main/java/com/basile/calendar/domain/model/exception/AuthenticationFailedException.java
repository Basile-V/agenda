package com.basile.calendar.domain.model.exception;

public abstract class AuthenticationFailedException extends RuntimeException {

    protected AuthenticationFailedException(String message) {
        super(message);
    }
}
