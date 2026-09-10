package com.basile.calendar.domain.port.in;

import com.basile.calendar.domain.model.Event;

public interface CreateEvent {

    Event create(Event draft);
}
