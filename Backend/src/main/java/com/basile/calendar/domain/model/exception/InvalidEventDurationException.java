package com.basile.calendar.domain.model.exception;

public class InvalidEventDurationException extends DomainException {

    public InvalidEventDurationException(int durationMinutes) {
        super("La durée d'un événement doit être strictement positive, reçu : " + durationMinutes);
    }
}
