package com.basile.calendar.application.service;

import com.basile.calendar.domain.model.Event;
import com.basile.calendar.domain.port.in.ListEventsForDay;
import com.basile.calendar.domain.port.out.EventRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class ListEventsForDayService implements ListEventsForDay {

    private final EventRepository eventRepository;

    @Override
    public List<Event> list(LocalDate date) {
        return eventRepository.findByDate(date);
    }
}
