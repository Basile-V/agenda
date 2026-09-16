package com.basile.calendar.domain.port.in.event;

import com.basile.calendar.domain.model.Event;

public interface CreateEvent {

    Event create(Event draft);
}
