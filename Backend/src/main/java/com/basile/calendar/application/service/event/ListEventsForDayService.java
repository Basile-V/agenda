package com.basile.calendar.application.service.event;

import com.basile.calendar.domain.model.Event;
import com.basile.calendar.domain.port.in.event.ListEventsForDay;
import com.basile.calendar.domain.port.out.event.EventRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class ListEventsForDayService implements ListEventsForDay {

    private final EventRepository eventRepository;

    @Override
    public List<Event> list(LocalDate date, Long viewerId) {
        return eventRepository.findVisibleOnDate(date, viewerId);
    }
}
