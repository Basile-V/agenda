package com.basile.calendar.domain.port.in.event;

public interface DeleteEvent {

    void delete(Long id, Long requesterId);
}
