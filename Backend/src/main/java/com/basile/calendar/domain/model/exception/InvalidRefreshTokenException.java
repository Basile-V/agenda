package com.basile.calendar.domain.model.exception;

public class InvalidRefreshTokenException extends AuthenticationFailedException {

    public InvalidRefreshTokenException() {
        super("Jeton de rafraîchissement invalide");
    }
}
