package com.basile.calendar.domain.port.in;

import com.basile.calendar.domain.model.Event;
import java.time.LocalDate;
import java.util.List;

public interface ListEventsForDay {

    List<Event> list(LocalDate date);
}
