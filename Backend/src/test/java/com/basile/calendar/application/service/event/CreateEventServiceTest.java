package com.basile.calendar.application.service.event;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.basile.calendar.domain.model.Event;
import com.basile.calendar.domain.port.out.event.EventRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;

class CreateEventServiceTest {

    private final EventRepository eventRepository = mock(EventRepository.class);
    private final CreateEventService createEventService = new CreateEventService(eventRepository);

    @Test
    void should_save_event_when_creating_valid_event() {
        Event draft = Event.draft("Point équipe", LocalDate.of(2026, 9, 2), LocalTime.of(15, 0), 90, 2L, false);
        Event saved = draft.withId(1L);
        when(eventRepository.save(draft)).thenReturn(saved);

        Event result = createEventService.create(draft);

        assertThat(result).isEqualTo(saved);
        verify(eventRepository).save(draft);
    }
}
