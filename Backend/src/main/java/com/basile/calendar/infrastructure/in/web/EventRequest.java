package com.basile.calendar.infrastructure.in.web;

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
        @Positive int duration) {

    Event toDomain() {
        return Event.draft(title, date, start, duration);
    }
}
