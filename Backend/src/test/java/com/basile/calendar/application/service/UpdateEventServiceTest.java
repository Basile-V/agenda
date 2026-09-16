package com.basile.calendar.application.service;

import static org.assertj.core.api.Assertions.assertThat;
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

class UpdateEventServiceTest {

    private final EventRepository eventRepository = mock(EventRepository.class);
    private final UpdateEventService updateEventService = new UpdateEventService(eventRepository);

    @Test
    void should_save_updated_event_when_requester_is_owner() {
        Event existing = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, false)
                .withId(1L);
        Event changes = Event.draft("Point équipe renommé", LocalDate.of(2026, 9, 3), LocalTime.of(16, 0), 45, 2L, true);
        Event expectedToSave = new Event(1L, "Point équipe renommé", LocalDate.of(2026, 9, 3), LocalTime.of(16, 0), 45, 2L, true);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(eventRepository.save(expectedToSave)).thenReturn(expectedToSave);

        Event result = updateEventService.update(1L, changes, 2L);

        assertThat(result).isEqualTo(expectedToSave);
        verify(eventRepository).save(expectedToSave);
    }

    @Test
    void should_throw_when_event_does_not_exist() {
        when(eventRepository.findById(1L)).thenReturn(Optional.empty());
        Event changes = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, false);

        assertThatThrownBy(() -> updateEventService.update(1L, changes, 2L))
                .isInstanceOf(EventNotFoundException.class);
        verify(eventRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void should_throw_when_requester_is_not_owner() {
        Event existing = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, false)
                .withId(1L);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(existing));
        Event changes = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, false);

        assertThatThrownBy(() -> updateEventService.update(1L, changes, 99L))
                .isInstanceOf(EventAccessDeniedException.class);
        verify(eventRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void should_throw_when_requester_is_not_owner_of_a_public_event() {
        Event existing = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, true)
                .withId(1L);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(existing));
        Event changes = Event.draft("Point équipe piraté", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 99L, true);

        assertThatThrownBy(() -> updateEventService.update(1L, changes, 99L))
                .isInstanceOf(EventAccessDeniedException.class);
        verify(eventRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void should_save_updated_event_when_owner_changes_only_the_start_time() {
        Event existing = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, false)
                .withId(1L);
        Event changes = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(17, 30), 90, 2L, false);
        Event expectedToSave = new Event(1L, "Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(17, 30), 90, 2L, false);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(eventRepository.save(expectedToSave)).thenReturn(expectedToSave);

        Event result = updateEventService.update(1L, changes, 2L);

        assertThat(result).isEqualTo(expectedToSave);
        verify(eventRepository).save(expectedToSave);
    }

    @Test
    void should_save_updated_event_when_owner_updates_their_own_public_event() {
        Event existing = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, true)
                .withId(1L);
        Event changes = Event.draft("Point équipe renommé", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, true);
        Event expectedToSave = new Event(1L, "Point équipe renommé", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, true);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(eventRepository.save(expectedToSave)).thenReturn(expectedToSave);

        Event result = updateEventService.update(1L, changes, 2L);

        assertThat(result).isEqualTo(expectedToSave);
        verify(eventRepository).save(expectedToSave);
    }
}
