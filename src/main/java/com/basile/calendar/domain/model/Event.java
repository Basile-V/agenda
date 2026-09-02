package com.basile.calendar.domain.model;

import com.basile.calendar.domain.model.exception.InvalidEventDurationException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Objects;

public record Event(Long id, String title, LocalDate date, LocalTime start, int durationMinutes) {

    public Event {
        Objects.requireNonNull(date, "date");
        Objects.requireNonNull(start, "start");
        if (durationMinutes <= 0) {
            throw new InvalidEventDurationException(durationMinutes);
        }
    }

    public static Event draft(String title, LocalDate date, LocalTime start, int durationMinutes) {
        return new Event(null, title, date, start, durationMinutes);
    }
}
