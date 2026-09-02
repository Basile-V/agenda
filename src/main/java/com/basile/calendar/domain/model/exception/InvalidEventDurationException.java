package com.basile.calendar.domain.model.exception;

public class InvalidEventDurationException extends RuntimeException {

    public InvalidEventDurationException(int durationMinutes) {
        super("La durée d'un événement doit être strictement positive, reçu : " + durationMinutes);
    }
}
