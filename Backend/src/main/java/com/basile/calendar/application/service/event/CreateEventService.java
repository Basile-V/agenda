package com.basile.calendar.application.service.event;

import org.springframework.stereotype.Service;

import com.basile.calendar.domain.model.Event;
import com.basile.calendar.domain.port.in.event.CreateEvent;
import com.basile.calendar.domain.port.out.event.EventRepository;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CreateEventService implements CreateEvent {

    private final EventRepository eventRepository;

    @Override
    public Event create(Event draft) {
        return eventRepository.save(draft);
    }
}
