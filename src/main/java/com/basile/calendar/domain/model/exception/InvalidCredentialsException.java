package com.basile.calendar.domain.model.exception;

public class InvalidCredentialsException extends AuthenticationFailedException {

    public InvalidCredentialsException() {
        super("Identifiants invalides");
    }
}
