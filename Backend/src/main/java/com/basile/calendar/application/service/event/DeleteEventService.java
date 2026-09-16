package com.basile.calendar.application.service.event;

import com.basile.calendar.domain.model.Event;
import com.basile.calendar.domain.model.exception.EventAccessDeniedException;
import com.basile.calendar.domain.model.exception.EventNotFoundException;
import com.basile.calendar.domain.port.in.event.DeleteEvent;
import com.basile.calendar.domain.port.out.event.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class DeleteEventService implements DeleteEvent {

    private final EventRepository eventRepository;

    @Override
    public void delete(Long id, Long requesterId) {
        Event existing = eventRepository.findById(id).orElseThrow(() -> new EventNotFoundException(id));
        if (!existing.ownerId().equals(requesterId)) {
            throw new EventAccessDeniedException(id, requesterId);
        }
        eventRepository.delete(id);
    }
}
