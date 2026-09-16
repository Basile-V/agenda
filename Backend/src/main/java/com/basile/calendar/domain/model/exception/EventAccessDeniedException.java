package com.basile.calendar.domain.model.exception;

public class EventAccessDeniedException extends RuntimeException {

    public EventAccessDeniedException(Long eventId, Long requesterId) {
        super("L'utilisateur " + requesterId + " n'est pas autorisé à modifier l'événement " + eventId);
    }
}
