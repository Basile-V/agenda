package com.basile.calendar.application.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.basile.calendar.domain.model.Event;
import com.basile.calendar.domain.model.exception.EventAccessDeniedException;
import com.basile.calendar.domain.model.exception.EventNotFoundException;
import com.basile.calendar.domain.port.out.EventRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class DeleteEventServiceTest {

    private final EventRepository eventRepository = mock(EventRepository.class);
    private final DeleteEventService deleteEventService = new DeleteEventService(eventRepository);

    @Test
    void should_delete_event_when_requester_is_owner() {
        Event existing = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, false)
                .withId(1L);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(existing));

        deleteEventService.delete(1L, 2L);

        verify(eventRepository).delete(1L);
    }

    @Test
    void should_throw_when_event_does_not_exist() {
        when(eventRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> deleteEventService.delete(1L, 2L))
                .isInstanceOf(EventNotFoundException.class);
        verify(eventRepository, never()).delete(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void should_throw_when_requester_is_not_owner() {
        Event existing = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, false)
                .withId(1L);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> deleteEventService.delete(1L, 99L))
                .isInstanceOf(EventAccessDeniedException.class);
        verify(eventRepository, never()).delete(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void should_throw_when_requester_is_not_owner_of_a_public_event() {
        Event existing = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, true)
                .withId(1L);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> deleteEventService.delete(1L, 99L))
                .isInstanceOf(EventAccessDeniedException.class);
        verify(eventRepository, never()).delete(org.mockito.ArgumentMatchers.any());
    }
}
