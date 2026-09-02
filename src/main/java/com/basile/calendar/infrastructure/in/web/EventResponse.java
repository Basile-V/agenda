package com.basile.calendar.infrastructure.in.web;

import com.basile.calendar.domain.model.Event;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;
import java.time.LocalTime;

record EventResponse(
        Long id,
        String title,
        LocalDate date,
        @JsonFormat(pattern = "HH:mm") LocalTime start,
        int duration) {

    static EventResponse from(Event event) {
        return new EventResponse(event.id(), event.title(), event.date(), event.start(), event.durationMinutes());
    }
}
