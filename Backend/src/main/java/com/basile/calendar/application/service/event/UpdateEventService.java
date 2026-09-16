package com.basile.calendar.application.service.event;

import com.basile.calendar.domain.model.Event;
import com.basile.calendar.domain.model.exception.EventAccessDeniedException;
import com.basile.calendar.domain.model.exception.EventNotFoundException;
import com.basile.calendar.domain.port.in.event.UpdateEvent;
import com.basile.calendar.domain.port.out.event.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UpdateEventService implements UpdateEvent {

    private final EventRepository eventRepository;

    @Override
    public Event update(Long id, Event changes, Long requesterId) {
        Event existing = eventRepository.findById(id).orElseThrow(() -> new EventNotFoundException(id));
        if (!existing.ownerId().equals(requesterId)) {
            throw new EventAccessDeniedException(id, requesterId);
        }
        Event updated = existing.withDetails(
                changes.title(), changes.date(), changes.start(), changes.durationMinutes(), changes.isPublic());
        return eventRepository.save(updated);
    }
}
