package com.basile.calendar.domain.model;

import com.basile.calendar.domain.model.exception.InvalidEventDurationException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Objects;

public record Event(Long id, String title, LocalDate date, LocalTime start, int durationMinutes, Long ownerId,
        boolean isPublic) {

    public Event {
        Objects.requireNonNull(date, "date");
        Objects.requireNonNull(start, "start");
        Objects.requireNonNull(ownerId, "ownerId");
        if (durationMinutes <= 0) {
            throw new InvalidEventDurationException(durationMinutes);
        }
    }

    public static Event draft(
            String title, LocalDate date, LocalTime start, int durationMinutes, Long ownerId, boolean isPublic) {
        return new Event(null, title, date, start, durationMinutes, ownerId, isPublic);
    }

    public Event withId(Long id) {
        return new Event(id, title, date, start, durationMinutes, ownerId, isPublic);
    }

    public Event withDetails(String title, LocalDate date, LocalTime start, int durationMinutes, boolean isPublic) {
        return new Event(id, title, date, start, durationMinutes, ownerId, isPublic);
    }
}
