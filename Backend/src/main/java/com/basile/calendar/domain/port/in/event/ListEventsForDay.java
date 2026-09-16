package com.basile.calendar.domain.port.in.event;

import com.basile.calendar.domain.model.Event;
import java.time.LocalDate;
import java.util.List;

public interface ListEventsForDay {

    List<Event> list(LocalDate date, Long viewerId);
}
