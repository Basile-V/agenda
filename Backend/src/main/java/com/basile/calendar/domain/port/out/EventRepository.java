package com.basile.calendar.domain.port.out;

import com.basile.calendar.domain.model.Event;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EventRepository {

    Event save(Event event);

    List<Event> findVisibleOnDate(LocalDate date, Long viewerId);

    Optional<Event> findById(Long id);
}
