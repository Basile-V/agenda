package com.basile.calendar.infrastructure.in.web.event;

import com.basile.calendar.domain.model.Event;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;
import java.time.LocalTime;

record EventRequest(
        String title,
        @NotNull LocalDate date,
        @NotNull @JsonFormat(pattern = "HH:mm") LocalTime start,
        @Positive int duration,
        Boolean isPublic) {

    Event toDomain(Long ownerId) {
        return Event.draft(title, date, start, duration, ownerId, Boolean.TRUE.equals(isPublic));
    }
}
