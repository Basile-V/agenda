package com.basile.calendar.domain.model.exception;

public class EventNotFoundException extends RuntimeException {

    public EventNotFoundException(Long id) {
        super("Aucun événement trouvé avec l'id : " + id);
    }
}
