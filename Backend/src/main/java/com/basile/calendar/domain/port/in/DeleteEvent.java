package com.basile.calendar.domain.port.in;

public interface DeleteEvent {

    void delete(Long id, Long requesterId);
}
