package com.basile.calendar.infrastructure.in.web;

import com.basile.calendar.domain.model.Event;
import com.basile.calendar.domain.port.in.CreateEvent;
import com.basile.calendar.domain.port.in.ListEventsForDay;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final CreateEvent createEvent;
    private final ListEventsForDay listEventsForDay;

    @GetMapping
    public List<EventResponse> list(@RequestParam LocalDate date) {
        return listEventsForDay.list(date).stream().map(EventResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse create(@Valid @RequestBody EventRequest request) {
        Event created = createEvent.create(request.toDomain());
        return EventResponse.from(created);
    }
}
