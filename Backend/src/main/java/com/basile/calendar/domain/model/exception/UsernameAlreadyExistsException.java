package com.basile.calendar.domain.model.exception;

public class UsernameAlreadyExistsException extends DomainException {

    public UsernameAlreadyExistsException() {
        super("Nom d'utilisateur déjà utilisé");
    }
}
