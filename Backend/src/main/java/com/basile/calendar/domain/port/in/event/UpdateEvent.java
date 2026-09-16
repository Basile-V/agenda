package com.basile.calendar.domain.port.in.event;

import com.basile.calendar.domain.model.Event;

public interface UpdateEvent {

    Event update(Long id, Event changes, Long requesterId);
}
