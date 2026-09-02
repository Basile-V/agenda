package com.basile.calendar.domain.port.out;

import com.basile.calendar.domain.model.Event;
import java.time.LocalDate;
import java.util.List;

public interface EventRepository {

    Event save(Event event);

    List<Event> findByDate(LocalDate date);
}
